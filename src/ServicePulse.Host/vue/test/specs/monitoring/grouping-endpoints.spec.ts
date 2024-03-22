import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import userEvent from "@testing-library/user-event";
import { fireEvent, screen } from "@testing-library/vue";
import * as precondition from "../../preconditions";

describe("FEATURE: Grouping endpoints", () => {
  describe("RULE: The number of grouping segments is determined by the number of periods in the endpoint name ", () => {
    it("Example: 6 of 6 Endpoints have an equal amount of periods '.' in the endpoint name", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasMonitoredEndpoints);

      //Act
      await driver.goTo("monitoring");
      //var groupByButton = await screen.findByRole("button", { name: /no grouping/i });
      //var groupByButton = screen.getByRole("button", { name: /no grouping/i });
      //await userEvent.click(groupByButton);
      var segment1Link = await screen.findByRole("link", { name: /max\. 1 segments/i });

      //Assert
      //Check the sales endpoint still shows right before filtering
      expect(segment1Link).toBeInTheDocument();
      //expect(await screen.findByRole("link", { name: /a\.c\.sales1/i })).toBeInTheDocument();

      //Act
      //var filterByNameInput = await screen.findByLabelText("filter by name");
      //expect(filterByNameInput).toBeInTheDocument();
      //await fireEvent.update(filterByNameInput, "A.C.ClientUI");

      //Assert
      //Confirm the sales endpoint no longer shows in the list after filtering
      //expect(screen.queryByRole("link", { name: /a\.c\.sales1/i })).toBeNull();
      //Confirm the sales endpoint Still shows in the list after filtering
      //expect(screen.queryByRole("link", { name: /a\.c\.clientui/i })).toBeInTheDocument();
    });
  });
});
