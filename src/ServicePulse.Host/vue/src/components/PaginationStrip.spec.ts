import { expect, it as example, render, screen, describe, userEvent } from "@component-test-utils";
import paginationStrip from "./PaginationStrip.vue";

interface PaginationStripDSL {
  assert: PaginationStripDSLAssertions;
  clickPrevious(): Promise<void>;
  clickNext(): Promise<void>;
}

interface PaginationStripDSLAssertions {
  activePageIs(value: string): void;
  previousIsEnabled(): void;
  previousIsDisabled(): void;
  nextIsEnabled(): void;
  nextIsDisabled(): void;
  skipPagesBackIsPresent(value?: boolean): void;
  skipPagesForwardIsPresent(value?: boolean): void;
}

describe("Previous page behavior", () => {
  example("Disables navigating to 'Previous' page while first rendered on the first page", async () => {
    const dsl = rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 1 });

    dsl.assert.previousIsDisabled();
  });

  example("Disables navigating to 'Previous' after navigating to the first page", async () => {
    const dsl = rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 2 });

    dsl.assert.previousIsEnabled();

    await dsl.clickPrevious();

    dsl.assert.previousIsDisabled();
    dsl.assert.activePageIs("1");
  });

  example("Enables navigating to 'Previous' page while not first rendered on the first page", async () => {
    const dsl = rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 2 });
    dsl.assert.previousIsEnabled();
  });

  example("Enables navigating to 'Previous' page after navigating one page next", async () => {
    const dsl = rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 1 });

    dsl.assert.previousIsDisabled();

    await dsl.clickNext();

    dsl.assert.activePageIs("2");
    dsl.assert.previousIsEnabled();
  });
});

describe("Next page behavior", () => {
  example("Disables navigating to 'Next' page when first rendered on the last page", async () => {
    const dsl = rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 10 });
    dsl.assert.nextIsDisabled();
  });

  example("Disables navigating to 'Next' after navigating to the last page", async () => {
    const dsl = rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 9 });

    dsl.assert.nextIsEnabled();

    await dsl.clickNext();

    dsl.assert.nextIsDisabled();
    dsl.assert.activePageIs("10");
  });

  example("Enables navigating to 'Next' page when NOT first rendered on the last page", async () => {
    const dsl = rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 9 });

    dsl.assert.nextIsEnabled();
  });

  example("Enables navigating to 'Next' page after navigating one page back", async () => {
    const dls = rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 10 });

    dls.assert.nextIsDisabled();

    dls.clickPrevious();
    dls.assert.previousIsEnabled();
    dls.assert.activePageIs("8");
  });
});

describe("Feature: Skipping a number of pages forward or backward must be possible", () => {
  describe("Rule: Buttons for skpping back or forward should be available only when enough pages ahead or back are available", () => {
    example("Example: Enough pages to skip forward and backward", async () => {
      const dsl = rederPaginationStripWith({ records: 500, itemsPerPage: 10, selectedPage: 10, allowToJumpPagesBy: 5 });

      dsl.assert.skipPagesBackIsPresent();
      dsl.assert.skipPagesForwardIsPresent();
    });

    example("Example: Enough pages to skip foward only", async () => {
      const dsl = rederPaginationStripWith({ records: 500, itemsPerPage: 10, selectedPage: 6, allowToJumpPagesBy: 5 });

      dsl.assert.skipPagesBackIsPresent(false);
      dsl.assert.skipPagesForwardIsPresent();
    });

    example("Example: Enough pages to skip backward only", async () => {
      const dsl = rederPaginationStripWith({ records: 500, itemsPerPage: 10, selectedPage: 500, allowToJumpPagesBy: 5 });

      dsl.assert.skipPagesBackIsPresent();
      dsl.assert.skipPagesForwardIsPresent(false);
    });

    example("Example: No enough pages forward or backward", async () => {
      const dsl = rederPaginationStripWith({ records: 100, itemsPerPage: 10, selectedPage: 1, allowToJumpPagesBy: 5 });

      dsl.assert.skipPagesBackIsPresent(false);
      dsl.assert.skipPagesForwardIsPresent(false);
    });
  });
});

function rederPaginationStripWith({ records, itemsPerPage, selectedPage, allowToJumpPagesBy = 0 }: { records: number; itemsPerPage: number; selectedPage: number; allowToJumpPagesBy?: number }): PaginationStripDSL {
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
        expect(screen.queryByLabelText("Previous Page")).not.toBeDisabled();
      },

      nextIsDisabled: function () {
        expect(screen.queryByLabelText("Next Page")).toBeDisabled();
      },
      nextIsEnabled: function () {
        expect(screen.queryByLabelText("Next Page")).not.toBeDisabled();
      },
      activePageIs: function (value) {
        expect(screen.getByRole("button", { pressed: true })).toContainHTML(value);
      },
      skipPagesBackIsPresent: function (truthy = true) {
        if (truthy) {
          expect(screen.queryByLabelText(`Back ${allowToJumpPagesBy}`)).toBeInTheDocument();
        } else {
        }
      },
      skipPagesForwardIsPresent: function (truthy = true) {
        if (truthy) {
          expect(screen.queryByLabelText(`Forward ${allowToJumpPagesBy}`)).toBeInTheDocument();
        } else {
          expect(screen.queryByLabelText(`Forward ${allowToJumpPagesBy}`)).not.toBeInTheDocument();
        }
      },
    },
    clickPrevious: async function () {
      await userEvent.click(await screen.findByLabelText("Previous Page"));
    },

    clickNext: async function () {
      await userEvent.click(await screen.findByLabelText("Next Page"));
    },
  };

  return dslAPI;
}
