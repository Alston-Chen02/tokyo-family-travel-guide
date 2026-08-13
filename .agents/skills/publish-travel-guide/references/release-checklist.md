# Production release checklist

Use this checklist after every deployment. Record evidence for each applicable item.

## Before publishing

- Confirm repository, default branch, and Pages workflow trigger.
- Inspect `git status`, relevant source files, and `git diff --check`.
- Verify time-sensitive itinerary facts from primary sources.
- Check copyright and licensing before embedding third-party maps, images, fonts, or icons.
- Confirm no personal or booking information was newly exposed.
- Ensure new interactive controls have labels, keyboard activation, focus indication, and sensible empty/default states.
- If the application uses a service worker, bump the cache identifier when the release changes cached shell behavior or assets.

## Build and deployment

- Run the normal project build locally when possible.
- If local build is unavailable due to a managed environment, state why and use GitHub Actions.
- Verify the workflow belongs to the exact deployed commit SHA.
- Require a successful build and deploy job, not only a green commit status.
- Open the public GitHub Pages URL with a unique query string to bypass navigation cache.

## Desktop production QA

- Verify the intended page or day is reachable through visible navigation.
- Check headings, copy, links, icons, route lines, legends, cards, and spacing.
- Activate every new interaction and confirm the visible state changes correctly.
- Check browser console errors.
- Confirm the main document has no horizontal overflow.

## Mobile production QA

Set the viewport to **390 × 844** and reload the production page.

- Confirm `document.documentElement.scrollWidth <= window.innerWidth`.
- Confirm cards fit within the content gutter.
- Confirm SVG or map height is not stretched by an adjacent desktop column.
- Confirm horizontal carousels scroll inside their own container without widening the document.
- Confirm buttons remain readable and touchable, with important content unobscured by the fixed bottom navigation.
- Activate at least one map marker or interactive control and verify its detail panel.
- Capture or inspect a representative screenshot.
- Reset the viewport after testing.

## PWA and cache QA

- Confirm the deployed service worker contains the new cache identifier.
- Reload with a cache-busting query string.
- Verify the new release appears without asking the user to clear all browser data.
- Preserve offline fallback behavior.

## Completion rule

Deployment success is necessary but insufficient. Complete the task only after production desktop, mobile, interaction, overflow, error-log, link, and relevant cache checks pass. If any check fails, fix and redeploy before reporting completion.
