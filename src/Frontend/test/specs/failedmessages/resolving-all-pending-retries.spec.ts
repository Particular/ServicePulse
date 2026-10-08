import { expect } from "vitest";
import { waitFor } from "@testing-library/vue";
import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import type { Driver } from "../../driver";
import type { PendingRetriesTestBed, ResolveAllRequest } from "../../preconditions/pendingRetries";
import routeLinks from "@/router/routeLinks";
import { getPendingRetryRowCount } from "./questions/pendingRetriesView";
import { selectQueueFilter, selectRetryPeriod } from "./actions/retryAllPendingRetries";
import { clickResolveAll, confirmResolveAll } from "./actions/resolveAllPendingRetries";

const PENDING_RETRIES = routeLinks.failedMessage.pendingRetries.link;
const SALES_QUEUE = "Sales.Service";
const HOUR_IN_MS = 60 * 60 * 1000;

async function givenPendingRetriesAreShown(driver: Driver): Promise<PendingRetriesTestBed> {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  const bed = await driver.setUp(
    precondition.hasPendingRetryMessages({
      messages: [precondition.createPendingRetryMessage("msg-1", { endpoint: SALES_QUEUE }), precondition.createPendingRetryMessage("msg-2", { endpoint: SALES_QUEUE })],
    })
  );
  await driver.goTo(PENDING_RETRIES);
  await waitFor(() => expect(getPendingRetryRowCount()).toBe(2), { timeout: 5000 });
  return bed;
}

function requestedRange(request: ResolveAllRequest) {
  return { from: new Date(request.from).getTime(), to: new Date(request.to).getTime() };
}

describe("FEATURE: Resolving all pending retries", () => {
  describe("RULE: Resolving all should cover the displayed period", () => {
    test("EXAMPLE: With the default period, the whole period up to now is requested", async ({ driver }) => {
      const bed = await givenPendingRetriesAreShown(driver);

      await clickResolveAll();
      await confirmResolveAll();

      await waitFor(() => expect(bed.resolveAllRequests).toHaveLength(1));
      const request = bed.resolveAllRequests[0];
      expect(request.queueaddress).toBeUndefined();

      const { from, to } = requestedRange(request);
      expect(to).toBeGreaterThan(from);
      expect(Math.abs(Date.now() - to)).toBeLessThan(30 * 1000);
      expect(Math.abs(to - from - 365 * 24 * HOUR_IN_MS)).toBeLessThan(2 * HOUR_IN_MS);
    });

    test("EXAMPLE: With 'Retried in the last 2 Hours' selected, only the last two hours are requested", async ({ driver }) => {
      const bed = await givenPendingRetriesAreShown(driver);
      await selectRetryPeriod("Retried in the last 2 Hours");

      await clickResolveAll();
      await confirmResolveAll();

      await waitFor(() => expect(bed.resolveAllRequests).toHaveLength(1));
      const { from, to } = requestedRange(bed.resolveAllRequests[0]);
      expect(Math.abs(Date.now() - to)).toBeLessThan(30 * 1000);
      expect(Math.abs(to - from - 2 * HOUR_IN_MS)).toBeLessThan(60 * 1000);
    });
  });

  describe("RULE: Resolving all with a queue selected should only resolve that queue", () => {
    test("EXAMPLE: With a queue selected, resolving all targets that queue with the displayed period", async ({ driver }) => {
      const bed = await givenPendingRetriesAreShown(driver);
      await selectQueueFilter(SALES_QUEUE);
      await selectRetryPeriod("Retried in the last 1 Day");

      await clickResolveAll();
      await confirmResolveAll();

      await waitFor(() => expect(bed.resolveAllRequests).toHaveLength(1));
      const request = bed.resolveAllRequests[0];
      expect(request.queueaddress).toBe(SALES_QUEUE);

      const { from, to } = requestedRange(request);
      expect(Math.abs(Date.now() - to)).toBeLessThan(30 * 1000);
      expect(Math.abs(to - from - 24 * HOUR_IN_MS)).toBeLessThan(60 * 1000);
    });
  });
});
