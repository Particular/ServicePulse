import { screen } from "@testing-library/vue";

export function getMessageView() {
  return {
    async notice(text: RegExp) {
      return await screen.findByText(text, { selector: "[role=status]" });
    },

    async heading(messageType: string) {
      return await screen.findByRole("heading", { level: 1, name: messageType });
    },

    async statusLabel(text: string) {
      return await screen.findByText(text, { selector: "span.label" });
    },

    async metadataItem(label: string) {
      return await screen.findByText((_, element) => element?.tagName === "SPAN" && element.classList.contains("metadata") && (element.textContent?.trim().startsWith(label) ?? false));
    },

    async actionButton(name: string) {
      return await screen.findByRole("button", { name });
    },
  };
}
