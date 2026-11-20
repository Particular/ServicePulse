# Navigation shell

The shell is the part of ServicePulse that every page shares: the navigation side bar, the content area, and the trial license footer. `App.vue` lays them out; the side bar is `NavigationSideBar.vue`.

## Layout by width

| Viewport width | Side bar | Content |
|---|---|---|
| Below 768px | Hidden. A top bar with a menu button opens it as a drawer over the content. | Full width |
| 768px to 1279px | Always a 64px icon rail. Expanding it overlays the content and does not move it. | Viewport width minus 64px |
| 1280px and wider | Expanded (224px) by default. The user can collapse it to the rail. | Viewport width minus the side bar |

On wide screens the browser remembers the collapsed choice in `localStorage` under `servicepulse.sideBarCollapsed` (`useSideBarCollapsed.ts`). On medium screens the overlay closes on navigation, Escape, or a click outside it, and the stored choice does not apply.

## Content width

Views size themselves with viewport media queries and expect at least 930px of content. `#main-content` keeps a 930px minimum width for its view, so narrower content scrolls horizontally instead of breaking the view layout. This is why the side bar stays a rail between 768px and 1279px: an expanded side bar there takes 224px from views that have no room for it. Phones get horizontal scrolling for the same reason; making views work below 930px is separate work.

## Items

The side bar lists the areas in the order of `menuItems` in `NavigationSideBar.vue`. Each item renders only when `useAllowedRoutes` reports that the user may call its ServiceControl route, and no item renders until permissions are known.

Each item is a menu item component, such as `FailedMessagesMenuItem.vue`, that renders a link with an icon, a `.side-bar-label`, and an optional status indicator: a count badge or an exclamation mark. When the side bar is a rail, the label stays in the DOM but is visually hidden, so it remains the link's accessible name, and a tooltip shows it on hover and keyboard focus. Badges stay visible on the rail.

## Bottom section

Below the area links, from top to bottom:

- the user menu, when authentication is enabled;
- Feedback, a link to new GitHub issues;
- the version strip (`PlatformVersionInfo.vue`): the ServicePulse version, the hosting mode, and the platform update status.

The hosting mode is "Integrated" when `window.defaultConfig.isIntegrated` is set and "Standalone" otherwise; the frontend does not know the host type. The update status links to Platform health when any Platform health row has an upgrade available, including while an instance is degraded or unavailable. The Platform health menu item shows updates only when there is no other issue; see [Platform health page](platform-health-page.md).

## Footer

`PageFooter.vue` renders only for a valid trial license and states that it is for non-production use. It is hidden for the MassTransit connector and when the license is unavailable. It sits below the content area and does not cover content.

## Checking the shell locally

Run the mock scenarios described in [Frontend testing and mocking basics](testing-basics.md). The `trial-license` scenario shows the footer. The `auth-authenticated` scenario shows the user menu.

The [UI guideline](../guidelines/ui.md) requires a layout check on each side of every breakpoint a change can affect. For the shell, check at these widths:

| Width | Layout |
|---|---|
| 375px | Drawer, on a phone |
| 768px | Rail, with the narrowest content |
| 1279px | Rail, with the widest content |
| 1280px | Expanded side bar, with the narrowest content |

Update this table when a shell breakpoint changes. A view's own breakpoints, such as Monitoring's, add widths for changes that can affect that view.
