# Platform Health Page Testing Guide

This document describes the Platform health page, how it derives its rows and severity, and how to test it manually and automatically.

For shared frontend mock and Vitest workflow, see `docs/frontend/testing-basics.md`.

This page is also the canonical reference for shared platform topology scenarios used across Platform health and the capability-card docs.

For Custom Checks page behavior around built-in platform checks, see `docs/frontend/custom-checks-page.md`.

## Overview

The Platform health page provides instance-level visibility across the ServiceControl platform.

The page is frontend-first and mock-driven. It:

- uses the shared platform model from `PlatformModelStore` as its source of truth for platform instances
- derives page-specific row and details behavior in `PlatformHealthStore`
- keeps topology and instance visibility on the page instead of duplicating per-instance widgets on capability cards
- uses built-in platform custom checks as secondary health signals for page-specific health inference, including instance-mapped degraded states

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

The architecture intentionally separates shared platform state from page-specific health semantics:

- `src/Frontend/src/stores/PlatformModelStore.ts`
  - shared aggregation and normalization layer
- `src/Frontend/src/resources/PlatformModel.ts`
  - shared platform types including `PlatformInstance`
- `src/Frontend/src/stores/PlatformHealthStore.ts`
  - page-specific severity, rows, upgrade cues, and details

## Built-In Custom Checks

Platform health consumes built-in platform custom checks as secondary signals even when those checks are hidden by default on the Custom Checks page.

On Platform health they are used to:

- degrade or fail platform-health rows
- populate expanded row details, including `failure_reason`

For the shared built-in-check catalog and Custom Checks page behavior, see `docs/frontend/custom-checks-page.md`.

Platform health-specific rule:

- when assigning a built-in degraded check to a specific instance, use `originating_endpoint.name` to match the emitting platform instance

## Manual Testing with Mock Scenarios

Start from the shared frontend mocking workflow in `docs/frontend/testing-basics.md`, then use the Platform health scenario and runtime helpers below.

### Startup Scenario

The Platform health page has a single startup scenario:

- `platform-health`

After startup, use the browser console runtime helpers to switch topology, status, and custom-check conditions live.

### Runtime Helpers

```javascript
window.__platformHealth.getState()
window.__platformHealth.reset()
window.__platformHealth.setScenario("single-region-healthy")
window.__platformHealth.setStatus("remote-0", "degraded")
```

For custom-check-specific helpers and presets, see `docs/frontend/custom-checks-page.md`.

### Topology Scenarios

Switch topology at runtime with `window.__platformHealth.setScenario(...)`:

| Scenario | Purpose |
|----------|---------|
| `single-region-healthy` | Primary and monitoring healthy, audit remotes healthy |
| `single-region-warning` | Monitoring healthy, audit remotes healthy; pair with a built-in audit preset to exercise degraded audit state |
| `single-region-danger` | Primary unavailable, audit remotes healthy, monitoring unavailable |
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
| `platform-only-audit` | Built-in audit degraded signal targeted at a specific audit instance |
| `mixed-primary-and-user` | Combined platform and user checks |

### Manual Checks

Verify these behaviors from the single startup scenario plus runtime switches:

| Behavior | How to exercise it |
|----------|--------------------|
| Healthy single-region table | `setScenario("single-region-healthy")` |
| Warning state from degraded audit instance | `setScenario("single-region-warning")` plus `setCustomCheckPreset("platform-only-audit")` |
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

Use the shared commands in `docs/frontend/testing-basics.md`, then run these Platform health-specific specs:

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

Use `docs/frontend/testing-basics.md` for shared troubleshooting.

Platform health-specific checks:

### Unexpected topology or custom-check state

1. Run `window.__platformHealth.reset()`.
2. Reapply `setScenario(...)` and `setCustomCheckPreset(...)` separately.
3. Use `window.__platformHealth.getState()` and `getCustomChecks()` to confirm the active mock state.

### Tests failing

1. Run the focused Platform health specs listed above.
2. If a degraded row is missing or assigned to the wrong instance, inspect the check's `originating_endpoint.name` and the instance name carried in the platform model.
