# One-page lab handover

Keep this short: facts and links, no essay or credential values. Follow [LAB.md](../LAB.md).
Fill before the repair PR merges; paste into the task issue and add final observations
there afterward. No extra notes-only PR is required just to record the outcome.

| Item | Your actual result |
| --- | --- |
| Owner / next-action owner | Your GitHub identity; who handles anything still open |
| Target | This private repository URL, lab number, default `dev`, observed commit SHA |
| Original alert URL(s) and state | Actual copy-specific links; Fixed, Open, Used in tests, or pending as observed |
| PR URL(s) | Actual repair/bot PR; separate negative case and unused starter disposition if applicable |
| Run URL(s) and tests | Current runs; ordinary / compatibility / security pass-fail counts; unavailable evidence labelled |
| Outcome / remaining risk | One sentence; include Manual fallback, mock-only, pending indexing, or unmet rule if relevant |
| Safe rollback ref | Known-safe commit SHA and why it is safe; pending/not available if unverified, never the vulnerable seed |
| Local smoke, if used | Exact tested hash and result; local only, not deployed |

**No production approval is granted.** A dismissal is not a fix; the local mock
does not revoke a real credential. A rollback ref is a plan, not an executed rollback.
Any later rollback uses a reviewed revert PR and existing rules, not a force-push.
Use the task issue for remaining actions and [troubleshooting](../docs/troubleshooting.md)
for help. Never paste marker values, tokens, real payloads, or invented evidence.
