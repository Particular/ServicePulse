# Error/Recoverability Capability Card Testing Guide

This document describes the error/recoverability capability card component, its various states, and how to test them both manually and automatically.

## Overview

The Recoverability Capability Card displays on the ServicePulse dashboard and shows the status of the error handling (recoverability) feature. The card's status depends on whether the ServiceControl instance is available and responding.

Unlike the Monitoring and Auditing cards, the Recoverability card has a simpler state model because:

- ServiceControl is required for the dashboard to function
- If ServiceControl is unavailable, the entire dashboard shows a connection error view
- There is no "not configured" state because ServiceControl is always configured for the dashboard to work

## Card States

| Status      | Condition                                 | Badge       | Action Button        |
|-------------|-------------------------------------------|-------------|----------------------|
| Unavailable | ServiceControl instance is not responding | Unavailable | Learn More           |
| Available   | ServiceControl instance is available      | Available   | View Failed Messages |

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
VITE_MOCK_SCENARIO=recoverability-available npm run dev:mocks

# Windows CMD
set VITE_MOCK_SCENARIO=recoverability-available && npm run dev:mocks

# Windows PowerShell
$env:VITE_MOCK_SCENARIO="recoverability-available"; npm run dev:mocks
```

Open the browser console to see available scenarios.

#### Available Recoverability Scenarios

| Scenario                   | Status    | Badge     | Button               | Description                                 | Indicators          |
|----------------------------|-----------|-----------|----------------------|---------------------------------------------|---------------------|
| `recoverability-available` | Available | Available | View Failed Messages | "The ServiceControl instance is available." | Instance: Available |

### Testing "Unavailable" State

The "Unavailable" state cannot be tested via mock scenarios because when ServiceControl is unavailable, the entire dashboard is replaced with a connection error view. The recoverability card is only visible when ServiceControl is connected.

To observe the connection error behavior:

1. Edit `src/Frontend/public/js/app.constants.js`
2. Set `service_control_url` to an invalid/unreachable URL
3. Run `npm run dev` (without mocks)

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

| File                                                                                  | Type        | Description                             |
|---------------------------------------------------------------------------------------|-------------|-----------------------------------------|
| `src/Frontend/test/specs/platformcapabilities/recoverability-capability-card.spec.ts` | Application | End-to-end tests for the card component |

### Running Automated Tests

From the `src/Frontend` directory:

```bash
# Run all recoverability capability tests
npx vitest run test/specs/platformcapabilities/recoverability-capability-card.spec.ts

# Run all platform capability tests
npx vitest run test/specs/platformcapabilities/
```

### Test Coverage

#### Application Tests (`recoverability-capability-card.spec.ts`)

| Rule                              | Test Case                                                |
|-----------------------------------|----------------------------------------------------------|
| ServiceControl instance available | Shows "Available" status + "View Failed Messages" button |
| Instance indicator                | Shows "Instance" indicator with version info             |

**Note:** The "Unavailable" state is not tested because when ServiceControl is unavailable, the entire dashboard is replaced with a connection error view, making the recoverability card inaccessible.

## Key Source Files

| File                                                                                     | Purpose                                 |
|------------------------------------------------------------------------------------------|-----------------------------------------|
| `src/Frontend/src/components/platformcapabilities/capabilities/ErrorCapability.ts`       | Main composable for recoverability card |
| `src/Frontend/src/stores/ConnectionsAndStatsStore.ts`                                    | Connection state management             |
| `src/Frontend/test/specs/platformcapabilities/questions/recoverabilityCapabilityCard.ts` | Test helper functions                   |
| `src/Frontend/test/mocks/scenarios/`                                                     | Manual testing scenarios                |

## How Recoverability Status is Determined

The recoverability status is determined by checking the ServiceControl connection state:

```typescript
// Simplified status determination logic
const isConnected = connectionState.connected && !connectionState.unableToConnect;

if (!isConnected) {
  return CapabilityStatus.Unavailable;
}
return CapabilityStatus.Available;
```

## Status Indicators

The recoverability card shows a single "Instance" indicator that displays:

- The ServiceControl instance URL
- The ServiceControl version number
- Connection status (Available or Unavailable icon)

## Relationship with Dashboard

The Recoverability capability card is tightly coupled to the main ServiceControl connection:

- When ServiceControl connects successfully, the dashboard loads and the card shows "Available"
- When ServiceControl fails to connect, the dashboard shows a full-page connection error instead of loading the dashboard with an "Unavailable" card

This is different from the Monitoring and Auditing cards, which can show "Unavailable" states independently while the dashboard remains functional.

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
