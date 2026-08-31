# Error/Recoverability Capability Card Testing Guide

This document describes the error/recoverability capability card component, its various states, and how to test them both manually and automatically.

For shared frontend mock and Vitest workflow, see `docs/frontend/testing-basics.md`.

## Overview

The Recoverability Capability Card displays on the ServicePulse dashboard and shows the status of the error handling (recoverability) feature. The card's status depends on whether the primary ServiceControl instance is available and responding.

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

Start from the shared frontend mocking workflow in `docs/frontend/testing-basics.md`, then select the recoverability scenario below.

For the shared meaning of primary and remote error instance states, use `docs/frontend/platform-health-page.md` as the canonical reference. This page documents only the recoverability-specific layer on top.

### Available Recoverability Scenarios

| Scenario                   | Status    | Badge     | Button               | Description                                 | Indicators                         |
|----------------------------|-----------|-----------|----------------------|---------------------------------------------|------------------------------------|
| `recoverability-available` | Available | Available | View Failed Messages | "The ServiceControl instance is available." | `FailedMessages`: ✅ |

### Testing "Unavailable" State

The "Unavailable" state cannot be tested via mock scenarios because when ServiceControl is unavailable, the entire dashboard is replaced with a connection error view. The recoverability card is only visible when ServiceControl is connected.

To observe the connection error behavior:

1. Edit `src/Frontend/public/js/app.constants.js`
2. Set `service_control_url` to an invalid/unreachable URL
3. Run `npm run dev` (without mocks)

## Automated Tests

### Test Files

| File                                                                                  | Type        | Description                             |
|---------------------------------------------------------------------------------------|-------------|-----------------------------------------|
| `src/Frontend/test/specs/platformcapabilities/recoverability-capability-card.spec.ts` | Application | End-to-end tests for the card component |

### Running Automated Tests

Use the shared commands in `docs/frontend/testing-basics.md`, then run this recoverability-specific spec:

```bash
npx vitest run test/specs/platformcapabilities/recoverability-capability-card.spec.ts
```

### Test Coverage

#### Application Tests (`recoverability-capability-card.spec.ts`)

| Rule                              | Test Case                                                |
|-----------------------------------|----------------------------------------------------------|
| ServiceControl instance available | Shows "Available" status + "View Failed Messages" button |
| Connected primary instance        | Shows a green `FailedMessages` indicator                 |
| Remote error instances present    | Keeps the `FailedMessages` indicator green               |

**Note:** The "Unavailable" state is not tested because when ServiceControl is unavailable, the entire dashboard is replaced with a connection error view, making the recoverability card inaccessible.

## Key Source Files

| File                                                                                     | Purpose                                 |
|------------------------------------------------------------------------------------------|-----------------------------------------|
| `src/Frontend/src/components/platformcapabilities/capabilities/ErrorCapability.ts`       | Main composable for recoverability card |
| `src/Frontend/src/stores/PlatformModelStore.ts`                                          | Shared platform state for primary health |
| `src/Frontend/test/specs/platformcapabilities/questions/recoverabilityCapabilityCard.ts` | Test helper functions                   |
| `src/Frontend/test/mocks/scenarios/`                                                     | Manual testing scenarios                |

## How Recoverability Status is Determined

The recoverability status is determined by checking the primary instance in the shared platform model:

```typescript
// Simplified status determination logic
const isConnected = platformModelStore.primary?.health !== "unavailable";

if (!isConnected) {
  return CapabilityStatus.Unavailable;
}
return CapabilityStatus.Available;
```

## Status Indicators

The recoverability card shows a single `FailedMessages` indicator whenever the primary ServiceControl instance is available.

A degraded primary instance remains connected for this card. Platform health owns the degraded vs unavailable distinction at the instance level.

- green when failures can be managed from this ServicePulse instance

Instance-level visibility for ServiceControl lives on the `Platform health` page instead of on the capability card.

## Relationship with Dashboard

The Recoverability capability card is tightly coupled to the main ServiceControl connection:

- When ServiceControl connects successfully, the dashboard loads and the card shows "Available"
- When ServiceControl fails to connect, the dashboard shows a full-page connection error instead of loading the dashboard with an "Unavailable" card

This is different from the Monitoring and Auditing cards, which can show "Unavailable" states independently while the dashboard remains functional.

When the card is in an available or unavailable state, the status badge links to `Platform health`. There is no separate instance widget on the card.

## Troubleshooting

Use `docs/frontend/testing-basics.md` for shared troubleshooting.

Recoverability-specific checks:

1. If the card disappears instead of showing `Unavailable`, confirm the scenario has crossed into full ServiceControl connection failure, which replaces the dashboard.
2. If the `FailedMessages` indicator is wrong, inspect whether the primary instance is connected.
