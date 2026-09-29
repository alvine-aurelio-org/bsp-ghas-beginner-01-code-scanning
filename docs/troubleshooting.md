# Troubleshooting: keep the real result visible

Start with this copy's [LAB.md](../LAB.md) and [start-here.md](start-here.md).
For help, put the step, safe error text, repository/PR/run URL, and commit hash in
the task issue. Never attach secret values, tokens, full authentication logs, or
private source from another repository. Do not retry a mutation until you know what happened.

## Setup, sign-in, and work items

### No Exercise issue, task issue, or starter PR

**Do:** verify this is your **template copy**, not the source or a fork. From clean,
trusted default code, open **Actions -> Start lab -> Run workflow -> dev** with
**Create starter pull requests** selected (default **true**). If policy denies PR
creation, rerun with that checkbox cleared (**false**) for **issues only**, then
follow [manual-setup.md](manual-setup.md). Fetch, inspect, and reuse partial branches;
never overwrite them. If issue automation also fails, the instructor creates only
missing human Exercise/task issues and links native evidence, with automation unavailable.

**See result:** setup reports the exact items it created or found. Reruns preserve
open **and closed** items; look at **Issues / Pull requests -> Closed** too. A closed
case is not a reason to create duplicates or claim it was reset. Ask the instructor
before arranging a genuinely new attempt.

**Why:** templates copy files, not issues or PRs. Do not weaken organization Actions
policy, add a PAT, or imitate Dependabot to create a missing bot PR. A missing
automated comment is a setup gap, not a completed lesson or a clean alert inventory.

### Login denied, wrong repository, missing alerts, or HTTP 403

**Do:** check `git remote -v` and your browser's account/repository. Use normal Git
for Windows / Git Credential Manager browser authentication, or approved SSH, with
required SSO/MFA. A token prompt is a reason to ask for the approved Git sign-in flow,
not to copy/export a PAT. Ask the instructor to check only the intended repository's
products and permissions, including actual secret-alert visibility.

**See result:** the approved identity can read the intended native page/API, or the
denial stays explicit. Do not copy credentials, export Git tokens, or buy access.

**Why:** a 403 or an Actions-token limitation is **unavailable**, never "zero alerts."
Browser access, Git authentication, and commit attribution are different. An Actions
token does not inherit your browser's Dependabot/secret access; use the native pages.
Changing every login or Git author name is not a cure for missing entitlement.

### Setup or a demonstration ran from the wrong branch

**Do:** inspect the Actions run's selected branch and checkout SHA. **Start lab**,
**Lab progress**, and the offered demonstrations run on trusted **dev**, not arbitrary
PR code. For local branch work, check `git status --short --branch`; preserve intended
edits and use [Refresh progress from dev](start-here.md#refresh-progress-from-dev)
only with a clean tree. Confirm `dev` is the real default with trusted merged code.

**See result:** the correct workflow run is tied to the intended default SHA. A
stale or wrong-branch run is not substituted for the requested evidence.

**Why:** setup, issue comments, and fixture preparation must not trust arbitrary PR code.
Never use `reset --hard`, force-push, or delete work just to pass this guard.

### Git checkout or push fails

**Do:** use [Check out a PR branch](start-here.md#check-out-a-pr-branch). Read the actual
browser PR head, replace the placeholder, fetch, and distinguish first-time tracking
checkout from switching/pulling an existing branch. Use the real bot/Autofix branch
when appropriate, not the notes starter. Stop for conflicts, a missing upstream,
wrong origin, or a refused fast-forward; preserve local work and ask the instructor.

**See result:** the intended head branch is checked out and your ordinary commits
are attributed to your own GitHub identity. Inspect the actual remote/PR before
retrying a failed push; an error does not prove that nothing reached the server.

**Why:** Git handles source here, not local dependencies. Do not install a runtime,
package manager, or extra CLI to get through the lesson, and never push directly to
default, discard edits, overwrite a partial starter, or rewrite a bot's history.

### A setup-created PR has no checks or asks for approval

**Do:** inspect the PR's **Checks** and **Approve workflows to run** banner. An
authorized human with write access can approve eligible runs. If no run was triggered,
make an ordinary personally attributed commit on that PR branch and push. Use a
small notes-only change when you must first observe an unchanged negative state,
especially Lab 04's policy failure or Lab 05's unsafe/missing-analysis case.

**See result:** current Quality and Security regression summaries report checkout
SHA, installed lodash version, and real counts; CodeQL analyzes that PR revision.
Dependency review runs on PRs only. PR runs can check a merge SHA: record it and the
associated head revision distinctly. Missing or skipped runs remain pending.

**Why:** a setup-created PR is not proof its follow-up workflows ran. Do not add
credentials, loosen organization policy, or edit checks to make a green icon appear.

## Scans and test results

### CodeQL did not run, or no expected baseline alert appears

**Do:** open **Actions -> CodeQL** for the current default revision. If it never
started after enablement, select **Run workflow -> dev -> Run workflow**. Inspect
failed/skipped/queued jobs before rerunning. Confirm Code Security and the shipped
advanced workflow with `javascript-typescript`, build mode `none`, `config-file`,
and category `/language:javascript-typescript`. Do not enable default setup too.
Ask the instructor about inherited configuration conflicts instead of changing policy.

**See result:** a completed, valid native analysis is linked to the correct revision.
Labs 01 and 02 need their actual baseline findings. Missing findings remain pending;
Lab 05's safe default should not be confused with its intentionally unsafe PR.

**Why:** a product toggle, green workflow, empty PR-diff result, or another copy's
alert is not a native baseline finding in this repository.

### Tests are red

**Do:** compare the exact failing test with this table; keep all assertions unchanged.

| State | Expected security result | Expected compatibility result |
| --- | --- | --- |
| Lab 01 initial | 1 pass / 2 fail | 3 pass |
| Lab 01 allowlist only | 2 pass / 1 fail (limiter) | 3 pass |
| Lab 02 initial | 2 pass / 1 fail (preview) | 3 pass |
| Labs 03, 04, 05 default | 3 pass | 3 pass |
| Lab 04 updated bot head, old policy | 3 pass | 2 pass / 1 fail (version review) |
| Lab 05 unsafe-preview head | 2 pass / 1 fail (preview) | 3 pass |
| Completed source/policy repairs | 3 pass | 3 pass |

**See result:** the **Quality / unit-and-compatibility** summary still has 20 ordinary
passes plus the table's compatibility counts; **Security regression / secure-behavior**
reports all 3 security tests. Retain the initial, intermediate, and repaired run URLs.
Only named intentional failures explain a red baseline; zero/skipped tests, runner
installation failures, unexpected failures, or removed assertions need investigation.

**Why:** these failures teach separate boundaries. A full solution may help repair
source, but tests must not be altered to make unsafe behavior pass.

### Extended-query edit fails, or it produces no extra alerts

**Do:** in VS Code, keep the name and source boundary in
[.github/codeql/codeql-config.yml](../.github/codeql/codeql-config.yml):

```yaml
name: BSP beginner CodeQL
paths:
  - src
queries:
  - uses: security-extended
```

Use two leading spaces on list entries, none on `name`, `paths`, or `queries`, and
no tabs. Inspect current CodeQL logs and the workflow's `config-file` reference;
do not edit the workflow itself. Lab 05 intentionally starts one case with the missing query.

**See result:** the changed configuration is used by a real analysis. More queries
do not guarantee more findings; that is not a reason to insert more vulnerable code.

**Why:** query selection differs from default/advanced setup. Do not change the
language, stable analysis category, or setup mode to repair a YAML indentation error.

### Autofix is unavailable, fails, or has no usable suggestion

**Do:** use only normal **Generate fix**. If it yields a usable reviewed suggestion,
**Create PR with fix**, check out that real PR's browser-displayed head, copy the
full query configuration into it using VS Code, and close the unused starter.
Otherwise label **Manual fallback** and use the lesson's small `escape(label)` fix.

**See result:** one actual source-repair PR is tested and tracked. A pending/error
suggestion is not reported as generated; a notes-only merge is not a fix.

**Why:** Autofix is best effort. Do not select **Assign to Copilot**, start a paid
cloud-agent session, or buy a seat to work around an unavailable suggestion.

### PR is green but the original alert is still open

**Do:** confirm the source repair was merged to `dev`, then inspect the new default
run or dependency-graph refresh. Reopen the original alert URL and check its branch
and state. Follow [the shared Git refresh](start-here.md#refresh-progress-from-dev).
If needed, dispatch **Lab progress** on `dev` for a CodeQL/PR snapshot, but use the
native Dependabot/secret pages for those states and put original URLs in the task issue.

**See result:** CodeQL/Dependabot findings become **Fixed** when native default
results confirm the repair. Indexing delays stay pending. If the source is still
unsafe, fix it; do not dismiss the alert to make the queue appear clean.

**Why:** PR checks, default analysis, and alert lifecycle are different evidence.
Lab 03's historical secret remains until the honest test disposition instead.

## Secret protection, Dependabot, and gates

### Historical secret is missing, or remains after file deletion

**Do:** verify secret scanning is enabled and that you can read the exact copy's
secret alerts. Let native history scanning complete. Ask the instructor to confirm
the seeded fixture; never generate a real secret or re-push a marker to force detection.
After deletion, revisit the original alert without revealing its value.

**See result:** deletion alone leaves history and the alert. For the confirmed
never-issued fixture, **Used in tests** (`used_in_tests`) is the honest resolution;
unknown/real exposure goes to the incident owner. Do not claim provider revocation.

**Why:** the mock rotation cannot invalidate a real provider credential, and an
`Unknown` validity label does not certify a value as harmless.

### Fresh push fixture, rejected push, or recovery is unclear

**Do:** in Lab 03 use only the fresh **Prepare push exercise** run on `dev` and its
private summary's unique repository/run/attempt fixture, exact default SHA, filename,
branch, and Git-only sequence. This is an intentionally copyable never-issued value,
not a real API secret or the historical seeded marker. Stop if the clean local/default
remote SHA differs, the branch already exists, or a ref check errors. A successful
exact-ref query with no ref returned proves absence; a login/network failure does not.

Require native **GH013 + Push cannot contain secrets + SendGrid**, then independently
confirm the exact attempted remote ref is absent and default SHA unchanged. If the
push was accepted, **STOP and contact the instructor**; do not retry, bypass,
force-push, delete remote refs, or amend already-pushed history.

Only after confirmed rejection, and while the last commit is the recorded unpushed
synthetic commit, follow Lab 03's recovery in [LAB.md](../LAB.md): replace the same
file's content with `TRAINING_MARKER_REMOVED` in VS Code, stage that exact file,
amend that one commit, and push normally to the same branch. Verify the accepted
harmless SHA with the exact remote-ref read, then return to `dev`. If other work
has been committed since the probe, stop for help instead of amending it.

**See result:** a secret-specific native rejection with absent ref is distinct
from the later accepted harmless commit. Keep the safe branch for instructor cleanup,
not default merge. Preserve only sanitized rejection, commit/ref evidence, and run URL.

**Why:** nonzero Git exit status alone cannot prove secret scanning blocked a push.
A later deletion commit leaves the earlier marker in the outgoing history. The
scoped last-unpushed-commit amendment avoids that without force-pushing or rewriting
remote history. Never expose a marker in a ticket or screenshot.

### No Dependabot PR, or its compatibility check fails

**Do:** inspect **Security -> Dependabot alerts**, the graph, enabled security
updates, and available Dependabot logs. Use the alert's **Create security update**
button if offered; do not create a human imitation. Confirm the real bot author.
On that actual PR branch, inspect its initial Quality summary's **installed lodash
version** and **2 compatibility passes / 1 failure** before policy edits. If a normal
human commit is needed to trigger it, use notes only first. Review release/advisory
details, bot manifest/lockfile changes, and behavior tests, then edit only
`validatedVersion` in [dependency-policy.json](../dependency-policy.json) using VS Code.
Push the review commit and inspect the new Actions summaries; do not hand-edit the lockfile.

**See result:** the real bot PR retains its history and current checks turn green
after review. Current patched versions take priority over printed version numbers.
An open PR does not fix default alerts; scheduled version-update timing/count is not guaranteed.

**Why:** `open-pull-requests-limit: 0` stops version-update PRs, not security updates.
Do not silence tests, downgrade, inline registry secrets, or mistake `lab/work` for a bot PR.

### A PR cannot merge, or the expected native block is absent

**Do:** open the merge box's rule details and the current run URLs. Distinguish a
CodeQL finding, missing required analysis, failed QA, pending run, and inherited
approval requirement. In Lab 05, the admin follows [browser ruleset setup](instructor.md#configure-lab-05-rules)
for **BSP beginner 05 - security gates**: active on `dev`, no bypass actors,
CodeQL medium-or-higher plus errors/warnings, and exact `unit-and-compatibility`,
`secure-behavior`, and `dependency-review` checks with GitHub Actions source where offered.
Checks must run before their names can be selected; do not omit unregistered ones.
Replace `./bsp-missing-query.ql` with `security-extended` in the missing-analysis
case's query configuration, observe valid green analysis, then close without merging.

**See result:** the precise block is visible and the repaired useful preview can
pass the same rules. If enforcement cannot be demonstrated, leave that result pending.

**Why:** a generic blocked label cannot identify the controlling rule. Training
adds zero independent required approvals, but inherited approvals still apply.
Never remove a rule/check, fabricate an approval, bypass, or merge the broken workflow.

### Metrics or smoke output looks like a dashboard or release

**Do:** keep **Lab progress** snapshots and **Lab demonstrations** outputs separate.
The demonstrations workflow is available only in Labs 03 and 05: `secret-response`
in 03; `metrics` and `smoke` in 05. Dispatch on `dev` and retain each Actions run URL
and exact summary SHA. Do not substitute a local hash or conflate runs at different SHAs.

**See result:** metrics are the synthetic **4-day versus 3-day** comparison; status
is a CodeQL/PR snapshot; smoke is a **runner-loopback-only** demonstration at the
reported hash. No laptop server or live organization metric is involved.

**Why:** none proves an organization dashboard, cloud deployment, production
approval, or executed rollback. Record a known-safe ref and remaining risk in the
[handover](../exercise/notes.md); [optional topics](topics.md) remain conditional.
