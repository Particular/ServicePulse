import { it, describe } from "@application-test-utils";
import { hasActiveLicense, hasEventLogItems, hasFiveActiveOneFailingHeartbeats, hasMonitoredEndpoints, hasNoDisconnectedEndpoints, hasNoErrors, hasNoFailingCustomChecks, hasServiceControlMainInstance, hasServiceControlMonitoringInstance, hasUpToDateServiceControl, hasUpToDateServicePulse } from "../preconditions";
import { link } from "fs";

describe("Feature: System status - Should dynamically update the number of failed heartbeats, failed messages and active triggered custom checks", () => {
  // Should display an overview of the system status with the number of failed heartbeats, failed messages and active triggered custom checks
  // Example: Number of failed heartbeats changes
  it.only("Example: Number of failed heartbeats changes", async ({ driver }) => {
    await driver.setUp(hasActiveLicense);
    await driver.setUp(hasServiceControlMainInstance);
    await driver.setUp(hasServiceControlMonitoringInstance);
    await driver.setUp(hasUpToDateServiceControl);
    await driver.setUp(hasUpToDateServicePulse);
    await driver.setUp(hasFiveActiveOneFailingHeartbeats);
    await driver.setUp(hasMonitoredEndpoints);
    await driver.setUp(hasNoErrors);
    await driver.setUp(hasNoFailingCustomChecks);    
    await driver.setUp(hasMonitoredEndpoints);    
    await driver.setUp(hasNoDisconnectedEndpoints);    
    await driver.setUp(hasEventLogItems);    

    await driver.goTo("dashboard");

    await driver.findByText("4").shouldBeVisible()
  });
  // Example: Number of failed messages changes
  // Example: Number of active custom checks changes
});

// Should display last 10 events that have occurred?
//Example: When there are 15 events, the 10 more recent are the one displayed

// Should display 'no events' when there are no events available
//Example: There are no events registered

// Should auto refresh
//Example: Displays the last 10 events and then a new event happens
