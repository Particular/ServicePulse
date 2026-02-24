/* eslint-disable @typescript-eslint/no-explicit-any */
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
 * Checks if a tab is currently active (selected)
 */
export function isTabActive(tabElement: HTMLElement | null): boolean {
  if (!tabElement) return false;
  return tabElement.classList.contains("active");
}

/**
 * Waits for the code editor to be rendered and have content
 * @param editorIndex - Index of the editor to wait for (0 = first, 1 = second)
 * @param expectedContent - Optional substring that should be present in the content
 * @param timeout - Maximum time to wait in milliseconds (default 5000)
 * @returns The editor content once found
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
  // The CodeEditor component has role="code" and contains a CodeMirror editor
  // Get all code editors in the document
  const codeEditors = screen.queryAllByRole("code");

  if (codeEditors.length === 0) {
    console.log("No code editors found in DOM");
    return "";
  }

  if (editorIndex >= codeEditors.length) {
    console.log(`Editor index ${editorIndex} out of range, only ${codeEditors.length} editors found`);
    return "";
  }

  const codeEditor = codeEditors[editorIndex];
  console.log(`Getting content from code editor at index ${editorIndex} of ${codeEditors.length} total editors`);

  const vueInstance = (codeEditor as any).__vueParentComponent || (codeEditor as any).__vnode;
  if (vueInstance) {
    console.log("Found Vue instance, checking for model value...");

    const modelValue = vueInstance?.props?.modelValue || vueInstance?.ctx?.modelValue || (vueInstance as any)?.__vModel;
    if (modelValue && typeof modelValue === "string") {
      console.log("Got content from Vue model, length:", modelValue.length);
      return modelValue;
    }
  }

  console.log("No content found in code editor");
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
export async function getCopyToClipboardButtons() {
  // Strategy 1: Find by text content
  const buttonsByText = Array.from(document.querySelectorAll("button")).filter((btn) => btn.textContent?.includes("Copy to clipboard"));

  if (buttonsByText.length > 0) {
    return buttonsByText;
  }

  // Strategy 2: Find by aria-label
  const buttonsByAriaLabel = Array.from(document.querySelectorAll("button[aria-label*='Copy']"));

  if (buttonsByAriaLabel.length > 0) {
    return buttonsByAriaLabel as HTMLButtonElement[];
  }

  // Strategy 3: Use Testing Library (this might throw if not found)
  try {
    return await screen.findAllByRole("button", { name: /copy/i });
  } catch {
    return [];
  }
}

/**
 * Gets the first visible "Copy to clipboard" button
 */
export async function getFirstVisibleCopyButton() {
  return await waitFor(
    async () => {
      const buttons = await getCopyToClipboardButtons();
      console.log(`Found ${buttons.length} copy buttons total`);

      if (buttons.length === 0) {
        throw new Error("No copy buttons found on the page");
      }

      // In test environments, just return the first button since JSDOM doesn't fully render
      // In real browsers, all visibility checks would work
      const button = buttons[0] as HTMLButtonElement;
      const style = window.getComputedStyle(button);

      console.log(`Copy button: display=${style.display}, visibility=${style.visibility}, opacity=${style.opacity}, text="${button.textContent}"`);

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
 * Gets the first visible "Copy to clipboard" button
 */
export async function getVisibleCopyButton(index = 0) {
  return await waitFor(
    async () => {
      const buttons = await getCopyToClipboardButtons();
      console.log(`Found ${buttons.length} copy buttons total`);

      if (buttons.length === 0) {
        throw new Error("No copy buttons found on the page");
      }

      // In test environments, just return the first button since JSDOM doesn't fully render
      // In real browsers, all visibility checks would work
      const button = buttons[index] as HTMLButtonElement;
      const style = window.getComputedStyle(button);

      console.log(`Copy button: display=${style.display}, visibility=${style.visibility}, opacity=${style.opacity}, text="${button.textContent}"`);

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
