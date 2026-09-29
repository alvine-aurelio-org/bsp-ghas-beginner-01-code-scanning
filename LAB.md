# Lab 01: Find and fix your first CodeQL alerts

**Time:** about 60 minutes. **Goal:** repair two download findings in your own private copy.
Complete [docs/start-here.md](docs/start-here.md) first. Use your copy's Exercise
and task issues, not the template's history. Use Git, VS Code, and browser github.com
only; the unchanged tests and CodeQL run in GitHub Actions, not on your laptop.

## 1. See your own CodeQL alerts

**Do**

1. **Before changing anything**, open the original `dev` runs for **Quality /
   unit-and-compatibility** and **Security regression / secure-behavior** in Actions.
   Read their summaries: checkout SHA, installed lodash version, and suite counts.
   Keep both run URLs and the baseline counts in your task issue.
2. Open **Actions -> CodeQL** and its completed run for that default revision.
   Open **Security -> Code scanning** (sometimes under **Security and quality**).
   Select the default branch and open `js/path-injection` and
   `js/missing-rate-limiting` in [src/routes/download.cjs](src/routes/download.cjs).
   Keep both actual alert URLs; alert numbers differ between copies.
3. In **Pull requests**, find the notes-only PR whose head is `lab/work`.
   [Check out that PR branch](docs/start-here.md#check-out-a-pr-branch) using Git.
   If setup could not create it, follow [manual setup](docs/manual-setup.md);
   do not change organization policy or recreate closed work.

**See result:** 20 ordinary tests and 3 compatibility tests pass. Security tests
show **1 pass / 2 failures**: preview passes; download access and rate limiting fail.
These are observed Actions results, not predicted local results. Missing findings mean
[setup needs attention](docs/troubleshooting.md), not that this lab is complete.

**Why:** normal behavior tests can pass while a security boundary is still unsafe.

## 2. Follow the unsafe file-path flow

**Do**

1. In the path-injection alert, expand the flow/path view if offered. Open
   [src/routes/download.cjs](src/routes/download.cjs) in VS Code.
2. Find `req.query.name`, then `path.resolve(dataRoot, name)`, then `readFile()`.
   A caller's text currently chooses the filesystem path.
3. Open the two intended documents: [data/welcome.txt](data/welcome.txt) and
   [data/policy.txt](data/policy.txt). Read the download test in
   [test/security.test.cjs](test/security.test.cjs); it creates its own temporary canaries.
4. Look at the second alert too: the download handler has no request limiter.

**See result:** one handler has two different problems: what it can read and how
often it can be called. No real file paths or attack payloads need to be tried.

**Why:** `path.resolve()` normalizes a path; it does not confine caller input to a folder.

## 3. Allow only the two workshop documents

**Do**

1. Stay on `lab/work`. Inside `registerDownload()`, before `app.get()`, add:

   ```javascript
   const allowedFiles = new Map([
     ['welcome.txt', path.resolve(dataRoot, 'welcome.txt')],
     ['policy.txt', path.resolve(dataRoot, 'policy.txt')]
   ]);
   ```

2. Change the existing name check to
   `typeof name !== 'string' || !allowedFiles.has(name)`.
   Remove `const target = path.resolve(dataRoot, name);` and its obsolete unsafe-path
   comment. Change `readFile(target, 'utf8')` to
   `readFile(allowedFiles.get(name), 'utf8')`. Keep the error handling.
3. If stuck, replace the whole route with
   [solutions/download-allowlist.cjs](solutions/download-allowlist.cjs): open it
   in VS Code, copy its full text into the route, and save. Do not edit the solution.
4. [Save and push](docs/start-here.md#save-and-push-a-small-change) only the route
   with message `fix: allow only workshop downloads`. In this PR's **Files changed**
   and **Checks**, open the new Security regression run and its summary.
   **Record this intermediate run before adding the limiter.**

**See result:** security tests now show **2 passes / 1 failure**. The limiter test
still fails, so leave the PR unmerged. The original default-branch alerts can
remain open while the repair is only on this PR. Zero or skipped tests do not count.

**Why:** the request selects a trusted map entry instead of constructing a path.
The intermediate solution intentionally does not fix rate limiting.

## 4. Limit repeated downloads

**Do**

1. In the same route, add this beside the other imports:

   ```javascript
   const { rateLimit } = require('express-rate-limit');
   ```

2. Inside `registerDownload()`, before `app.get()`, add:

   ```javascript
   const limiter = rateLimit({
     windowMs: 60_000,
     limit: 60,
     standardHeaders: 'draft-8',
     legacyHeaders: false
   });
   ```

3. Insert `limiter` between the `'/download'` argument and the existing async
   handler in `app.get()`. Keep the allowlist. The dependency is already in the
   lockfile; Actions installs it. If needed, copy the full text of
   [solutions/src/routes/download.cjs](solutions/src/routes/download.cjs) into
   the route using VS Code, not a shell copy command.
4. Fill the short [exercise/notes.md](exercise/notes.md) handover with your owner,
   target, original alert URLs, PR URL, and remaining risk. Stage the route and
   notes, **Commit**, and **Push** to the same PR. Inspect the new Actions summaries
   and current CodeQL and Dependency review checks. Do not edit tests or workflows.

**See result:** **20 ordinary + 3 compatibility + 3 security tests pass**.
The limiter test allows 60 fixture reads and expects HTTP 429 for the next one.
Match the run's PR revision and reported checkout SHA; retain the earlier failing runs.

**Why:** access control and abuse control need separate fixes; a passing test is
useful evidence, not a substitute for native CodeQL analysis.

## 5. Merge and see the original alerts fixed

**Do**

1. In the actual repair PR, inspect **Files changed** and current **Checks**.
   The route repair must be present; a notes-only change is not a solution.
2. When current checks and any inherited rules permit, select **Merge pull request
   -> Confirm merge** into `dev`. This exercise adds no independent-reviewer gate.
3. Follow [Refresh progress from dev](docs/start-here.md#refresh-progress-from-dev).
   Use **Actions -> Lab progress -> Run workflow -> dev** if its CodeQL/PR snapshot
   needs refreshing; a snapshot alone does not establish whole-lab completion.
4. Open the new default-branch CodeQL run, then revisit both original alert URLs.
   Check the merged checkout SHA and default-branch state, not just a green PR icon.
5. Add the final run URLs and observed alert states to your task issue's handover
   comment. If analysis/indexing is pending, record pending and refresh later.

**See result:** both original findings are **Fixed**, not **Dismissed**, after
analysis of the merged default revision. Your task issue links the original,
intermediate, and final evidence; an unavailable automated comment stays unavailable.

**Why:** only a merged repair plus the scanner's readback proves this default-branch
finding was fixed. A successful analysis can still contain alerts.

Production note: this map trusts non-symlink fixture files. Its in-process limiter
does not provide complete production or multi-server protection.
