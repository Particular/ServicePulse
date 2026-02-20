import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { waitFor } from "@testing-library/vue";
import UserEvent from "@testing-library/user-event";
import { emailNotificationsLabel, emailNotificationsToggleLabel, emailNotificationsToggleCheckBox } from "./questions/emailNotificationsLabel";
import { configureEmailButton, emailConfigurationPopup, saveButton, sendTestNotificationButton, testFailedMessage, testSuccessMessage } from "./questions/emailConfiguration";
describe("FEATURE: Health check notifications", () => {
  describe("RULE: Email notification should be able to toggled on and off", () => {
    test("EXAMPLE: Email notification is toggled on", async ({ driver }) => {
      // Arrange - ensure notifications are initially OFF
      await driver.setUp(precondition.serviceControlWithMonitoring);

      const handler = await driver.setUp(precondition.hasEmailNotificationsDisabledWithToggleCapture());

      // Act - navigate to the configuration page and click the toggle
      await driver.goTo("/configuration/health-check-notifications");

      expect(await emailNotificationsLabel()).toBeInTheDocument();

      // Wait for the toggleLabel to exist in DOM
      const toggleLabel = await emailNotificationsToggleLabel();
      expect(toggleLabel).not.toBeNull();

      // initial state should be off per precondition
      const toggleCheckBox = await emailNotificationsToggleCheckBox();
      expect(toggleCheckBox).not.toBeNull();
      expect(toggleCheckBox.checked).toBe(false);

      //toggle the switch to turn on notifications
      await UserEvent.click(toggleLabel as HTMLElement);

      // assert backend received enabled: true
      await waitFor(() => {
        expect((handler.getCapturedBody() as Record<string, unknown>)?.enabled).toBe(true);
      });
      expect(toggleCheckBox.checked).toBe(true);
    });

    test("EXAMPLE: Email notification is toggled off", async ({ driver }) => {
      // Arrange - ensure notifications are initially ON
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const handler = await driver.setUp(precondition.hasEmailNotificationsEnabledWithToggleCapture());

      // Act - navigate to the configuration page and click the toggle
      await driver.goTo("/configuration/health-check-notifications");

      // Wait for the page to render
      expect(await emailNotificationsLabel()).toBeInTheDocument();

      // Wait for the toggleLabel to exist in DOM
      const toggleLabel = await emailNotificationsToggleLabel();
      expect(toggleLabel).not.toBeNull();

      // initial state should be ON per precondition
      const toggleCheckBox = await emailNotificationsToggleCheckBox();
      expect(toggleCheckBox).not.toBeNull();
      expect(toggleCheckBox.checked).toBe(true);

      //toggle the switch to turn OFF notifications
      await UserEvent.click(toggleLabel as HTMLElement);

      // Assert - backend received enabled: false
      await waitFor(() => {
        expect((handler.getCapturedBody() as Record<string, unknown>)?.enabled).toBe(false);
      });
      expect(toggleCheckBox.checked).toBe(false);
    });
  });
  describe("RULE: Email notifications should be configurable", () => {
    test("EXAMPLE: Clicking the configure button should open the email configuration popup", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.goTo("/configuration/health-check-notifications");

      // Assert - the email configuration popup is not visible initially
      expect(await emailConfigurationPopup()).toBeNull();

      // Act - find and click the "Configure" button
      const configureButton = await configureEmailButton();
      expect(configureButton).not.toBeNull();
      await UserEvent.click(configureButton);

      // Assert - the email configuration popup is now visible
      await waitFor(async () => {
        expect(await emailConfigurationPopup()).not.toBeNull();
      });
    });

    test("EXAMPLE:  The save button should be enabled when the form is valid", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEmailNotificationsWithCompleteSettings());

      await driver.goTo("/configuration/health-check-notifications");

      // Assert - the email configuration popup is not visible initially
      expect(await emailConfigurationPopup()).toBeNull();

      // Act - find and click the "Configure" button
      const configureButton = await configureEmailButton();
      expect(configureButton).not.toBeNull();
      await UserEvent.click(configureButton);

      // Assert - the email configuration popup is now visible
      const popUpDialog = (await waitFor(async () => {
        return await emailConfigurationPopup();
      })) as HTMLElement;
      expect(popUpDialog).not.toBeNull();

      // Assert - Save button is enabled
      const dialogSaveButton = await saveButton();
      expect(dialogSaveButton).not.toBeNull();
      expect(dialogSaveButton).toBeEnabled();
    });

    test("EXAMPLE:   The save button should be disabled when the form is invalid", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEmailNotificationsWithIncompleteSettings());

      await driver.goTo("/configuration/health-check-notifications");

      // Assert - the email configuration popup is not visible initially
      expect(await emailConfigurationPopup()).toBeNull();

      // Act - find and click the "Configure" button
      const configureButton = await configureEmailButton();
      expect(configureButton).not.toBeNull();
      await UserEvent.click(configureButton);

      // Assert - the email configuration popup is now visible
      const popUpDialog = (await waitFor(async () => {
        return await emailConfigurationPopup();
      })) as HTMLElement;
      expect(popUpDialog).not.toBeNull();

      // Assert - Save button is enabled
      const dialogSaveButton = await saveButton();
      expect(dialogSaveButton).not.toBeNull();
      expect(dialogSaveButton).toBeDisabled();
    });

    test.todo("EXAMPLE: The save button should update the email configuration and close the popup when clicked");

    /* SCENARIO
          Invalid configurations cannot be saved

          Given the Email configuration popup is visible
          When invalid or incomplete data is entered into the form
          Then the Save button is not enabled
    */

    test.todo("EXAMPLE: The cancel button should close the email configuration popup without saving changes");

    /* SCENARIO
          Email configuration changed can be cancelled

          Given the Email configuration popup is visible
          And edits have been made to the email configuration
          When the Cancel button is pressed
          Then the Email configuration popup is closed
          And no changes have been made to the email configuration
        */
  });
  describe("RULE: Health check notification configuration should be persistent", () => {
    test.todo("EXAMPLE: Updated email configuration should remain after a page refresh");

    /* SCENARIO
          Email configuration

          When the email configuration has been changed
          And the screen is refreshed
          Then the email notification configuration matches what was last saved
        */

    test.todo("EXAMPLE: Email notification are on and remain on after a page refresh");
    test.todo("EXAMPLE: Email notification are off and remain off after a page refresh");
    /* SCENARIO
          Email notifications toggle

          Given the Email notifications are ON
          When the page is refreshed
          Then the Email notifications are ON
        */
  });
  describe("RULE: Sending a test notification should indicate success or failure", () => {
    test("EXAMPLE: Invalid Configuration", async ({ driver }) => {
      /* SCENARIO
          Given an invalid configuration
          When "Send test notification" is clicked
          Then "TEST FAILED" is displayed*/
      // Arrange - set up with invalid email configuration
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEmailNotificationsWithIncompleteSettings());
      await driver.goTo("/configuration/health-check-notifications");

      // Act - Click the "Send test notification" button
      const testButton = await sendTestNotificationButton();
      expect(testButton).not.toBeNull();
      await UserEvent.click(testButton);

      // Assert - "TEST FAILED" message is displayed
      await waitFor(async () => {
        const failedMsg = await testFailedMessage();
        expect(failedMsg).not.toBeNull();
        expect((failedMsg as HTMLElement).textContent).toMatch(/test failed/i);
      });
    });
    test("EXAMPLE: Valid Configurationalid Configuration", async ({ driver }) => {
      /* SCENARIO
            Given a valid configuration
          When "Send test notification" is clicked
          Then "Test email sent successfully" is displayed*/

      // Arrange - set up with invalid email configuration
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEmailNotificationsWithCompleteSettings());
      await driver.goTo("/configuration/health-check-notifications");

      // Act - Click the "Send test notification" button
      const testButton = await sendTestNotificationButton();
      expect(testButton).not.toBeNull();
      await UserEvent.click(testButton);

      // Assert - "Test email sent successfully" message is displayed
      await waitFor(async () => {
        const successMsg = await testSuccessMessage();
        expect(successMsg).not.toBeNull();
        expect((successMsg as HTMLElement).textContent).toMatch(/test email sent successfully/i);
      });
    });
  });
});
