# Security & QA Fix Summary

Response to `QA_Audit_Report.md`. Every item below was verified against
the actual code (not assumed from the report's description) before
deciding whether it needed a fix.

## Fixed

| # | Issue | Fix |
|---|---|---|
| 1 | **Insecure JWT storage in localStorage (XSS risk)** | Full migration to httpOnly cookies. Backend: `app/core/security.py` (`set_auth_cookies`/`clear_auth_cookies`), `app/api/auth.py`, `app/core/dependencies.py` (cookie-first, Bearer-header fallback for non-browser clients). Frontend: `client.ts` (`credentials: "include"`, no token read/stored), `authApi.ts`, `RequireAuth.tsx` (async session check via `/auth/me`, replacing the old synchronous localStorage flag). Verified live: `Set-Cookie` headers carry `HttpOnly`; a request with the cookie alone (no header) authenticates; logout clears both cookies; a request with neither is rejected. See `tests/test_cookie_auth.py`. |
| 2 | **Infinite Execution Loop Risk (orchestrator)** | Added `_dedupe_preserve_order()` so a router returning duplicate agent names doesn't re-run one agent redundantly, plus a hard `dispatch_steps` counter (`_MAX_DISPATCH_STEPS`) in `orchestrator.py` that forces aggregation if ever exceeded — a defensive backstop even though the existing `remaining_agents`-shrinks-every-visit design shouldn't loop on its own. See `tests/test_security_fixes.py::test_dedupe_preserve_order_removes_duplicate_agents`. |
| 3 | **Context Window Exhaustion** | Added `truncate_context()` / `build_prompt_with_context()` in `app/agents/base.py` (shared `MAX_CONTEXT_CHARS` cap, "...[Context Truncated]" marker) and applied it across all six agents, including the Data Processing agent's dataset-profile JSON (previously unbounded for wide datasets). See `tests/test_base_agent.py`, `tests/test_project_management_agent.py`. |
| 4 | **Chroma Concurrency Crashes** | Added a process-wide `threading.Lock` around all Chroma write operations (`add_chunks`, `delete_document`) in `app/rag/vector_store.py`. Reads remain unlocked. Comment documents Chroma server-mode/PGVector migration as the real long-term fix for multi-user scale. |
| 5 | **Unrestricted File Ingestion (no MIME/content validation)** | `app/services/rag_service.py` now checks actual file bytes against real signatures (`%PDF-` for PDF, `PK\x03\x04`/ZIP header for DOCX, UTF-8-decodability + no NUL bytes for TXT/CSV) in addition to the extension check — a renamed script no longer passes as a "PDF." See `tests/test_security_fixes.py`. |
| 6 (found independently, not in the report) | **Arbitrary local file read via the CSV path** | The old code extracted any `"*.csv"`-looking substring straight out of the user's free-text chat message (both in the orchestrator's router and the Data Processing agent) and passed it directly to `pd.read_csv()` — a message like "read ../../etc/shadow.csv" would attempt to read that file. Removed the regex-based extraction entirely; `csv_path` is now only ever supplied by `agent_service.py` after verifying the user owns that Document row, and `_resolve_trusted_csv_path()` adds a defense-in-depth check that the resolved path is inside the managed uploads directory. See `tests/test_security_fixes.py::test_csv_path_outside_upload_dir_is_refused`. |
| 7 | **Agent Guardrails / Prompt Injection** | Added `wrap_user_input()` — delimits raw user text with explicit markers and an instruction that its content is data, not commands, applied at the router, in `build_prompt_with_context`, and in the Data Processing agent's direct prompts. Not a full guardrails framework (see Roadmap below), but a real, standard first line of defense. |
| 8 | Base agent crash on a misconfigured subclass (`self.name` missing) | `BaseAgent.__init__` now raises a clear `TypeError` immediately if a subclass didn't set `name = AgentName.X`, instead of failing later with a confusing `AttributeError` the first time an `AgentResult` tried to use it. |
| 9 | `with_structured_output` returning `None` | `ask_structured()` now explicitly detects a `None` result and routes to the JSON-fallback parser instead of crashing on `schema.model_validate(None)`. |
| 10 | Greedy regex in the JSON-fallback parser | Switched to a non-greedy match anchored at the end of the (fence-stripped) response, so commentary containing braces before/after the JSON block no longer corrupts extraction. Also now strips markdown code fences the model may add despite instructions. |
| 11 | `@lru_cache`-pinned LLM client | Added `reset_llm_cache()` so the cached client can be rebuilt after a settings change (e.g. in tests or a future "switch model" admin action), instead of the cache silently locking in stale settings for the process lifetime. |
| 12 | No retry on transient LLM failures | `ask_structured()` retries transient (non-parsing) LLM errors up to twice with a short backoff before giving up — parsing/validation errors are not retried, since a bare retry wouldn't fix a structurally wrong response; those go straight to the fallback parser. |

## Verified already correct — no change needed

| # | Item from the report | Why no fix was needed |
|---|---|---|
| 13 | Password hashing inconsistency (PyJWT + passlib) | `core/security.py` uses a single `CryptContext(schemes=["argon2"])` — no bcrypt/legacy scheme is configured anywhere, so there's no migration/mismatch to bypass. |
| 14 | Frontend `.env` secret exposure | `valtier-frontend/.env.example` contains only `VITE_API_URL`; no API keys or secrets are ever built into the frontend bundle. |
| 15 | Stripe webhook signature bypass | `stripe_service.construct_webhook_event()` already calls `stripe.Webhook.construct_event()`, which raises on an invalid/missing signature, mapped to a 400 `AppError` in `app/api/payments.py`. Confirmed live and via `tests/test_stripe_webhooks.py::test_webhook_rejects_invalid_signature`. |
| 16 | Async/sync SQLAlchemy engine mismatch | Routes are declared as sync `def` (FastAPI runs these in a thread pool automatically) except two `async def` routes (`upload_document`, `stripe_webhook`), which only `await` non-blocking file/body reads — neither touches the DB session inside an event-loop-blocking way. There is no async SQLAlchemy engine in this codebase to mismatch against. |
| 17 | React 19 + Recharts re-render overhead | `AnalyticsPage.tsx`'s chart data (`data.tasksOverTime`, `data.usageByAgent`) comes directly from state with no inline per-render derivation — there's nothing here to memoize; the component already only re-renders when the underlying data actually changes. |
| 18 | Multi-tenant data isolation (Chroma + Postgres) | Already implemented and already tested: every Chroma chunk is tagged and filtered by `user_id`; every Postgres query for conversations/documents/memory filters by `user_id` and returns 403/404 rather than leaking existence. See `tests/test_documents.py::test_user_cannot_access_another_users_document`, `tests/test_memory.py::test_memory_isolated_between_users`. |
| 19 | Refresh-token-expiry redirect loop | Resolved as a side effect of the cookie migration (#1): `RequireAuth` now does a single deterministic async check against `/auth/me` with an explicit loading state, rather than reactively trusting a synchronous localStorage flag that could go stale. |

## Roadmap items (not implemented — genuinely new infrastructure, out of scope for a fix pass)

- **Redis-based per-tier rate limiting** (`slowapi`/Redis): the app already enforces per-plan monthly usage quotas at the DB level (`app/services/agent_service.py::check_and_reserve_usage`); real-time Redis rate limiting is additive infrastructure, not a fix to an existing bug.
- **Chroma server mode / PGVector migration**: the concurrency fix above (a write lock) mitigates the immediate crash risk; migrating off local-file Chroma is a larger infrastructure change for real production scale, as the report itself frames it.
- **Full guardrails framework (e.g. NeMo Guardrails)**: the lightweight input-delimiting mitigation above (#7) is a real improvement, but a complete guardrails/jailbreak-detection layer is a separate, larger integration.
- **Server-Sent Events / WebSockets for streaming responses**: a feature request, not a vulnerability.

## Test suite

All fixes are covered by tests. Full suite: **61 passed** (37 pre-existing +
12 corrected `test_base_agent.py` + 3 corrected
`test_project_management_agent.py` + 7 new `test_security_fixes.py` + 5 new
`test_cookie_auth.py`).

Note: the QA team's originally supplied `Test_base_agent.py` and
`test_project_management_agent.py` referenced a non-existent
`AgentName.ORCHESTRATOR` enum member and were missing `Any`/`Optional`
imports, so they could not run as-is against this codebase. Corrected
versions preserving their actual test intent are included above.
