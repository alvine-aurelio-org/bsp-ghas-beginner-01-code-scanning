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
- Provide Node **24.16.0+ within 24.x**, npm, Git, GitHub CLI, and VS Code. Allow
  ordinary browser authentication with existing MFA/SSO. No PAT distribution,
  shared accounts, token environment variables, or tokens in repository content.

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
4. On clean, trusted, up-to-date `dev`, install and initialize:

   ```powershell
   npm ci --ignore-scripts --no-audit --no-fund
   npm run lab:setup
   npm run lab:status
   ```

5. Alternatively, **Actions -> Start lab -> Run workflow** on `dev` can set up the
   copy; approve a workflows banner if required. When Actions PR creation is denied,
   use local CLI setup. Do not relax organization policy or introduce a PAT.

**See result:** the local Exercise and task issues plus starter PRs have fresh IDs.
Setup reconciles open **and closed** work items on rerun; it does not reopen or
duplicate them. No comments, native scan history, findings, or bot identity are copied.

**Why:** recreate the working context, then let native services produce evidence.
Use local `lab:status` for full authorized alert reads and its issue comment;
Actions-token limits must remain labelled unavailable rather than clean.

Optional **instructor-only** alternative to the UI, on that same trusted default:

```powershell
npm run lab:enable -- --approve-security
```

This approves only repository enablement under **existing** entitlement; it does
not authorize purchasing, renewing a trial, or changing organization policy.
Inspect any cost/capacity concern first and read back the exact copy's settings.
Participants normally use the UI and never need this administrative command.

## 3. Check each baseline and its visible outcome

**Do**

Use **Actions -> CodeQL** on the current default and inspect the relevant native
security pages in the fresh copy. A successful run alone is not absence of findings.
Expect 20 ordinary and 3 compatibility passes before changes in every package;
the combined security suite contains preview, download, and limiter tests.

| Lab | Initial security | Required observation |
| --- | --- | --- |
| 01 | 1 pass / 2 fail | Native path-injection and missing-rate-limiting findings; intermediate allowlist gives 2/1; final repair 3/0 |
| 02 | 2 pass / 1 fail | Native reflected-XSS alert; changed query config analyzed; generated suggestion or honest manual fallback; final 3/0 |
| 03 | 3 pass / 0 fail | Historical inert SendGrid finding; file removal; local mock; `used_in_tests`; one native blocked push with absent ref |
| 04 | 3 pass / 0 fail | Native lodash advisories and real Dependabot security-update PR; reviewed policy and merged fixed alert states |
| 05 default | 3 pass / 0 fail | Distinct native finding and missing-analysis blocks; repaired useful change passes unchanged rules |

- Labs 01-04 start with notes-only `lab/work`. Lab 05 uses `lab/unsafe-preview`
  and `lab/missing-analysis`. Participants discover PR numbers with `gh pr list`.
- A native Autofix **Generate fix -> Create PR with fix** route is best effort.
  Do not assign a cloud coding agent or buy capacity to satisfy it. If it fails,
  label the manual `escape(label)` repair; close any unused notes starter.
- In Lab 04, the original bot PR must remain the actual **dependabot[bot]** PR.
  Baseline lodash is `4.17.23`; selected patch is `4.18.1` (28 September 2026).
  Current advisory/installed patched versions take priority over these printed values.
  Its old `validatedVersion` deliberately yields 2 compatibility passes / 1 failure.
  Review before changing that policy; retain the real behavior tests.
- The initial version-update limit `0` does not disable security updates. Lab 04
  changes it to `3`, weekly, npm at `/`. Picocolors `1.1.0 -> 1.1.1` is the planned
  distinct version-update example, subject to current availability and eligibility.
  Preflight it; never promise a count or fabricate a bot PR if none appears.

**See result:** required native results are observed in this copy, or their actual
blockers remain pending. Old-edition receipts and local solution tests cannot fill gaps.

**Why:** deliberately red baselines teach diagnosis; only the named failures are
expected. A different failure, missing analysis, or denied API needs investigation.

## 4. Keep the secret and gate exercises narrowly scoped

**Do**

- Confirm the seeded marker's never-issued origin without exposing its value.
  In Lab 03, deletion through the work PR does not erase history. Resolve the native
  test alert as **Used in tests** (`used_in_tests`), never claim real revocation.
  `npm run lab:secret-response` is local-only: old denied, replacement accepted,
  replacement revoked/denied. Real exposures require the incident owner's
  provider-side revoke/rotate response first, separately from this mock.
- Run `npm run lab:push-check` once from trusted clean default. It keeps probe
  content out of the working tree and performs automatic remote-ref checks.
  Success requires native **GH013 / SendGrid** plus the exact remote ref absent.
  Other push failures do not prove secret protection. Never bypass it. Unexpected
  acceptance means stop, retain sanitized evidence, and follow only the script's
  exact owned-branch cleanup instruction; do not retry or delete unrelated refs.
- For Lab 05 only, the authorized repository admin runs `npm run lab:gates` from
  clean default. Inspect the command's **named, owned training ruleset**: `dev`,
  native CodeQL medium-or-higher, **Quality / unit-and-compatibility**,
  **Security regression / secure-behavior**, **Dependency review / dependency-review**,
  **0 independent required approvals**, and no bypass actors. Do not adopt or
  alter unrelated rulesets. Existing inherited approvals must still be obtained.
- Observe the raw preview finding separately from its failed test. For missing
  analysis, `bsp-invalid-language` intentionally prevents CodeQL analysis; restore
  `javascript-typescript`, observe green valid analysis, then **close without merge**.
  Retain the useful heading when escaping the unsafe preview so its repair is not
  an empty diff. Merge only that safe, useful change through the unchanged rules.

**See result:** no real credential, bypass, fabricated approval, weakened check,
or broken workflow reaches the default branch. Both negative cases retain real run URLs.

**Why:** a beginner exercise needs reproducible evidence, not a production release
ceremony. Production approval and incident policies remain separate and untouched.

## 5. Finish with an honest handover

**Do**

1. Refresh from clean `dev` using `npm run lab:status`. Verify original default
   CodeQL/Dependabot alerts as **Fixed**, not dismissed, where those fixes are taught.
   The secret lesson intentionally ends with **Resolved / Used in tests** instead.
2. Keep [exercise/notes.md](../exercise/notes.md) brief. Final post-merge evidence
   can go in the task issue comment: owner, target, actual alert/PR/run URLs,
   remaining risk, and a known-safe rollback ref if one exists.
3. Lab 05's `npm run lab:metrics` is a **synthetic** four-row cohort: fix-only mean
   4 days; 3 days when the allowed non-false-positive dismissal is included.
   `lab:status` supplies separate live counts. Do not invent a live organization dashboard.
4. `npm run lab:smoke` is a loopback-only demonstration tied to the exact current
   hash, not cloud deployment, a release approval, or a proven rollback.
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
does not guarantee validity or push-protection support. Mark unavailable items
**not demonstrated**, not completed. See [topics.md](topics.md).
