import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { waitFor } from "@testing-library/vue";
import UserEvent from "@testing-library/user-event";
import { emailNotificationsLabel, emailNotificationsToggleLabel, emailNotificationsToggleCheckBox } from "./questions/emailNotificationsLabel";
import {
  configureEmailButton,
  emailConfigurationPopup,
  saveButton,
  cancelButton,
  smtpServerAddressInput,
  sendTestNotificationButton,
  testFailedMessage,
  testSuccessMessage,
  emailConfigurationPopup1,
  emailConfigurationPopupQuery,
} from "./questions/emailConfiguration";
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

    test("EXAMPLE: Configure button opens popup with Save and Cancel buttons", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEmailNotificationsWithCompleteSettings());
      await driver.goTo("/configuration/health-check-notifications");

      // Assert - popup is not visible initially
      const initialPopup = await emailConfigurationPopup();
      expect(initialPopup).toBeNull();

      // Act - click the Configure button
      const configureButton = await configureEmailButton();
      expect(configureButton).not.toBeNull();
      await UserEvent.click(configureButton);

      // Assert - popup is now visible and contains Save and Cancel buttons
      const popup = await emailConfigurationPopup1();
      expect(popup).not.toBeNull();

      const saveBtn = popup!.saveButton();
      const cancelBtn = popup!.cancelButton();

      expect(saveBtn).toBeInTheDocument();

      expect(cancelBtn).toBeInTheDocument();
    });

    test("EXAMPLE:  The save button should update the email configuration and close the popup when clicked", async ({ driver }) => {
      /* SCENARIO
          Invalid configurations cannot be saved

          Given the Email configuration popup is visible
          When invalid or incomplete data is entered into the form
          Then the Save button is not enabled
    */
      // Arrange - set up with complete email configuration
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEmailNotificationsWithCompleteSettings());
      await driver.goTo("/configuration/health-check-notifications");

      // Assert - the email configuration popup is not visible initially
      expect(await emailConfigurationPopup()).toBeNull();

      // Act - open the email configuration popup
      const configureButton = await configureEmailButton();
      expect(configureButton).not.toBeNull();
      await UserEvent.click(configureButton);

      // Assert - the email configuration popup is now visible
      const popUpDialog = await waitFor(async () => {
        return await emailConfigurationPopup();
      });
      expect(popUpDialog).not.toBeNull();

      // Act - make edits to the form
      const smtpServerInput = await smtpServerAddressInput();
      const originalValue = smtpServerInput.value;
      const newValue = "something.smtp.example.com";
      await UserEvent.clear(smtpServerInput);
      await UserEvent.type(smtpServerInput, newValue);

      // Act - click the save button
      const btnSave = await saveButton();
      expect(btnSave).toBeInTheDocument();
      await UserEvent.click(btnSave);
      // Assert - the email configuration popup is closed
      await waitFor(async () => {
        expect(await emailConfigurationPopup()).toBeNull();
      });

      // Assert -  changes were saved (reopen popup and verify original value)
      await UserEvent.click(await configureEmailButton());
      await waitFor(async () => {
        expect(await emailConfigurationPopup()).not.toBeNull();
      });

      const smtpServerInputAfter = await smtpServerAddressInput();
      expect((smtpServerInputAfter as HTMLInputElement).value).toBe(newValue);
      expect((smtpServerInputAfter as HTMLInputElement).value).not.toBe(originalValue);
    });
    test("EXAMPLE: The cancel button should close the email configuration popup without saving changes", async ({ driver }) => {
      /* SCENARIO
          Email configuration changed can be cancelled

          Given the Email configuration popup is visible
          And edits have been made to the email configuration
          When the Cancel button is pressed
          Then the Email configuration popup is closed
          And no changes have been made to the email configuration

        */ // Arrange - set up with complete email configuration
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEmailNotificationsWithCompleteSettings());
      await driver.goTo("/configuration/health-check-notifications");

      // Assert - the email configuration popup is not visible initially
      expect(await emailConfigurationPopup()).toBeNull();

      // Act - open the email configuration popup
      const configureButton = await configureEmailButton();
      expect(configureButton).not.toBeNull();
      await UserEvent.click(configureButton);

      // Assert - the email configuration popup is now visible
      const popUpDialog = await waitFor(async () => {
        return await emailConfigurationPopup();
      });
      expect(popUpDialog).not.toBeNull();

      // Act - make edits to the form
      const smtpServerInput = await smtpServerAddressInput();
      const originalValue = smtpServerInput.value;
      await UserEvent.clear(smtpServerInput);
      await UserEvent.type(smtpServerInput, "something.smtp.example.com");

      // Act - click the Cancel button
      const btnCancel = await cancelButton();
      expect(btnCancel).not.toBeNull();
      await UserEvent.click(btnCancel);
      // Assert - the email configuration popup is closed
      await waitFor(async () => {
        expect(await emailConfigurationPopup()).toBeNull();
      });

      // Assert - no changes were saved (reopen popup and verify original value)
      await UserEvent.click(await configureEmailButton());
      await waitFor(async () => {
        expect(await emailConfigurationPopup()).not.toBeNull();
      });

      const smtpServerInputAfter = await smtpServerAddressInput();
      expect((smtpServerInputAfter as HTMLInputElement).value).toBe(originalValue);
    });
  });
  describe("RULE: Health check notification configuration should be persistent", () => {
    test("EXAMPLE: Updated email configuration should remain after a page refresh", async ({ driver }) => {
      /* SCENARIO
        Email configuration persists after refresh

        When the email configuration has been changed
        And the screen is refreshed
        Then the email notification configuration matches what was last saved
      */

      // Arrange - set up with initial email configuration
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEmailNotificationsWithSaveCapture());
      await driver.goTo("/configuration/health-check-notifications");

      // Act - open the email configuration popup
      const configureButton = await configureEmailButton();
      await UserEvent.click(configureButton);

      // Wait for popup to be visible and get the popup object
      const emailPopup = await emailConfigurationPopup1();

      // Act - change the SMTP server address
      const smtpServerInput = await emailPopup.smtpServerAddressInput();
      const newSmtpValue = "updated.smtp.example.com";
      await UserEvent.clear(smtpServerInput);
      await UserEvent.type(smtpServerInput, newSmtpValue);

      // Act - save the changes
      const saveBtn = emailPopup.saveButton();
      expect(saveBtn).toBeEnabled();
      await UserEvent.click(saveBtn);

      // Wait for popup to close
      await waitFor(() => {
        expect(emailPopup.dialog).not.toBeInTheDocument();
      });
      // Assert - the email configuration popup is not visible initially
      expect(emailConfigurationPopupQuery()).toBeNull();
      // Act - refresh the page
      await driver.goTo("/configuration/health-check-notifications");

      // Wait for the page to fully load
      await emailNotificationsLabel();

      // click configure button to open popup and check if the updated value is there
      const configureButtonAfterRefresh = await configureEmailButton();
      await UserEvent.click(configureButtonAfterRefresh);

      //  get the popup object

      const emailPopupAfterRefresh = await emailConfigurationPopup1();
      expect(emailPopupAfterRefresh).not.toBeNull();

      // Verify the saved value persisted
      const smtpServerInputAfterRefresh = emailPopupAfterRefresh.smtpServerAddressInput();
      expect(smtpServerInputAfterRefresh.value).toBe(newSmtpValue);
    });
    test("EXAMPLE: Email notification are on and remain on after a page refresh", async ({ driver }) => {
      /* SCENARIO
     Email notifications remain ON after refresh

     Given the Email notifications are ON
     When the page is refreshed
     Then the Email notifications are still ON
  */

      // Arrange – notifications start enabled
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEmailNotificationsEnabledWithToggleCapture());

      // Act – go to the configuration page
      await driver.goTo("/configuration/health-check-notifications");

      // Wait for the page to render
      expect(await emailNotificationsLabel()).toBeInTheDocument();

      // Get the toggle label and checkbox
      const toggleLabel = await emailNotificationsToggleLabel();
      expect(toggleLabel).not.toBeNull();

      const toggleCheckBox = await emailNotificationsToggleCheckBox();
      expect(toggleCheckBox).not.toBeNull();

      // Assert – initial state is ON
      expect(toggleCheckBox.checked).toBe(true);

      // Act – refresh the page
      await driver.goTo("/configuration/health-check-notifications");

      // Wait for the page to render again
      expect(await emailNotificationsLabel()).toBeInTheDocument();

      const toggleLabelAfterRefresh = await emailNotificationsToggleLabel();
      expect(toggleLabelAfterRefresh).not.toBeNull();

      const toggleCheckBoxAfterRefresh = await emailNotificationsToggleCheckBox();
      expect(toggleCheckBoxAfterRefresh).not.toBeNull();

      // Assert – state is still ON after refresh
      expect(toggleCheckBoxAfterRefresh.checked).toBe(true);
    });
    test("EXAMPLE: Email notification are off and remain off after a page refresh", async ({ driver }) => {
      /* SCENARIO
     Email notifications remain OFF after refresh

     Given the Email notifications are OFF
     When the page is refreshed
     Then the Email notifications are still OFF
  */

      // Arrange – notifications start disabled
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEmailNotificationsDisabledWithToggleCapture());

      // Act – go to the configuration page
      await driver.goTo("/configuration/health-check-notifications");

      // Wait for the page to render
      expect(await emailNotificationsLabel()).toBeInTheDocument();

      // Get the toggle label and checkbox
      const toggleLabel = await emailNotificationsToggleLabel();
      expect(toggleLabel).not.toBeNull();

      const toggleCheckBox = await emailNotificationsToggleCheckBox();
      expect(toggleCheckBox).not.toBeNull();

      // Assert – initial state is OFF
      expect(toggleCheckBox.checked).toBe(false);

      // Act – refresh the page
      await driver.goTo("/configuration/health-check-notifications");

      // Wait for the page to render again
      expect(await emailNotificationsLabel()).toBeInTheDocument();

      const toggleLabelAfterRefresh = await emailNotificationsToggleLabel();
      expect(toggleLabelAfterRefresh).not.toBeNull();

      const toggleCheckBoxAfterRefresh = await emailNotificationsToggleCheckBox();
      expect(toggleCheckBoxAfterRefresh).not.toBeNull();

      // Assert – state is still OFF after refresh
      expect(toggleCheckBoxAfterRefresh.checked).toBe(false);
    });
  });
  describe("RULE: Sending a test notification should indicate success or failure", () => {
    test("EXAMPLE: Invalid Configuration", async ({ driver }) => {
      // Arrange - set up with invalid email configuration
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEmailNotificationsWithIncompleteSettings());
      await driver.goTo("/configuration/health-check-notifications");

      // Act - Click the "Send test notification" button
      const testButton = await sendTestNotificationButton();
      expect(testButton).not.toBeNull();
      await UserEvent.click(testButton);

      // Assert - "Test failed" message is displayed
      const failedMsg = await testFailedMessage();
      expect(failedMsg).toBeInTheDocument();
    });
    test("EXAMPLE: Valid Configuration", async ({ driver }) => {
      // Arrange - set up with valid email configuration
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEmailNotificationsWithCompleteSettings());
      await driver.goTo("/configuration/health-check-notifications");

      // Act - Click the "Send test notification" button
      const testButton = await sendTestNotificationButton();
      expect(testButton).not.toBeNull();
      await UserEvent.click(testButton);

      // Assert - "Test email sent successfully" message is displayed
      const successMsg = await testSuccessMessage();
      expect(successMsg).toBeInTheDocument();
    });
  });
});
