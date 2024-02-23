import { expect, it as example, render, screen, describe, userEvent } from "@component-test-utils";
import paginationStrip from "./PaginationStrip.vue";

//Defines a domain-specific language (DSL) for interacting with the system under test (sut)
interface PaginationStripDSL {
  assert: PaginationStripDSLAssertions;
  clickPrevious(): Promise<void>;
  clickNext(): Promise<void>;

  clickJumpPagesForward(): Promise<void>;
  clickJumpPagesBack(): Promise<void>;
}

//Defines a domain-specific language (DSL) for checking assertions against the system under test (sut)
interface PaginationStripDSLAssertions {
  pageButtonIsDisplayed(value: string): void;
  activePageIs(value: string): void;
  previousIsEnabled(): void;
  previousIsDisabled(): void;
  nextIsEnabled(): void;
  nextIsDisabled(): void;
  jumpPagesBackIsPresent(value?: boolean): void;
  jumpPagesForwardIsPresent(value?: boolean): void;
}

describe("Feature: Moving backwards through pages with a single button must be possible", () => {
  describe("Rule: The 'Previous' button is disabled when the first page is active", () => {
    example("Example: First page is active on the initial render", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 1 });

      component.assert.previousIsDisabled();
    });

    example("Example: Clicking 'previous' button from second page", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 2 });

      component.assert.previousIsEnabled();

      await component.clickPrevious();

      component.assert.previousIsDisabled();
      component.assert.activePageIs("Page 1");
    });
  });
  describe("Rule: The 'Previous' button is enabled when the first page is not active", () => {
    example("Example: Second page is active on initial render", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 2 });
      component.assert.previousIsEnabled();
    });

    example("Example: Clicking 'Next' button from first page", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 1 });

      component.assert.previousIsDisabled();

      await component.clickNext();

      component.assert.activePageIs("Page 2");
      component.assert.previousIsEnabled();
    });
  });
});

describe("Feature: Moving forward through pages with a single button must be possible", () => {
  describe("Rule: The 'Next' button is disabled when the last page is active", () => {
    example("Example: Last page is active on the initial render", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 10 });
      component.assert.nextIsDisabled();
    });

    example("Example: Clicking 'Next' button from penultimate page", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 9 });

      component.assert.nextIsEnabled();

      await component.clickNext();

      component.assert.nextIsDisabled();
      component.assert.activePageIs("Page 10");
    });
  });
  describe("Rule: The 'Next' button is enabled when the last page is not active", () => {
    example("Example: Penultimate page is active on initial render", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 9 });

      component.assert.nextIsEnabled();
    });

    example("Example: Clicking 'Previous' button from last page", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 10 });

      component.assert.nextIsDisabled();

      await component.clickPrevious();
      component.assert.previousIsEnabled();
      component.assert.activePageIs("Page 9");
    });
  });
});

describe("Feature: Navigating to a specific page that is available must be possible", () => {
  describe("Rule: Number of page buttons displayed match the relationship between the total number of items and the number of items allowed per page", () => {
    example("Example: 100 items vs. 10 items per page", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 1 });

      component.assert.pageButtonIsDisplayed("Page 1");
      component.assert.pageButtonIsDisplayed("Page 2");
      /*component.assert.pageButtonIsDisplayed("Page 3");
      component.assert.pageButtonIsDisplayed("Page 4");
      component.assert.pageButtonIsDisplayed("Page 5");
      component.assert.pageButtonIsDisplayed("Page 6");
      component.assert.pageButtonIsDisplayed("Page 7");
      component.assert.pageButtonIsDisplayed("Page 8");
      component.assert.pageButtonIsDisplayed("Page 9");
      component.assert.pageButtonIsDisplayed("Last Page"); */
    });
  });
});

describe("Feature: Jumping a number of pages forward or backward must be possible", () => {
  describe("Rule: Buttons for jumping pages back or forward are available only when enough pages ahead or back are available", () => {
    example("Example: Enough pages to jump forward and backward", async () => {
      const component = renderPaginationStripWith({ records: 500, itemsPerPage: 10, selectedPage: 10, allowToJumpPagesBy: 5 });

      component.assert.jumpPagesBackIsPresent();
      component.assert.jumpPagesForwardIsPresent();
    });

    example("Example: Enough pages to jump foward only", async () => {
      const component = renderPaginationStripWith({ records: 500, itemsPerPage: 10, selectedPage: 6, allowToJumpPagesBy: 5 });

      component.assert.jumpPagesBackIsPresent(false);
      component.assert.jumpPagesForwardIsPresent();
    });

    example("Example: Enough pages to jump back only", async () => {
      const component = renderPaginationStripWith({ records: 500, itemsPerPage: 10, selectedPage: 50, allowToJumpPagesBy: 5 });

      component.assert.jumpPagesBackIsPresent();
      component.assert.jumpPagesForwardIsPresent(false);
      component.assert.activePageIs("Page 50");
    });

    example("Example: Not enough pages to jump forward or backward", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 1, allowToJumpPagesBy: 5 });

      component.assert.jumpPagesBackIsPresent(false);
      component.assert.jumpPagesForwardIsPresent(false);
    });

    example("Example: Jump 5 pages forward", async () => {
      const component = renderPaginationStripWith({ records: 500, itemsPerPage: 10, selectedPage: 6, allowToJumpPagesBy: 5 });

      component.assert.jumpPagesBackIsPresent(false);
      component.assert.jumpPagesForwardIsPresent();

      await component.clickJumpPagesForward();

      component.assert.jumpPagesBackIsPresent();
      component.assert.jumpPagesForwardIsPresent();

      component.assert.activePageIs("Page 11");
    });

    example("Example: Jump 10 pages back", async () => {
      const component = renderPaginationStripWith({ records: 500, itemsPerPage: 10, selectedPage: 50, allowToJumpPagesBy: 5 });

      component.assert.jumpPagesBackIsPresent();
      component.assert.jumpPagesForwardIsPresent(false);

      await component.clickJumpPagesBack();
      await component.clickJumpPagesBack();

      component.assert.jumpPagesBackIsPresent();
      component.assert.jumpPagesForwardIsPresent();

      component.assert.activePageIs("Page 40");
    });
  });
});

function renderPaginationStripWith({ records, itemsPerPage, selectedPage, allowToJumpPagesBy = 0 }: { records: number; itemsPerPage: number; selectedPage: number; allowToJumpPagesBy?: number }): PaginationStripDSL {
  render(paginationStrip, {
    props: {
      modelValue: selectedPage,
      itemsPerPage: itemsPerPage,
      totalCount: records,
      pageBuffer: allowToJumpPagesBy,
    },
  });

  let dslAPI: PaginationStripDSL = {
    assert: {
      previousIsDisabled: function () {
        expect(screen.queryByLabelText("Previous Page")).toBeDisabled();
      },
      previousIsEnabled: function () {
        expect(screen.queryByLabelText("Previous Page")).toBeEnabled();
      },
      nextIsDisabled: function () {
        expect(screen.queryByLabelText("Next Page")).toBeDisabled();
      },
      nextIsEnabled: function () {
        expect(screen.queryByLabelText("Next Page")).toBeEnabled();
      },
      activePageIs: function (value) {
        expect(screen.getByRole("button", { pressed: true, name: value })).toBeInTheDocument();
      },
      jumpPagesBackIsPresent: function (truthy = true) {
        if (truthy) {
          expect(screen.queryByLabelText(`Back ${allowToJumpPagesBy}`)).toBeInTheDocument();
        } else {
        }
      },
      jumpPagesForwardIsPresent: function (truthy = true) {
        if (truthy) {
          expect(screen.queryByLabelText(`Forward ${allowToJumpPagesBy}`)).toBeInTheDocument();
        } else {
          expect(screen.queryByLabelText(`Forward ${allowToJumpPagesBy}`)).not.toBeInTheDocument();
        }
      },
      pageButtonIsDisplayed: function (value: string): void {
        expect(screen.getByRole("button", { name: value })).toBeInTheDocument();
      },
    },
    clickPrevious: async function () {
      await userEvent.click(await screen.findByLabelText("Previous Page"));
    },

    clickNext: async function () {
      await userEvent.click(await screen.findByLabelText("Next Page"));
    },

    clickJumpPagesForward: async function () {
      await userEvent.click(await screen.findByLabelText(`Forward ${allowToJumpPagesBy}`));
    },

    clickJumpPagesBack: async function () {
      await userEvent.click(await screen.findByLabelText(`Back ${allowToJumpPagesBy}`));
    },
  };

  return dslAPI;
}
