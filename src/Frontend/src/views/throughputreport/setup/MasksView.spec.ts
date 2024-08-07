import { makeDriverForTests, userEvent, render, screen } from "@component-test-utils";
import MasksView from "@/views/throughputreport/setup/MasksView.vue";
import { describe, expect, test } from "vitest";
import * as precondition from "../../../../test/preconditions";
import { useServiceControl } from "@/composables/serviceServiceControl";
import { useServiceControlUrls } from "@/composables/serviceServiceControlUrls";
import { minimumSCVersionForThroughput } from "@/views/throughputreport/isThroughputSupported";
import flushPromises from "flush-promises";
import Toast from "vue-toastification";
import { disableMonitoring } from "../../../../test/drivers/vitest/setup";

describe("MaskView tests", () => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;

  async function setup() {
    const driver = makeDriverForTests();

    disableMonitoring();

    await driver.setUp(precondition.hasServiceControlMainInstance(minimumSCVersionForThroughput));
    await driver.setUp(precondition.hasUpToDateServicePulse);
    await driver.setUp(precondition.hasUpToDateServiceControl);
    await driver.setUp(precondition.errorsDefaultHandler);

    return driver;
  }

  async function renderComponent(body: string[] = []) {
    const driver = await setup();
    driver.mockEndpoint(`${serviceControlInstanceUrl}licensing/settings/masks`, { body });
    useServiceControlUrls();
    await useServiceControl();
    const { debug } = render(MasksView, { global: { plugins: [Toast] } });
    await flushPromises();
    return { debug, driver };
  }

  function getTextAreaElement() {
    return screen.getByRole("textbox", { name: /List of words to mask/i }) as HTMLTextAreaElement;
  }

  test("renders empty list", async () => {
    await renderComponent();

    expect(getTextAreaElement().value).toBe("");
  });

  test("renders mask list loaded from server", async () => {
    await renderComponent(["first", "second"]);

    expect(getTextAreaElement().value).toBe("first\nsecond");
  });

  test("update mask list", async () => {
    await renderComponent(["first", "second"]);

    const use = userEvent.setup();
    await use.type(getTextAreaElement(), "\nthree\nfour\nfive");

    expect(getTextAreaElement().value).toBe("first\nsecond\nthree\nfour\nfive");
  });

  test("save mask list", async () => {
    const { driver } = await renderComponent(["first", "second"]);

    const use = userEvent.setup();
    await use.type(getTextAreaElement(), "\nthree\nfour\nfive");

    driver.mockEndpoint(`${serviceControlInstanceUrl}licensing/settings/masks/update`, { body: undefined, method: "post" });
    await use.click(screen.getByRole("button", { name: /Save/i }));

    expect(screen.queryAllByText(/Masks Saved/i).length).toBeGreaterThanOrEqual(1);
  });
});
