---
name: ServicePulse
description: Operations console for NServiceBus systems. Problems first, calm otherwise.
colors:
  brand: "#00a3c4"
  canvas: "#f2f6f7"
  surface: "#ffffff"
  danger: "#ce4844"
  trial: "#b22222"
  healthy: "#00c468"
  chrome: "#1a1a1a"
  chrome-ink: "#b5b5b5"
  chrome-ink-active: "#ffffff"
  chrome-hover: "#2b2b2b"
  chrome-divider: "#333333"
  chrome-strip: "#0d0d0d"
  chrome-strip-ink: "#a6a6a6"
typography:
  body:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
  page-title:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 700
  version-strip:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 400
rounded:
  sm: "4px"
spacing:
  side-bar: "224px"
  side-bar-collapsed: "64px"
components:
  side-bar:
    backgroundColor: "{colors.chrome}"
    textColor: "{colors.chrome-ink}"
    width: "{spacing.side-bar}"
  side-bar-item:
    textColor: "{colors.chrome-ink}"
    typography: "{typography.body}"
    padding: "8px 20px"
    height: "40px"
  side-bar-item-hover:
    backgroundColor: "{colors.chrome-hover}"
    textColor: "{colors.chrome-ink-active}"
  side-bar-item-active:
    backgroundColor: "{colors.chrome-hover}"
    textColor: "{colors.chrome-ink-active}"
  count-badge:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface}"
  version-strip:
    backgroundColor: "{colors.chrome-strip}"
    textColor: "{colors.chrome-strip-ink}"
    typography: "{typography.version-strip}"
    height: "28px"
  trial-license-bar:
    backgroundColor: "{colors.trial}"
    textColor: "{colors.surface}"
    padding: "6px 16px"
---

# Design System: ServicePulse

This document describes the visual rules of ServicePulse. The values above are mirrored as CSS custom properties in `src/Frontend/src/assets/tokens.css`, for example `colors.chrome` as `--sp-chrome`; `colors.brand` is the existing `--sp-blue` in `main.css`. Change a value in both places in the same pull request. [Navigation shell](frontend/navigation-shell.md) describes how the shell behaves at each width.

## Overview

ServicePulse is an operations console. People open it mostly when something is wrong in production, or while developing to understand how their system behaves ([product](PRODUCT.md)). The design follows from that:

- Problems first. What is broken and needs action is visible before anything else: counts and warnings sit next to the area they belong to, in the navigation itself.
- Calm when healthy. A healthy system shows no decoration: no "all good" banners, no colour without meaning.
- The existing look is kept. Dark application chrome, a light canvas for content, the teal brand mark. Changes improve structure, legibility, and accessibility rather than restyle.

**Key characteristics:**

- A dark left side bar holds all navigation; content sits on a light canvas.
- Colour carries state (danger, warning, trial, healthy) or the current location, never decoration.
- One typeface family, sized for dense, scannable lists.

## Colors

A restrained palette: neutral chrome and canvas, the brand teal, and state colours.

### Primary

- **Brand teal**: the ServicePulse mark, the bar that marks the current area in the side bar, and the "Updates available" icon in the version strip.

### Neutral

- **Chrome**: side bar background. **Chrome ink** is item text on it (8.5:1).
- **Chrome hover**: background for hovered items and the current area, with **chrome ink active** text (14.2:1).
- **Chrome divider**: separates the bottom section of the side bar.
- **Chrome strip** and **chrome strip ink**: the version strip at the bottom of the side bar (8.0:1).
- **Canvas**: page background behind content. **Surface**: panels and lists.

### State

- **Danger**: count badges for things that need action, such as failed messages, failing custom checks, and unhealthy heartbeats (white text at 4.5:1).
- **Trial**: the trial license bar (white text at 6.7:1).
- **Healthy**: the "platform up to date" icon in the version strip (8.4:1).

**The Meaning Rule.** A colour other than the neutrals always means a state or the current location. Status is never shown by colour alone: a count, a word, or an icon carries it too.

**The Contrast Rule.** Text meets WCAG 2.2 AA: 4.5:1 for normal text, 3:1 for large text and for icons that carry meaning.

## Typography

**Body font:** Helvetica Neue (with Helvetica, Arial, sans-serif).

**Character:** neutral and compact; the content (endpoint names, exception types, counts) is the voice.

- **Body:** 14px, line height 1.43. Side bar items use it too.
- **Page title:** 30px bold.
- **Version strip:** 11px.

## Layout

Desktop is the main target ([product](PRODUCT.md)), and desktop screens are wider than they are tall, so horizontal space is cheap and vertical space is scarce.

**The Vertical Space Rule.** Vertical space belongs to content. Persistent shell elements sit at the side: navigation is a left side bar, there is no top navigation bar, and a footer appears only when there is license information to show, under the content column and never under the side bar.

- **Side bar:** 224px wide, collapsible to a 64px icon rail. Between 768px and 1279px it is always a rail and expands over the content instead of pushing it. Below 768px it is a drawer that a menu button opens.
- **Content:** fills the remaining width and scrolls on its own; the side bar stays in place. Views keep a 930px minimum width and scroll horizontally below it.
- **View margins:** most views wrap their content in a container 92% of the content width, centred.

## Elevation & Depth

Flat. Regions are separated by colour (dark chrome against a light canvas) and by 1px dividers. The one shadow is on the side bar while it overlays content on medium screens (`box-shadow: 4px 0 16px rgb(0 0 0 / 30%)`), so it reads as above the page.

## Shapes

Square side bar items. Small 4px rounding on icon buttons in the side bar, such as the collapse button and the update status icon. Count badges are pills.

## Components

### Side bar

The single place for navigation. From top to bottom:

1. The ServicePulse logo, linking to the dashboard, and the collapse button.
2. The areas: Dashboard, Heartbeats, Monitoring, All Messages, Failed Messages, Custom Checks, Events, Platform health, Usage, and Configuration.
3. A bottom section, separated by a divider: the signed-in user when authentication is enabled, Feedback, and the version strip.

Areas the user may not use, or capabilities that are not configured, are not shown.

### Side bar item

Icon (16px) and label in one row, at least 40px high. States: default (chrome ink), hover (chrome hover background, white text), current area (chrome hover background, white text, and a 4px brand teal bar on the left edge), keyboard focus (2px white outline). Labels are always present for assistive technology; in the rail they are visually hidden, not removed, and show as a tooltip on hover and keyboard focus.

### Count badge and warning mark

A danger pill with a number sits at the end of an item when that area has something needing action. A warning triangle marks degraded or misconfigured areas, such as Platform health, Configuration, and Usage. In the rail both move to the icon's top right corner.

### Version strip

One line at the very bottom of the side bar: the ServicePulse version, the hosting mode (Integrated or Standalone), and an update status icon. The icon is brand teal and links to Platform health when any platform component has an update, and healthy green otherwise; a tooltip and hidden text name the status. In the rail only the icon shows.

### Footer

Carries license information only: for a valid trial license, a trial bar reading "<license type> license, non-production use only" that links to the license page. With any other license there is no footer.

## Do's and Don'ts

### Do:

- **Do** put a count or warning next to the navigation item it belongs to.
- **Do** keep a text label on every navigation item, also for screen readers when it is visually hidden.
- **Do** use the tokens in `tokens.css` for colours, sizes, and rounding in new shell styles.
- **Do** name components by role, such as "side bar item" or "count badge", not by a library's class names.
- **Do** build views from the shared components in `src/Frontend/src/components`, as the [UI guideline](guidelines/ui.md) requires.

### Don't:

- **Don't** add a top navigation bar or a permanent footer; they take vertical space from content.
- **Don't** use brand teal for text on the canvas or on white: it reaches only 2.7:1 and 3.0:1 there.
- **Don't** show healthy status as decoration.

### Known gaps

- **Brand teal on light backgrounds.** Links, tabs, and primary buttons inside pages use brand teal on white or canvas, which fails AA for text. It needs a darker interactive teal.
- **Page content on small screens.** Views keep a 930px minimum width, so phones and narrow tablets scroll horizontally. `docs/PRODUCT.md` requires every task to be usable there.
- **Bootstrap theming.** Count badges, the user menu, and page-level buttons and tabs still get part of their look from Bootstrap classes, which the tokens do not reach. The user menu also relies on Bootstrap's dropdown behavior until Bootstrap is removed.
