import { screen } from "@testing-library/vue";

export function getFailedMessagesView() {
  return {
    async groupHeading(groupName: string) {
      return await screen.findByRole("heading", { level: 1, name: groupName });
    },

    async messageTypes() {
      const messages = await screen.findAllByText((_, element) => element?.matches(".failed-message p.lead") ?? false);
      return messages.map((message) => message.textContent?.trim());
    },
  };
}
