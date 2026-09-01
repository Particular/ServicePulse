# Platform Topology

This document defines the shared topology language used by Platform health and the related frontend docs.

## Topology

ServicePulse models the platform as:

- primary ServiceControl
- zero or more remote instances
- monitoring when configured
- ServicePulse itself

Remote instances are rendered with `remote-audit` or `remote-error` roles, but they are still model-derived rows. Their `apiUrl` is shown for context.

## Direct Access Rule

Only the primary ServiceControl instance and Monitoring are treated as direct API targets.

Audit remote rows are not assumed to be directly reachable even if they have an API URL.

## Backend Remote Relay

Primary ServiceControl does fan out to remotes when building `GET /api/configuration/remotes`.

It calls each remote's `/api/configuration`, gathers the responses in parallel, and returns a transformed `RemoteConfiguration[]` payload with:

- `api_uri`
- `version`
- `status`
- `configuration`

This is an enriched relay, not a raw pass-through.

## Shared Uses

- `docs/frontend/platform-health-page.md`
- `docs/frontend/platform-health-expanded-settings-mock.html`
- capability-card docs under `docs/frontend/`

## Row Data

Rows can show:

- instance type
- name
- version
- health state
- API URL as informational context

Expanded row details should come from model data and capability signals, not from calling audit endpoints directly.
