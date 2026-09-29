# Instructor: prepare five small native labs

Participant entry: [start-here.md](start-here.md), then [LAB.md](../LAB.md).
Keep each repository independent. This beginner path replaces long reflections
with small edits and a [one-page handover](../exercise/notes.md), not a new approval process.

## 1. Approve scope and access before class

**Do**

- Confirm the exact approved organization, private-repository names, cleanup owner,
  existing Code Security and Secret Protection entitlement, any trial expiry, and
  Actions allowance. Do not buy, renew, change membership, or enable all future repositories.
- Plan for participants' **active-committer** usage for each enabled product.
  Learners push their own GitHub-attributed commits; GitHub calculates qualifying
  usage, commonly over a rolling 90-day window. A copied file, account toggle, or
  Actions bot PR is not evidence that the learner is an active committer. Billing
  readback may lag; do not invent immediate counts or promise zero incremental cost.
- Test the participant's actual code, dependency, and secret-alert visibility.
  Write/Maintain alone is not sufficient evidence of secret access. Use scoped
  repository grants, not organization-wide security-manager access as a shortcut.
- Provide **Git, VS Code, and a browser for github.com only**. On Windows use Git
  for Windows with Git Credential Manager browser authentication, or approved SSH.
  Retain normal MFA/SSO and personally attributed commits. No PAT distribution,
  token copying/export, shared accounts, or tokens in repository content.
  Node.js and npm are used only inside Actions; no local runtime, package manager, GitHub CLI,
  server, or instructor-only command-line workaround is part of this course.

**See result:** the approved copy and participant identity can complete the native
steps within existing entitlement. Any missing capability is recorded before class.

**Why:** permissions, licensing, and Actions capacity are separate requirements.
The five-repository exercise is not authorization for wider organization changes.

## 2. Initialize the participant's own copy

**Do**

1. Follow **Use this template -> Create a new repository** into the approved
   organization, **Private**, **Include all branches unchecked**. Do not fork.
   Verify default `dev`, Issues, and the participant clone's own origin.
2. Use the repository UI in [start-here.md](start-here.md) to enable Code Security,
   Secret Protection, secret scanning, push protection, dependency graph, Dependabot
   alerts, and security updates. Preserve organization policies and inherited settings.
3. Keep the shipped **advanced CodeQL** workflow. Do not enable default setup too.
   Confirm `config-file`, JavaScript/TypeScript with build mode `none`, and stable
   category `/language:javascript-typescript`. Lab 02 initially has no `queries`
   section; the learner adds only `security-extended`.
4. Open **Actions -> Start lab -> Run workflow -> dev**. Keep **Create starter pull
  requests** (`create_starter_prs`) at its default **true**, then run the workflow.
  Approve an eligible copied-workflows banner as an authorized human if required.
5. If organization policy denies automated PR creation, rerun on `dev` with that
  checkbox cleared (**false**) to create/reuse **Exercise and task issues only**.
  Follow [manual-setup.md](manual-setup.md) for Git branches, VS Code edits, and
  native **New pull request**. Fetch/inspect/reuse partial branches; never overwrite.
6. If issue automation is unavailable too, create only missing human Exercise/task
  issues, link the lesson and native evidence, and label automated comments
  unavailable. You own the setup gap; do not relax policy or introduce a PAT.

**See result:** this copy's Exercise/task issues and starter PRs have their own IDs.
Setup reconciles open **and closed** work items on rerun; it does not reopen or
duplicate them. No comments, native scan history, findings, or bot identity are copied.

**Why:** recreate the working context, then let native services produce evidence.
**Lab progress** provides CodeQL/PR snapshots, not a privileged all-alert verdict.
Use native **Security -> Dependabot alerts / Secret scanning** and original URLs
in the task issue; Actions tokens are not assumed entitled to those reads.
Unavailable data/comments are not clean results. Never reset or recreate closed work.

## 3. Check each baseline and its visible outcome

**Do**

Use **Actions -> CodeQL** on the current default and inspect the relevant native
security pages in the fresh copy. A successful run alone is not absence of findings.
Before changes, preserve the original **Quality / unit-and-compatibility** and
**Security regression / secure-behavior** run summaries: checkout SHA, installed
lodash version, and suite counts. Expect 20 ordinary and 3 compatibility passes;
the 3-test security suite contains preview, download, and limiter tests. If a run
is missing, start the relevant workflow on `dev`; do not substitute local results.

| Lab | Initial security | Required observation |
| --- | --- | --- |
| 01 | 1 pass / 2 fail | Native path-injection and missing-rate-limiting findings; intermediate allowlist gives 2/1; final repair 3/0 |
| 02 | 2 pass / 1 fail | Native reflected-XSS alert; changed query config analyzed; generated suggestion or honest manual fallback; final 3/0 |
| 03 | 3 pass / 0 fail | Historical inert SendGrid finding; file removal; Actions mock; `used_in_tests`; fresh native blocked push with absent ref, then harmless recovery |
| 04 | 3 pass / 0 fail | Native lodash advisories and real Dependabot security-update PR; reviewed policy and merged fixed alert states |
| 05 default | 3 pass / 0 fail | Distinct native finding and missing-analysis blocks; repaired useful change passes unchanged rules |

- Labs 01-04 start with notes-only `lab/work`. Lab 05 uses `lab/unsafe-preview`
  and `lab/missing-analysis`. Participants read actual head branches on browser
  PRs and use [the shared checkout routine](start-here.md#check-out-a-pr-branch).
- Setup-created PRs may show **Approve workflows to run**; an authorized human
  with write access approves them. If no run was triggered, a normal participant
  commit can trigger CI. Use notes-only changes when an initial negative result
  must be preserved, especially the bot's policy failure and Lab 05's gate cases.
  Check actual run/checkout SHA association, not a stale or empty green result.
- A native Autofix **Generate fix -> Create PR with fix** route is best effort.
  Do not assign a cloud coding agent or buy capacity to satisfy it. If it fails,
  label the manual `escape(label)` repair; close any unused notes starter.
- In Lab 04, the original bot PR must remain the actual **dependabot[bot]** PR.
  Baseline lodash is `4.17.23`; selected patch is `4.18.1` (28 September 2026).
  Current advisory/installed patched versions take priority over these printed values.
  Its old `validatedVersion` deliberately yields 2 compatibility passes / 1 failure.
  Preserve that failing Actions summary before changing the policy, then use its
  **installed lodash version** for review. Keep behavior tests and the bot's real
  manifest/lockfile changes; do not hand-edit the lockfile or impersonate the bot.
- The initial version-update limit `0` does not disable security updates. Lab 04
  changes it to `3`, weekly, npm at `/`. Picocolors `1.1.0 -> 1.1.1` is the planned
  distinct version-update example, subject to current availability and eligibility.
  Preflight it; never promise a count or fabricate a bot PR if none appears.

**See result:** required native results are observed in this copy, or their actual
blockers remain pending. Source-template/historical reports and authoring solution
tests cannot fill participant evidence gaps. Zero/skipped tests never count as a pass.

**Why:** deliberately red baselines teach diagnosis; only the named failures are
expected. A different failure, missing analysis, or denied API needs investigation.

## 4. Keep the secret and gate exercises narrowly scoped

**Do**

- Confirm the seeded marker's never-issued origin without exposing its value.
  In Lab 03, deletion through the work PR does not erase history. Resolve the native
  test alert as **Used in tests** (`used_in_tests`), never claim real revocation.
  Run **Actions -> Lab demonstrations -> Run workflow -> dev**, demonstration
  **secret-response**. Its SHA-bound summary shows old **accepted**, then rotated
  old **denied** / replacement **accepted**, then replacement **revoked/denied**.
  No provider calls or real revocation occur. Real exposures require the incident
  owner's provider-side revoke/rotate response first, separately from this mock.
- Lab 03 alone has **Actions -> Prepare push exercise**, dispatched on `dev`.
  Its private summary deliberately displays one fresh, never-issued SendGrid-format
  file fixture, unique to repository ID/run ID/attempt, plus the exact default SHA,
  **exercise/push-canary.txt**, unique `lab/push-check-RUNID-ATTEMPT` branch, and
  Git-only commands. This new inert fixture is copyable into that local file;
  historical/real alert values are not. Never invent a marker or reuse an old one.
- Require clean latest `dev` matching the summary, a successful exact-ref absence
  check before the push, and the participant's normal Git authentication. After
  the attempted push require **GH013 + Push cannot contain secrets + SendGrid**,
  another successful exact-ref absence check, and unchanged default remote SHA.
  Preserve only sanitized rejection, attempted commit/ref, and the evidence URL.
  Unexpected acceptance means **stop and contact the instructor**: no bypass,
  retry, force-push, automatic ref deletion, or presumed successful prevention.
- After **confirmed rejection only**, the learner replaces the same file's content
  with `TRAINING_MARKER_REMOVED` in VS Code and amends **only the last unpushed
  synthetic commit**, as shown in the lesson. A normal push to that same branch
  must then match the harmless commit SHA. A later deletion commit would not remove
  the earlier marker from the push. Never amend pushed work; keep the safe branch
  for instructor cleanup and return to `dev` without merging it.
- For Lab 05 only, configure the browser ruleset below. Existing inherited
  approvals remain required; no administrative bypass or rule weakening is allowed.
- Observe the raw preview finding separately from its failed test. For missing
  analysis, `./bsp-missing-query.ql` intentionally names an absent query; replace it
  with `security-extended`, observe green valid analysis, then **close without merge**.
  Retain the useful heading when escaping the unsafe preview so its repair is not
  an empty diff. Merge only that safe, useful change through the unchanged rules.

**See result:** no real credential, bypass, fabricated approval, weakened check,
or broken workflow reaches the default branch. Both negative cases retain real run URLs.

**Why:** a beginner exercise needs reproducible evidence, not a production release
ceremony. Production approval and incident policies remain separate and untouched.

### Configure Lab 05 rules

1. As the authorized repository admin, open **Settings -> Rules -> Rulesets ->
  New branch ruleset** in this private Lab 05 copy. Use the exact name
  **BSP beginner 05 - security gates**. If that owned ruleset already exists,
  inspect/reuse it rather than create a duplicate or adopt an unrelated ruleset.
2. Set enforcement to **Active**, target branch **dev** only, and leave the bypass
  list empty. Do not change organization rules or other repository rulesets.
3. Select **Require a pull request before merging** with **0** added required
  approvals, **Require conversation resolution**, **Restrict deletions**, and
  **Block force pushes**. Zero here adds no classroom reviewer gate; it does not
  remove approvals or other requirements inherited from elsewhere.
4. Enable native **Require code scanning results**, select **CodeQL**, set the
  security-alert threshold to **Medium or higher**, and the alert threshold to
  **Errors and warnings**. A successful CodeQL job alone is not this rule.
5. Enable **Require status checks to pass** and add these exact check names:

  | Workflow | Required check name |
  | --- | --- |
  | Quality | `unit-and-compatibility` |
  | Security regression | `secure-behavior` |
  | Dependency review | `dependency-review` |

  Choose **GitHub Actions** as the check source where the UI offers it. The checks
  must have run in this copy before their names are selectable; Dependency review
  needs a PR. Approve eligible workflows or use a normal notes-only participant
  commit to trigger them without repairing the negative case. Do not omit a check
  just because it has not registered yet.
6. Save, reopen, and read back the name, scope, active state, empty bypass list,
  thresholds, and check sources. Inspect each PR's **View rules** or merge-box
  details: the unsafe finding and missing-analysis case must show their own native
  block. If controls are unavailable or enforcement cannot be demonstrated, leave
  the gate result pending and escalate within approved scope, not through a purchase.

## 5. Finish with an honest handover

**Do**

1. Follow [Refresh progress from dev](start-here.md#refresh-progress-from-dev): Git
  refresh only, then inspect default runs and original native alert URLs. If needed,
  dispatch **Lab progress** on `dev` for a CodeQL/PR snapshot. Confirm native
  CodeQL/Dependabot **Fixed**, not dismissed, where taught; the historical secret
  instead ends **Resolved / Used in tests**. A snapshot is not whole-lab completion.
2. Keep [exercise/notes.md](../exercise/notes.md) brief. Final post-merge evidence
   can go in the task issue comment: owner, target, actual alert/PR/run URLs,
   remaining risk, and a known-safe rollback ref if one exists.
3. **Lab demonstrations exists only in Labs 03 and 05.** In Lab 05 dispatch it on
  `dev` separately with **metrics** and **smoke**. Each Actions summary records its
  exact `dev` SHA; retain the URL and SHA. Metrics uses a **frozen synthetic** four-row
  fixture: 4-day fix-only mean, or 3 days including the allowed non-false-positive
  dismissal. This is not a live organization dashboard or the Lab progress snapshot.
4. Smoke runs on **runner loopback only**, not a laptop server or cloud deployment.
  Its run is neither production approval nor a proven rollback. If summary SHAs
  differ, do not present them as evidence for one tested revision.
5. Retain private evidence and follow the agreed cleanup owner/policy; do not
   delete repositories, alert history, rules, or trial features automatically.

**See result:** the learner can show what changed, what actually ran, and what
remains open without a long reflection form or an independent-reviewer exercise blocker.

**Why:** truthful pending results are more useful than a green claim built from
missing access, synthetic data, a dismissal, or another repository's evidence.

## Optional topics, not required completions

Only demonstrate available, approved capabilities: organization **Security overview**,
security configurations, campaigns, custom triage, custom secret patterns, and
AI-detected/generic secret scanning. These depend on entitlement, policy, and current
support. Do not enable organization-wide settings or publish a pattern during the core
exercise. A custom pattern requires its own dry run and scoped approval; AI detection
does not guarantee validity or push-protection support. Treat unavailable capabilities
as **not demonstrated**, never completed. Review the boundaries in [topics.md](topics.md).
