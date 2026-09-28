# Lab 01 - Find and fix your first CodeQL alerts

**60 minutes · five small steps · your own private repository**

[USE THIS TEMPLATE](https://github.com/alvine-aurelio-org/bsp-ghas-beginner-01-code-scanning/generate)

1. Create your copy in your approved organization; copy **only the default branch**.
2. Follow [Start here](docs/start-here.md) to enable existing-entitlement security, clone your copy and recreate its issues/PRs.
3. Open the **Exercise** issue and follow [the five-step lab](LAB.md).

## What you will see

1. See your own CodeQL alerts
2. Read the unsafe file-path flow
3. Allow only the two workshop files
4. Limit repeated downloads
5. Merge and see the original alerts fixed

**The loop:** see a finding -> change one thing -> push -> inspect the new run -> merge -> see the original alert fixed.

GitHub does not copy issues, PRs, settings or alerts with a template. **Start lab** / `npm run lab:setup` recreates the starter work items in your copy. Native scans create fresh alerts. The real Dependabot/Autofix PRs are created by their own GitHub features, never impersonated.

The **Lab progress** workflow refreshes code/PR evidence. `npm run lab:status` gives the full authorized snapshot. Unavailable scans stay pending; green jobs and checkboxes do not prove a fix.

## Help

- [Setup and active-committer access](docs/start-here.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Instructor checklist](docs/instructor.md)
- [Topic map and optional features](docs/topics.md)
- [Five-lab catalogue](https://github.com/alvine-aurelio-org/bsp-ghas-workshop)

Use only the synthetic fixtures. No real credentials, public hosting, paid cloud-agent sessions or production release. This starter intentionally contains the lesson's findings; never disable a check to finish.
