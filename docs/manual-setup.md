# Manual setup when automated pull requests are not allowed

Use this only in **your approved private template copy**, never the source template
or a fork. Complete the access, Git authentication, and repository security settings
in [start-here.md](start-here.md) first. The instructor owns setup gaps. No token,
purchase, organization-policy change, or extra laptop tool is needed.

## 1. Keep or create the Exercise and task issues

**Do**

1. Open **Actions -> Start lab -> Run workflow -> dev**. Clear **Create starter
   pull requests** (`create_starter_prs: false`) and run it. This mode creates or
   reuses **issues only**, not branches or PRs.
2. Read the summary and open its Exercise and task issue links. Inspect **Issues ->
   Closed** and **Pull requests -> Closed** as well as open items. Preserve existing
   work and outcomes; do not reopen, reset, duplicate, or recreate a closed case.
3. If issue automation is also unavailable, the instructor uses **Issues -> New
   issue** to create only missing Exercise/task issues as a normal human. Use this
   copy's lab number/title from [LAB.md](../LAB.md), link that lesson and the two
   issues to each other, name the participant/next-action owner and target date,
   and state that automated setup/comments are unavailable. Reuse existing issues.
4. Add actual native alert, PR, and run URLs as they become available. A human issue
   is not an automated progress report; never invent bot identity, managed comments,
   scanner findings, or completed steps to make automation appear successful.

**See result:** the lesson has real work-item links and a named setup owner, even if
automated comments remain unavailable. A closed attempt is not silently restarted.

**Why:** a template copies files, not work-item history. Native pages plus honest
human evidence work without granting Actions more permission or adding a PAT.

## 2. Inspect before creating any branch

**Do**

In the browser, look for **both open and closed PRs** with the intended head name.
If one is closed, stop and ask the instructor about the existing outcome rather
than create another. On the laptop, save/commit/push intended work first; then run
these Git commands **one at a time**, stopping on any error:

```powershell
git remote -v
git status --short --branch
git switch dev
git pull --ff-only
git fetch origin
```

The remote must be your copy and the tree must have no file entries before the
switch. `dev` must be the trusted default, not an unmerged exercise. Do not push
directly to it. Replace `ACTUAL_BRANCH` with the branch for the case below:

```powershell
git ls-remote --heads origin refs/heads/ACTUAL_BRANCH
git branch --list ACTUAL_BRANCH
```

- A **successful** remote command returning no ref means remote absence. A login,
  authorization, or network failure does not. Resolve that failure before proceeding.
- If a remote branch exists, perhaps from a partially failed **Start lab**, fetch,
  inspect, and **reuse** it. Follow [the PR checkout routine](start-here.md#check-out-a-pr-branch)
  with its verified head name, even if the browser PR has not yet been created.
  After checkout, inspect the branch in VS Code and these read-only comparisons:

  ```powershell
  git log --oneline origin/dev..HEAD
  git diff --stat origin/dev...HEAD
  ```

- If a local branch already exists, preserve and inspect it too; do not run the
  new-branch command over it. A local-only partial attempt or missing upstream
  needs instructor review before publishing that same branch normally.
- Use the fresh-branch commands below **only when both local and remote branches
  are absent and no closed PR exists**. Never reset, force-push, delete a branch,
  discard work, or replace unknown changes to recreate a starter.
- On reused branches, perform only missing intended setup edits. If the correct
  diff is already present, do not make an empty/duplicate commit: use its open PR
  or the browser's **New pull request** if none exists.

**See result:** each case has one known branch and one native PR, with any existing
work retained. Conflicts or unexpected changes remain an instructor-owned blocker.

**Why:** denied PR creation can leave a valid branch behind; retrying blind creation
or overwriting it could destroy progress and invalidate the evidence.

## Labs 01-04: create the notes-only work PR

**Do**

1. Apply the inspection rules above to `lab/work`. For a genuinely new branch:

   ```powershell
   git switch -c lab/work origin/dev
   ```

2. In **VS Code Explorer**, create **exercise/start.md**. Write a short note naming
   this copy and the lesson you will follow; explain that the note is not a fix.
   Save it. Do not modify source, tests, dependencies, or workflows during this setup.
3. Review and publish only that note on the new work branch:

   ```powershell
   git add exercise/start.md
   git commit -m "docs: start my lab work"
   git push -u origin lab/work
   ```

4. On github.com open **Pull requests -> New pull request**. Select base **dev**,
   compare **lab/work**, both in this copy. Inspect the notes-only diff, choose
   **Create pull request**, give it a clear starter title, and link the task issue.
   Put the actual PR URL in that issue. If an open PR already exists, reuse it.
5. Continue [LAB.md](../LAB.md), preserving the original default baseline before
   any source repair. If Labs 02 or 04 offer a genuine Autofix/Dependabot PR, use
   **that PR's actual head branch** for the repair, not an imitation of a bot PR.
   Lab 04 retains `lab/work` for its later version-update configuration change.

**See result:** a human-created notes-only starter points at `dev`. It is not a
security fix, copied scan result, or fabricated Dependabot/Autofix update.

**Why:** a small real commit makes an ordinary PR without privileged automation.
The actual lesson still requires source/version changes and native readback.

## Lab 05: create the two gate cases

Use these cases **only in Lab 05**. Preserve the safe default baseline first and
follow the [instructor's browser ruleset setup](instructor.md#configure-lab-05-rules).
Neither intentionally broken case is to be merged. Do not change workflow files.

### A. Unsafe preview with a useful heading change

**Do**

1. Apply the branch inspection rules to `lab/unsafe-preview`. Start from clean,
   current `dev`; for a genuinely new branch only:

   ```powershell
   git switch -c lab/unsafe-preview origin/dev
   ```

2. Open [src/routes/preview.cjs](../src/routes/preview.cjs) in VS Code. The safe
   default has **Ticket preview** and `${escape(label)}`. If it does not, stop for
   instructor help instead of blindly replacing text. In this case branch only:
   - Replace `${escape(label)}` with `${label}` to create the controlled unsafe case.
   - Change the heading **Ticket preview** to **Secure ticket preview**. Keep this
     useful heading through the later repair so the final source diff is not empty.
   - Keep validation, the existing import, tests, and all workflows unchanged.
3. Save, inspect the route diff, and publish only this route:

   ```powershell
   git add src/routes/preview.cjs
   git commit -m "test: demonstrate unsafe preview gate"
   git push -u origin lab/unsafe-preview
   ```

4. Use **Pull requests -> New pull request** with base **dev**, compare
   **lab/unsafe-preview**, in this copy. Title it as the unsafe-preview gate case,
   link the task issue, and state that it must not merge until repaired. Reuse an
   existing open PR instead of duplicating one.

**See result:** a real changed-code PR produces **2 security passes / 1 failure**
and a native preview finding. Preserve both results before the lesson repairs it;
the native ruleset's block must be inspected separately from the failing test.

**Why:** restoring escaping later while retaining the useful heading proves a
real repair can pass the same controls, not just eliminate the whole source diff.

### B. Missing analysis, then recovery without merging

**Do**

1. Return to clean, updated `dev` with [the shared refresh routine](start-here.md#refresh-progress-from-dev),
   not the unsafe branch. Apply the inspection rules to `lab/missing-analysis`.
   For a genuinely new branch only:

   ```powershell
   git switch -c lab/missing-analysis origin/dev
   ```

2. In VS Code edit only [.github/codeql/codeql-config.yml](../.github/codeql/codeql-config.yml)
   to retain the name and `src` boundary but reference a deliberately absent query:

   ```yaml
   name: BSP beginner CodeQL
   paths:
     - src
   queries:
     - uses: ./bsp-missing-query.ql
   ```

   Do not create that query or change the actual CodeQL workflow. Create a short
   **exercise/scan-recovery.md** note in VS Code explaining that the query will be
   restored and this demonstration PR closed without merging.
3. Save and publish those exact files:

   ```powershell
   git add .github/codeql/codeql-config.yml exercise/scan-recovery.md
   git commit -m "test: demonstrate missing CodeQL analysis"
   git push -u origin lab/missing-analysis
   ```

4. Use **Pull requests -> New pull request** with base **dev**, compare
   **lab/missing-analysis**, in this copy; reuse an existing open PR if present.
   Give it a missing-analysis title, link the task issue, and state **close without
   merge**. Follow the lesson to preserve the failed analysis, replace only the
   missing query with `security-extended`, observe valid analysis, then close it.

**See result:** CodeQL cannot load the query; other suites remain 20 ordinary,
3 compatibility, and 3 security passes. Missing analysis is not zero findings.

**Why:** this case isolates scanner failure from vulnerable code. Its recovery is
evidence, not permission to merge a negative fixture or weaken a required rule.

## Check runs and return to the lesson

A normal human Git push triggers the shipped CI/CodeQL workflows; Dependency review
runs on the PR. If an existing setup-created PR shows **Approve workflows to run**,
an authorized human with write access approves it. If needed, a normal notes-only
participant commit triggers runs without concealing the lesson's negative state.
Read current Actions summaries and record actual checkout SHAs and counts, not
assumed results or a green icon alone. Missing/zero/skipped runs stay pending.

**Lab progress** can refresh the automated CodeQL/PR snapshot on `dev` when available;
it is not a whole-lab completion verdict. Dependabot/secret states come from native
Security pages and their original URLs in the task issue. If human-created issues
cannot receive managed comments, retain that automation gap explicitly and let the
instructor own it. Continue [LAB.md](../LAB.md) without extra local tools or credentials.
