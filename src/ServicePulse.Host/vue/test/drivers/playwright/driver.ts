import { expect, Locator, Page, test as itPlaywright } from '@playwright/test';

import type {
  Assertions,
  AssertionsNot,
  Driver,
  Interactions,
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
    await page.goto(`#/${path}`);
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
  mockEndpoint(path, { body, method = 'get', status = 200 }) {
    page.route(path, (route) => {
      if (route.request().method() !== method.toUpperCase()) {
        route.continue();
        return;
      }

      route.fulfill({
        status,
        body: JSON.stringify(body),
      });
    });
  },
  setUp(factory) {
    return factory({ driver: this });
  },
  queryByText(text) {
    return makeAssertionsNot(() => page.getByText(text));
  },
});

const it = itPlaywright.extend<{ driver: Driver }>({
  driver: async ({ page }, use) => {
    await use(makeDriver({ page }));
  },
});

export { it };