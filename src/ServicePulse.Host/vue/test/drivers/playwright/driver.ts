import { expect, Locator, Page, test as itPlaywright } from '@playwright/test';

import type {
  Assertions,
  AssertionsNot,
  Driver,
  Interactions,
  ItCallback,
} from '../../driver';

type LocatorResolver = () => Locator;

function makeAssertions(elementResolver: LocatorResolver): Assertions {
  return {
    shouldHaveAttribute: async (attribute, value) => {
      await expect(elementResolver()).toHaveAttribute(attribute, value || /.*/);
    },
    shouldBeVisible: async () => {
      await expect(elementResolver()).toBeVisible();
    },
  };
}

function makeAssertionsNot(elementResolver: LocatorResolver): AssertionsNot {
  return {
    shouldNotBeVisible: async () => {
      await expect(elementResolver()).toBeHidden();
    },
    shouldNotExist: async () => {
      await expect(elementResolver()).not.toBeVisible();
    },
  };
}

function makeInteractions(elementResolver: LocatorResolver): Interactions {
  return {
    check: async () => {
      await elementResolver().check();
    },
    click: async () => {
      await elementResolver().click();
    },
    type: async (text) => {
      await elementResolver().fill(`${text}`);
    },
  };
}

function makeAssertionsInteractions(
  elementResolver: LocatorResolver,
): Assertions & Interactions {
  return {
    ...makeAssertions(elementResolver),
    ...makeInteractions(elementResolver),
  };
}

const makeDriver = ({ page }: { page: Page }): Driver => ({
  async goTo(path) {
    await page.goto(path);
  },
  findByLabelText(text) {
    return makeAssertionsInteractions(() => page.getByLabel(text));
  },
  findByRole(role, { name }) {
    return makeAssertionsInteractions(() => page.getByRole(role, { name }));
  },
  findByText(text) {
    return makeAssertions(() => page.getByText(text));
  },
  findAllByText(text) {
    return makeAssertions(() => page.getByText(text));
  },  
  queryByText(text) {
    return makeAssertionsNot(() => page.getByText(text));
  },
});

function wrapItCallback(func: ItCallback) {
  return ({ page }: { page: Page }) => {
    const driver = makeDriver({ page });
    return func({ driver });
  };
}

const it = (description: string, func: ItCallback) =>
  itPlaywright(description, wrapItCallback(func));
it.only = (description: string, func: ItCallback) =>
  itPlaywright.only(description, wrapItCallback(func));

export { it };
