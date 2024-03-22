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
      await driver.setUp(precondition.withEndpointsNamed(["Endpoint1.A.B","Endpoint2.A.B","Endpoint3.A.B"]));

      //Act
      await driver.goTo("monitoring");
      
      expect((await screen.findAllByRole("link", { name: /max\..*segments/i })).length).toBe(2);
      expect(await screen.findByRole("link", { name: /max\. 1 segments/i })).toBeInTheDocument();
      expect(await screen.findByRole("link", { name: /max\. 2 segments/i })).toBeInTheDocument();      
      
    });
  });
});
