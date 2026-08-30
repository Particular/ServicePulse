# Monitoring Capability Card Testing Guide

This document describes the monitoring capability card component, its various states, and how to test them both manually and automatically.

## Overview

The Monitoring Capability Card displays on the ServicePulse dashboard and shows the status of the monitoring feature. The card's status depends on:

1. Whether the monitoring instance is configured in ServicePulse
2. Whether the monitoring instance is available (responding)
3. Capability-specific metrics readiness shown by the `Metrics` indicator

## Card States

| Status                  | Condition                                         | Badge          | Action Button |
|-------------------------|---------------------------------------------------|----------------|---------------|
| Instance Not Configured | Monitoring URL not configured in ServicePulse     | Not configured | Get Started   |
| Unavailable             | Monitoring instance configured but not responding | Unavailable    | Learn More    |
| Available               | Monitoring instance configured and responding     | Available      | View Metrics  |

The `Metrics` indicator carries the capability-specific readiness state. If no endpoints are currently sending throughput data, the card still stays `Available` while the indicator is yellow.

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
VITE_MOCK_SCENARIO=monitoring-available npm run dev:mocks

# Windows CMD
set VITE_MOCK_SCENARIO=monitoring-available && npm run dev:mocks

# Windows PowerShell
$env:VITE_MOCK_SCENARIO="monitoring-available"; npm run dev:mocks
```

Open the browser console to see available scenarios.

#### Available Monitoring Scenarios

| Scenario                  | Status      | Badge       | Button       | Description                                                                                                       | Indicators  |
|---------------------------|-------------|-------------|--------------|-------------------------------------------------------------------------------------------------------------------|-------------|
| `monitoring-available`    | Available   | Available   | View Metrics | "The ServiceControl Monitoring instance is available. Use the Metrics indicator to see whether endpoints are currently sending throughput data." | Metrics: ✅ |
| `monitoring-unavailable`  | Unavailable | Unavailable | Learn More   | "The ServiceControl Monitoring instance is configured but not responding..."                                      | None        |
| `monitoring-no-endpoints` | Available   | Available   | View Metrics | "The ServiceControl Monitoring instance is available. Use the Metrics indicator to see whether endpoints are currently sending throughput data." | Metrics: ⚠️ |

**Indicator Legend:** ✅ = Available/Success, ❌ = Unavailable/Error, ⚠️ = Warning/Not Configured

### Testing "Instance Not Configured" State

The "Instance Not Configured" state cannot be tested via mock scenarios because it requires modifying the ServicePulse configuration. To test this state:

1. Edit `src/Frontend/public/js/app.constants.js`
2. Change `monitoring_urls` to `['!']` or `[]`
3. Run `npm run dev` (without mocks)

```javascript
window.defaultConfig = {
  // ... other config
  monitoring_urls: ['!'],  // Disables monitoring
};
```

### Adding New Scenarios

1. Add a scenario precondition to `src/Frontend/test/preconditions/platformCapabilities.ts`:

```typescript
export const scenarioMyScenario = async ({ driver }: SetupFactoryOptions) => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  // Add scenario-specific preconditions here
};
```

1. Create a new file in `src/Frontend/test/mocks/scenarios/` (e.g., `my-scenario.ts`):

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

| File                                                                              | Type        | Description                             |
|-----------------------------------------------------------------------------------|-------------|-----------------------------------------|
| `src/Frontend/test/specs/platformcapabilities/monitoring-capability-card.spec.ts` | Application | End-to-end tests for the card component |

### Running Automated Tests

From the `src/Frontend` directory:

```bash
# Run all monitoring capability tests
npx vitest run test/specs/platformcapabilities/monitoring-capability-card.spec.ts

# Run all platform capability tests
npx vitest run test/specs/platformcapabilities/
```

### Test Coverage

#### Application Tests (`monitoring-capability-card.spec.ts`)

| Rule                                      | Test Case                                                      |
|-------------------------------------------|----------------------------------------------------------------|
| Available with endpoints sending data     | Shows "Available" status + "View Metrics" button             |
| Available but no endpoints sending data   | Keeps card available and shows a warning `Metrics` indicator   |
| Instance configured but not responding    | Shows "Unavailable" status                                   |
| Monitoring not configured in ServicePulse | Shows "Get Started" button                                   |
| Shared card signals                       | Shows only the `Metrics` indicator when connected              |

## Key Source Files

| File                                                                                    | Purpose                             |
|-----------------------------------------------------------------------------------------|-------------------------------------|
| `src/Frontend/src/components/platformcapabilities/capabilities/MonitoringCapability.ts` | Main composable for monitoring card |
| `src/Frontend/src/components/monitoring/monitoringClient.ts`                            | Monitoring API client               |
| `src/Frontend/src/stores/PlatformModelStore.ts`                                         | Shared platform model for monitoring state |
| `src/Frontend/test/preconditions/platformCapabilities.ts`                               | Test preconditions and fixtures     |
| `src/Frontend/test/mocks/scenarios/`                                                    | Manual testing scenarios            |

## How Monitoring Status is Determined

The monitoring status is determined by checking two conditions in order:

1. **Is monitoring configured?** - Checks if `monitoring_urls` contains a valid URL (not "!" or empty)
2. **Is the instance responding?** - Checks if the connection to the monitoring instance succeeds

```typescript
// Simplified status determination logic
if (!isMonitoringEnabled) {
  return CapabilityStatus.InstanceNotConfigured;
}
if (!connectionSuccessful) {
  return CapabilityStatus.Unavailable;
}
return CapabilityStatus.Available;
```

## Status Indicators

The monitoring card no longer renders a separate instance widget.

It shows a single `Metrics` indicator only when the monitoring instance is configured and connected:

- green when monitored endpoints exist
- yellow when no endpoints are sending throughput data yet

Instance-level monitoring visibility now lives on the `Platform health` page.

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
