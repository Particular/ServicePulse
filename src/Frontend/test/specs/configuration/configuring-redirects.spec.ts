import { expect } from "vitest";
import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { waitFor } from "@testing-library/vue";
import { getRedirectRowCount, getRedirectRow, getRedirectRowActions, isRedirectListed } from "./questions/redirectRows";
import { isEmptyMessageVisible } from "./questions/redirectListEmpty";
import { getRedirectTabCount } from "./questions/redirectTab";
import { getSubmitButton, isRedirectDialogOpen } from "./questions/redirectDialog";
import { getSourceQueueControl } from "./questions/redirectFormFields";
import { isUnknownTargetQueueWarningVisible } from "./questions/toAddressWarning";
import { isEndRedirectConfirmationVisible } from "./questions/endRedirectConfirmation";
import { isNotificationVisible } from "./questions/notifications";
import { openCreateRedirectDialog } from "./actions/openCreateRedirectDialog";
import { openModifyRedirectDialog } from "./actions/openModifyRedirectDialog";
import { setSourceQueue } from "./actions/setSourceQueue";
import { setTargetQueue } from "./actions/setTargetQueue";
import { setImmediateRetry } from "./actions/toggleImmediateRetry";
import { submitRedirectDialog } from "./actions/submitRedirectDialog";
import { cancelRedirectDialog } from "./actions/cancelRedirectDialog";
import { endRedirect, declineToEndRedirect } from "./actions/endRedirect";

const REDIRECTS_PAGE = "/configuration/retry-redirects";

const KNOWN_QUEUES = ["Sales.Service", "Billing.Service", "Archive.Service", "Old.Queue", "Endpoint1", "X.Queue", "Y.Queue", "Z.Queue"];

describe("FEATURE: Configuring queue redirects", () => {
  describe("RULE: All queue redirects should be listed", () => {
    test("EXAMPLE: A message should be shown when there are no redirects", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasManageableRedirects({ redirects: [], knownQueues: KNOWN_QUEUES }));

      await driver.goTo(REDIRECTS_PAGE);

      await waitFor(() => {
        expect(isEmptyMessageVisible()).toBe(true);
        expect(getRedirectRowCount()).toBe(0);
      });
    });

    test("EXAMPLE: Existing redirects should be shown in a list", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.hasManageableRedirects({
          redirects: [precondition.createRedirectFixture("Sales.Service", "Billing.Service", "redirect-sales"), precondition.createRedirectFixture("Archive.Service", "Old.Queue", "redirect-archive")],
          knownQueues: KNOWN_QUEUES,
        })
      );

      await driver.goTo(REDIRECTS_PAGE);

      await waitFor(() => {
        expect(isEmptyMessageVisible()).toBe(false);
        expect(getRedirectRowCount()).toBe(2);
        expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true);
        expect(isRedirectListed("Archive.Service", "Old.Queue")).toBe(true);
      });

      expect(getRedirectRow("Sales.Service")?.lastModifiedShown).toBe(true);
      expect(getRedirectRowActions("Sales.Service")).toBeDefined();
      expect(getRedirectRowActions("Archive.Service")).toBeDefined();
    });

    test("EXAMPLE: Redirects should be shown in a list when there are created", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasManageableRedirects({ redirects: [], knownQueues: KNOWN_QUEUES }));

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(() => expect(getRedirectRowCount()).toBe(0));

      const dialog = await openCreateRedirectDialog();
      await setSourceQueue(dialog, "Sales.Service");
      await setTargetQueue(dialog, "Billing.Service");
      await submitRedirectDialog(dialog, "create");

      await waitFor(() => {
        expect(isEmptyMessageVisible()).toBe(false);
        expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true);
      });
    });
  });
  describe("RULE: Queue redirects should be able to be created", () => {
    test("EXAMPLE: The 'create' button in the create redirect dialog should be disabled when the form is invalid", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasManageableRedirects({ redirects: [], knownQueues: KNOWN_QUEUES }));

      await driver.goTo(REDIRECTS_PAGE);

      const dialog = await openCreateRedirectDialog();
      expect(getSubmitButton(dialog, "create")).toBeDisabled();
    });

    test("EXAMPLE: Clicking the 'create' button with Valid redirect information in the create redirect dialog should create a redirect", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(precondition.hasManageableRedirects({ redirects: [], knownQueues: KNOWN_QUEUES }));

      await driver.goTo(REDIRECTS_PAGE);

      const dialog = await openCreateRedirectDialog();
      await setSourceQueue(dialog, "Sales.Service");
      await setTargetQueue(dialog, "Billing.Service");
      await submitRedirectDialog(dialog, "create");

      await waitFor(() => {
        expect(bed.redirects).toHaveLength(1);
        expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true);
        expect(isNotificationVisible(/redirect created successfully/i)).toBe(true);
      });
    });

    test("EXAMPLE: A valid 'To' address that is not known should show a warning message but still allow the redirect to be created", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(precondition.hasManageableRedirects({ redirects: [], knownQueues: KNOWN_QUEUES }));

      await driver.goTo(REDIRECTS_PAGE);

      const dialog = await openCreateRedirectDialog();
      await setSourceQueue(dialog, "Sales.Service");
      await setTargetQueue(dialog, "Mystery.Queue");

      await waitFor(() => {
        expect(isUnknownTargetQueueWarningVisible(dialog)).toBe(true);
        expect(getSubmitButton(dialog, "create")).toBeEnabled();
      });

      await submitRedirectDialog(dialog, "create");

      await waitFor(() => expect(isRedirectListed("Sales.Service", "Mystery.Queue")).toBe(true));
      expect(bed.redirects).toHaveLength(1);
    });

    test("EXAMPLE: Clicking the 'create' button with the 'Immediately retry any matching failed messages' checkbox checked should create a redirect and start a retry operation", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(precondition.hasManageableRedirects({ redirects: [], knownQueues: KNOWN_QUEUES }));

      await driver.goTo(REDIRECTS_PAGE);

      const dialog = await openCreateRedirectDialog();
      await setSourceQueue(dialog, "Sales.Service");
      await setTargetQueue(dialog, "Billing.Service");
      await setImmediateRetry(dialog, true);
      await submitRedirectDialog(dialog, "create");

      await waitFor(() => {
        expect(bed.redirects).toHaveLength(1);
        expect(bed.retriedQueues).toContain("Sales.Service");
      });
    });

    test("EXAMPLE: Clicking the 'create' button with the 'Immediately retry any matching failed messages' checkbox checked should show an error message when the retry operation fails", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(precondition.hasManageableRedirects({ redirects: [], knownQueues: KNOWN_QUEUES, retryStatus: 500 }));

      await driver.goTo(REDIRECTS_PAGE);

      const dialog = await openCreateRedirectDialog();
      await setSourceQueue(dialog, "Sales.Service");
      await setTargetQueue(dialog, "Billing.Service");
      await setImmediateRetry(dialog, true);
      await submitRedirectDialog(dialog, "create");

      await waitFor(() => {
        expect(bed.redirects).toHaveLength(1);
        expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true);
        expect(bed.retriedQueues).toContain("Sales.Service");
        expect(isNotificationVisible(/failed to retry pending messages/i)).toBe(true);
      });
      expect(isNotificationVisible(/redirect created successfully/i)).toBe(false);
    });

    test("EXAMPLE: Clicking the 'create' button with the 'Immediately retry any matching failed messages' checkbox unchecked should create a redirect and not start a retry operation", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(precondition.hasManageableRedirects({ redirects: [], knownQueues: KNOWN_QUEUES }));

      await driver.goTo(REDIRECTS_PAGE);

      const dialog = await openCreateRedirectDialog();
      await setSourceQueue(dialog, "Sales.Service");
      await setTargetQueue(dialog, "Billing.Service");
      await setImmediateRetry(dialog, false);
      await submitRedirectDialog(dialog, "create");

      await waitFor(() => {
        expect(bed.redirects).toHaveLength(1);
        expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true);
      });
      expect(bed.retriedQueues).toHaveLength(0);
    });

    test("EXAMPLE: Creating a redirect with a 'From' address that already exists should show an error message and not create a new redirect", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(
        precondition.hasManageableRedirects({
          redirects: [precondition.createRedirectFixture("Endpoint1", "X.Queue", "redirect-endpoint1")],
          knownQueues: KNOWN_QUEUES,
        })
      );

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(() => expect(isRedirectListed("Endpoint1", "X.Queue")).toBe(true));

      const dialog = await openCreateRedirectDialog();
      await setSourceQueue(dialog, "Endpoint1");
      await setTargetQueue(dialog, "Y.Queue");
      await submitRedirectDialog(dialog, "create");

      await waitFor(() => expect(isNotificationVisible(/can not create more than one redirect for queue: endpoint1/i)).toBe(true));
      expect(bed.redirects).toHaveLength(1);
      expect(isRedirectListed("Endpoint1", "Y.Queue")).toBe(false);
    });

    test("EXAMPLE: Creating a redirect with a 'To' address that already exists should show an error message and not create a new redirect", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(
        precondition.hasManageableRedirects({
          redirects: [precondition.createRedirectFixture("Endpoint1", "X.Queue", "redirect-endpoint1")],
          knownQueues: KNOWN_QUEUES,
        })
      );

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(() => expect(isRedirectListed("Endpoint1", "X.Queue")).toBe(true));

      const dialog = await openCreateRedirectDialog();
      await setSourceQueue(dialog, "Z.Queue");
      await setTargetQueue(dialog, "Endpoint1");
      await submitRedirectDialog(dialog, "create");

      await waitFor(() => expect(isNotificationVisible(/can not create a redirect to a queue that already has a redirect or is a target of a redirect/i)).toBe(true));
      expect(bed.redirects).toHaveLength(1);
      expect(isRedirectListed("Z.Queue", "Endpoint1")).toBe(false);
    });

    test("EXAMPLE: Creating a redirect with a 'From' address when a redirect with the same 'To' address already exists should show an error message and not create a new redirect", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(
        precondition.hasManageableRedirects({
          redirects: [precondition.createRedirectFixture("X.Queue", "Endpoint1", "redirect-to-endpoint1")],
          knownQueues: KNOWN_QUEUES,
        })
      );

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(() => expect(isRedirectListed("X.Queue", "Endpoint1")).toBe(true));

      const dialog = await openCreateRedirectDialog();
      await setSourceQueue(dialog, "Endpoint1");
      await setTargetQueue(dialog, "Z.Queue");
      await submitRedirectDialog(dialog, "create");

      await waitFor(() => expect(isNotificationVisible(/can not create a redirect to a queue that already has a redirect or is a target of a redirect/i)).toBe(true));
      expect(bed.redirects).toHaveLength(1);
      expect(isRedirectListed("Endpoint1", "Z.Queue")).toBe(false);
    });

    test("EXAMPLE: Clicking the 'cancel' button in the create redirect dialog should close the dialog and not create a redirect", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(precondition.hasManageableRedirects({ redirects: [], knownQueues: KNOWN_QUEUES }));

      await driver.goTo(REDIRECTS_PAGE);

      const dialog = await openCreateRedirectDialog();
      await setSourceQueue(dialog, "Sales.Service");
      await setTargetQueue(dialog, "Billing.Service");
      await cancelRedirectDialog(dialog);

      await waitFor(() => expect(isRedirectDialogOpen("create")).toBe(false));
      expect(bed.redirects).toHaveLength(0);
      expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(false);
    });
  });
  describe("RULE: Existing queue redirects should not allow the 'From' address to modified", () => {
    test("EXAMPLE: Opening the 'Modify redirect' dialog should not allow the 'From' address to be changed", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.hasManageableRedirects({
          redirects: [precondition.createRedirectFixture("Sales.Service", "Billing.Service", "redirect-sales")],
          knownQueues: KNOWN_QUEUES,
        })
      );

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(() => expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true));

      const dialog = await openModifyRedirectDialog("Sales.Service");

      expect(getSourceQueueControl(dialog)).toBeDisabled();
      expect(getSubmitButton(dialog, "modify")).toBeEnabled();
    });
  });
  describe("RULE: Existing queue redirects should be able to be modified", () => {
    test("EXAMPLE: Changes to the 'To' address should be saved when the 'modify' button is clicked", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(
        precondition.hasManageableRedirects({
          redirects: [precondition.createRedirectFixture("Sales.Service", "Billing.Service", "redirect-sales")],
          knownQueues: KNOWN_QUEUES,
        })
      );

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(() => expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true));

      const dialog = await openModifyRedirectDialog("Sales.Service");
      await setTargetQueue(dialog, "Archive.Service");
      await submitRedirectDialog(dialog, "modify");

      await waitFor(() => {
        expect(isRedirectListed("Sales.Service", "Archive.Service")).toBe(true);
        expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(false);
        expect(isNotificationVisible(/redirect updated successfully/i)).toBe(true);
      });
      expect(bed.redirects).toHaveLength(1);
      expect(bed.redirects[0].to_physical_address).toBe("Archive.Service");
    });

    test("EXAMPLE: 'To' address that is not known should show a warning message but still allow the redirect to be modified", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(
        precondition.hasManageableRedirects({
          redirects: [precondition.createRedirectFixture("Sales.Service", "Billing.Service", "redirect-sales")],
          knownQueues: KNOWN_QUEUES,
        })
      );

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(() => expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true));

      const dialog = await openModifyRedirectDialog("Sales.Service");
      await setTargetQueue(dialog, "Mystery.Queue");

      await waitFor(() => {
        expect(isUnknownTargetQueueWarningVisible(dialog)).toBe(true);
        expect(getSubmitButton(dialog, "modify")).toBeEnabled();
      });

      await submitRedirectDialog(dialog, "modify");

      await waitFor(() => expect(isRedirectListed("Sales.Service", "Mystery.Queue")).toBe(true));
      expect(bed.redirects).toHaveLength(1);
    });

    test("EXAMPLE: Modifying a redirect with a 'to' address that already exists to another redirect's 'from' address should show an error message and not modify the redirect", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(
        precondition.hasManageableRedirects({
          redirects: [precondition.createRedirectFixture("Sales.Service", "Billing.Service", "redirect-sales"), precondition.createRedirectFixture("Archive.Service", "Old.Queue", "redirect-archive")],
          knownQueues: KNOWN_QUEUES,
        })
      );

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(() => {
        expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true);
        expect(isRedirectListed("Archive.Service", "Old.Queue")).toBe(true);
      });

      const dialog = await openModifyRedirectDialog("Archive.Service");
      await setTargetQueue(dialog, "Sales.Service");
      await submitRedirectDialog(dialog, "modify");

      await waitFor(() => expect(isNotificationVisible(/failed to update a redirect/i)).toBe(true));
      expect(bed.redirects).toHaveLength(2);
      expect(isRedirectListed("Archive.Service", "Sales.Service")).toBe(false);
      expect(isRedirectListed("Archive.Service", "Old.Queue")).toBe(true);
    });

    test("EXAMPLE: Modifying a redirect and checking the 'Immediately retry any matching failed messages' checkbox should update the redirect and start a retry operation", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(
        precondition.hasManageableRedirects({
          redirects: [precondition.createRedirectFixture("Sales.Service", "Billing.Service", "redirect-sales")],
          knownQueues: KNOWN_QUEUES,
        })
      );

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(() => expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true));

      const dialog = await openModifyRedirectDialog("Sales.Service");
      await setImmediateRetry(dialog, true);
      await submitRedirectDialog(dialog, "modify");

      await waitFor(() => {
        expect(isNotificationVisible(/redirect updated successfully/i)).toBe(true);
        expect(bed.retriedQueues).toContain("Sales.Service");
      });
    });

    test("EXAMPLE: Modifying a redirect and checking the 'Immediately retry any matching failed messages' checkbox should show an error message when the retry operation fails", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(
        precondition.hasManageableRedirects({
          redirects: [precondition.createRedirectFixture("Sales.Service", "Billing.Service", "redirect-sales")],
          knownQueues: KNOWN_QUEUES,
          retryStatus: 500,
        })
      );

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(() => expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true));

      const dialog = await openModifyRedirectDialog("Sales.Service");
      await setImmediateRetry(dialog, true);
      await submitRedirectDialog(dialog, "modify");

      await waitFor(() => {
        expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true);
        expect(bed.retriedQueues).toContain("Sales.Service");
        expect(isNotificationVisible(/failed to retry pending messages/i)).toBe(true);
      });
      expect(isNotificationVisible(/redirect updated successfully/i)).toBe(false);
    });

    test("EXAMPLE: Modifying a redirect and unchecking the 'Immediately retry any matching failed messages' checkbox should update the redirect and not start a retry operation", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(
        precondition.hasManageableRedirects({
          redirects: [precondition.createRedirectFixture("Sales.Service", "Billing.Service", "redirect-sales")],
          knownQueues: KNOWN_QUEUES,
        })
      );

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(() => expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true));

      const dialog = await openModifyRedirectDialog("Sales.Service");
      await setTargetQueue(dialog, "Archive.Service");
      await setImmediateRetry(dialog, false);
      await submitRedirectDialog(dialog, "modify");

      await waitFor(() => expect(isRedirectListed("Sales.Service", "Archive.Service")).toBe(true));
      expect(isNotificationVisible(/redirect updated successfully/i)).toBe(true);
      expect(bed.retriedQueues).toHaveLength(0);
    });

    test("EXAMPLE: Clicking the 'cancel' button in the modify redirect dialog should close the dialog and not modify the redirect", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(
        precondition.hasManageableRedirects({
          redirects: [precondition.createRedirectFixture("Sales.Service", "Billing.Service", "redirect-sales")],
          knownQueues: KNOWN_QUEUES,
        })
      );

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(() => expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true));

      const dialog = await openModifyRedirectDialog("Sales.Service");
      await setTargetQueue(dialog, "Archive.Service");
      await cancelRedirectDialog(dialog);

      await waitFor(() => expect(isRedirectDialogOpen("modify")).toBe(false));
      expect(bed.redirects).toHaveLength(1);
      expect(bed.redirects[0].to_physical_address).toBe("Billing.Service");
      expect(isRedirectListed("Sales.Service", "Archive.Service")).toBe(false);
    });
  });
  describe("RULE: Redirects should be able to be ended", () => {
    test("EXAMPLE: Clicking the 'Yes' button in the end redirect dialog should end the redirect", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(
        precondition.hasManageableRedirects({
          redirects: [precondition.createRedirectFixture("Sales.Service", "Billing.Service", "redirect-sales")],
          knownQueues: KNOWN_QUEUES,
        })
      );

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(() => expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true));

      await endRedirect("Sales.Service");

      await waitFor(() => {
        expect(bed.redirects).toHaveLength(0);
        expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(false);
        expect(isEmptyMessageVisible()).toBe(true);
        expect(isNotificationVisible(/redirect deleted/i)).toBe(true);
      });
    });

    test("EXAMPLE: Clicking the 'No' button in the end redirect dialog should not end the redirect", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const bed = await driver.setUp(
        precondition.hasManageableRedirects({
          redirects: [precondition.createRedirectFixture("Sales.Service", "Billing.Service", "redirect-sales")],
          knownQueues: KNOWN_QUEUES,
        })
      );

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(() => expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true));

      await declineToEndRedirect("Sales.Service");

      await waitFor(() => expect(isEndRedirectConfirmationVisible()).toBe(false));
      expect(bed.redirects).toHaveLength(1);
      expect(isRedirectListed("Sales.Service", "Billing.Service")).toBe(true);
    });
  });
  describe("RULE: The number of redirects should be displayed", () => {
    test("EXAMPLE: The tab should include a (0) suffix when there are no redirects", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasManageableRedirects({ redirects: [], knownQueues: KNOWN_QUEUES }));

      await driver.goTo(REDIRECTS_PAGE);

      await waitFor(async () => expect(await getRedirectTabCount()).toBe(0));
    });

    test("EXAMPLE: The tab should increment the counter when a redirect is added", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasManageableRedirects({ redirects: [], knownQueues: KNOWN_QUEUES }));

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(async () => expect(await getRedirectTabCount()).toBe(0));

      const dialog = await openCreateRedirectDialog();
      await setSourceQueue(dialog, "Sales.Service");
      await setTargetQueue(dialog, "Billing.Service");
      await submitRedirectDialog(dialog, "create");

      await waitFor(async () => expect(await getRedirectTabCount()).toBe(1));
    });

    test("EXAMPLE: The tab should decrement the counter when a redirect is ended", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.hasManageableRedirects({
          redirects: [precondition.createRedirectFixture("Sales.Service", "Billing.Service", "redirect-sales")],
          knownQueues: KNOWN_QUEUES,
        })
      );

      await driver.goTo(REDIRECTS_PAGE);
      await waitFor(async () => expect(await getRedirectTabCount()).toBe(1));

      await endRedirect("Sales.Service");

      await waitFor(async () => expect(await getRedirectTabCount()).toBe(0));
    });
  });
});
