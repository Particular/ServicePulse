---
name: ServicePulse
description: Operations console for NServiceBus systems. Problems first, calm otherwise.
colors:
  brand: "#00a3c4"
  canvas: "#f2f6f7"
  surface: "#ffffff"
  danger: "#ce4844"
  trial: "#b22222"
  chrome: "#1a1a1a"
  chrome-ink: "#b4bcbd"
  chrome-ink-muted: "#8a9496"
  chrome-ink-active: "#ffffff"
  chrome-hover: "#262a2b"
  chrome-active: "#2f3537"
  chrome-divider: "#2c3132"
typography:
  body:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
  nav-item:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.3
  nav-item-active:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.3
  nav-group-label:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.08em"
  page-title:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  sm: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "20px"
  sidebar: "248px"
  sidebar-collapsed: "64px"
components:
  sidebar:
    backgroundColor: "{colors.chrome}"
    textColor: "{colors.chrome-ink}"
    width: "{spacing.sidebar}"
  sidebar-item:
    textColor: "{colors.chrome-ink}"
    typography: "{typography.nav-item}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "40px"
  sidebar-item-hover:
    backgroundColor: "{colors.chrome-hover}"
    textColor: "{colors.chrome-ink-active}"
  sidebar-item-active:
    backgroundColor: "{colors.chrome-active}"
    textColor: "{colors.chrome-ink-active}"
    typography: "{typography.nav-item-active}"
  sidebar-group-label:
    textColor: "{colors.chrome-ink-muted}"
    typography: "{typography.nav-group-label}"
    padding: "0 12px"
  count-badge:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface}"
  trial-license-bar:
    backgroundColor: "{colors.trial}"
    textColor: "{colors.surface}"
    padding: "6px 16px"
---

# Design System: ServicePulse

This document describes the ServicePulse design system. The values above are mirrored as CSS custom properties in `src/Frontend/src/assets/tokens.css` (`colors.chrome` is `--sp-chrome`, and so on); change both in the same pull request. It is written to be read by people and by any tool, and does not depend on a particular one.

## Overview

ServicePulse is an operations console. People open it mostly when something is wrong in production, or while developing to understand how their system behaves ([product](PRODUCT.md)). The design follows from that:

- **Problems first.** What is broken and needs action is visible before anything else: counts and warnings sit next to the area they belong to, in the navigation itself.
- **Calm when healthy.** A healthy system shows no decoration: no "all good" banners, no colour without meaning.
- **The existing look is kept.** Dark application chrome, a light canvas for content, the teal brand mark. Changes improve structure, legibility and accessibility rather than restyle.

**Key characteristics:**

- Dark left sidebar holds all navigation; content sits on a light canvas.
- Colour carries state (danger, warning, trial), never decoration.
- One typeface family, sized for dense, scannable lists.

## Colors

A restrained palette: neutral chrome and canvas, the brand teal, and state colours.

### Primary

- **Brand teal** (`#00a3c4`): the ServicePulse mark, the icon of the active navigation item, and the "Updates available" link in the sidebar. On the dark chrome it reaches 5.8:1.

### Neutral

- **Chrome** (`#1a1a1a`): sidebar background.
- **Chrome ink** (`#b4bcbd`): sidebar item text, 9.0:1 on chrome.
- **Chrome ink, muted** (`#8a9496`): sidebar group labels, 5.6:1 on chrome.
- **Chrome hover** (`#262a2b`) and **chrome active** (`#2f3537`): item backgrounds for hover and for the current area; active text is white (12.5:1).
- **Chrome divider** (`#2c3132`): separates the sidebar's bottom items.
- **Canvas** (`#f2f6f7`): page background behind content. **Surface** (`#ffffff`): panels and lists.

### State

- **Danger** (`#ce4844`): count badges for things that need action (failed messages, failing custom checks, unhealthy heartbeats).
- **Trial** (`#b22222`): the trial-license bar, white text at 6.7:1.

### Named rules

**The Meaning Rule.** A colour other than the neutrals always means a state or the current location. Status is never shown by colour alone: a count, a word or an icon carries it too.

**The Contrast Rule.** Text meets WCAG 2.2 AA: 4.5:1 for normal text, 3:1 for large text and for icons that carry meaning.

## Typography

**Body font:** Helvetica Neue (with Helvetica, Arial, sans-serif).

**Character:** neutral and compact; the content (endpoint names, exception types, counts) is the voice.

- **Body:** 14px, line height 1.43.
- **Navigation items:** 15px regular; the current area is 600 weight.
- **Navigation group labels:** 12px bold uppercase, tracked 0.08em.
- **Page title:** 30px bold.

## Layout

**Desktop-first, landscape.** Desktop is the main target ([product](PRODUCT.md)) and desktop viewports are wider than they are tall, so horizontal space is cheap and vertical space is scarce. Navigation therefore lives in a left sidebar and there is no top navigation bar, so the height goes to content. A footer appears only when there is license information to show, and then only under the content column, never under the sidebar.

- **Sidebar:** 248px wide. Collapsible to a 64px icon rail; the choice is remembered per browser.
- **Content:** fills the remaining width and scrolls on its own; the sidebar stays in place.
- **Small screens (below 768px):** a slim top bar with a menu button and the logo; the sidebar opens as a drawer over the content, moves focus into itself and closes on Escape, on the close button, on the backdrop or after navigating.
- Every task stays usable on tablets and phones; the page itself must not force a minimum width.

## Elevation & Depth

Flat. Regions are separated by colour (dark chrome against a light canvas) and by 1px dividers, not by shadows.

## Shapes

Small, consistent rounding: 6px on navigation items and controls. Count badges are pills.

## Components

### Sidebar

The single place for navigation. Top to bottom:

1. The ServicePulse logo, linking to the dashboard, and the collapse control.
2. **Dashboard.**
3. Groups, each with a label: **Recoverability** (Failed Messages, Heartbeats, Custom Checks), **Monitoring** (Monitoring), **Auditing** (All Messages), **Platform** (Platform health, Events).
4. A bottom block, separated by a divider: platform update status ("Updates available", linking to Platform health, shown only when an update exists; "Integrated ServicePulse" in integrated mode), then **Usage**, **Configuration**, **Feedback** and the signed-in user.

Items the user is not permitted to use, or capabilities that are not configured, are not shown; a group with no items is not shown either.

### Sidebar item

Icon (18px) and label in one row, 40px high, 6px rounding. States: default (chrome ink), hover (chrome hover background, white text), current area (chrome active background, white 600-weight text, teal icon), keyboard focus (2px teal outline). Labels are always present for assistive technology; in the collapsed rail they are visually hidden, not removed.

### Count badge and warning mark

A danger-coloured pill with a number sits at the end of an item when that area has something needing action. A warning triangle marks degraded or misconfigured areas (Platform health, Configuration, Usage). In the collapsed rail both move to the icon's top-right corner.

### Footer

Carries license information only: for a trial license, a trial-colour bar "<license type> license, non-production use only" linking to the license page. With any other license there is no footer. It sits below the current view in the content column and never spans the sidebar.

## Do's and Don'ts

**Do:**

- Put a count or warning next to the navigation item it belongs to.
- Keep text labels on every navigation item, also for screen readers when visually collapsed.
- Use the shared tokens (`tokens.css`) for colours, sizes and rounding in new styles.
- Name components by role ("sidebar item", "count badge"), not by a library's class names.
- Build views from the shared components in `src/Frontend/src/components`; do not add Bootstrap component classes or `data-bs-*` attributes (see the [UI guideline](guidelines/ui.md)).

**Don't:**

- Add a top navigation bar or a permanent footer; they take vertical space from content.
- Use brand teal for text on the light canvas or on white: it reaches only 2.7–3.0:1 there.
- Show healthy status as decoration.

### Known gaps

- **Brand teal on light backgrounds.** Links, tabs and primary buttons inside pages still use `#00a3c4` on white or canvas, which fails AA for text (2.7–3.0:1). Outside the scope of the shell change; needs a darker interactive teal.
- **Page-level tabs** (e.g. Failed Messages' five tabs) still sit inside pages. Moving them into the sidebar as sub-items is a follow-up.
- **Page content on small screens** is usable but not yet designed for narrow widths.
- **User menu** still relies on Bootstrap's dropdown until Bootstrap is removed.
