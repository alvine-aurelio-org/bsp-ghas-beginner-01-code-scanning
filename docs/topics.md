# What the five beginner labs cover

Start with [start-here.md](start-here.md), then this repository's [LAB.md](../LAB.md).
Each lab is an independent private template copy; do not reuse another copy's
alert IDs, issue numbers, PR numbers, or results.
Participants use **Git, VS Code, and browser github.com only**. Node/npm and unchanged
tests run in GitHub Actions; authoring tooling is not participant tooling. Browser
**Start lab** normally creates issues and starter PRs; [manual setup](manual-setup.md)
supports issues-only or human setup without changing policy or adding credentials.

| Lab | Hands-on topic | Native result to inspect |
| --- | --- | --- |
| 01: Code scanning | Read a path flow, allowlist files, add a rate limiter | Original path and rate-limit findings become **Fixed** on default |
| 02: Autofix and CodeQL | Review a generated fix or label manual fallback; add extended queries | Actual query-config analysis and original preview finding **Fixed** |
| 03: Secret protection | Delete the historical marker, Actions mock rotation, honest resolution, fresh synthetic push/recovery | Historical alert **Used in tests**; **GH013 / SendGrid** block with absent ref, then accepted harmless commit |
| 04: Dependabot | Review real bot update and installed-version policy; schedule version updates | Merged bot fix closes original advisories; actual dependency graph/SBOM |
| 05: PR gates | Compare unsafe and missing-analysis cases; repair useful code | Distinct native blocks, repaired PR passes the same rules, short handover |

## Code scanning, query suites, and Autofix

- **Code scanning / CodeQL** analyzes source for risky flows. Green analysis means
  the analysis ran successfully, not that it found nothing. Actions tests verify
  only their assertions; use both kinds of evidence. Quality and Security regression
  summaries identify checkout SHA, installed lodash version, and suite counts.
  Preserve original/intermediate failures as well as final results; skipped or
  zero tests, stale PR checks, and source-template reports are not completion.
- **Default setup** is GitHub-managed configuration. **Advanced setup** uses an
  explicit workflow. These packages ship advanced setup throughout; do not enable
  default setup concurrently or switch modes just to finish an exercise.
- **Standard queries versus `security-extended`** is a query-suite choice, not a
  setup-mode choice. Lab 02 adds the extended suite through
  [.github/codeql/codeql-config.yml](../.github/codeql/codeql-config.yml); the
  language/category stays JavaScript/TypeScript. A larger suite need not add findings.
- **Standard Copilot Autofix** offers a suggestion for supported findings through
  **Generate fix -> Create PR with fix** when available under the approved setup.
  Review its diff and the unchanged Actions tests on its actual PR head. Pending,
  failed, unsupported, or unavailable suggestions take a labelled manual fallback,
  not a fabricated success.
- **Assign to Copilot / cloud coding agent** is a separate workflow with its own
  policy and potential billing. It is not needed to complete these lessons.

## Secrets: detection, response, and prevention

- **Secret scanning** can report a supported pattern already present in history.
  Removing the current file neither removes historical exposure nor revokes a real key.
- **Push protection** can prevent supported secrets from entering a remote ref.
  Lab 03 requires **GH013 + Push cannot contain secrets + SendGrid**, a successful
  independent check showing the exact attempted ref absent, and unchanged default
  remote SHA. A login/network error or unrelated rule rejection is not that proof.
- The **historical** SendGrid-format fixture is never-issued. Do not reveal it,
  send it to a provider, or copy it into a push. Its honest resolution is
  `used_in_tests`, not `revoked`, `false_positive`, or a code **Fixed** claim.
- Lab 03's **Prepare push exercise** workflow on `dev` supplies a **different fresh
  never-issued fixture**, unique to repository ID/run ID/attempt. Its private Actions
  summary intentionally shows copy-ready file text and a unique branch, not a real
  API alert value. Only that fixture may be copied into the prescribed local file;
  never invent a marker, reuse the historical one, or expose its value in evidence.
  After confirmed rejection, replacing the file with `TRAINING_MARKER_REMOVED` and
  amending only the last unpushed synthetic commit permits a normal harmless push.
  No force-push, remote-history rewrite, default merge, or protection bypass occurs.
  Unexpected acceptance means stop for the instructor, not repeat the probe.
- **Mock rotation** runs through **Lab demonstrations -> secret-response** on `dev`.
  Its Actions summary binds to an exact SHA: old accepted, rotated old denied /
  replacement accepted, then replacement revoked/denied. It proves only the mock's
  behavior. Real incidents require provider-side revoke/rotate first, consumer
  updates, evidence, and the authorized incident owner's process.

## Four dependency capabilities

| Capability | Meaning | Not a substitute for |
| --- | --- | --- |
| Dependabot alerts | Advisory matches in the dependency graph | Runtime behavior tests |
| Dependabot security updates | A real bot proposes a patched dependency for an advisory | Reviewing and merging that original bot PR |
| Dependabot version updates | Scheduled proposals for newer releases, even without an advisory | Security-update enablement |
| Dependency review | Every PR's dependency changes checked under configured policy | All default-branch advisory states or full compatibility |

The initial `open-pull-requests-limit: 0` disables **version-update PRs** only.
Lab 04 changes it to `3` with a weekly npm-root (`/`) schedule. A bot update or
its arrival time is not guaranteed. Use the current advisory's patched version;
the planned lodash `4.17.23 -> 4.18.1` and picocolors `1.1.0 -> 1.1.1` examples
must be checked against what GitHub and the registry actually offer at class time.

The `validatedVersion` field in [dependency-policy.json](../dependency-policy.json)
forces an installed-version review from the **real bot PR's Actions summary**;
retain its initial 2-pass/1-fail compatibility result before updating that policy.
Keep the bot's lockfile and real behavior assertions; do not hand-edit the lockfile.
Version equality and a bot compatibility score are not exhaustive QA. A **dependency graph**
or **SBOM export** is an inventory, not a security certificate. Approved private
registries use **Dependabot secrets**, never credentials inline in YAML or notes.

## Triage, rules, and measurements

- **Fix** changes the vulnerable code/version; native default results confirm it.
  **Dismiss** records a disposition without changing the code. **Reopen** returns
  a dismissed finding to attention. Reason labels vary by scanner.
- Optional Lab 05 triage uses only a known synthetic case: **Used in tests**,
  then **Reopen**, with honest history. It is neither a false-positive claim nor
  a fix, and it never authorizes merging while the vulnerability is dismissed.
- **Native code-scanning protection** checks current analysis and its configured
  threshold. It is separate from successful workflow status. The training rules
  use CodeQL medium-or-higher **and errors/warnings**, plus `unit-and-compatibility`,
  `secure-behavior`, and `dependency-review` checks. The instructor configures
  **BSP beginner 05 - security gates** through repository **Settings -> Rules ->
  Rulesets**, active on `dev`, conversation resolution required, no bypass actors,
  deletions/force pushes blocked. Inherited rules are unchanged.
  Different tools, diff coverage, merge queues, and existing policies need their
  own validation in production; this lesson proves only its specific PR cases.
- The owned training ruleset adds **0 independent required approvals**. It does
  not relax inherited approvals, invent self-approval, or grant a bypass. Production
  risk/release authorization is outside the lab.
- **Lab progress** runs in Actions on `dev` and posts a **CodeQL/PR snapshot**.
  Read Dependabot/secret states on actual native Security pages and put original
  URLs in the task issue; the Actions token is not assumed to have those permissions.
  Denied reads/comments remain unavailable, and indexing remains pending. A snapshot
  alone, a template's report, or another participant's results is not completion.
- **Lab demonstrations** is offered only in Labs **03** and **05** on `dev`. Lab 03
  offers `secret-response`; Lab 05 offers `metrics` and `smoke`. Each run summary
  ties its result to the exact `dev` checkout SHA; retain run URL and SHA together.
- **metrics** uses [data/metric-history.json](../data/metric-history.json), a frozen,
  invented four-row cohort. Fixes after 2 and 6 days average **4 days**. Including
  its allowed non-false-positive dismissal after 1 day gives **3 days**; the
  false-positive row is excluded from that second mean. This teaching calculation
  is not a live GitHub dashboard or a claim of exact dashboard parity.
- **smoke** runs on the GitHub Actions runner's loopback interface only, at the
  summary's SHA. It starts no laptop server, deploys no cloud service, grants no
  production approval, and proves no rollback.
  Keep a known-safe rollback ref and an owner in [exercise/notes.md](../exercise/notes.md).

## Optional organization and AI topics: conditional, not completed

An instructor may demonstrate these **only if available and separately approved**.
Their appearance depends on current product, plan, policy, role, and scanner support.
No core lesson requires buying access or changing an organization-wide policy.

| Conditional topic | What to look at if available | Do not claim |
| --- | --- | --- |
| Organization Security overview | Native aggregate counts and filters with authorized access | That the runner's synthetic metric is an organization dashboard |
| Security configurations | How an approved configuration applies repository settings | That copying a template or running setup configures the organization |
| Security campaigns | Grouped remediation work with real owners/deadlines | That a training task issue starts or completes a campaign |
| Custom triage / auto-triage rules | Supported scoped matching, disposition reasons, and audit history | That automatic dismissal repairs code or is enabled by this course |
| Custom secret patterns | Pattern design, bounded dry run, review, and separate scoped publication | That a regex automatically covers history or blocks every push |
| AI-detected / generic secrets | Available detection, context review, validity uncertainty, and false positives | That AI detection proves validity, guarantees coverage, or implies push-protection support |

If unavailable, record **not demonstrated**. Never invent completion, create live
secrets to test these features, bypass protection, or broaden scope. Preparation is in
[instructor.md](instructor.md); help is in [troubleshooting.md](troubleshooting.md).
