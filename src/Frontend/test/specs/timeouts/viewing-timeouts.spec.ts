import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import { screen, waitFor, within } from "@testing-library/vue";
import * as precondition from "../../preconditions";

const minutes = (n: number) => n * 60_000;

function sampleTimeouts() {
  const sales = { endpoint: "Sales", sagaType: "Sales.Sagas.OrderPolicy, Sales", timeoutType: "Sales.Sagas.BuyersRemorseTimeout, Sales", host: "SALES-01", payload: '{"orderId":"order-1"}' };
  return [
    precondition.createTimeout({ ...sales, correlation: "order-1", dueInMs: minutes(12), payloadUpdated: true }),
    precondition.createTimeout({ ...sales, correlation: "order-2", dueInMs: minutes(180) }),
    precondition.createTimeout({ ...sales, correlation: "order-3", dueInMs: -minutes(30) }),
    precondition.createTimeout({ ...sales, correlation: "order-4", dueInMs: -minutes(5), status: "Triggered" }),
  ];
}

describe("FEATURE: Saga timeouts list", () => {
  describe("RULE: The menu shows how many timeouts are overdue", () => {
    test("EXAMPLE: One overdue timeout shows a badge of 1", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasSagaTimeouts(sampleTimeouts()));

      await driver.goTo("/dashboard");

      await waitFor(() => expect(screen.getByLabelText("overdue-timeouts-count")).toHaveTextContent("1"));
    });

    test("EXAMPLE: No badge is shown when nothing is overdue", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);

      await driver.goTo("/dashboard");

      await waitFor(() => expect(screen.getByRole("link", { name: /Timeouts/ })).toBeInTheDocument());
      expect(screen.queryByLabelText("overdue-timeouts-count")).toBeNull();
    });
  });

  describe("RULE: Tabs separate pending and overdue timeouts", () => {
    test("EXAMPLE: The pending tab lists pending timeouts and the tab titles show counts", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasSagaTimeouts(sampleTimeouts()));

      await driver.goTo("/timeouts");

      await waitFor(() => expect(screen.getAllByLabelText("timeout-row")).toHaveLength(3));
      expect(screen.getByRole("tab", { name: "Pending (3)" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Overdue (1)" })).toBeInTheDocument();
      const firstRow = screen.getAllByLabelText("timeout-row")[0];
      expect(within(firstRow).getByText("order-3")).toBeInTheDocument();
      expect(within(firstRow).getByLabelText("timeout-status")).toHaveTextContent("Overdue");
      expect(screen.getByLabelText("timeouts-results-count")).toHaveTextContent("Showing 1 to 3 of 3 timeouts");
    });

    test("EXAMPLE: The overdue tab lists only overdue timeouts", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasSagaTimeouts(sampleTimeouts()));

      await driver.goTo("/timeouts/overdue");

      await waitFor(() => expect(screen.getAllByLabelText("timeout-row")).toHaveLength(1));
      expect(screen.getByText("order-3")).toBeInTheDocument();
    });
  });
});
