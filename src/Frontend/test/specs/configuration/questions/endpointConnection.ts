import { screen, within } from "@testing-library/vue";

/**
 * Gets the "Endpoint Configuration Only" tab element
 */
export async function endpointConfigurationOnlyTab() {
  // Find all h5 elements within the tabs div
  const tabs = await screen.findByRole("tablist");
  const endpointConfigTab = within(tabs).getByText(/Endpoint configuration only/i);
  return endpointConfigTab.closest("h5");
}

/**
 * Gets the "JSON File" tab element
 */
export async function jsonFileTab() {
  const tabs = await screen.findByRole("tablist");
  const jsonTab = within(tabs).getByText(/JSON file/i);
  return jsonTab.closest("h5");
}

/**
 * Checks if a tab is currently active (selected)
 */
export function isTabActive(tabElement: HTMLElement | null): boolean {
  if (!tabElement) return false;
  return tabElement.classList.contains("active");
}

/**
 * Gets the code editor content for the currently visible tab
 */
export async function getCodeEditorContent() {
  // The CodeEditor component renders a <pre> element with the code
  const codeBlock = await screen.findByRole("code");
  return codeBlock.textContent || "";
}

/**
 * Clicks on a tab to switch to it
 */
export function clickTab(tabElement: HTMLElement) {
  const link = within(tabElement).getByRole("link");
  link.click();
}
/**
 * Gets all "Copy to clipboard" buttons on the page
 */
export async function getCopyToClipboardButtons() {
  return await screen.findAllByRole("button", { name: /copy to clipboard/i });
}

/**
 * Gets the first visible "Copy to clipboard" button
 */
export async function getFirstVisibleCopyButton() {
  const buttons = await getCopyToClipboardButtons();
  // Return the first button that is visible
  for (const button of buttons) {
    if (button.offsetParent !== null) {
      return button;
    }
  }
  return null;
}
/**
 * Clicks the copy button for the currently active tab
 */
export async function clickCopyButton() {
  const button = await getFirstVisibleCopyButton();
  if (!button) throw new Error("No visible copy button found");
  button.click();
}
