# Lab 01 - Find and fix your first CodeQL alerts

**60 minutes · five small steps · your own private repository**

**Participant tools: Git + VS Code + browser GitHub.com only.** No local Node.js, package-manager installation, GitHub CLI, or application server is required. Dependencies and tests run in GitHub Actions.

[USE THIS TEMPLATE](https://github.com/alvine-aurelio-org/bsp-ghas-beginner-01-code-scanning/generate)

1. Create your copy in your approved organization; copy **only the default branch**.
2. Follow [Start here](docs/start-here.md) to enable approved security, clone your copy, and run **Start lab** in the browser.
3. Open the **Exercise** issue and follow [the five-step lab](LAB.md).

## What you will see

1. See your own CodeQL alerts
2. Read the unsafe file-path flow
3. Allow only the two workshop files
4. Limit repeated downloads
5. Merge and see the original alerts fixed

**The loop:** see a finding -> edit in VS Code -> Git commit/push -> inspect Actions and PR checks -> merge in GitHub.com -> verify the original native alert. The secret lesson ends with an honest test disposition instead of a code-fix claim.

GitHub does not copy issues, PRs, settings or alerts with a template. Browser **Start lab** recreates work items. If policy prevents automated PR creation, turn off **Create starter pull requests** and use [manual Git/browser setup](docs/manual-setup.md); no credential workaround or policy weakening. Genuine Dependabot/Autofix PRs come from their own GitHub features.

**Lab progress** refreshes code/PR evidence. Read original dependency and secret alerts directly in **Security**; the Actions token is not assumed to have every alert permission. Tests show actual counts and checkout revisions in run summaries, including expected red baselines. Missing access, skipped checks, and pending scans never mean clean.

## Help

- [Setup and Git branch routine](docs/start-here.md)
- [Manual setup without additional tools](docs/manual-setup.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Instructor checklist](docs/instructor.md)
- [Topic map and optional features](docs/topics.md)
- [Five-lab catalogue](https://github.com/alvine-aurelio-org/bsp-ghas-workshop)

Use only the synthetic fixtures. No real credentials, public hosting, paid cloud-agent sessions or production release. Never disable a check to finish.
