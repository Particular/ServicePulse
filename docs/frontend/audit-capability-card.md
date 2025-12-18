# Audit Capability Card Testing Guide

This document describes the audit capability card component, its various states, and how to test them both manually and automatically.

## Overview

The Audit Capability Card displays on the ServicePulse dashboard and shows the status of the auditing feature. The card's status depends on:

1. Whether audit instances are configured
2. Whether audit instances are available (online)
3. Whether successful messages exist (endpoints configured for auditing)
4. Whether the ServiceControl version supports the "All Messages" feature (>= 6.6.0)

## Card States

| Status                   | Condition                                        | Badge       | Action Button |
|--------------------------|--------------------------------------------------|-------------|---------------|
| Instance Not Configured  | No audit instances configured                    | -           | Get Started   |
| Unavailable              | All audit instances offline                      | Unavailable | Learn More    |
| Degraded                 | Some audit instances offline                     | Degraded    | -             |
| Endpoints Not Configured | Instance available but no messages OR SC < 6.6.0 | -           | Learn More    |
| Available                | Instance available with messages AND SC >= 6.6.0 | Available   | View Messages |

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

Use the `?scenario=<name>` query parameter to switch scenarios. Open the browser console to see available scenarios.

#### Available Audit Scenarios

| Scenario | Status | Badge | Button | Description | Indicators |
|----------|--------|-------|--------|-------------|------------|
| [`audit-no-instance`](http://localhost:5173/?scenario=audit-no-instance) | Instance Not Configured | - | Get Started | "A ServiceControl Audit instance has not been configured..." | None |
| [`audit-unavailable`](http://localhost:5173/?scenario=audit-unavailable) | Unavailable | Unavailable | Learn More | "All ServiceControl Audit instances are configured but not responding..." | Instance: ❌ |
| [`audit-degraded`](http://localhost:5173/?scenario=audit-degraded) | Partially Unavailable | Degraded | - | "Some ServiceControl Audit instances are not responding." | Instance 1: ✅, Instance 2: ❌, Messages: ✅ |
| [`audit-available`](http://localhost:5173/?scenario=audit-available) | Available | Available | View Messages | "All ServiceControl Audit instances are available and endpoints have been configured..." | Instance: ✅, Messages: ✅ |
| [`audit-old-sc-version`](http://localhost:5173/?scenario=audit-old-sc-version) | Endpoints Not Configured | - | Learn More | "A ServiceControl Audit instance is connected but no successful messages..." | Instance: ✅, Messages: ⚠️ (SC < 6.6.0) |
| [`audit-no-messages`](http://localhost:5173/?scenario=audit-no-messages) | Endpoints Not Configured | - | Learn More | "A ServiceControl Audit instance is connected but no successful messages have been processed yet..." | Instance: ✅, Messages: ⚠️ |
| [`audit-multiple-instances`](http://localhost:5173/?scenario=audit-multiple-instances) | Available | Available | View Messages | "All ServiceControl Audit instances are available..." | Instance 1: ✅, Instance 2: ✅, Messages: ✅ |

**Indicator Legend:** ✅ = Available/Success, ❌ = Unavailable/Error, ⚠️ = Warning/Not Configured

### Adding New Scenarios

1. Create a new file in `src/Frontend/test/mocks/scenarios/` (e.g., `my-scenario.ts`):

```typescript
import { Driver } from "../../driver";
import * as precondition from "../../preconditions";

export const name = "my-scenario";
export const description = "Description of what this scenario tests";

export async function setup(driver: Driver) {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  // Add scenario-specific preconditions here
}
```

2. Import and register it in `src/Frontend/test/mocks/scenarios/index.ts`

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

| Rule                            | Test Case                                                     |
|---------------------------------|---------------------------------------------------------------|
| No audit instance configured    | Shows "Get Started" button                                    |
| Audit instance unavailable      | Shows "Unavailable" status                                    |
| Partially unavailable instances | Shows "Degraded" status                                       |
| Available but no messages       | Shows "Endpoints Not Configured" status                       |
| Available with messages         | Shows "Available" status + "View Messages" button             |
| ServiceControl < 6.6.0          | Shows "Endpoints Not Configured" (All Messages not supported) |
| Single instance indicator       | Shows "Instance" label                                        |
| Messages indicator              | Shows "Messages" label when messages exist                    |
| Multiple instances              | Shows numbered "Instance 1", "Instance 2" labels              |

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
| `src/Frontend/test/preconditions/auditCapability.ts`                                  | Test preconditions and fixtures        |
| `src/Frontend/test/mocks/scenarios/`                                                  | Manual testing scenarios               |

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
