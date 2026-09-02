import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { customChecksFailedRowsList, customChecksMessage, showPlatformCustomChecksToggle } from "./questions/failedCustomChecks";
import { waitFor, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { Status } from "@/resources/CustomCheck";

describe("FEATURE: No data", () => {
  describe("RULE: When there is no data to show, a message should be displayed ", () => {
    test("EXAMPLE: There are no failed or passing custom checks", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasCustomChecksEmpty);

      await driver.goTo("/custom-checks");

      await waitFor(() => {
        expect(customChecksMessage()).toBe("No failed custom checks");
      });
    });
    test("EXAMPLE: There are custom checks but none of them are failing", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const failingCustomCheckCount = 0;
      const passingCustomCheckCount = 5;
      await driver.setUp(precondition.hasCustomChecks(failingCustomCheckCount, passingCustomCheckCount));

      await driver.goTo("/custom-checks");

      await waitFor(() => {
        expect(customChecksMessage()).toBe("No failed custom checks");
      });
    });

    test("EXAMPLE: Internal platform custom checks are hidden by default but can be shown", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.getCustomChecks([
          precondition.createCustomCheck({
            custom_check_id: "ServiceControl Primary Instance",
            category: "Health",
            status: Status.Fail,
            failure_reason: "Critical error detected",
            internal: true,
          }),
        ])
      );

      await driver.goTo("/custom-checks");

      await waitFor(() => {
        expect(customChecksMessage()).toBe("No failed custom checks");
      });

      await waitFor(() => {
        expect(showPlatformCustomChecksToggle()).toBeInTheDocument();
      });

      await userEvent.click(showPlatformCustomChecksToggle());

      await waitFor(async () => {
        expect(await customChecksFailedRowsList()).toHaveLength(1);
      });
    });

    test("EXAMPLE: The platform custom checks toggle is hidden when there are no internal checks", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.getCustomChecks([
          precondition.createCustomCheck({
            custom_check_id: "SampleCustomeCheck 1",
            category: "Some Category 1",
            status: Status.Fail,
            failure_reason: "configured to fail on endpoint 1",
          }),
        ])
      );

      await driver.goTo("/custom-checks");

      await waitFor(() => {
        expect(screen.queryByRole("checkbox", { name: /Show platform custom checks/i })).toBeNull();
      });
    });
  });
});
