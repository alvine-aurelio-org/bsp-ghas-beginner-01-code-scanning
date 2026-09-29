# Lab 01: Find and fix your first CodeQL alerts

**Time:** 60 minutes. **Goal:** fix two download alerts in your private copy.
**Tools:** Git, VS Code, GitHub.com; dependencies and tests run in GitHub Actions.

**Prerequisites:** Git for Windows with Git Credential Manager; complete browser sign-in
and required MFA/organization SSO when prompted. Use an approved private organization
with existing Code Security, Secret Protection, and Actions entitlement/access.
No purchases or personal access tokens. Access denied or settings missing? Stop for an administrator;
never change organization policy.

## 1. Create and clone your private copy

Open the [public source template](https://github.com/alvine-aurelio-org/bsp-ghas-beginner-01-code-scanning).
Select **Use this template > Create a new repository**, not **Fork**.
Choose your approved organization and **Private**; leave **Include all branches** off
(default branch only), then **Create repository**. Confirm its default branch is `dev`.
Templates do not copy issues, scans, or security settings.

In your copy, open **Settings > Security and quality > Advanced Security** (or **Advanced Security**).
Enable **Code Security**, **Secret Protection**, **secret scanning**, **push protection**,
**dependency graph**, and **Dependabot alerts**; ask an administrator if needed.
Enable **Actions** if prompted. Keep the shipped **advanced CodeQL** workflow;
do not enable **Default setup**.

Copy your copy's **Code > HTTPS** URL. In VS Code: **F1 > Git: Clone**, paste that URL,
choose a folder, then **Open**. Open **Terminal > New Terminal** at the repository root.
Copy/run **one line at a time; STOP on unexpected errors**. Never force-push,
reset destructively, or weaken tests/rules. Remote must match your copy; status must be clean.

```powershell
git remote -v
git status --short --branch
git switch dev
git pull --ff-only
```

Only if Git later reports unknown author, replace these values and configure this clone,
then retry that commit. Preserve good existing identity; author email is not authentication.

```powershell
git config user.name "YOUR_NAME"
git config user.email "YOUR_VERIFIED_EMAIL"
```

**Check:** Your private copy is open on clean `dev`, with approved security enabled.

## 2. Read the baseline and create your branch

Before editing, open **Actions**; wait for completed `dev` runs for **CodeQL**, **Quality**, and
**Security regression**. For each missing initial run, select that workflow separately:
**Run workflow > dev > Run workflow**. No button? Check default `dev` and Actions enabled;
if denied, stop for an administrator.

Read summaries: **20 ordinary + 3 compatibility passes**; security **1 pass / 2 failures**
(download access and limiter fail). Keep all three run URLs, checkout SHAs, and counts for the PR.
In **Security > Code scanning**, select `dev`; open `js/path-injection` and
`js/missing-rate-limiting` in [src/routes/download.cjs](src/routes/download.cjs).
Keep both actual alert URLs. Follow `req.query.name` through `path.resolve(dataRoot, name)`
to `readFile()`: normalization is not access control. Missing/pending scans are not completion;
a green CodeQL run can contain findings.

Create this branch; if it already exists, stop rather than overwrite it:

```powershell
git switch -c lab/fix-download
```

**Check:** Both alerts and expected baseline counts are visible; `lab/fix-download` is active.

## 3. Allow only the two documents

Edit only [src/routes/download.cjs](src/routes/download.cjs). Immediately inside
`registerDownload(app, dataRoot)`, before `app.get()`, add:

```javascript
  const allowedFiles = new Map([
    ['welcome.txt', path.resolve(dataRoot, 'welcome.txt')],
    ['policy.txt', path.resolve(dataRoot, 'policy.txt')]
  ]);
```

Replace `name.length === 0` with `!allowedFiles.has(name)`; keep the string check.
Delete `const target = path.resolve(dataRoot, name);` and both preceding unsafe-warning comments.
Replace `readFile(target, 'utf8')` with `readFile(allowedFiles.get(name), 'utf8')`.
Keep error handling; save. Status and staged filenames below must show **only this route**;
inspect each output before continuing.

```powershell
git status --short
git diff -- src/routes/download.cjs
git add -- src/routes/download.cjs
git diff --cached --name-only
git commit -m "fix: allow only workshop downloads"
git push -u origin lab/fix-download
```

On GitHub: **Pull requests > New pull request**, base `dev`, compare `lab/fix-download`,
then **Create pull request**. Title: **Fix download path and rate limiting**.
Paste baseline alert/run URLs, SHAs, and counts into its description.
In **Checks**, open the current Security regression summary; match its PR source head
to the latest PR commit (checkout can be a different test-merge SHA).
Comment the intermediate run URL and counts **before adding the limiter**. Do not merge yet.

**Check:** Security regression shows **2 passes / 1 failure**; the PR remains unmerged.

## 4. Limit repeated downloads

In the same route, add beside the other imports:

```javascript
const { rateLimit } = require('express-rate-limit');
```

Inside `registerDownload()`, after the allowlist and before `app.get()`, add:

```javascript
  const limiter = rateLimit({
    windowMs: 60_000,
    limit: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false
  });
```

Replace `app.get('/download', async (req, res) => {` with
`app.get('/download', limiter, async (req, res) => {`. Keep the allowlist and tests unchanged.
The dependency is already locked; Actions installs it. Save, inspect the diff,
and require the staged list to contain only the route before committing:

```powershell
git diff -- src/routes/download.cjs
git add -- src/routes/download.cjs
git diff --cached --name-only
git commit -m "fix: limit repeated downloads"
git push
```

The same PR updates. Comment its latest Security regression URL, PR head/checkout SHAs,
and counts. The limiter test permits 60 fixture reads and expects HTTP 429 next.

**Check:** Security regression shows **3 passes / 0 failures** on the latest PR revision.

## 5. Merge and verify both original alerts

Review **Files changed** and latest-head **Checks**: only the route changed;
**Quality: 20 ordinary + 3 compatibility passes**, **Security regression: 3 passes / 0 failures**,
**CodeQL: success**, and **Dependency review: success**. Zero/skipped tests do not count.
Missing/pending latest checks? Wait and refresh, not repeated pushes.
Meet existing rules and required approvals without weakening them; only then select
**Merge pull request > Confirm merge** into `dev`.

```powershell
git switch dev
git pull --ff-only
git rev-parse HEAD
```

Open the new `dev` CodeQL run for that merged SHA. Revisit **both original alert URLs**
on `dev`; require **Fixed**, not **Dismissed**. Add final run/alert URLs, merged SHA,
and observed states to a comment on the same PR. Pending indexing remains pending, not complete.
The map trusts controlled non-symlink fixtures; this in-process limiter is not complete
production or multi-server protection.

**Check:** Both original alerts show **Fixed** on merged `dev` after its analysis.
