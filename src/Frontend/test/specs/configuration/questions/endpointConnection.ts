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

/**
 * Gets the code editor content for the currently visible tab
 * @param editorIndex - Index of the editor to get (0 = first, 1 = second). Defaults to 0.
 *                      Useful when a tab has multiple code editors (e.g., JSON File tab has 2)
 */
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

  // CodeMirror 6 stores the EditorView on the .cm-editor element
  const cmEditor = codeEditor.querySelector(".cm-editor");

  // Try to access the EditorView's state document
  if (cmEditor) {
    // Check for the EditorView instance attached to the element
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editorView = (cmEditor as any).cmView;
    if (editorView?.state?.doc) {
      // Get the full document content from CodeMirror's state
      const content = editorView.state.doc.toString();
      console.log("Got content from CodeMirror state, length:", content.length);
      return content;
    }
  }

  // Fallback: Try to get content from .cm-content
  const cmContent = codeEditor.querySelector(".cm-content");
  if (cmContent?.textContent) {
    console.log("Got content from .cm-content, length:", cmContent.textContent.length);
    return cmContent.textContent;
  }

  // Fallback: Try to get all lines from the DOM (only gets visible lines)
  const cmLines = codeEditor.querySelectorAll(".cm-line");
  if (cmLines.length > 0) {
    // Join all lines with newlines
    const content = Array.from(cmLines)
      .map((line) => line.textContent || "")
      .join("\n");
    console.log("Got content from .cm-line elements, count:", cmLines.length, "length:", content.length);
    return content;
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
  // Try to find by text directly (works better with Tippy wrapper)
  // try {
  //   return await screen.findAllByText("Copy to clipboard");
  // } catch (e) {
  //   console.log("Failed to find by text 'Copy to clipboard':", e);

  //   // Debug: Check if code editors exist
  //   const codeEditors = screen.queryAllByRole("code");
  //   console.log(`Found ${codeEditors.length} code editors`);

  //   codeEditors.forEach((editor, i) => {
  //     const toolbar = editor.querySelector(".toolbar");
  //     const copyButton = editor.querySelector("button");
  //     const allContent = editor.innerHTML.substring(0, 500);
  //     console.log(`Code editor ${i}: has toolbar=${!!toolbar}, has button=${!!copyButton}`);
  //     console.log(`  HTML preview: ${allContent}`);
  //     if (copyButton) {
  //       console.log(`  Button text="${copyButton.textContent}", aria-label="${copyButton.getAttribute("aria-label")}"`);
  //     }
  //   });

  //   throw new Error("No 'Copy to clipboard' buttons found on the page", { cause: e });
  // }
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

      // Return the first button that is visible
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i] as HTMLButtonElement;
        const isVisible = button.offsetParent !== null;
        console.log(`Copy button ${i}: visible=${isVisible}, text="${button.textContent}"`);
        if (isVisible) {
          return button;
        }
      }

      throw new Error("No visible copy button found");
    },
    { timeout: 5000 }
  );
}

/**
 * Clicks the copy button for the currently active tab
 */
export async function clickCopyButton() {
  const button = await getFirstVisibleCopyButton();
  button.click();
}
