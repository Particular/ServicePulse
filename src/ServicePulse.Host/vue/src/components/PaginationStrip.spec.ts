import { expect, it, render, screen, describe, userEvent } from "@component-test-utils";
import paginationStrip from "./PaginationStrip.vue";

describe("Previous page behavior", () => {
  it("Disables navigating to previous page while on first page", async () => {
    render(paginationStrip, {
      props: {
        modelValue: 1,
        itemsPerPage: 0,
        totalCount: 100,
        pageBuffer: 0,
      },
    });

    expect(screen.queryByLabelText("Previous")).toBeDisabled();
  });

  it("Enables navigating to 'Previous' page while not on first page", async () => {
    render(paginationStrip, {
      props: {
        modelValue: 2,
        itemsPerPage: 0,
        totalCount: 100,
        pageBuffer: 0,
      },
    });

    expect(screen.queryByLabelText("Previous")).not.toBeDisabled();
  });
});

describe("Next page behavior", () => {
  it("Disables navigating to 'Next' page while first rendered on the last page", async () => {
    render(paginationStrip, {
      props: {
        modelValue: 10,
        itemsPerPage: 10,
        totalCount: 100,
        pageBuffer: 0,
      },
    });

    expect(screen.queryByLabelText("Next")).toBeDisabled();
  });

  it("Disables navigating to 'Next' after navigating to the last page", async () => {
    render(paginationStrip, {
      props: {
        modelValue: 9,
        itemsPerPage: 10,
        totalCount: 100,
        pageBuffer: 0,
      },
    });

    const nextButton = await screen.findByLabelText("Next");

    expect(nextButton).not.toBeDisabled();
    
    await userEvent.click(nextButton)
    expect(nextButton).toBeDisabled();
  });

  it("Enables navigating to 'Next' page while NOT first rendered on the last page", async () => {
    render(paginationStrip, {
      props: {
        modelValue: 9,
        itemsPerPage: 10,
        totalCount: 100,
        pageBuffer: 0,
      },
    });

    expect(screen.queryByLabelText("Next")).toBeEnabled();
  });

  it("Enables navigating to 'Next' page after navigating one page back", async () => {
    render(paginationStrip, {
      props: {
        modelValue: 10,
        itemsPerPage: 10,
        totalCount: 100,
        pageBuffer: 0,
      },
    });

    expect(screen.queryByLabelText("Next")).toBeDisabled();

    const nextButton = await screen.findByLabelText("Previous");

    await userEvent.click(nextButton)
    expect(nextButton).toBeEnabled();
  });
});


describe("Page buffer behavior", () => {
  it.todo("Example 1");
  it.todo("Example 2");
});

describe("Total count and items per page behavior", () => {
  // If the current page number is less than the page buffer there should be no left ellipsis
// If the current page number is greater than the page buffer there should be a left ellipsis
// If the current page is equal to the page buffer then should be no left ellipsis
// Same for the right ellipsis, although that should be "current page is within page buffer of the last page.
  it.todo("Example 1");
  it.todo("Example 2");
});
