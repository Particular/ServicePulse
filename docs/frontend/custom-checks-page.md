# Custom Checks Page Testing Guide

This document describes the frontend Custom Checks page behavior, with a focus on built-in platform custom checks and how they relate to other frontend views.

For shared frontend mock and Vitest workflow, see `docs/frontend/testing-basics.md`.

## Overview

The Custom Checks page shows failing custom checks reported to ServiceControl.

Built-in platform custom checks are handled differently from user-defined custom checks:

- they are hidden by default from the Custom Checks page
- they are hidden by default from the Custom Checks dashboard tile and menu badge
- operators can reveal them with `Show platform custom checks`
- Platform health consumes those built-in checks as secondary platform signals

## Built-In Platform Custom Checks

The built-in platform custom check catalog is curated in:

- `src/Frontend/src/components/customchecks/builtInPlatformChecks.ts`

The frontend uses that catalog for two different purposes:

1. filtering built-in platform checks out of the Custom Checks UI by default
2. recognizing built-in platform checks that Platform health can use as secondary instance signals

Recognition is based on:

- `category + custom_check_id`

This is intentional because ServiceControl can reuse the same `custom_check_id` across different categories.

## Page Behavior

The Custom Checks page:

- fetches failed custom checks from `customchecks?status=fail&page=<n>`
- shows only non-platform custom checks by default
- exposes `Show platform custom checks` to reveal built-in platform checks
- keeps pagination tied to the visible filtered list

Relevant frontend pieces:

- `src/Frontend/src/views/CustomChecksView.vue`
- `src/Frontend/src/stores/CustomChecksStore.ts`
- `src/Frontend/src/components/customchecks/CustomCheckView.vue`

## Platform Health Relationship

Platform health uses built-in platform checks even when the Custom Checks page hides them.

Platform health also refreshes those custom checks directly, so this behavior does not depend on visiting the Custom Checks page first.

That logic is documented in:

- `docs/frontend/platform-health-page.md`

When Platform health assigns a built-in degraded check to a specific platform instance, it uses:

- built-in recognition by `category + custom_check_id`
- instance assignment by `originating_endpoint.name`

The Custom Checks page itself does not perform that instance correlation. It only exposes the raw custom check data and the show/hide toggle.

## Manual Testing with Mock Scenarios

Start from the shared frontend mocking workflow in `docs/frontend/testing-basics.md`.

For built-in platform custom check behavior, the most useful mock setup is:

- `VITE_MOCK_SCENARIO=platform-health npm run dev:mocks`

Then use:

- `window.__platformHealth.setCustomCheckPreset("none")`
- `window.__platformHealth.setCustomCheckPreset("user-only")`
- `window.__platformHealth.setCustomCheckPreset("platform-only-primary")`
- `window.__platformHealth.setCustomCheckPreset("platform-only-primary-degraded")`
- `window.__platformHealth.setCustomCheckPreset("platform-only-audit")`
- `window.__platformHealth.setCustomCheckPreset("mixed-primary-and-user")`

### Manual Checks

| Behavior | How to exercise it |
|----------|--------------------|
| Built-in platform checks hidden by default | Apply `platform-only-primary` or `platform-only-audit`, then open Custom Checks page |
| Built-in platform checks shown when toggled on | Apply a platform-only preset, enable `Show platform custom checks` |
| User-defined checks visible by default | Apply `user-only` or `mixed-primary-and-user` |
| Platform health reacts to hidden built-in checks | Apply `platform-only-primary-degraded` or `platform-only-audit`, then compare Platform health with Custom Checks page |

## Automated Tests

### Test Files

| File | Type | Description |
|------|------|-------------|
| `src/Frontend/src/stores/CustomChecksStore.spec.ts` | Unit | built-in check filtering and toggle behavior |

### Running Automated Tests

Use the shared commands in `docs/frontend/testing-basics.md`, then run:

```bash
npx vitest run src/stores/CustomChecksStore.spec.ts
```

## Troubleshooting

Use `docs/frontend/testing-basics.md` for shared troubleshooting.

Custom Checks-specific checks:

1. If a built-in platform check is visible unexpectedly, confirm `showPlatformCustomChecks` is off.
2. If Platform health reacts to a check that the page is hiding, that is expected behavior.
3. If a built-in check is classified incorrectly, inspect `category` and `custom_check_id` against `builtInPlatformChecks.ts`.
