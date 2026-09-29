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
| Run URL(s) and tests | Original / intermediate / final Actions runs, checkout SHA, installed lodash version, and ordinary / compatibility / security pass-fail counts; no zero/skipped-test claims |
| Outcome / remaining risk | One sentence; include Manual fallback, mock-only, pending indexing, or unmet rule if relevant |
| Safe rollback ref | Known-safe commit SHA and why it is safe; pending/not available if unverified, never the vulnerable seed |
| Runner demonstrations, if used | Actions run URL, exact dev SHA, and result; mock / synthetic metrics / runner-loopback smoke, not a laptop server or deployed app |
| Push exercise, if used | Sanitized rejection, attempted commit/ref, successful absent-ref/default-SHA checks, then harmless accepted SHA; never marker text |

Keep final Dependabot/secret observations tied to the **original native Security
page URLs**. Lab progress is only a CodeQL/PR snapshot, not whole-lab completion;
missing access/comments and pending indexing stay explicit with an owner.

**No production approval is granted.** A dismissal is not a fix; the Actions mock
does not revoke a real credential. A rollback ref is a plan, not an executed rollback.
Any later rollback uses a reviewed revert PR and existing rules, not a force-push.
Track remaining actions in the task issue and use [troubleshooting](../docs/troubleshooting.md)
for help. Keep marker values, tokens, real payloads, and invented evidence out of the handover.
