import { expect } from "vitest";
import { waitFor } from "@testing-library/vue";
import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import type { Driver } from "../../driver";
import type { PendingRetriesTestBed, RetryAllRequest } from "../../preconditions/pendingRetries";
import routeLinks from "@/router/routeLinks";
import { getPendingRetryRowCount, isRetryAllConfirmationVisible, isSelectQueueFirstNoticeVisible } from "./questions/pendingRetriesView";
import { clickRetryAll, confirmRetryAll, selectQueueFilter, selectRetryPeriod } from "./actions/retryAllPendingRetries";

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

function requestedRange(request: RetryAllRequest) {
  return { from: new Date(request.from).getTime(), to: new Date(request.to).getTime() };
}

describe("FEATURE: Retrying all pending retries", () => {
  describe("RULE: Retrying all can only be done for a single queue", () => {
    test("EXAMPLE: Clicking Retry all without a queue selected explains that a queue must be selected first and requests nothing", async ({ driver }) => {
      const bed = await givenPendingRetriesAreShown(driver);

      await clickRetryAll();

      expect(isSelectQueueFirstNoticeVisible()).toBe(true);
      expect(bed.retryAllRequests).toHaveLength(0);
    });
  });

  describe("RULE: Retrying all should cover the displayed period for the selected queue", () => {
    test("EXAMPLE: With the default period, the whole period up to now is requested for the selected queue", async ({ driver }) => {
      const bed = await givenPendingRetriesAreShown(driver);
      await selectQueueFilter(SALES_QUEUE);

      await clickRetryAll();
      expect(isRetryAllConfirmationVisible()).toBe(true);
      await confirmRetryAll();

      await waitFor(() => expect(bed.retryAllRequests).toHaveLength(1));
      const request = bed.retryAllRequests[0];
      expect(request.queueaddress).toBe(SALES_QUEUE);

      const { from, to } = requestedRange(request);
      expect(to).toBeGreaterThan(from);
      expect(Math.abs(Date.now() - to)).toBeLessThan(30 * 1000);
      expect(Math.abs(to - from - 365 * 24 * HOUR_IN_MS)).toBeLessThan(2 * HOUR_IN_MS);
    });

    test("EXAMPLE: With 'Retried in the last 2 Hours' selected, only the last two hours are requested", async ({ driver }) => {
      const bed = await givenPendingRetriesAreShown(driver);
      await selectRetryPeriod("Retried in the last 2 Hours");
      await selectQueueFilter(SALES_QUEUE);

      await clickRetryAll();
      await confirmRetryAll();

      await waitFor(() => expect(bed.retryAllRequests).toHaveLength(1));
      const request = bed.retryAllRequests[0];
      expect(request.queueaddress).toBe(SALES_QUEUE);

      const { from, to } = requestedRange(request);
      expect(Math.abs(Date.now() - to)).toBeLessThan(30 * 1000);
      expect(Math.abs(to - from - 2 * HOUR_IN_MS)).toBeLessThan(60 * 1000);
    });
  });
});
