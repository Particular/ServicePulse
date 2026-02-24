import { screen, within, waitFor } from "@testing-library/vue";

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
 * Checks if a selelcted tab is currently active
 */
export function isTabActive(tabElement: HTMLElement | null): boolean {
  if (!tabElement) return false;
  return tabElement.classList.contains("active");
}

/**
 * Waits for the code editor to be rendered and have content
 */
export async function waitForCodeEditorContent(editorIndex = 0, expectedContent?: string, timeout = 5000): Promise<string> {
  let content = "";

  await waitFor(
    () => {
      content = getCodeEditorContent(editorIndex);

      if (content.length === 0) {
        throw new Error(`Code editor at index ${editorIndex} has no content`);
      }

      if (expectedContent && !content.includes(expectedContent)) {
        throw new Error(`Code editor content does not contain expected text: "${expectedContent}". ` + `Got content (length ${content.length}): ${content.substring(0, 100)}...`);
      }

      return true;
    },
    { timeout }
  );

  return content;
}

export function getCodeEditorContent(editorIndex = 0) {
  const codeEditors = screen.queryAllByRole("code");

  if (codeEditors.length === 0) {
    return "";
  }

  if (editorIndex >= codeEditors.length) {
    return "";
  }

  const codeEditor = codeEditors[editorIndex];

  const vueInstance = (codeEditor as any).__vueParentComponent || (codeEditor as any).__vnode;
  if (vueInstance) {
    const modelValue = vueInstance?.props?.modelValue || vueInstance?.ctx?.modelValue || (vueInstance as any)?.__vModel;
    if (modelValue && typeof modelValue === "string") {
      return modelValue;
    }
  }
  return "";
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
export function getCopyToClipboardButtons() {
  const buttonsByText = Array.from(document.querySelectorAll("button")).filter((btn) => btn.textContent?.includes("Copy to clipboard"));

  if (buttonsByText.length > 0) {
    return buttonsByText;
  }
  return [];
}

export async function getVisibleCopyButton(index = 0) {
  return await waitFor(
    async () => {
      const buttons = await getCopyToClipboardButtons();
      if (buttons.length === 0) {
        throw new Error("No copy buttons found on the page");
      }

      const button = buttons[index] as HTMLButtonElement;
      const style = window.getComputedStyle(button);

      // Basic check - just ensure it's not explicitly hidden
      const isExplicitlyHidden = style.display === "none" || style.visibility === "hidden";

      if (isExplicitlyHidden) {
        throw new Error("Copy button is explicitly hidden");
      }
      return button;
    },
    { timeout: 5000 }
  );
}
/**
 * Clicks the copy button for the currently active tab
 */
export async function clickCopyButton(index = 0) {
  const button = await getVisibleCopyButton(index);
  button.click();
}
