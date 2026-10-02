"""Data Processing Agent: profiles, cleans, and summarizes tabular data."""
from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd

from app.agents.base import BaseAgent, truncate_context, wrap_user_input
from app.agents.schemas import AgentName, AgentResult, ColumnProfile, DataProfile
from app.core.config import settings

SYSTEM_PROMPT = """You are the Data Processing Agent inside Valtier. You analyze, clean, \
and summarize structured/tabular data. Ground your statements in the provided profile \
(row/column counts, missing values, dtypes) rather than guessing, and suggest concrete \
cleaning steps."""


def _profile_csv(path: str) -> DataProfile:
    df = pd.read_csv(path)
    columns = []
    issues = []
    for col in df.columns:
        series = df[col]
        missing = int(series.isna().sum())
        missing_pct = round((missing / len(df)) * 100, 2) if len(df) else 0.0
        if missing_pct > 30:
            issues.append(f"Column '{col}' has {missing_pct}% missing values")
        columns.append(
            ColumnProfile(name=str(col), dtype=str(series.dtype), missing_count=missing, missing_pct=missing_pct)
        )
    if int(df.duplicated().sum()) > 0:
        issues.append(f"{int(df.duplicated().sum())} duplicate rows detected")
    return DataProfile(source=path, row_count=len(df), column_count=len(df.columns), columns=columns, issues=issues)


def _resolve_trusted_csv_path(csv_path: str) -> str:
    """
    Only accept a csv_path that lives inside the configured upload
    directory. `csv_path` must always come from a DB-verified Document
    the requesting user owns (see agent_service.run_agent_task) — this
    is a defense-in-depth check against ever reading an arbitrary
    server-side file if a future caller passes something untrusted.
    """
    upload_root = Path(settings.upload_dir).resolve()
    resolved = Path(csv_path).resolve()
    if upload_root not in resolved.parents and resolved != upload_root:
        raise ValueError("Refusing to read a file outside the managed uploads directory")
    if not resolved.is_file():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")
    return str(resolved)


class DataProcessingAgent(BaseAgent):
    name = AgentName.DATA_PROCESSING
    system_prompt = SYSTEM_PROMPT

    def run(self, task_input: str, context: dict[str, Any]) -> AgentResult:
        # csv_path must be supplied by the orchestrator from a document the
        # user actually owns (see agent_service.py) — it is never derived
        # from free-text in the user's message. Earlier versions of this
        # agent (and the orchestrator's router) extracted any "*.csv"-looking
        # substring straight out of the user's raw message and passed it to
        # pd.read_csv() unchecked, which let a request like "read
        # ../../etc/shadow.csv" attempt to read arbitrary server files. That
        # fallback has been removed entirely.
        csv_path = context.get("csv_path")

        if not csv_path:
            response = self.llm.invoke(
                f"{SYSTEM_PROMPT}\n\nNo dataset file was provided. Based on this request, "
                f"describe what data would be needed and how it should be prepared for "
                f"analysis:\n\n{wrap_user_input(task_input)}"
            )
            text = getattr(response, "content", str(response))
            return AgentResult(
                agent=self.name,
                success=True,
                summary="No dataset file referenced; provided a data-preparation plan instead.",
                data={"guidance": text},
            )

        trusted_path = _resolve_trusted_csv_path(csv_path)
        profile = _profile_csv(trusted_path)
        # A dataset with very many columns can produce a large profile —
        # cap it before it goes into the prompt (QA: context window exhaustion).
        profile_json = truncate_context(profile.model_dump_json(indent=2), max_chars=3000)
        response = self.llm.invoke(
            f"{wrap_user_input(task_input)}\n\nDataset profile for {profile.source}:\n{profile_json}\n\n"
            "Summarize data quality in 3-5 sentences and list concrete cleaning steps."
        )
        narrative = getattr(response, "content", str(response))

        return AgentResult(
            agent=self.name,
            success=True,
            summary=f"Profiled {profile.source}: {profile.row_count} rows, "
            f"{profile.column_count} columns, {len(profile.issues)} data quality issue(s).",
            data={"profile": profile.model_dump(), "narrative": narrative},
        )
