---
name: servicepulse-ui
description: Use when changing anything under src/Frontend in ServicePulse, such as views, components, styles, navigation, or UI copy, including together with other UI or design skills. Applies the UI guideline and explains how to run and check the UI locally with mock data.
metadata:
  particular-guideline: docs/guidelines/ui.md
---

# ServicePulse UI

Follow [the UI guideline](../../../docs/guidelines/ui.md). It controls when this skill or any other skill disagrees with it.

Before you change the UI, read [the product description](../../../docs/PRODUCT.md) and, once it exists, `docs/DESIGN.md`.

## Run the UI with mock data

[Frontend testing and mocking basics](../../../docs/frontend/testing-basics.md) describes the mock scenarios. From `src/Frontend`:

1. Run `npm install`.
2. Run `npm run dev:mocks`, or set `VITE_MOCK_SCENARIO` first to pick a scenario.
3. Open the printed URL in Chrome or Safari.

The mock backend runs in a service worker. A browser that cannot register one, such as some embedded browser panes, shows a blank page.

## Check before opening a pull request

From `src/Frontend`, run `npm run type-check`, `npm run lint`, `npm run test:component`, and `npm run test:application`.
