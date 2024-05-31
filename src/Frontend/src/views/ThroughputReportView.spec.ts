import { expect, it as example, render, screen, describe, userEvent } from "@component-test-utils";
//Imports from the system under test
import ThroughputReportView from "./ThroughputReportView.vue";
import ReportGenerationState from "@/resources/ReportGenerationState";
import { useServiceControl } from "@/composables/serviceServiceControl";
import { useServiceControlUrls } from "@/composables/serviceServiceControlUrls";
import { useLicense } from "@/composables/serviceLicense";
import makeRouter from "@/router";

//Testing framework imports
import { beforeAll } from "vitest";
import { RouterLinkStub } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";

//Reusing functions from the acceptance test setup
import { Driver } from "@/../test/driver";
import { makeMockEndpoint } from "@/../test/mock-endpoint";
import { mockServer } from "@/../test/mock-server";
import { serviceControlWithMonitoring } from "@/../test/preconditions";
import { serviceControlMainInstance } from "@/../test/mocks/service-control-instance-template";

describe("Feature: Backend mininum requirements checking", async () => {
  describe("Rule: It should be validated that ServiceControl version is at least 5.0.0", async () => {
    const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
    example("Example: ServiceControl main instance is 4.9.0", async () => {
      mockEndpoint(serviceControlInstanceUrl, {
        body: serviceControlMainInstance,
        headers: { "X-Particular-Version": "4.0.4" },
      });
      await useServiceControlUrls().then(() => Promise.all([useLicense(), useServiceControl()]));

      render(ThroughputReportView, {
        global: {
          stubs: {
            RouterLink: RouterLinkStub,
          },
          plugins: [router, createTestingPinia()],
        },
        props: {},
      });

      //Replace this with a role and/or aria-label
      expect(screen.getByText(/the minimum version of servicecontrol required to enable the usage feature is \./i)).toBeInTheDocument();
      screen.logTestingPlaygroundURL();
    });

    example("Example: ServiceControl main instance is 5.0.0", async () => {
      mockEndpoint(serviceControlInstanceUrl, {
        body: serviceControlMainInstance,
        headers: { "X-Particular-Version": "5.0.4" },
      });
      await useServiceControlUrls().then(() => Promise.all([useLicense(), useServiceControl()]));

      render(ThroughputReportView, {
        global: {
          stubs: {
            RouterLink: RouterLinkStub,
          },
          plugins: [router, createTestingPinia()],
        },
        props: {},
      });

      //Replace this with a role and/or aria-label
      expect(screen.queryByText(/the minimum version of servicecontrol required to enable the usage feature is \./i)).not.toBeInTheDocument();
      screen.logTestingPlaygroundURL();
    });
  });
});

const mockEndpoint = makeMockEndpoint({ mockServer: mockServer });

const router = makeRouter();

const makeDriver = (): Driver => ({
  async goTo() {},
  mockEndpoint,
  setUp(factory) {
    return factory({ driver: this });
  },
  disposeApp() {},
});

const driver = makeDriver();

beforeAll(async () => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  const el = document.createElement("div");
  el.id = "modalDisplay";
  document.body.appendChild(el);
  await driver.setUp(serviceControlWithMonitoring);

  mockEndpoint(`${serviceControlInstanceUrl}licensing/report/available`, {
    body: <ReportGenerationState>{
      transport: "LearningTransport",
      report_can_be_generated: true,
      reason: "",
    },
    method: "get",
    status: 200,
  });
});
