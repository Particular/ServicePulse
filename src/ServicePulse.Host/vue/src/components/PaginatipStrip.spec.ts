import { expect, it, render, screen, describe, userEvent } from "@component-test-utils";
import paginationStrip from "./PaginationStrip.vue";
describe("Previous page behavior", () => {
  it("Disables 'Previous' button when the component is render to be on the first page", async () => {
    render(paginationStrip, {
      props: {
        modelValue: 1,
        itemsPerPage: 10,
        totalCount: 100,
        pageBuffer: 0,
      },
    });
    expect(screen.queryByLabelText("Previous")).toBeDisabled();
  });

  it("Disables navigating to 'Previous' after navigating to the first page", async () => {
    render(paginationStrip, {
      props: {
        modelValue: 2,
        itemsPerPage: 10,
        totalCount: 100,
        pageBuffer: 0,
      },
    });
    // Confirm that the the previous button rendered as enabled
    expect(screen.queryByLabelText("Previous")).toBeEnabled();
    // click the previous button
    const previousButton = await screen.findByLabelText("Previous");
    await userEvent.click(previousButton);
    // Check that the previous button is disabled
    expect(screen.queryByLabelText("Previous")).toBeDisabled();
    // Check that the page number 1 is active
    expect(screen.getByRole("button", { pressed: true, name: "1" })).toBeInTheDocument();
  });

  it("Enables navigating to 'Previous' page when not first rendered on the first page", async () => {
    render(paginationStrip, {
      props: {
        modelValue: 2,
        itemsPerPage: 10,
        totalCount: 100,
        pageBuffer: 0,
      },
    });
    expect(screen.queryByLabelText("Previous")).toBeEnabled();
  });

  it("Enables navigating to 'Previous' page after navigating one page next", async () => {
    render(paginationStrip, {
      props: {
        modelValue: 1,
        itemsPerPage: 10,
        totalCount: 100,
        pageBuffer: 0,
      },
    });
    // Confirm that the the previous button rendered as enabled
    expect(screen.queryByLabelText("Previous")).toBeDisabled();
    // click the previous button
    const nextButton = await screen.findByLabelText("Next");
    await userEvent.click(nextButton);
    // Check that the previous button is disabled
    expect(screen.queryByLabelText("Previous")).toBeEnabled();
    // Check that the page number 1 is active
    expect(screen.getByRole("button", { pressed: true, name: "2" })).toBeInTheDocument();
  });
});

describe("Next page behavior", () => {
  it.todo("Disables navigating to 'Next' page when first rendered on the last page", async () => {});

  it.todo("Disables navigating to 'Next' after navigating to the last page", async () => {});

  it.todo("Enables navigating to 'Next' page when NOT first rendered on the last page", async () => {});

  it.todo("Enables navigating to 'Next' page after navigating one page back", async () => {});
});

describe("Feature: Jumping a number of pages forward or backward must be possible", () => {
  describe("Rule: Buttons for jumping pages back or forward should be available only when enough pages ahead or back are available", () => {
    it.todo("Example: Enough pages to jump forward and backward", async () => {});

    it.todo("Example: Enough pages to jump foward only", async () => {});

    it.todo("Example: Enough pages to jump back only", async () => {});

    it.todo("Example: Not enough pages to jump forward or backward", async () => {});

    it.todo("Example: Jump 5 pages forward", async () => {});

    it.todo("Example: Jump 10 pages back", async () => {});
  });
});
