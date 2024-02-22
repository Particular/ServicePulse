import { expect, it, render, screen, describe, userEvent } from "@component-test-utils";
import paginationStrip from "./PaginationStrip.vue";

describe("Previous page behavior", () => {
  it("Disables navigating to 'Previous' page while first rendered on the first page", async () => {
    
    rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 1 });

    expect(screen.queryByLabelText("Previous")).toBeDisabled();
  });

  it("Disables navigating to 'Previous' after navigating to the first page", async () => {
    
    rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 2 });

    const previousButton = await screen.findByLabelText("Previous");
    expect(previousButton).not.toBeDisabled();

    await userEvent.click(previousButton);

    expect(previousButton).toBeDisabled();
    expect(screen.getByRole("button", { pressed: true })).toContainHTML("1");
  });

  it("Enables navigating to 'Previous' page while not first rendered on the first page", async () => {
    rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 2 });
    expect(screen.queryByLabelText("Previous")).not.toBeDisabled();
  });

  it("Enables navigating to 'Previous' page after navigating one page next", async () => {
    
    rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 1 });

    expect(screen.queryByLabelText("Previous")).toBeDisabled();
    const nextButton = await screen.findByLabelText("Next");

    await userEvent.click(nextButton);

    expectActivePageToBe("2");
    expect(nextButton).toBeEnabled();
  });
});

describe("Next page behavior", () => {
  it("Disables navigating to 'Next' page while first rendered on the last page", async () => {
    
    rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 10 });

    expect(screen.queryByLabelText("Next")).toBeDisabled();
  });

  it("Disables navigating to 'Next' after navigating to the last page", async () => {
    
    rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 9 });

    const nextButton = await screen.findByLabelText("Next");
    expect(nextButton).not.toBeDisabled();

    await userEvent.click(nextButton);

    expectActivePageToBe("10");
    expect(nextButton).toBeDisabled();
  });

  it("Enables navigating to 'Next' page while NOT first rendered on the last page", async () => {
    
    rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 9 });

    expect(screen.queryByLabelText("Next")).toBeEnabled();
  });

  it("Enables navigating to 'Next' page after navigating one page back", async () => {
    
    rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 10 });

    expect(screen.queryByLabelText("Next")).toBeDisabled();

    const previousButton = await screen.findByLabelText("Previous");
    await userEvent.click(previousButton);

    expectActivePageToBe("9");
    expect(previousButton).toBeEnabled();
  });
});

// describe("Page buffer behavior", () => {
// // If the current page number is less than the page buffer there should be no left ellipsis
// // If the current page number is greater than the page buffer there should be a left ellipsis
// // If the current page is equal to the page buffer then should be no left ellipsis
// // Same for the right ellipsis, although that should be "current page is within page buffer of the last page.
// });

describe("Total count and items per page behavior", () => {
  it.todo("Example 1");
  it.todo("Example 2");
});

function expectActivePageToBe(activePageNumber: string) {
  expect(screen.getByRole("button", { pressed: true })).toContainHTML(activePageNumber);
}

function rederPaginationStripWith(options: { records: number; itemsPerPage: number; selectedPage: number }) {
  render(paginationStrip, {
    props: {
      modelValue: options.selectedPage,
      itemsPerPage: options.itemsPerPage,
      totalCount: options.records,
      pageBuffer: 0,
    },
  });
}
