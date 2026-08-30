# Monitoring Capability Card Testing Guide

This document describes the monitoring capability card component, its various states, and how to test them both manually and automatically.

For shared frontend mock and Vitest workflow, see `docs/frontend/testing-basics.md`.

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

The `Metrics` indicator carries the capability-specific readiness state. If no endpoints are sending throughput data, the card stays `Available` while the indicator is yellow.

A degraded monitoring instance still counts as connected for this card. Only `unavailable` drives the card into the unavailable state.

## Manual Testing with Mock Scenarios

Start from the shared frontend mocking workflow in `docs/frontend/testing-basics.md`, then select one of the monitoring scenarios below.

For the shared meaning of instance topology and availability states, use `docs/frontend/platform-health-page.md` as the canonical reference. This page documents only the monitoring-specific layer on top.

### Available Monitoring Scenarios

| Scenario                  | Status      | Badge       | Button       | Description                                                                                                       | Indicators  |
|---------------------------|-------------|-------------|--------------|-------------------------------------------------------------------------------------------------------------------|-------------|
| `monitoring-available`    | Available   | Available   | View Metrics | "The ServiceControl Monitoring instance is available. Use the Metrics indicator to see whether endpoints are sending throughput data." | Metrics: ✅ |
| `monitoring-unavailable`  | Unavailable | Unavailable | Learn More   | "The ServiceControl Monitoring instance is configured but not responding..."                                      | None        |
| `monitoring-no-endpoints` | Available   | Available   | View Metrics | "The ServiceControl Monitoring instance is available. Use the Metrics indicator to see whether endpoints are sending throughput data." | Metrics: ⚠️ |

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

## Automated Tests

### Test Files

| File                                                                              | Type        | Description                             |
|-----------------------------------------------------------------------------------|-------------|-----------------------------------------|
| `src/Frontend/test/specs/platformcapabilities/monitoring-capability-card.spec.ts` | Application | End-to-end tests for the card component |

### Running Automated Tests

Use the shared commands in `docs/frontend/testing-basics.md`, then run this monitoring-specific spec:

```bash
npx vitest run test/specs/platformcapabilities/monitoring-capability-card.spec.ts
```

### Test Coverage

#### Application Tests (`monitoring-capability-card.spec.ts`)

| Rule                                      | Test Case                                                      |
|-------------------------------------------|----------------------------------------------------------------|
| Available with endpoints sending data     | Shows "Available" status + "View Metrics" button             |
| Available but no endpoints sending data   | Keeps card available and shows a warning `Metrics` indicator   |
| Degraded but responding instance          | Keeps card available and still shows `Metrics` behavior        |
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

Instance-level monitoring visibility lives on the `Platform health` page.

## Troubleshooting

Use `docs/frontend/testing-basics.md` for shared troubleshooting.

Monitoring-specific checks:

1. If the badge is wrong, verify whether the scenario is changing instance connectivity or only endpoint throughput presence.
2. If the `Metrics` indicator is wrong, inspect the `monitored-endpoints` response for the active scenario.
3. The `Instance Not Configured` case is a config-driven manual case, not a standard mock scenario.
