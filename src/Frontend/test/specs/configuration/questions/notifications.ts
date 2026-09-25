import { screen, within } from "@testing-library/vue";

export function getAlertNotifications() {
  const alerts = screen.queryAllByRole("alert");
  return alerts.map(function (alert) {
    return {
      textMatches: (match: RegExp) => within(alert).queryByText(match) !== null,
      hasLink({ caption, address }: { caption: string; address: string }) {
        return within(alert).getByRole("link", { name: caption }).getAttribute("href") === address;
      },
    };
  });
}

export function findNotification(match: RegExp) {
  return getAlertNotifications().find((notification) => notification.textMatches(match));
}

export function isNotificationVisible(match: RegExp): boolean {
  return findNotification(match) !== undefined;
}
