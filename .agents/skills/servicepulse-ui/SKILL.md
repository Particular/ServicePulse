---
name: servicepulse-ui
description: Use when changing anything under src/Frontend in ServicePulse, such as views, components, styles, navigation, or UI copy, including together with other UI or design skills. Applies the UI guideline and explains how to run and check the UI locally with mock data.
metadata:
  particular-guideline: docs/guidelines/ui.md
---

# ServicePulse UI

Read [the UI guideline](../../../docs/guidelines/ui.md) before you change code, and follow it. It controls when this skill or any other skill disagrees with it.

Before you change the UI, read [the product description](../../../docs/PRODUCT.md) and, once it exists, `docs/DESIGN.md`.

## Run the UI with mock data

[Frontend testing and mocking basics](../../../docs/frontend/testing-basics.md) describes the mock scenarios. From `src/Frontend`:

1. Run `npm install`.
2. Run `npm run dev:mocks`, or set `VITE_MOCK_SCENARIO` first to pick a scenario.
3. Open the printed URL in Chrome or Safari.

The mock backend runs in a service worker. A browser that cannot register one, such as some embedded browser panes, shows a blank page.

## Check layouts

The guideline sets which views and widths to check. When a `docs/` page of the area you change lists the widths to check, use those. To compare before and after:

1. Run the base branch with mock data and take a screenshot of each view at each width.
2. Run the change with the same mock scenario and take the same screenshots.
3. Compare each pair, and also look for horizontal scrolling, truncated titles, and wrapped toolbars.
4. Keep the mock instance of the change running while you ask the person who asked for the change to accept a difference.
5. Give them a link to the view in that instance, with the mock scenario, the width to set, and any step needed to reach the state, such as a tab to open.

For a change to the shell or to shared styles, cover at least Dashboard, Failed Messages with a message's details, Monitoring with an endpoint's details, All Messages with a message's sequence diagram (`audit-available` scenario), Platform health, and Configuration. [Navigation shell](../../../docs/frontend/navigation-shell.md) lists the widths for the shell.

## Check before opening a pull request

From `src/Frontend`, run `npm run type-check`, `npm run lint`, `npm run test:component`, and `npm run test:application`.

## Impeccable

Use the [Impeccable](https://impeccable.style) design skill for design reviews and refinement of the UI, such as critique, audit, and polish. Impeccable reads `docs/PRODUCT.md` and `docs/DESIGN.md` but not the UI guideline, so read the guideline before you run an Impeccable command, and follow the guideline when the two disagree. If an Impeccable command creates `PRODUCT.md` or `DESIGN.md` at the repository root, merge its content into the file under `docs/` and delete the root copy.

Its version is pinned in `src/Frontend/package.json`, and `.impeccable/config.json` enables its design detector hook. If the Impeccable skill is not available in your session, ask the user to install it from `src/Frontend`:

1. Run `npm install`.
2. Run `npm run ai:setup`.
3. Restart the session.

`ai:setup` installs the skill, its agents, and its hooks into this repository's `.claude/` folder for Claude Code; they are not committed. For other tools, change `--providers` in the script, for example to `--providers=cursor`. Use either a globally installed Impeccable plugin or this setup, not both.
