# Frontend Testing And Mocking Basics

This document covers the shared workflow for frontend mock scenarios and focused Vitest runs.

Use the page-specific docs for feature behavior and scenario meaning:

- `docs/frontend/custom-checks-page.md`
- `docs/frontend/audit-capability-card.md`
- `docs/frontend/monitoring-capability-card.md`
- `docs/frontend/error-capability-card.md`
- `docs/frontend/platform-health-page.md`

## Prerequisites

```bash
cd src/Frontend
npm install
```

## Running The Dev Server With Mocks

```bash
npm run dev:mocks
```

This starts the frontend with MSW intercepting API calls.

## Selecting A Mock Scenario

Set `VITE_MOCK_SCENARIO` before starting `dev:mocks`.

```bash
# Linux/macOS
VITE_MOCK_SCENARIO=platform-health npm run dev:mocks

# Windows CMD
set VITE_MOCK_SCENARIO=platform-health && npm run dev:mocks

# Windows PowerShell
$env:VITE_MOCK_SCENARIO="platform-health"; npm run dev:mocks
```

## Where Mock Scenarios Live

- `src/Frontend/test/mocks/scenarios/`
  - scenario entry points
- `src/Frontend/test/preconditions/`
  - reusable API mocks and scenario setup helpers
- `src/Frontend/test/mocks/scenarios/index.ts`
  - scenario registry keyed by `VITE_MOCK_SCENARIO`

## Adding A New Scenario

1. Add or reuse preconditions in `src/Frontend/test/preconditions/`.
2. Create a scenario entry under `src/Frontend/test/mocks/scenarios/`.
3. Register it in `src/Frontend/test/mocks/scenarios/index.ts`.

Example shape:

```ts
import { createScenario } from "../scenario-helper";
import * as precondition from "../../../preconditions";

const { worker, runScenario } = createScenario();

export { worker };

export const setupComplete = (async () => {
  await runScenario(precondition.scenarioMyScenario);
})();
```

## Common Test Commands

Run focused Vitest specs from `src/Frontend`:

```bash
npx vitest run test/specs/platformcapabilities/monitoring-capability-card.spec.ts
npx vitest run test/specs/platformcapabilities/recoverability-capability-card.spec.ts
npx vitest run src/views/PlatformHealthView.spec.ts
```

Run broader checks:

```bash
npm run lint
npm run type-check
```

Use verbose output when needed:

```bash
npx vitest run test/specs/platformcapabilities/ --reporter=verbose
```

## Troubleshooting

### Scenario not loading

1. Check the browser console.
2. Verify the `VITE_MOCK_SCENARIO` name matches a registered scenario.
3. Confirm MSW is enabled.

### Reload issues in `dev:mocks`

1. Reload once more after scenario changes if the service worker was updated.
2. If needed, clear the browser's site data for the local Vite origin and restart `npm run dev:mocks`.

### Test failures

1. Run `npm run type-check`.
2. Run only the focused spec for the affected page first.
3. Verify the required preconditions are registered for that scenario.
