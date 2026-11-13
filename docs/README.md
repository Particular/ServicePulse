# Engineering context

## About this repository

ServicePulse is the web operations console of the Particular Service Platform. It shows data from ServiceControl and ServiceControl Monitoring instances and lets users act on it, mainly on failed messages. For local build and test steps see the [README.md](../README.md).

- `src/Frontend/` — the Vue application that users see
- `src/ServicePulse/` — the ASP.NET Core host, also used by the container image
- `src/ServicePulse.Host/` — the .NET Framework host for Windows installations
- `src/Particular.ServicePulse.Core/`, `src/Particular.PlatformSample.ServicePulse/` — ServicePulse binaries packaged for integrated ServicePulse and for Particular.PlatformSample
- `src/Setup/`, `src/ServicePulse.Install.CustomActions/` — the Windows installer
- `src/SmokeTest.*/` — endpoints for manual smoke testing against ServiceControl
- `.github/workflows/` — CI pipelines

## Start here

- [ServicePulse documentation](https://docs.particular.net/servicepulse/) — public documentation entry point
- [README.md](../README.md) — how to build, run, and test locally
- [Contributing](https://docs.particular.net/platform/contributing) — contribution process
- [Hosting options](hosting-options.md) — the ways ServicePulse can be hosted
- [Frontend testing and mocking basics](frontend/testing-basics.md) — mock scenarios and focused Vitest runs

## Architecture and design

- [Product](PRODUCT.md) — who ServicePulse is for, the situations it is used in, and what it must do
- [Platform topology](platform-topology.md) — how ServicePulse models ServiceControl instances and which ones it calls directly
- [Platform health page](frontend/platform-health-page.md) — how Platform health derives its rows and severity
- [Custom checks page](frontend/custom-checks-page.md) — how internal platform custom checks relate to other views

## Guidelines

- [UI changes](guidelines/ui.md) — every change under `src/Frontend/**` that users can see or interact with: check the layout with mock data and state the check in the pull request, use the shared components instead of adding Bootstrap component classes, and for a change to the navigation, the page structure, or the visual direction, list assumptions and constraints for confirmation before design work starts. Skill: `servicepulse-ui`.

## Decisions and rationale

- [Architecture and design decisions](decisions/)

### Decisions recorded in pull requests

A pull request is listed here only when it is the canonical record for a decision area: it establishes a durable constraint or convention, or rejects an alternative likely to return, and no `docs/` file or ADR covers it. Bug fixes and routine changes are not listed; recover them from `git log` and `gh pr view`.

Keep this index current when a canonical source is added, replaced, or retired; link, do not copy.
