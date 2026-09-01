"""
Agent Orchestrator: classifies a task, dynamically selects the needed
specialized agents, and runs them via a LangGraph workflow.

    Task
     -> Router (classification + agent selection)
     -> [optional RAG retrieval]
     -> Dispatcher -> selected Agent(s), in order -> Dispatcher -> ...
     -> Aggregation
     -> Final Response

This mirrors the standalone Valtier agentic core, but is wired for
in-process use by AgentService (no CLI, no file-based memory).
"""
from __future__ import annotations

import operator
from typing import Annotated, Any, Optional, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph

from app.agents.analytics import AnalyticsAgent
from app.agents.base import BaseAgent, get_llm, wrap_user_input
from app.agents.data_processing import DataProcessingAgent
from app.agents.project_management import ProjectManagementAgent
from app.agents.requirements import RequirementsAgent
from app.agents.sales import SalesAgent
from app.agents.schemas import AgentDecision, AgentError, AgentName, AgentResult
from app.agents.security import SecurityAgent
from app.utils.logging import get_logger

logger = get_logger("ORCHESTRATOR")

_AGENT_CLASSES: dict[AgentName, type[BaseAgent]] = {
    AgentName.PROJECT_MANAGEMENT: ProjectManagementAgent,
    AgentName.DATA_PROCESSING: DataProcessingAgent,
    AgentName.SECURITY: SecurityAgent,
    AgentName.ANALYTICS: AnalyticsAgent,
    AgentName.REQUIREMENTS: RequirementsAgent,
    AgentName.SALES: SalesAgent,
}

# Defensive backstop only. The graph's control flow (remaining_agents
# strictly shrinks by one on every agent-node visit) shouldn't loop
# indefinitely on its own, but QA flagged the lack of a hard ceiling —
# this guarantees the workflow terminates even if a future change to
# the routing/removal logic ever reintroduces a cycle.
_MAX_DISPATCH_STEPS = len(_AGENT_CLASSES) + 2

_ROUTER_SYSTEM_PROMPT = f"""You are the routing brain of Valtier. Given a user's request, \
decide which specialized agents are needed and in what order.

Available agents:
- {AgentName.PROJECT_MANAGEMENT.value}: project plans, tasks, milestones, timelines
- {AgentName.DATA_PROCESSING.value}: cleaning/profiling/summarizing structured (CSV) data
- {AgentName.SECURITY.value}: defensive security risk assessment
- {AgentName.ANALYTICS.value}: trends, patterns, comparisons, insights (usually after data_processing if a dataset is involved)
- {AgentName.REQUIREMENTS.value}: functional/non-functional requirements, user stories
- {AgentName.SALES.value}: lead analysis, sales strategy, draft outreach

Select ONLY the agents genuinely needed. Do not select an agent "just in case". \
execution_order must contain exactly the same agents as selected_agents, sensibly ordered. \
Set requires_rag=true only if the request depends on organization-specific documents \
(e.g. "according to our policy...")."""


def _merge_dicts(left: dict[str, Any], right: dict[str, Any]) -> dict[str, Any]:
    merged = dict(left)
    merged.update(right)
    return merged


def _dedupe_preserve_order(agents: list[AgentName]) -> list[AgentName]:
    """
    Drop duplicate agent entries the router (or a hallucinating LLM)
    might return, keeping first-seen order. Without this, a duplicated
    name in execution_order causes that agent to run twice — extra LLM
    cost for no benefit, and the exact "redundant re-execution" pattern
    QA's infinite-loop concern was gesturing at.
    """
    seen: set[AgentName] = set()
    deduped: list[AgentName] = []
    for agent in agents:
        if agent not in seen:
            seen.add(agent)
            deduped.append(agent)
    return deduped


class OrchestratorState(TypedDict, total=False):
    request: str
    user_id: Optional[str]
    csv_path: Optional[str]
    rag_context: Optional[str]
    task_type: str
    selected_agents: list[AgentName]
    execution_order: list[AgentName]
    remaining_agents: list[AgentName]
    requires_rag: bool
    dispatch_steps: int
    shared_context: Annotated[dict[str, Any], _merge_dicts]
    agent_results: Annotated[list[AgentResult], operator.add]
    errors: Annotated[list[AgentError], operator.add]
    final_response: Optional[str]


def classify_request(request: str) -> AgentDecision:
    llm = get_llm()
    structured_llm = llm.with_structured_output(AgentDecision)
    logger.info("Request received")
    try:
        decision = structured_llm.invoke(
            [SystemMessage(content=_ROUTER_SYSTEM_PROMPT), HumanMessage(content=f"User request:\n{wrap_user_input(request)}")]
        )
        if not isinstance(decision, AgentDecision):
            decision = AgentDecision.model_validate(decision)
        decision.selected_agents = _dedupe_preserve_order(decision.selected_agents)
        decision.execution_order = _dedupe_preserve_order(decision.execution_order or decision.selected_agents)
        if not decision.selected_agents:
            raise ValueError("Router returned no agents")
        logger.info(f"Task classified as '{decision.task_type}'")
        logger.info(f"Selected agents: {[a.value for a in decision.execution_order]}")
        return decision
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"LLM routing failed ({exc}); falling back to keyword routing")
        return _keyword_fallback(request)


def _keyword_fallback(request: str) -> AgentDecision:
    text = request.lower()
    selected: list[AgentName] = []

    if any(w in text for w in ("csv", "dataset", "clean the data", "missing values", "sales data")):
        selected.append(AgentName.DATA_PROCESSING)
    if any(w in text for w in ("trend", "insight", "pattern", "compare", "analytic", "revenue", "identify problems")):
        selected.append(AgentName.ANALYTICS)
    if any(w in text for w in ("security", "vulnerab", "risk assessment", "secure")):
        selected.append(AgentName.SECURITY)
    if any(w in text for w in ("requirement", "user stor", "acceptance criteria", "spec")):
        selected.append(AgentName.REQUIREMENTS)
    if any(w in text for w in ("plan", "timeline", "milestone", "roadmap", "schedule")):
        selected.append(AgentName.PROJECT_MANAGEMENT)
    if any(w in text for w in ("sales", "lead", "proposal", "customer", "pitch")):
        selected.append(AgentName.SALES)

    if not selected:
        selected = [AgentName.PROJECT_MANAGEMENT]

    logger.info(f"Selected agents (fallback): {[a.value for a in selected]}")
    return AgentDecision(
        task_type="keyword_fallback",
        reasoning="LLM routing was unavailable; selected agents via keyword matching.",
        selected_agents=selected,
        execution_order=selected,
        requires_rag=False,
    )


# --------------------------------------------------------------------------- #
# Graph nodes
# --------------------------------------------------------------------------- #

def router_node(state: OrchestratorState) -> dict[str, Any]:
    request = state["request"]
    decision = classify_request(request)

    return {
        "task_type": decision.task_type,
        "selected_agents": decision.selected_agents,
        "execution_order": decision.execution_order,
        "remaining_agents": list(decision.execution_order),
        "requires_rag": decision.requires_rag,
        "dispatch_steps": 0,
        "shared_context": {},
        "agent_results": [],
        "errors": [],
    }


def rag_node(state: OrchestratorState) -> dict[str, Any]:
    from app.rag.retriever import retrieve

    logger.info("Retrieving context from knowledge base")
    chunks = retrieve(state["request"], user_id=state.get("user_id"))
    if not chunks:
        return {"rag_context": None}
    context_text = "\n".join(f"- ({c['source']}) {c['text'][:300]}" for c in chunks)
    return {"rag_context": context_text}


def dispatch_node(state: OrchestratorState) -> dict[str, Any]:
    return {"dispatch_steps": state.get("dispatch_steps", 0) + 1}


def _route_after_router(state: OrchestratorState) -> str:
    return "rag_retrieval" if state.get("requires_rag") else "dispatch"


def _route_after_dispatch(state: OrchestratorState) -> str:
    if state.get("dispatch_steps", 0) > _MAX_DISPATCH_STEPS:
        logger.warning(
            f"Dispatch step cap ({_MAX_DISPATCH_STEPS}) exceeded; forcing aggregation to guarantee termination"
        )
        return "aggregate"
    remaining = state.get("remaining_agents") or []
    return remaining[0].value if remaining else "aggregate"


def make_agent_node(agent_enum: AgentName):
    agent_class = _AGENT_CLASSES[agent_enum]

    def node(state: OrchestratorState) -> dict[str, Any]:
        agent = agent_class()
        prior_summary = "\n".join(f"- [{r.agent.value}] {r.summary}" for r in state.get("agent_results", []))
        context: dict[str, Any] = dict(state.get("shared_context", {}))
        context["prior_summary"] = prior_summary
        if state.get("csv_path"):
            context["csv_path"] = state["csv_path"]

        task_input = state["request"]
        if state.get("rag_context"):
            task_input = f"{task_input}\n\nRelevant knowledge base context:\n{state['rag_context']}"

        result = agent.execute(task_input, context)

        remaining = list(state.get("remaining_agents", []))
        if agent_enum in remaining:
            remaining.remove(agent_enum)

        update: dict[str, Any] = {
            "agent_results": [result],
            "shared_context": {agent_enum.value: result.summary},
            "remaining_agents": remaining,
        }
        if not result.success:
            update["errors"] = list(result.errors)
        return update

    return node


def aggregate_node(state: OrchestratorState) -> dict[str, Any]:
    logger.info("Combining results")
    results = state.get("agent_results", [])
    if not results:
        return {"final_response": "No agents produced output for this request."}

    lines = [f"Request classified as: {state.get('task_type', 'unknown')}", ""]
    for result in results:
        status = "OK" if result.success else "FAILED"
        lines.append(f"[{result.agent.value.upper()}] ({status}) {result.summary}")

    errors = state.get("errors", [])
    if errors:
        lines.append("")
        lines.append("Errors encountered:")
        for err in errors:
            lines.append(f"- {err.agent}: {err.message}")

    logger.info("Final response generated")
    return {"final_response": "\n".join(lines)}


def build_graph():
    graph = StateGraph(OrchestratorState)
    graph.add_node("router", router_node)
    graph.add_node("rag_retrieval", rag_node)
    graph.add_node("dispatch", dispatch_node)
    graph.add_node("aggregate", aggregate_node)

    for agent_enum in _AGENT_CLASSES:
        graph.add_node(agent_enum.value, make_agent_node(agent_enum))
        graph.add_edge(agent_enum.value, "dispatch")

    graph.set_entry_point("router")
    graph.add_conditional_edges(
        "router", _route_after_router, {"rag_retrieval": "rag_retrieval", "dispatch": "dispatch"}
    )
    graph.add_edge("rag_retrieval", "dispatch")

    dispatch_map = {agent.value: agent.value for agent in _AGENT_CLASSES}
    dispatch_map["aggregate"] = "aggregate"
    graph.add_conditional_edges("dispatch", _route_after_dispatch, dispatch_map)

    graph.add_edge("aggregate", END)
    return graph.compile()


_compiled_graph = None


def get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph


class OrchestratorResult(TypedDict):
    task_type: str
    selected_agents: list[AgentName]
    agent_results: list[AgentResult]
    summary: str
    errors: list[AgentError]


def run_orchestrator(request: str, user_id: Optional[str] = None, csv_path: Optional[str] = None) -> OrchestratorResult:
    """Synchronous entry point used by AgentService."""
    graph = get_graph()
    final_state = graph.invoke({"request": request, "user_id": user_id, "csv_path": csv_path})
    return {
        "task_type": final_state.get("task_type", "unknown"),
        "selected_agents": final_state.get("execution_order", []),
        "agent_results": final_state.get("agent_results", []),
        "summary": final_state.get("final_response", ""),
        "errors": final_state.get("errors", []),
    }
