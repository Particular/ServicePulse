import { expect, it, render, screen, describe } from "@component-test-utils";
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
  it.todo("Disables navigating to 'Next' page while in the last page");
  it.todo("Enables navigating to 'Next' page while NOT in the last page");
});

describe("Page buffer behavior", () => {
  it.todo("Example 1");
  it.todo("Example 2");
});

describe("Total count and items per page behavior", () => {
  it.todo("Example 1");
  it.todo("Example 2");
});
