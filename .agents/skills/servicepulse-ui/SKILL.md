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

## Impeccable

Use the [Impeccable](https://impeccable.style) design skill for design reviews and refinement of the UI, such as critique, audit, and polish. Impeccable reads `docs/PRODUCT.md` and `docs/DESIGN.md` but not the UI guideline, so read the guideline before you run an Impeccable command, and follow the guideline when the two disagree. If an Impeccable command creates `PRODUCT.md` or `DESIGN.md` at the repository root, merge its content into the file under `docs/` and delete the root copy.

Its version is pinned in `src/Frontend/package.json`, and `.impeccable/config.json` enables its design detector hook. If the Impeccable skill is not available in your session, ask the user to install it from `src/Frontend`:

1. Run `npm install`.
2. Run `npm run ai:setup`.
3. Restart the session.

`ai:setup` installs the skill, its agents, and its hooks into this repository's `.claude/` folder for Claude Code; they are not committed. For other tools, change `--providers` in the script, for example to `--providers=cursor`. Use either a globally installed Impeccable plugin or this setup, not both.
