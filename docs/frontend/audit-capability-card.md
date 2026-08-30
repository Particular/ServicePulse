# Audit Capability Card Testing Guide

This document describes the audit capability card component, its various states, and how to test them both manually and automatically.

For shared frontend mock and Vitest workflow, see `docs/frontend/testing-basics.md`.

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

The `Messages` indicator carries the capability-specific readiness state. If no successful messages exist yet, or if `All Messages` is not supported, the card remains `Available` while the indicator is yellow.

An audit instance that is degraded but still responding remains available for this card. Only unavailable audit instances affect the badge state.

## Manual Testing with Mock Scenarios

Start from the shared frontend mocking workflow in `docs/frontend/testing-basics.md`, then select one of the audit scenarios below.

For the shared meaning of single-region and multi-region instance topologies, use `docs/frontend/platform-health-page.md` as the canonical reference. This page documents only the auditing-specific layer on top.

### Available Audit Scenarios

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

## Automated Tests

### Test Files

| File                                                                               | Type        | Description                             |
|------------------------------------------------------------------------------------|-------------|-----------------------------------------|
| `src/Frontend/test/specs/platformcapabilities/audit-capability-card.spec.ts`       | Application | End-to-end tests for the card component |
| `src/Frontend/test/specs/platformcapabilities/auditing-capability-helpers.spec.ts` | Unit        | Tests for helper functions              |

### Running Automated Tests

Use the shared commands in `docs/frontend/testing-basics.md`, then run these audit-specific specs:

```bash
npx vitest run test/specs/platformcapabilities/audit-capability-card.spec.ts
npx vitest run test/specs/platformcapabilities/auditing-capability-helpers.spec.ts
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

Instance-level audit visibility lives on the `Platform health` page.

## Troubleshooting

Use `docs/frontend/testing-basics.md` for shared troubleshooting.

Audit-specific checks:

1. If the card badge is wrong, inspect whether the scenario is changing instance availability or only message readiness.
2. If the `Messages` indicator is wrong, check both successful-message mocks and the ServiceControl version used by the scenario.
