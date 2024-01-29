//import { it } from "@application-test-utils";
import { expect } from "vitest";
import { it } from "../drivers/vitest/driver";
import { screen, within } from '@testing-library/dom';

import * as precondition from "../preconditions";

it.only("Example: One endpoint heartbeat failing", async ({ driver }) => {

  //Service control requests minimum setup. Todo: encapsulate for reuse.
  await driver.setUp(precondition.hasActiveLicense);
  await driver.setUp(precondition.hasServiceControlMainInstance);
  await driver.setUp(precondition.hasServiceControlMonitoringInstance);
  await driver.setUp(precondition.hasUpToDateServiceControl);
  await driver.setUp(precondition.hasUpToDateServicePulse);  
  await driver.setUp(precondition.hasMonitoredEndpoints);
  await driver.setUp(precondition.hasNoErrors);
  await driver.setUp(precondition.hasNoFailingCustomChecks);
  await driver.setUp(precondition.hasMonitoredEndpoints);
  await driver.setUp(precondition.hasNoDisconnectedEndpoints);
  await driver.setUp(precondition.hasEventLogItems);

  //Arrange
  await driver.setUp(precondition.hasFiveActiveOneFailingHeartbeats);

  //Act
  await driver.goTo("dashboard");
  //Assert
  var heartbeats = await screen.findByLabelText("system status heart beats")    
  expect(await within(heartbeats).findByText('1')).toBeInTheDocument();   
  
});
// Example: Number of failed messages changes
// Example: Number of active custom checks changes

// Rule: Should display last 10 events that have occurred
//Example: When there are 15 events, the 10 more recent are the one displayed

// Rule: Should display 'no events' when there are no events available
//Example: There are no events registered

// Should auto refresh
//Example: Displays the last 10 events and then a new event happens
