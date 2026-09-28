# Lab 01: Find and fix your first CodeQL alerts

**Time:** about 60 minutes. **Goal:** repair two download findings in your own private copy.
Complete [docs/start-here.md](docs/start-here.md) first. Use the recreated Exercise
and task issues, not the source template's issues or scan history.
Run terminal commands separately; inspect each result before continuing.

## 1. See your own CodeQL alerts

**Do**

1. Open **Actions -> CodeQL** and the completed run for your copy's `dev` branch.
2. Open **Security -> Code scanning** (sometimes under **Security and quality**).
   Select the default branch and open `js/path-injection` and
   `js/missing-rate-limiting` in [src/routes/download.cjs](src/routes/download.cjs).
   Keep both actual alert URLs; alert numbers differ between copies.
3. In your clone, run the tests, then find the notes-only `lab/work` starter PR:

   ```powershell
   npm test
   npm run test:compatibility
   npm run test:security
   gh pr list
   ```

4. Replace `NUMBER` below with the PR number whose head is `lab/work`:

   ```powershell
   gh pr checkout NUMBER
   ```

**See result:** 20 ordinary tests and 3 compatibility tests pass. Security tests
show **1 pass / 2 failures**: preview passes; download access and rate limiting fail.
The two CodeQL findings are real alerts in this copy. Missing findings mean
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
   [solutions/download-allowlist.cjs](solutions/download-allowlist.cjs).
   On Windows, this is the same replacement:

   ```powershell
   Copy-Item solutions/download-allowlist.cjs src/routes/download.cjs
   ```

   On other systems, copy its full text into the route in VS Code or the
   [GitHub file editor on the PR branch](docs/start-here.md#save-and-push-a-small-change).
4. Run `npm run test:security`. In **Source Control**, stage only the route,
   **Commit** with `fix: allow only workshop downloads`, then **... -> Push**.
   Open this PR's **Files changed** and **Checks**.

**See result:** security tests now show **2 passes / 1 failure**. The limiter test
still fails, so leave the PR unmerged. The original default-branch alerts can
remain open while the repair is only on this PR.

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
   handler in `app.get()`. Keep the allowlist. The dependency is already installed.
   Full-file fallback: [solutions/src/routes/download.cjs](solutions/src/routes/download.cjs).

   ```powershell
   Copy-Item solutions/src/routes/download.cjs src/routes/download.cjs
   npm test
   npm run test:compatibility
   npm run test:security
   ```

   Skip `Copy-Item` if you made the small edits; the tests are required either way.
4. Fill the short [exercise/notes.md](exercise/notes.md) handover with your owner,
   target, original alert URLs, PR URL, and remaining risk. Stage the route and
   notes, **Commit**, and **Push** to the same PR. Do not edit any tests.

**See result:** **20 ordinary + 3 compatibility + 3 security tests pass**.
The limiter test allows 60 fixture reads and expects HTTP 429 for the next one.
Inspect the new CodeQL and other checks for this exact PR revision.

**Why:** access control and abuse control need separate fixes; a passing test is
useful evidence, not a substitute for native CodeQL analysis.

## 5. Merge and see the original alerts fixed

**Do**

1. In the actual repair PR, inspect **Files changed** and current **Checks**.
   The route repair must be present; a notes-only change is not a solution.
2. When current checks and any inherited rules permit, select **Merge pull request
   -> Confirm merge** into `dev`. This exercise adds no independent-reviewer gate.
3. Follow [Refresh progress from dev](docs/start-here.md#refresh-progress-from-dev),
   including `npm run lab:status` from the clean, updated default checkout.
4. Open the new default-branch CodeQL run, then revisit both original alert URLs.
   Check their default-branch state, not just the PR check's green icon.
5. Add the final run URLs and observed alert states to your task issue's handover
   comment. If analysis/indexing is pending, record pending and refresh later.

**See result:** both original findings are **Fixed**, not **Dismissed**, after
analysis of the merged default revision. The Exercise comment links your copy's evidence.

**Why:** only a merged repair plus the scanner's readback proves this default-branch
finding was fixed. A successful analysis can still contain alerts.

Production note: the map assumes trusted, non-symlink fixture files; the simple
in-process limiter is not a complete production or multi-server design.
