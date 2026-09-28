# Start your own private beginner lab

Five small, independent repositories use the same routine: **see a real finding ->
make a small change -> inspect checks -> merge -> verify the original result**.
This copy's [LAB.md](../LAB.md) is the exercise; its [README.md](../README.md) links here.
You need no previous lab's files, issue numbers, or scan history.

## 1. Check access and tools

**Do**

- Use your approved GitHub organization and own account. The instructor confirms
  existing **Code Security** and **Secret Protection** entitlement, capacity, and
  any trial expiry before enabling this private copy. A Copilot seat is not a substitute.
- Install **Node.js 24.16.0 or newer within 24.x**, npm, **Git**, **GitHub CLI (`gh`)**,
  and VS Code through your approved software channel. Use the required 24.x line,
  not an older patch or a different major version.
- Confirm that you can create/use the private copy, push changes, open issues/PRs,
  and read its code, dependency, and secret alerts. Settings changes need repository
  admin rights; ask the instructor to perform them if you lack those rights.

**See result:** you have the tools and scoped access for this one training copy.
Missing access is a setup task, not a failed lesson or permission to buy a product.

**Why:** private native scans require the right products, permissions, and actual runs.
You will push your own GitHub-attributed commit during the lesson. GitHub calculates
**active-committer** usage from qualifying history; there is no learner checkbox.
An Actions-created starter alone does not make you an active committer. The instructor
checks capacity; billing counts may lag. Never share an identity to avoid licensing.

## 2. Create a template copy and clone that copy

**Do**

1. On the assigned template, select **Use this template -> Create a new repository**.
2. Choose **your approved organization**, the assigned new name, and **Private**.
   Leave **Include all branches** unchecked: copy **only the default branch**.
   Do not use **Fork** and do not edit the source template.
3. In the new repository, confirm the default branch is `dev` and Issues are available.
   If the default differs, ask the instructor to reconcile it before setup; do not
   casually retarget workflows or branch rules.
4. In **your new copy**, select **Code -> HTTPS -> Copy URL**. In VS Code's Command
   Palette select **Git: Clone**, paste that URL, choose an approved isolated local
   folder, and open the resulting clone. Reuse an existing copy rather than making duplicates.

**See result:** the browser and VS Code both point to your private repository.
Its files are copied, but its issues, PRs, settings, native alerts, and scan history are not.

**Why:** setup recreates local work items; native scanners discover fresh findings.
Source-template results are not your results.

## 3. Enable native security in the repository UI

**Do**

Open **Settings -> Security and quality -> Advanced Security** (some interfaces
show **Settings -> Advanced Security**). With the instructor if needed, verify or enable:

| Control in this copy | Required state |
| --- | --- |
| GitHub Code Security | Enabled under the existing approved entitlement |
| GitHub Secret Protection | Enabled under the existing approved entitlement |
| Secret scanning and push protection | Both enabled |
| Dependency graph | Enabled; it may already be on |
| Dependabot alerts | Enabled |
| Dependabot security updates | Enabled |

Stop if GitHub asks for a purchase, trial renewal, or wider organization change.
Verify actual secret-alert access; Write/Maintain alone is not proof of it.
Every package ships [.github/workflows/codeql.yml](../.github/workflows/codeql.yml)
for **advanced CodeQL setup**. Do **not** select **CodeQL default setup** as well.
If an inherited security configuration enforces it, ask the administrator to
reconcile this exact approved copy; do not weaken an organization policy.

**See result:** the required features are available on this repository. The shipped
workflow, not a second setup method, will run CodeQL.

**Why:** enabling a product is not a scan. Repository settings do not prove findings
exist, and an empty or inaccessible alert page is not evidence of safety.

## 4. Sign in locally and recreate the work items

**Do**

In **VS Code -> Terminal -> New Terminal**, at the root of your clone, run these
commands **one at a time**. Stop on an unexpected error; never paste past a failure.

```powershell
git remote -v
git status --short --branch
node --version
git --version
gh --version
gh auth status
```

The remote must be your copy and the branch must be clean `dev`. If GitHub CLI is
not signed in to the approved account, run `gh auth login`: choose **GitHub.com ->
HTTPS -> Login with a web browser** and complete the normal browser flow yourself.
Accept normal Git authentication setup if offered. Recheck `gh auth status`.
Browser, Git, and CLI sign-in are separate checks; satisfy existing MFA/SSO policy.
Do not create/paste a PAT, export a Git token into the environment, or save tokens
in repository files, commands, issues, screenshots, or lessons.

```powershell
npm ci --ignore-scripts --no-audit --no-fund
npm run lab:setup
npm run lab:status
```

The install reproduces the committed lockfile without dependency lifecycle scripts.
`lab:setup` and `lab:status` require a **clean, trusted default checkout**, not PR
code. They act only on your verified copy. Your authorized CLI session supplies the
full alert reads; no credential is embedded in the project.

**See result:** setup prints links to the recreated **Exercise** issue, task issue,
and starter work PR (`lab/work` for Labs 01-04; two named cases for Lab 05).
Status reads your copy's alerts/checks and refreshes the Exercise comment. Rerunning
setup safely preserves existing **open and closed** issues/PRs; it does not reset progress.

**Why:** templates copy files, not work-item identities. The recreated starter is
not a copied solution, a copied alert, or a bot security-update PR.

**Optional browser setup:** in your copy, open **Actions**, approve the repository's
workflows banner if GitHub shows one, then **Start lab -> Run workflow -> dev ->
Run workflow**. This uses the same setup intent. If Actions cannot create PRs,
use the local CLI setup above; do not weaken organization policy or add a PAT.
Still run local `lab:status` for the full privileged read: an Actions token may
not read every alert type, and "unavailable" never means zero alerts.

## 5. Open the lesson and its real results

**Do**

1. Open **Issues -> Exercise**, then the linked task issue and [LAB.md](../LAB.md).
2. Open **Actions -> CodeQL**. Inspect a run for current `dev`. If no run occurred
   after enablement, use **CodeQL -> Run workflow -> dev -> Run workflow**.
   Allow any legitimate workflow-approval prompt; do not change policy to avoid it.
3. Open **Security -> Code scanning / Secret scanning / Dependabot alerts** as
   directed by the lesson. Match this repository and the default revision.
4. Run `npm test`, `npm run test:compatibility`, and `npm run test:security` separately.
   Compare the **initial** security result below; the named failures are intentional.

| Lab | `npm test` | Compatibility | Security baseline |
| --- | --- | --- | --- |
| 01 | 20 pass | 3 pass | 1 pass / 2 fail: download + limiter |
| 02 | 20 pass | 3 pass | 2 pass / 1 fail: preview |
| 03 | 20 pass | 3 pass | 3 pass / 0 fail |
| 04 | 20 pass | 3 pass | 3 pass / 0 fail |
| 05 default | 20 pass | 3 pass | 3 pass / 0 fail |

**See result:** you can open your own work items, native runs, and relevant findings.
Lab 05's unsafe PR intentionally differs from its safe default. Lab 04's bot update
intentionally fails one compatibility test until reviewed. Unexpected failures,
skipped tests, missing scans, and zero-test runs are not completion.

**Why:** local tests check behavior; native scans supply separate GitHub evidence.
Use [troubleshooting.md](troubleshooting.md) if either is missing.

## Save and push a small change

- Run `gh pr list` to find the **actual number in your copy**. In `gh pr checkout NUMBER`,
  replace `NUMBER` with that number; do not type it literally or use the template's number.
- In VS Code, edit the lesson's named file and **Save**. In **Source Control**, inspect
  the diff, use **+** beside only the intended files, enter a message, and **Commit**.
  Then choose **... -> Push**. Confirm the commit links to your own GitHub identity;
  use your account's verified/noreply email if local commit identity needs setup.
- Browser alternative: open **Pull requests -> your PR -> Files changed -> file menu
  -> Edit file**, or choose that PR's branch in **Code** and use the pencil. Commit
  to the **existing PR branch**, never directly to `dev`. Copy full solution text
  only when the lesson offers it. Pull those commits into the matching clean local
  branch before running tests; do not mix unsaved local and browser edits.
- Inspect **Files changed** and **Checks** at the newest PR revision. Merge only
  when the lesson says to and current rules allow it. There is no extra independent
  reviewer requirement in this beginner path; all inherited requirements still apply.

## Refresh progress from dev

First save/commit/push intended PR work; never discard edits just to get a clean tree.
After a normal merge, run each command separately and stop if it fails:

```powershell
git status --short
git switch dev
git pull --ff-only
npm ci --ignore-scripts --no-audit --no-fund
npm run lab:status
```

The first command must show no local edits. Confirm the updated default revision's
native runs and original alert states. A green workflow can contain alerts; a
dismissal is not a repair. Indexing/permission gaps remain pending or unavailable.
Keep [exercise/notes.md](../exercise/notes.md) to one page; use the task issue for
final post-merge URLs rather than creating an extra documentation-only merge loop.

**Safety:** use only bundled synthetic fixtures and owned test canaries. Loopback
is not a filesystem sandbox; keep the vulnerable app away from sensitive data.
No real payloads, real credentials, external provider tests, tunnels, public hosting,
or cloud release are part of these labs. More context: [topics.md](topics.md).
