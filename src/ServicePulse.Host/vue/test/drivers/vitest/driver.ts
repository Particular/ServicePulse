import { expect, it as itVitest, describe } from 'vitest';
import { screen, waitForElementToBeRemoved } from '@testing-library/dom';
import type { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import userEvent from '@testing-library/user-event';

import type {
  Assertions,
  AssertionsNot,
  Driver,
  Interactions,
} from '../../driver';
import { mount } from '../../../src/mount';
import  makeRouter from '../../../src/router';
import { mockEndpoint } from '../../utils';

type ElementResolver = () => Promise<HTMLElement | HTMLElement[]>;

function toArray<Type>(maybeArray: Type | Type[]) {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

function makeAssertions(elementResolver: ElementResolver): Assertions {
  return {
    shouldBeVisible: async () => {
      expect(await elementResolver()).toBeVisible();
    },
    shouldHaveAttribute: async (attribute, value) => {
      const elements = toArray<HTMLElement>(await elementResolver());

      // eslint-disable-next-line no-restricted-syntax
      for (const element of elements) {
        if (value) {
          expect(element.getAttribute(attribute)).toMatch(value);
        } else {
          expect(element.getAttribute(attribute)).toBeTruthy();
        }
      }
    },
  };
}

function makeAssertionsNot(
  elementResolver: () => Promise<HTMLElement | null>,
): AssertionsNot {
  return {
    shouldNotBeVisible: async () => {
      expect(await elementResolver()).toBeFalsy();
    },
    shouldNotExist: async () => {
      const element = await elementResolver();
      if (element) {
        try {
          await waitForElementToBeRemoved(element);
        } catch (error) {
          throw new Error('Expected element to not exist but it still exists!');
        }
      }
    },
  };
}

function makeInteractions(
  elementResolver: ElementResolver,
  { user }: { user: UserEvent },
): Interactions {
  return {
    check: async () => {
      const elements = toArray<HTMLElement>(await elementResolver());
      // eslint-disable-next-line no-restricted-syntax
      for (const element of elements) {
        // eslint-disable-next-line no-await-in-loop
        await user.click(element);
      }
    },
    click: async () => {
      const elements = toArray<HTMLElement>(await elementResolver());
      // eslint-disable-next-line no-restricted-syntax
      for (const element of elements) {
        // eslint-disable-next-line no-await-in-loop
        await user.click(element);
      }
    },
    type: async (text) => {
      const elements = toArray<HTMLElement>(await elementResolver());
      // eslint-disable-next-line no-restricted-syntax
      for (const element of elements) {
        // eslint-disable-next-line no-await-in-loop
        await user.type(element, text);
      }
    },
  };
}

function makeAssertionsInteractions(
  elementResolver: ElementResolver,
  { user }: { user: UserEvent },
): Assertions & Interactions {
  return {
    ...makeAssertions(elementResolver),
    ...makeInteractions(elementResolver, { user }),
  };
}

const makeDriver = ({ user }: { user: UserEvent }): Driver => ({
  async goTo(path) {
    const router = makeRouter();
    try {
      await router.push(path);
    } catch (error) {
      // Ignore redirection error.
      if (
        error instanceof Error &&
        error.message.includes('Redirected when going from')
      ) {
        return;
      }

      throw error;
    }

    document.body.innerHTML = '<div id="app"></div>';
    mount({ router });
  },
  findByLabelText(text) {
    return makeAssertionsInteractions(() => screen.findByLabelText(text), {
      user,
    });
  },
  findByRole(role, { name }) {
    return makeAssertionsInteractions(() => screen.findByRole(role, { name }), {
      user,
    });
  },
  findByText(text) {
    return makeAssertions(() => screen.findByText(text));
  },
  findAllByText(text) {
    return makeAssertions(() => screen.findAllByText(text));
  },
  mockEndpoint,
  setUp(factory) {
    return factory({ driver: this });
  },
  queryByText(text) {
    return makeAssertionsNot(async () => screen.queryByText(text));
  },
});

const it = itVitest.extend<{ driver: Driver }>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  driver: async ({ task }, use) => {
    const context: {
      user: UserEvent;
    } = {
      user: userEvent.setup(),
    };
    await use(makeDriver(context));
  },
});

export { it, describe };