# Audit Capability Card Testing Guide

This document describes the audit capability card component, its various states, and how to test them both manually and automatically.

## Overview

The Audit Capability Card displays on the ServicePulse dashboard and shows the status of the auditing feature. The card's status depends on:

1. Whether audit instances are configured
2. Whether all or only some audit instances are available
3. Capability-specific message readiness shown by the `Messages` indicator
4. Whether the ServiceControl version supports the "All Messages" feature (>= 6.6.0)

## Card States

| Status                  | Condition                     | Badge          | Action Button |
|-------------------------|-------------------------------|----------------|---------------|
| Instance Not Configured | No audit instances configured | Not configured | Get Started   |
| Unavailable             | All audit instances offline   | Unavailable    | Learn More    |
| Degraded                | Some audit instances offline  | Degraded       | Learn More    |
| Available               | All audit instances available | Available      | View Messages |

The `Messages` indicator carries the capability-specific readiness state. If no successful messages exist yet, or if `All Messages` is not supported, the card can still be `Available` while the indicator is yellow.

## Manual Testing with Mock Scenarios

### Prerequisites

```bash
cd src/Frontend
npm install
```

### Running the Dev Server with Mocks

```bash
npm run dev:mocks
```

This starts the dev server at `http://localhost:5173` with MSW (Mock Service Worker) intercepting API calls.

### Switching Between Scenarios

Set the `VITE_MOCK_SCENARIO` environment variable before running the dev server:

```bash
# Linux/macOS
VITE_MOCK_SCENARIO=audit-available npm run dev:mocks

# Windows CMD
set VITE_MOCK_SCENARIO=audit-available && npm run dev:mocks

# Windows PowerShell
$env:VITE_MOCK_SCENARIO="audit-available"; npm run dev:mocks
```

Open the browser console to see available scenarios.

#### Available Audit Scenarios

| Scenario                   | Status                  | Badge          | Button        | Description                                                       | Indicators      |
|----------------------------|-------------------------|----------------|---------------|-------------------------------------------------------------------|-----------------|
| `audit-no-instance`        | Instance Not Configured | Not configured | Get Started   | "A ServiceControl Audit instance has not been configured..."     | None            |
| `audit-unavailable`        | Unavailable             | Unavailable    | Learn More    | "All ServiceControl Audit instances are configured but not responding..." | None    |
| `audit-degraded`           | Degraded                | Degraded       | Learn More    | "Some ServiceControl Audit instances are not responding."        | Messages: ✅     |
| `audit-available`          | Available               | Available      | View Messages | "All ServiceControl Audit instances are available."              | Messages: ✅     |
| `audit-old-sc-version`     | Available               | Available      | View Messages | "All ServiceControl Audit instances are available."              | Messages: ⚠️     |
| `audit-no-messages`        | Available               | Available      | View Messages | "All ServiceControl Audit instances are available."              | Messages: ⚠️     |
| `audit-multiple-instances` | Available               | Available      | View Messages | "All ServiceControl Audit instances are available."              | Messages: ✅     |

**Indicator Legend:** ✅ = Available/Success, ❌ = Unavailable/Error, ⚠️ = Warning/Not Configured

### Adding New Scenarios

1. Add a scenario precondition to `src/Frontend/test/preconditions/platformCapabilities.ts`:

```typescript
export const scenarioMyScenario = async ({ driver }: SetupFactoryOptions) => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  // Add scenario-specific preconditions here
};
```

2. Create a new file in `src/Frontend/test/mocks/scenarios/` (e.g., `my-scenario.ts`):

```typescript
import { setupWorker } from "msw/browser";
import { Driver } from "../../driver";
import { makeMockEndpoint, makeMockEndpointDynamic } from "../../mock-endpoint";
import * as precondition from "../../preconditions";

export const worker = setupWorker();
const mockEndpoint = makeMockEndpoint({ mockServer: worker });
const mockEndpointDynamic = makeMockEndpointDynamic({ mockServer: worker });

const makeDriver = (): Driver => ({
  goTo() { throw new Error("Not implemented"); },
  mockEndpoint,
  mockEndpointDynamic,
  setUp(factory) { return factory({ driver: this }); },
  disposeApp() { throw new Error("Not implemented"); },
});

const driver = makeDriver();

export const setupComplete = (async () => {
  await driver.setUp(precondition.scenarioMyScenario);
})();
```

1. Register it in `src/Frontend/test/mocks/scenarios/index.ts`:

```typescript
const scenarios: Record<string, () => Promise<ScenarioModule>> = {
  // ... existing scenarios
  "my-scenario": () => import("./my-scenario"),
};
```

## Automated Tests

### Test Files

| File                                                                               | Type        | Description                             |
|------------------------------------------------------------------------------------|-------------|-----------------------------------------|
| `src/Frontend/test/specs/platformcapabilities/audit-capability-card.spec.ts`       | Application | End-to-end tests for the card component |
| `src/Frontend/test/specs/platformcapabilities/auditing-capability-helpers.spec.ts` | Unit        | Tests for helper functions              |

### Running Automated Tests

From the `src/Frontend` directory:

```bash
# Run all audit capability tests
npx vitest run test/specs/platformcapabilities/audit-capability-card.spec.ts

# Run helper function unit tests
npx vitest run test/specs/platformcapabilities/auditing-capability-helpers.spec.ts

# Run all platform capability tests
npx vitest run test/specs/platformcapabilities/
```

### Test Coverage

#### Application Tests (`audit-capability-card.spec.ts`)

| Rule                            | Test Case                                                         |
|---------------------------------|-------------------------------------------------------------------|
| No audit instance configured    | Shows "Get Started" button                                      |
| Audit instance unavailable      | Shows "Unavailable" status                                      |
| Partially unavailable instances | Shows "Degraded" status                                         |
| Available but no messages       | Keeps card available and shows a warning `Messages` indicator     |
| Available with messages         | Shows "Available" status + "View Messages" button               |
| ServiceControl < 6.6.0          | Keeps card available and shows warning `Messages` indicator       |
| Shared card signals             | Shows only the shared `Messages` indicator, not per-instance ones |

#### Unit Tests (`auditing-capability-helpers.spec.ts`)

| Function                                | Test Cases                                                         |
|-----------------------------------------|--------------------------------------------------------------------|
| `isAuditInstance`                       | Audit type, error type, unknown type, undefined type               |
| `filterAuditInstances`                  | null, undefined, empty, mixed, no audit, all audit                 |
| `allAuditInstancesUnavailable`          | null, undefined, empty, all unavailable, all online, mixed, single |
| `hasUnavailableAuditInstances`          | null, undefined, empty, at least one, all, none                    |
| `hasAvailableAuditInstances`            | null, undefined, empty, at least one, all, none                    |
| `hasPartiallyUnavailableAuditInstances` | null, undefined, empty, mixed, all online, all unavailable, single |

## Key Source Files

| File                                                                                  | Purpose                                |
|---------------------------------------------------------------------------------------|----------------------------------------|
| `src/Frontend/src/components/platformcapabilities/capabilities/AuditingCapability.ts` | Main composable and helper functions   |
| `src/Frontend/src/components/audit/isAllMessagesSupported.ts`                         | Version check for All Messages feature |
| `src/Frontend/src/stores/PlatformModelStore.ts`                                       | Shared platform model for audit instances |
| `src/Frontend/test/preconditions/platformCapabilities.ts`                             | Test preconditions and fixtures        |
| `src/Frontend/test/mocks/scenarios/`                                                  | Manual testing scenarios               |

## Status Indicators

The auditing card no longer renders per-instance widgets.

It shows a single `Messages` indicator when at least one audit instance is available:

- green when `All Messages` is supported and successful messages exist
- yellow when no successful messages exist yet
- yellow when the current ServiceControl version does not support `All Messages`

Instance-level audit visibility now lives on the `Platform health` page.

## Troubleshooting

### Scenario not loading

1. Check the browser console for errors
2. Verify the scenario name matches exactly (case-sensitive)
3. Ensure MSW is enabled (look for "[MSW] Mocking enabled" in console)

### Tests failing

1. Run `npm run type-check` to verify TypeScript compilation
2. Check if preconditions are properly set up
3. Use `--reporter=verbose` for detailed test output:

   ```bash
   npx vitest run test/specs/platformcapabilities/ --reporter=verbose
   ```
