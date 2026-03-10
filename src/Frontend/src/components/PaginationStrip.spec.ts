import { expect, render, screen, describe, userEvent, test } from "@component-test-utils";
import paginationStrip from "./PaginationStrip.vue";

//Defines a domain-specific language (DSL) for interacting with the system under test (sut)
interface PaginationStripDSL {
  clickPrevious(): Promise<void>;
  clickNext(): Promise<void>;
  clickPage(pageName: string): Promise<void>;
  clickJumpPagesForward(): Promise<void>;
  clickJumpPagesBack(): Promise<void>;
  updateNumberOfRecordsPerPage(newNumberOfItemsPerPage: number): Promise<void>;
  verify: PaginationStripDSLAssertions;
}

//Defines a domain-specific language (DSL) for checking verifications against the system under test (sut)
interface PaginationStripDSLAssertions {
  stripOfButtonsMatchesSequence(value: string): void;
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
    test("EXAMPLE: First page is active on the initial render", () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 1 });

      component.verify.previousIsDisabled();
    });

    test("EXAMPLE: Clicking 'previous' button from second page", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 2 });

      component.verify.previousIsEnabled();

      await component.clickPrevious();

      component.verify.previousIsDisabled();
      component.verify.activePageIs("Page 1");
    });
  });
  describe("Rule: The 'Previous' button is enabled when the first page is not active", () => {
    test("EXAMPLE: Second page is active on initial render", () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 2 });
      component.verify.previousIsEnabled();
    });

    test("EXAMPLE: Clicking 'Next' button from first page", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 1 });

      component.verify.previousIsDisabled();

      await component.clickNext();

      component.verify.activePageIs("Page 2");
      component.verify.previousIsEnabled();
    });
  });
});

describe("Feature: Moving forward through pages with a single button must be possible", () => {
  describe("Rule: The 'Next' button is disabled when the last page is active", () => {
    test("EXAMPLE: Last page is active on the initial render", () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 10 });
      component.verify.nextIsDisabled();
    });

    test("EXAMPLE: Clicking 'Next' button from penultimate page", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 9 });

      component.verify.nextIsEnabled();

      await component.clickNext();

      component.verify.nextIsDisabled();
      component.verify.activePageIs("Page 10");
    });
  });
  describe("Rule: The 'Next' button is enabled when the last page is not active", () => {
    test("EXAMPLE: Penultimate page is active on initial render", () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 9 });

      component.verify.nextIsEnabled();
    });

    test("EXAMPLE: Clicking 'Previous' button from last page", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 10 });

      component.verify.nextIsDisabled();

      await component.clickPrevious();
      component.verify.nextIsEnabled();
      component.verify.activePageIs("Page 9");
    });
  });
});

describe("Feature: Navigating to a specific page that is available must be possible", () => {
  describe("Rule: Clicking to an specific page should show the page as active", () => {
    test("EXAMPLE: First page is active then clicking to page number 4", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 1, allowToJumpPagesBy: 2 });

      component.verify.stripOfButtonsMatchesSequence("Previous,1,2,3,4,...,10,Next");

      await component.clickPage("Page 4");
      component.verify.activePageIs("Page 4");

      component.verify.stripOfButtonsMatchesSequence("Previous,1,...,2,3,4,5,6,...,10,Next");
    });
  });
});

describe("Feature: Jumping a number of pages forward or backward must be possible", () => {
  describe("Rule: Buttons for jumping pages back or forward are available only when enough pages ahead or back are available", () => {
    test("EXAMPLE: Strip for 100 records with 10 items per page, allowing to jump pages by 2", () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 1, allowToJumpPagesBy: 2 });

      component.verify.stripOfButtonsMatchesSequence("Previous,1,2,3,4,...,10,Next");
    });

    test("EXAMPLE: Enough pages to jump forward and backward", () => {
      const component = renderPaginationStripWith({ records: 500, itemsPerPage: 10, selectedPage: 10, allowToJumpPagesBy: 5 });

      component.verify.jumpPagesBackIsPresent();
      component.verify.jumpPagesForwardIsPresent();
    });

    test("EXAMPLE: Enough pages to jump foward only", () => {
      const component = renderPaginationStripWith({ records: 500, itemsPerPage: 10, selectedPage: 6, allowToJumpPagesBy: 5 });

      component.verify.jumpPagesBackIsPresent(false);
      component.verify.jumpPagesForwardIsPresent();
    });

    test("EXAMPLE: Enough pages to jump back only", () => {
      const component = renderPaginationStripWith({ records: 500, itemsPerPage: 10, selectedPage: 50, allowToJumpPagesBy: 5 });

      component.verify.jumpPagesBackIsPresent();
      component.verify.jumpPagesForwardIsPresent(false);
      component.verify.activePageIs("Page 50");
    });

    test("EXAMPLE: Not enough pages to jump forward or backward", () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 1, allowToJumpPagesBy: 5 });

      component.verify.jumpPagesBackIsPresent(false);
      component.verify.jumpPagesForwardIsPresent(false);
    });

    test("EXAMPLE: Jump 5 pages forward", async () => {
      const component = renderPaginationStripWith({ records: 500, itemsPerPage: 10, selectedPage: 6, allowToJumpPagesBy: 5 });

      component.verify.jumpPagesBackIsPresent(false);
      component.verify.jumpPagesForwardIsPresent();

      await component.clickJumpPagesForward();

      component.verify.jumpPagesBackIsPresent();
      component.verify.jumpPagesForwardIsPresent();

      component.verify.activePageIs("Page 11");
    });

    test("EXAMPLE: Jump 10 pages back", async () => {
      const component = renderPaginationStripWith({ records: 500, itemsPerPage: 10, selectedPage: 50, allowToJumpPagesBy: 5 });

      component.verify.jumpPagesBackIsPresent();
      component.verify.jumpPagesForwardIsPresent(false);

      await component.clickJumpPagesBack();
      await component.clickJumpPagesBack();

      component.verify.jumpPagesBackIsPresent();
      component.verify.jumpPagesForwardIsPresent();

      component.verify.activePageIs("Page 40");
    });
  });
});

describe("Feature: changes in the number of records per page are allowed", () => {
  describe("Rule: Updating the number of records per page recalculates the pages of the strip and resets selected page", () => {
    test("EXAMPLE: Number of records per page gets updated from 10 to 50", async () => {
      const component = renderPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 3, allowToJumpPagesBy: 2 });

      component.verify.stripOfButtonsMatchesSequence("Previous,1,2,3,4,5,...,10,Next");
      component.verify.activePageIs("Page 3");

      await component.updateNumberOfRecordsPerPage(50);
      component.verify.stripOfButtonsMatchesSequence("Previous,1,2,Next");

      component.verify.activePageIs("Page 1");
    });
  });
});

function renderPaginationStripWith({ records, itemsPerPage, selectedPage, allowToJumpPagesBy = 0 }: { records: number; itemsPerPage: number; selectedPage: number; allowToJumpPagesBy?: number }): PaginationStripDSL {
  const { rerender } = render(paginationStrip, {
    props: {
      modelValue: selectedPage,
      itemsPerPage: itemsPerPage,
      totalCount: records,
      pageBuffer: allowToJumpPagesBy,
    },
  });

  const dslAPI: PaginationStripDSL = {
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
    clickPage: async function (pageName: string): Promise<void> {
      await userEvent.click(await screen.findByLabelText(pageName));
    },
    updateNumberOfRecordsPerPage: async function (newNumberOfItemsPerPage: number) {
      await rerender({
        modelValue: selectedPage,
        itemsPerPage: newNumberOfItemsPerPage,
        totalCount: records,
        pageBuffer: allowToJumpPagesBy,
      });
    },
    verify: {
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
        }
      },
      jumpPagesForwardIsPresent: function (truthy = true) {
        if (truthy) {
          expect(screen.queryByLabelText(`Forward ${allowToJumpPagesBy}`)).toBeInTheDocument();
        } else {
          expect(screen.queryByLabelText(`Forward ${allowToJumpPagesBy}`)).not.toBeInTheDocument();
        }
      },
      stripOfButtonsMatchesSequence: function (sequence: string): void {
        const allButtons = screen.getAllByRole("button");
        const generatedStripText = allButtons.map((v) => v.innerHTML).join(",");
        expect(generatedStripText).toBe(sequence);
      },
    },
  };

  return dslAPI;
}
