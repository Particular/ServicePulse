//import { it } from "@application-test-utils";
import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { fireEvent, screen } from "@testing-library/vue";
import * as precondition from "../../preconditions";

describe("FEATURE: Endpoint filtering", () => {
  describe("RULE: List of monitoring endpoints should be filterable by the name", () => {
    it("Example: Filtering by an endpoint full name", async ({ driver }) => {
      //Arrange   
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasMonitoredEndpoints);

      //Act
      await driver.goTo("monitoring");

      //Asssert
      //Check the sales endpoint still shows right before filtering
      expect(await screen.findByRole("link", { name: /a\.c\.sales1/i })).toBeInTheDocument();

      //Act
      var filterByNameInput = await screen.findByLabelText("filter by name");
      expect(filterByNameInput).toBeInTheDocument();
      await fireEvent.update(filterByNameInput, "A.C.ClientUI");

      //Assert
      //Confirm the sales endpoint no longer shows in the list after filtering
      expect(screen.queryByRole("link", { name: /a\.c\.sales1/i })).toBeNull();
      //Confirm the sales endpoint Still shows in the list after filtering
      expect(screen.queryByRole("link", { name: /a\.c\.clientui/i })).toBeInTheDocument();
    });
  });
});
