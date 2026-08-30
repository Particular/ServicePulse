# Platform Health Page Testing Guide

This document describes the Platform health page, how it derives its rows and severity, and how to test it manually and automatically.

## Overview

The Platform health page provides instance-level visibility across the ServiceControl platform.

It is intentionally frontend-first and mock-driven in this branch. The page:

- uses the shared platform model from `PlatformModelStore` as its source of truth for platform instances
- derives page-specific row and details behavior in `PlatformHealthStore`
- keeps topology and instance visibility on the page instead of duplicating per-instance widgets on capability cards
- uses built-in platform custom checks as secondary health signals for page-specific health inference

## Page Behavior

The page renders one row per platform instance:

- primary error instance
- zero or more remote instances
- monitoring instance when configured

Each row shows:

- instance type
- instance name, linked directly to that instance `apiUrl`
- current version
- health state
- upgrade cue when a newer version is known

Rows for degraded or unavailable instances can expand to show details.

Those details come from:

- matching built-in platform custom checks when available
- fallback page-specific messages when no custom-check detail is available

## Severity Model

The page-level severity shown in navigation follows this precedence:

1. `danger`
2. `warning`
3. `info` for outdated-only states

Current severity rules:

- `danger`
  - primary error instance unavailable
  - any remote error instance not healthy
  - monitoring unavailable
- `warning`
  - primary error instance degraded
  - any audit instance degraded
- `none`
  - no availability or degradation issues

When severity is `none` but at least one row has an upgrade cue, the nav shows the info/outdated-only state.

## Shared Model Split

The current architecture intentionally separates shared platform state from page-specific health semantics:

- `src/Frontend/src/stores/PlatformModelStore.ts`
  - shared aggregation and normalization layer
- `src/Frontend/src/resources/PlatformModel.ts`
  - shared platform types including `PlatformInstance`
- `src/Frontend/src/stores/PlatformHealthStore.ts`
  - page-specific severity, rows, upgrade cues, and details

`PlatformHealthRow` remains page-specific and is not pushed into the shared platform model.

## Built-In Custom Checks

Built-in platform custom checks are hidden by default from the Custom Checks page, dashboard tile, and menu badge.

On Platform health they are still used as secondary signals to:

- degrade or fail platform-health rows
- populate expanded row details, including `failure_reason`

The lookup is curated by `category + custom_check_id`, not by `custom_check_id` alone.

## Manual Testing with Mock Scenarios

### Prerequisites

```bash
cd src/Frontend
npm install
```

### Running the Dev Server with Mocks

```bash
VITE_MOCK_SCENARIO=platform-health npm run dev:mocks
```

This starts the dev server at `http://localhost:5173` with the shared Platform health mock controls enabled.

### Startup Scenario

The Platform health page currently has a single startup scenario:

- `platform-health`

After startup, use the browser console runtime helpers to switch topology, status, and custom-check conditions live.

### Runtime Helpers

```javascript
window.__platformHealth.getState()
window.__platformHealth.getCustomChecks()
window.__platformHealth.reset()
window.__platformHealth.setScenario("single-region-healthy")
window.__platformHealth.setStatus("remote-0", "degraded")
window.__platformHealth.setCustomCheckPreset("platform-only-primary")
window.__platformHealth.setCustomChecks([])
window.__platformHealth.clearCustomChecks()
```

### Topology Scenarios

Switch topology at runtime with `window.__platformHealth.setScenario(...)`:

| Scenario | Purpose |
|----------|---------|
| `single-region-healthy` | Primary and monitoring healthy, audit remotes healthy |
| `single-region-warning` | Monitoring healthy, one degraded audit instance |
| `single-region-danger` | Primary unavailable, audit degraded, monitoring unavailable |
| `multi-region-healthy` | Primary healthy with remote error instances and no monitoring |
| `multi-region-danger` | One remote error instance unavailable |

### Custom Check Presets

Switch custom-check state independently with `window.__platformHealth.setCustomCheckPreset(...)`:

| Preset | Purpose |
|--------|---------|
| `none` | No custom checks |
| `user-only` | Non-platform custom checks only |
| `platform-only-primary` | Built-in primary critical-error signal |
| `platform-only-primary-degraded` | Built-in primary degraded signal |
| `platform-only-audit` | Built-in audit degraded signal |
| `mixed-primary-and-user` | Combined platform and user checks |

### Manual Checks

Verify these behaviors from the single startup scenario plus runtime switches:

| Behavior | How to exercise it |
|----------|--------------------|
| Healthy single-region table | `setScenario("single-region-healthy")` |
| Warning state from degraded audit instance | `setScenario("single-region-warning")` |
| Danger state from unavailable instances | `setScenario("single-region-danger")` or `setScenario("multi-region-danger")` |
| Multi-region topology | `setScenario("multi-region-healthy")` |
| Built-in platform checks hidden from Custom Checks UI but applied to Platform health | `setCustomCheckPreset("platform-only-primary")` or `setCustomCheckPreset("platform-only-audit")` |
| Expanded row details with `failure_reason` | trigger degraded/unavailable row, then click the health badge |
| Upgrade cue rendering | use instances whose versions differ from the known latest version in the scenario data |
| Support-case modal download flow | click `Open support case`, download the JSON, then verify the support link becomes enabled |

## Automated Tests

### Test Files

| File | Type | Description |
|------|------|-------------|
| `src/Frontend/src/stores/PlatformHealthStore.spec.ts` | Component/unit | Platform health severity, row derivation, and built-in check inference |
| `src/Frontend/src/views/PlatformHealthView.spec.ts` | Component | Page rendering, upgrade cues, row expansion, and support modal behavior |
| `src/Frontend/test/mocks/platform-health-state.spec.ts` | Unit | Runtime mock helper behavior and custom-check preset switching |

### Running Automated Tests

From the `src/Frontend` directory:

```bash
npx vitest run src/stores/PlatformHealthStore.spec.ts
npx vitest run src/views/PlatformHealthView.spec.ts
npx vitest run test/mocks/platform-health-state.spec.ts
```

### Test Coverage

| Area | Covered behavior |
|------|------------------|
| Platform health store | warning/danger severity, multi-region danger, monitoring presence, version fallback, built-in custom-check health inference |
| Platform health view | support download gating, upgrade cue rendering, direct instance links, monitoring row rendering, expandable degraded rows |
| Mock helpers | independent topology and custom-check switching |

## Key Source Files

| File | Purpose |
|------|---------|
| `src/Frontend/src/views/PlatformHealthView.vue` | Platform health page UI |
| `src/Frontend/src/stores/PlatformHealthStore.ts` | Page-specific rows, severity, and details |
| `src/Frontend/src/stores/PlatformModelStore.ts` | Shared platform instance aggregation |
| `src/Frontend/src/resources/PlatformModel.ts` | Shared platform types |
| `src/Frontend/src/resources/PlatformHealth.ts` | Page-specific response/row types |
| `src/Frontend/test/mocks/platform-health-state.ts` | Runtime mock topology and custom-check controls |
| `src/Frontend/src/components/platformhealth/PlatformHealthMenuItem.vue` | Navigation severity and tooltip behavior |

## Troubleshooting

### Scenario not loading

1. Check the browser console for errors.
2. Verify `VITE_MOCK_SCENARIO=platform-health` is set when running `npm run dev:mocks`.
3. Ensure MSW is enabled.

### Unexpected topology or custom-check state

1. Run `window.__platformHealth.reset()`.
2. Reapply `setScenario(...)` and `setCustomCheckPreset(...)` separately.
3. Use `window.__platformHealth.getState()` and `getCustomChecks()` to confirm the active mock state.

### Tests failing

1. Run `npm run type-check`.
2. Run the focused Platform health specs listed above.
3. Use `npx vitest run <path> --reporter=verbose` for more detail.
