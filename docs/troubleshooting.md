# Troubleshooting: keep the real result visible

Start with this copy's [LAB.md](../LAB.md) and [start-here.md](start-here.md).
For help, put the step, safe error text, repository/PR/run URL, and commit hash in
the task issue. Never attach secret values, tokens, full authentication logs, or
private source from another repository. Do not retry a mutation until you know what happened.

## Setup, sign-in, and work items

### No Exercise issue, task issue, or starter PR

**Do:** verify this is your **template copy**, not the source or a fork. From clean,
trusted `dev`, run `npm run lab:setup`. Or open **Actions -> Start lab -> Run workflow**
on `dev`, approving a workflows banner if GitHub asks. If Actions PR creation is
disabled, use the local CLI route with your normal browser login.

**See result:** setup reports the exact items it created or found. Reruns preserve
open **and closed** items; look at **Issues / Pull requests -> Closed** too. A closed
case is not a reason to create duplicates or claim it was reset. Ask the instructor
before arranging a genuinely new attempt.

**Why:** templates copy files, not issues or PRs. Do not weaken organization Actions
policy, add a PAT, or imitate Dependabot to create a missing bot PR.

### Login denied, wrong repository, missing alerts, or HTTP 403

**Do:** check `git remote -v`, `gh auth status`, and your browser's account/repository.
If not signed in, use `gh auth login` with **GitHub.com -> HTTPS -> Login with a web
browser**. Complete required SSO/MFA normally. Ask the instructor to check only the
intended repository's products and alert permissions, including secret-alert access.

**See result:** the approved identity can read the intended native page/API, or the
denial stays explicit. Do not copy credentials, export Git tokens, or buy access.

**Why:** a 403 or an Actions-token limitation is **unavailable**, never "zero alerts."
Browser, Git, and CLI credentials are separate; refreshing every login is not a cure
for missing entitlement or authorization.

### Setup or status refuses the checkout

**Do:** run `git status --short --branch`. Save, commit, and push intended PR work.
Only with no edits, use [Refresh progress from dev](start-here.md#refresh-progress-from-dev).
Confirm that `dev` is the real default, up to date, and contains only trusted merged code.

**See result:** `npm run lab:setup` / `npm run lab:status` can operate on the verified
default. A stale or untrusted checkout stays rejected; preserve the error for help.

**Why:** privileged reads and issue comments must not run from arbitrary PR code.
Never use `reset --hard`, force-push, or delete work just to pass this guard.

### Node, install, checkout, or local push fails

**Do:** check `node --version` is **24.16.0+ within 24.x**, and that Git and `gh` are
installed. Run `npm ci --ignore-scripts --no-audit --no-fund` at the clone root.
After changing to a branch with a different lockfile, run it again. For PR checkout,
use `gh pr list` and replace `NUMBER` in `gh pr checkout NUMBER` with the actual
copy-specific number. Save local changes before switching branches.

**See result:** this branch's locked dependencies install and the intended PR is
checked out. For a push rejection, inspect the actual current remote/PR first;
do not retry blindly or force-push over remote changes.

**Why:** branch switches do not reinstall packages. Do not delete/regenerate the
lockfile, run a broad dependency upgrade, or relax scripts/network policy to hide an install error.

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

**See result:** `npm test` still has 20 ordinary passes. Only the named intentional
failures explain a red baseline; missing dependencies, zero tests, unexpected failures,
or removed/skipped tests need correction, not a completion claim.

**Why:** these failures teach separate boundaries. A full solution may help repair
source, but tests must not be altered to make unsafe behavior pass.

### Extended-query edit fails, or it produces no extra alerts

**Do:** in [.github/codeql/codeql-config.yml](../.github/codeql/codeql-config.yml),
keep `name: BSP beginner CodeQL`, add `queries:`, and place
`- uses: security-extended` on the next line with **two leading spaces**. Use no tabs.
Inspect the current CodeQL logs and the workflow's `config-file` reference.

**See result:** the changed configuration is used by a real analysis. More queries
do not guarantee more findings; that is not a reason to insert more vulnerable code.

**Why:** query selection differs from default/advanced setup. Do not change the
language, stable analysis category, or setup mode to repair a YAML indentation error.

### Autofix is unavailable, fails, or has no usable suggestion

**Do:** use only normal **Generate fix**. If it yields a usable reviewed suggestion,
**Create PR with fix**, move the query change to it, and close the unused starter.
Otherwise label **Manual fallback** and use the lesson's small `escape(label)` fix.

**See result:** one actual source-repair PR is tested and tracked. A pending/error
suggestion is not reported as generated; a notes-only merge is not a fix.

**Why:** Autofix is best effort. Do not select **Assign to Copilot**, start a paid
cloud-agent session, or buy a seat to work around an unavailable suggestion.

### PR is green but the original alert is still open

**Do:** confirm the source repair was merged to `dev`, then inspect the new default
run or dependency-graph refresh. Reopen the original alert URL and check its branch
and state. Run local `lab:status` only from clean, updated default.

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

### Push check fails for another reason, or is unexpectedly accepted

**Do:** read the sanitized `lab:push-check` result. It must identify native **GH013 /
SendGrid** and independently confirm the exact remote ref is absent. Authentication,
network, or unrelated rule failures do not count. Never use a bypass link.

**See result:** genuine prevention is recorded, or the case stays pending. If
accepted, **stop** and contact the instructor; follow only the script's exact
owned-branch instruction, preserve evidence, and do not repeat the probe.

**Why:** nonzero Git exit status alone cannot prove secret scanning blocked a push.
Do not delete unrelated branches, disable protection, or expose the marker in a ticket.

### No Dependabot PR, or its compatibility check fails

**Do:** inspect **Security -> Dependabot alerts**, the graph, enabled security
updates, and available Dependabot logs. Use the alert's **Create security update**
button if offered; do not create a human imitation. Confirm the real bot author.
On that PR branch, reinstall the lockfile, inspect `npm ls lodash --depth=0`, review
release/advisory details and behavior tests, then update only `validatedVersion`
in [dependency-policy.json](../dependency-policy.json).

**See result:** the real bot PR retains its history and current checks turn green
after review. Current patched versions take priority over printed version numbers.
An open PR does not fix default alerts; scheduled version-update timing/count is not guaranteed.

**Why:** `open-pull-requests-limit: 0` stops version-update PRs, not security updates.
Do not silence tests, downgrade, inline registry secrets, or mistake `lab/work` for a bot PR.

### A PR cannot merge, or the expected native block is absent

**Do:** open the merge box's rule details and the current run URLs. Distinguish a
CodeQL finding, missing required analysis, failed QA, pending run, and inherited
approval requirement. In Lab 05, only the admin runs `lab:gates` and only for its
owned named ruleset; verify medium-or-higher and all three required check names.
Replace `./bsp-missing-query.ql` with `security-extended` in the missing-analysis
case's query configuration, observe valid green analysis, then close without merging.

**See result:** the precise block is visible and the repaired useful preview can
pass the same rules. If enforcement cannot be demonstrated, leave that result pending.

**Why:** a generic blocked label cannot identify the controlling rule. Training
adds zero independent required approvals, but inherited approvals still apply.
Never remove a rule/check, fabricate an approval, bypass, or merge the broken workflow.

### Metrics or smoke output looks like a dashboard or release

**Do:** keep `lab:metrics`, `lab:status`, and `lab:smoke` outputs separate. Match the
local smoke hash to `git rev-parse HEAD` from trusted, clean default.

**See result:** metrics are the synthetic **4-day versus 3-day** comparison; status
is live repository evidence; smoke is a loopback-only demonstration at the exact hash.

**Why:** none creates an organization dashboard, cloud deployment, production
approval, or completed rollback. Record a known-safe ref and remaining risk in the
[handover](../exercise/notes.md); optional features stay conditional in [topics.md](topics.md).
