import { test, describe } from "../../drivers/vitest/driver";
import { expect, onTestFinished } from "vitest";
import { screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import * as precondition from "../../preconditions";
import { mockServer } from "../../mock-server";

const minutes = (n: number) => n * 60_000;
const sales = { endpoint: "Sales", sagaType: "Sales.Sagas.OrderPolicy, Sales", timeoutType: "Sales.Sagas.BuyersRemorseTimeout, Sales", host: "SALES-01", correlation: "order-1", payload: '{"orderId":"order-1"}' };

function captureActionRequests() {
  const bodies: { action: string; body: Record<string, unknown> }[] = [];
  const listener = async ({ request }: { request: Request }) => {
    const match = request.method === "POST" && /\/timeouts\/[^/]+\/(reschedule|trigger|cancel)$/.exec(new URL(request.url).pathname);
    if (match) bodies.push({ action: match[1], body: await request.clone().json() });
  };
  mockServer.events.on("request:start", listener);
  onTestFinished(() => {
    mockServer.events.removeListener("request:start", listener);
  });
  return bodies;
}

describe("FEATURE: Managing a saga timeout", () => {
  describe("RULE: The details page shows the version that actions send", () => {
    test("EXAMPLE: The history labels a reschedule without a due time change as a payload update", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const [timeout] = await driver.setUp(precondition.hasSagaTimeouts([precondition.createTimeout({ ...sales, dueInMs: minutes(12), payloadUpdated: true })]));

      await driver.goTo(`/timeouts/${timeout.timeout_id}`);

      await waitFor(() => expect(screen.getByLabelText("timeout-version")).toHaveTextContent("2"));
      expect(screen.getByText(/This page shows version 2/)).toBeInTheDocument();
      const entries = screen.getAllByLabelText("timeout-history-entry");
      expect(entries).toHaveLength(2);
      expect(entries[1]).toHaveTextContent("Payload updated");
    });
  });

  describe("RULE: Actions send the displayed version and wait for the endpoint", () => {
    test("EXAMPLE: Rescheduling sends the new due time and disables actions until the endpoint reports", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const [timeout] = await driver.setUp(precondition.hasSagaTimeouts([precondition.createTimeout({ ...sales, dueInMs: minutes(12) })], { endpointResponseDelayMs: null }));
      const requests = captureActionRequests();

      await driver.goTo(`/timeouts/${timeout.timeout_id}`);
      const dueInput = await screen.findByLabelText("New due date and time (UTC)");
      await userEvent.clear(dueInput);
      await userEvent.type(dueInput, "2030-01-02T03:04:05");
      await userEvent.click(screen.getByRole("button", { name: "Reschedule" }));

      await waitFor(() => expect(screen.getByLabelText("pending-operation")).toHaveTextContent("Reschedule requested"));
      expect(requests).toEqual([{ action: "reschedule", body: { due_time: "2030-01-02T03:04:05.000Z", expected_version: 1, payload: null, payload_content_type: null } }]);
      expect(screen.getByRole("button", { name: "Trigger now" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Cancel timeout" })).toBeDisabled();
    });

    test("EXAMPLE: Changing the payload turns Reschedule into Edit and reschedule", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const [timeout] = await driver.setUp(precondition.hasSagaTimeouts([precondition.createTimeout({ ...sales, dueInMs: minutes(12) })], { endpointResponseDelayMs: null }));

      await driver.goTo(`/timeouts/${timeout.timeout_id}`);
      const changePayload = await screen.findByLabelText("Change payload");

      await userEvent.click(changePayload);
      expect(screen.getByRole("button", { name: "Edit and reschedule" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Reschedule" })).toBeNull();

      await userEvent.click(changePayload);
      expect(screen.getByRole("button", { name: "Reschedule" })).toBeInTheDocument();
    });

    test("EXAMPLE: A version conflict shows a warning and reloads the timeout", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const [timeout] = await driver.setUp(precondition.hasSagaTimeouts([precondition.createTimeout({ ...sales, dueInMs: minutes(12) })], { endpointResponseDelayMs: null }));

      await driver.goTo(`/timeouts/${timeout.timeout_id}`);
      await waitFor(() => expect(screen.getByLabelText("timeout-version")).toHaveTextContent("1"));

      // The saga changes the timeout after the page loaded, so the displayed version is stale.
      timeout.version = 5;

      await userEvent.click(screen.getByRole("button", { name: "Trigger now" }));

      await waitFor(() => expect(screen.getByText(/The timeout changed before the action was applied/)).toBeInTheDocument());
      await waitFor(() => expect(screen.getByLabelText("timeout-version")).toHaveTextContent("5"));
    });

    test("EXAMPLE: Canceling asks for confirmation", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const [timeout] = await driver.setUp(precondition.hasSagaTimeouts([precondition.createTimeout({ ...sales, dueInMs: minutes(12) })], { endpointResponseDelayMs: null }));
      const requests = captureActionRequests();

      await driver.goTo(`/timeouts/${timeout.timeout_id}`);
      await userEvent.click(await screen.findByRole("button", { name: "Cancel timeout" }));
      expect(requests).toHaveLength(0);
      await userEvent.click(screen.getByRole("button", { name: "Yes" }));

      await waitFor(() => expect(screen.getByLabelText("pending-operation")).toHaveTextContent("Cancel requested"));
      expect(requests).toEqual([{ action: "cancel", body: { expected_version: 1 } }]);
    });
  });

  describe("RULE: Terminal timeouts are read-only", () => {
    test("EXAMPLE: A triggered timeout has no actions", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const [timeout] = await driver.setUp(precondition.hasSagaTimeouts([precondition.createTimeout({ ...sales, dueInMs: -minutes(5), status: "Triggered" })]));

      await driver.goTo(`/timeouts/${timeout.timeout_id}`);

      await waitFor(() => expect(screen.getByText(/This timeout is triggered/)).toBeInTheDocument());
      expect(screen.queryByRole("button", { name: "Reschedule" })).toBeNull();
      expect(screen.queryByRole("button", { name: "Forget" })).toBeNull();
    });
  });
});
