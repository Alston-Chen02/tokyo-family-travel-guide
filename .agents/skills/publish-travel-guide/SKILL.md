---
name: publish-travel-guide
description: Safely change and publish the Tokyo family digital travel guide, including itinerary data, React UI, interactive maps, PWA/offline behavior, GitHub Pages deployment, and production visual QA. Use for any request to update, release, deploy, publish, or verify the tokyo-family-travel-guide website or its public GitHub Pages release.
---

# Publish Travel Guide

Treat the public GitHub Pages site as the acceptance target. A successful merge or deployment is not completion.

## Workflow

1. Read the current repository instructions, status, default branch, deployment workflow, `package.json`, relevant source files, and service worker.
2. Confirm the requested scope. Preserve unrelated user changes and never stage them silently.
3. For changing schedules, restrictions, prices, passes, closures, or operating hours, verify current primary sources before editing. Link to official sources rather than copying copyrighted maps or artwork.
4. Create an isolated `agent/<description>` branch when working from the default branch.
5. Implement the smallest coherent change. Match the existing visual language, responsive conventions, accessibility patterns, and data structure.
6. Run available local checks. At minimum run `git diff --check`; run the repository build when dependencies are present. If company policy or networking blocks local dependencies, do not install system-wide software or bypass restrictions. Use the connected GitHub app and make GitHub Actions the authoritative build check.
7. Review the full diff, stage only intended files, and commit tersely.
8. Publish through an authenticated local Git workflow when available. If GitHub CLI is unavailable, use the connected GitHub app to create the branch, update files, and open the PR. Do not require installing GitHub CLI on a managed computer.
9. Open a draft PR with scope, user impact, and validation notes. Merge only when the user authorized going live and the PR is mergeable.
10. Wait for the exact `main` commit's Pages workflow. Require `status=completed` and `conclusion=success` before production QA.
11. Perform every checkpoint in [release-checklist.md](references/release-checklist.md) against the cache-busted public URL.
12. If production QA exposes a defect, fix it, deploy again, and repeat the complete affected checkpoint set. Never declare completion from source inspection alone.

## Release gates

Do not report the release complete until all applicable gates pass:

- Source and content correctness
- Clean diff and intended-file scope
- Build and Pages deployment
- Desktop production layout
- 390 × 844 mobile production layout
- Interactive behavior and keyboard access
- No horizontal page overflow
- No browser console errors caused by the release
- PWA service-worker cache refresh when shell assets or behavior changed
- Public link and official external links work

Keep the production tab open as a deliverable when the user asked to see the result.

## Reporting

Lead with the live outcome. Include the public URL, PR or commit link, deployment result, desktop/mobile QA result, and any remaining limitation. If a gate did not pass, say the release is incomplete.
