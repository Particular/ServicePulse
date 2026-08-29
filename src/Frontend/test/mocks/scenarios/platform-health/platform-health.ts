import * as precondition from "../../../preconditions";
import { ApiRoutes } from "@/composables/apiRoutes";
import { createScenario } from "../scenario-helper";
import { getPlatformHealthCustomChecks, getPlatformHealthMonitoringRoot, getPlatformHealthPrimaryRoot, getPlatformHealthRemoteInstances, installPlatformHealthDevControls } from "../../platform-health-state";

const { worker, driver, runScenario } = createScenario();

export { worker };

export const setupComplete = (async () => {
  await runScenario(precondition.scenarioAuthenticatedUser);
  await runScenario(precondition.hasNoDisconnectedEndpoints);
  await runScenario(precondition.hasActiveLicense);
  await runScenario(() => {
    driver.mockEndpointDynamic(`${window.defaultConfig.service_control_url}`, "get", () => {
      const body = getPlatformHealthPrimaryRoot();

      return Promise.resolve({
        body,
        status: body.platform_health_status === "unavailable" ? 503 : 200,
        headers: { "X-Particular-Version": stateVersion() },
      });
    });
    driver.mockEndpointDynamic(`${window.defaultConfig.service_control_url}configuration/remotes`, "get", () => Promise.resolve({ body: getPlatformHealthRemoteInstances() }));
    driver.mockEndpointDynamic(`${window.defaultConfig.service_control_url}customchecks`, "get", (url) => {
      const status = url.searchParams.get("status");
      const body = getPlatformHealthCustomChecks();

      return Promise.resolve({
        body: status === "fail" ? body.filter((check) => check.status === "Fail") : body,
        headers: { "Total-Count": body.filter((check) => check.status === "Fail").length.toString() },
      });
    });
    driver.mockEndpoint(`${window.defaultConfig.service_control_url}my/routes`, { body: permissiveManifest() });
    driver.mockEndpoint(`${window.defaultConfig.monitoring_urls[0]}api/my/routes`, { body: permissiveManifest() });
    driver.mockEndpointDynamic(`${window.defaultConfig.monitoring_urls[0]}`, "get", () => {
      const body = getPlatformHealthMonitoringRoot();

      return Promise.resolve({
        body,
        status: 200,
        headers: { "X-Particular-Version": stateVersion() },
      });
    });
    return Promise.resolve();
  });
  installPlatformHealthDevControls();
})();

function stateVersion() {
  return "6.19.3";
}

function permissiveManifest() {
  return {
    roles: [],
    routes: Object.values(ApiRoutes).map((route) => ({
      method: route.method,
      url_template: route.path,
    })),
  };
}
