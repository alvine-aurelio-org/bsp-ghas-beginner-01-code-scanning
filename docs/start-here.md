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
- Your laptop needs **Git, VS Code, and a browser for github.com only**, installed
   through approved channels. On Windows, use Git for Windows with Git Credential
   Manager's normal browser sign-in, or your organization's approved SSH setup.
   No local Node.js, package manager, GitHub CLI, test runner, or application server
   is required. Node/npm remain behind GitHub Actions; authoring tools are not
   participant or classroom setup requirements.
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

## 4. Verify Git authentication and start the lab in the browser

**Do**

In **VS Code -> Terminal -> New Terminal**, at the root of your clone, run these
commands **one at a time**. Stop on an unexpected error; never paste past a failure.

```powershell
git remote -v
git status --short --branch
git --version
git config --get user.name
git config --get user.email
```

The remote must be your copy, the branch clean `dev`, and the commit identity your
own. Existing correct identity settings should be preserved. If missing or wrong,
replace both placeholders below with your own name and GitHub verified/noreply
email, and set them **for this clone only**, not globally:

```powershell
git config user.name "YOUR_NAME"
git config user.email "YOUR_VERIFIED_OR_NOREPLY_EMAIL"
```

Verify read access with `git fetch origin`. Complete Git Credential Manager's
browser authentication when prompted, using your approved account and existing
MFA/SSO; approved SSH is the alternative. Browser sign-in, Git authentication, and
commit attribution are different checks. A configured email does not authenticate
Git. If prompted for a token instead of the approved flow, stop for instructor help.
Never create/copy/paste/export a PAT or Git token, share accounts, or put credentials
in repository files, commands, issues, screenshots, or environment variables.

1. In your copy, open **Actions**. If GitHub asks to enable the copied workflows,
   have an authorized user confirm only this repository's approved workflows.
2. Choose **Start lab -> Run workflow -> dev**. Leave **Create starter pull requests**
   (`create_starter_prs`) selected; its default is **true**. Select **Run workflow**.
3. Read the run summary and open its **Exercise**, task issue, and PR links.
   Labs 01-04 use notes-only `lab/work`; Lab 05 has two separate gate cases.
4. If organization policy denies automated PR creation, rerun **Start lab** on
   `dev` with **Create starter pull requests** cleared (**false**). This creates or
   reuses **issues only**. Then follow [manual-setup.md](manual-setup.md) using Git,
   VS Code, and the browser's native **New pull request**. Fetch and inspect any
   partially created branches; never overwrite them or loosen policy.
5. If even issue automation is unavailable, the instructor arranges human-created
   Exercise/task issues and native evidence links as described in manual setup.
   An unavailable automated comment is not a clean result or a completed setup.

**See result:** your own work items are linked, with fresh IDs where created.
Reruns preserve existing **open and closed** issues/PRs; they never reset/recreate
closed work. Check the Closed views too; a new attempt needs instructor coordination.

**Why:** templates copy files, not work-item identities. The recreated starter is
not a copied solution, copied alert, or bot security-update PR. GitHub Actions setup
and progress use their own token, not your Git credentials; that token is not assumed
to have Dependabot or secret-alert access. Use the native Security pages for those.

## 5. Open the lesson and its real results

**Do**

1. Open **Issues -> Exercise**, then the linked task issue and [LAB.md](../LAB.md).
2. **Before any lesson changes**, open the original `dev` runs for **Quality /
   unit-and-compatibility** and **Security regression / secure-behavior**. Their
   **Summary** reports checkout SHA, installed lodash version, and suite counts.
   Save those run URLs and counts; a later repaired run cannot replace a baseline.
   If a baseline run is missing, use that workflow's **Run workflow -> dev**, with
   the instructor if needed. Do not change source to manufacture a missing result.
3. Open **Actions -> CodeQL** for that default revision. If no run occurred after
   enablement, use **CodeQL -> Run workflow -> dev -> Run workflow**. Then inspect
   **Security -> Code scanning / Secret scanning / Dependabot alerts** as directed.
4. Compare the actual **initial** results below. All tests run on GitHub's runner,
   against the committed lockfile; no laptop install or tests are needed.

| Lab | Ordinary tests | Compatibility | Security baseline |
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

**Why:** Actions tests check behavior; native scans supply separate GitHub evidence.
Use [troubleshooting.md](troubleshooting.md) if either is missing.

## Check out a PR branch

Open the **actual PR in your copy** and read its head branch near the title. Confirm
base `dev` and the expected repository. For Dependabot or Autofix, use **their real
PR's head**, not the notes-only `lab/work` starter. Never impersonate a bot or rewrite
its existing commits. Replace `ACTUAL_BRANCH` below with that exact branch name;
do not type the placeholder literally or include an `owner:` prefix.

Run commands separately. First ensure the working tree has no file entries:

```powershell
git status --short --branch
git fetch origin
```

Preserve, save, and commit/push intended work before switching; do not discard it.
If the branch has **not been created locally**, use this first-time command:

```powershell
git switch --track origin/ACTUAL_BRANCH
```

If the branch **already exists locally**, use these commands instead:

```powershell
git switch ACTUAL_BRANCH
git pull --ff-only
```

Check the VS Code branch indicator against the PR. Stop on conflicts, a missing
upstream, an unexpected remote, or a refused fast-forward; ask the instructor rather
than reset or force-push. Manual setup covers partially created branches without a PR.

## Save and push a small change

- Confirm you are on the actual PR branch, **never `dev`**. Use VS Code to edit,
   copy full solution text only when offered, or delete the one named fixture.
   Save, then in **Source Control** inspect the diff, stage **only intended files**,
   enter a message, and **Commit**. Choose **... -> Push**, not an unreviewed sync.
   Verify the human commit is attributed to you; preserve genuine bot commits.
- A Git push triggers CI and CodeQL. **Dependency review** runs on PRs only, not a
   standalone default-branch push. Setup-created PRs may show **Approve workflows to
   run**: an authorized human with write access can approve the run. If no run was
   triggered, a normal participant commit on that PR branch triggers checks; use a
   small notes-only commit where the lesson needs an unchanged negative baseline.
   Never remove rules/assertions or claim that an unrun check passed.
- Open **Files changed**, **Checks**, and each current Actions run's **Summary**.
   Match the associated PR/head revision and the reported **checkout SHA**; a PR
   workflow can check a merge SHA rather than the head SHA. Retain both as labelled,
   not an invented match. Check 20 ordinary, 3 compatibility, and 3 security tests,
   including the lesson's named intentional failures. Zero/skipped tests do not count.
- Merge only when the lesson says to and current rules allow it. There is no extra independent
  reviewer requirement in this beginner path; all inherited requirements still apply.

## Refresh progress from dev

First save/commit/push intended PR work; never discard edits just to get a clean tree.
After a normal merge, run each command separately and stop if it fails:

```powershell
git status --short --branch
git switch dev
git pull --ff-only
```

The first command must show no file entries. Inspect Actions summaries and default
CodeQL analysis for the **merged default checkout SHA**, then reopen the original
native alert URLs. A successful CodeQL run can contain findings; a dismissal is not
a repair. Indexing and permission gaps stay **pending** or **unavailable**.

If needed, open **Actions -> Lab progress -> Run workflow -> dev -> Run workflow**.
Its Exercise comment is a **CodeQL/PR snapshot**, not whole-lab completion. Check
Dependabot and secret states on the **actual native Security pages** and place the
original alert URLs and observed states in the task issue. An Actions token is not
assumed entitled to those reads. If issue comments are unavailable, the instructor
owns that setup gap; human notes and native pages remain evidence, not a fake green.

Keep [exercise/notes.md](../exercise/notes.md) to one page; use the task issue for
final post-merge URLs rather than creating an extra documentation-only merge loop.
Source-template reports and historical receipts never prove participant completion.

**Safety:** only approved synthetic fixtures and owned canaries are used. The Lab 03
push fixture is intentionally copied from its private Actions summary; historical
secret alert values must not be revealed/copied. No real credentials, external
provider tests, laptop servers, tunnels, public hosting, or cloud release are part
of these labs. **Lab demonstrations** exists only in Labs 03 and 05; its smoke
checks use runner loopback, not a participant-hosted app. See [topics.md](topics.md).
