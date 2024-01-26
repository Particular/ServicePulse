//import { it } from "@application-test-utils";
import { expect } from "vitest";
import { it } from "../drivers/vitest/driver";
import { screen, within } from '@testing-library/dom';

import * as precondition from "../preconditions";

it("Example: Number of failed heartbeats changes", async ({ driver }) => {

  await driver.setUp(precondition.hasActiveLicense);
  await driver.setUp(precondition.hasServiceControlMainInstance);
  await driver.setUp(precondition.hasServiceControlMonitoringInstance);
  await driver.setUp(precondition.hasUpToDateServiceControl);
  await driver.setUp(precondition.hasUpToDateServicePulse);

  await driver.setUp(precondition.hasFiveActiveOneFailingHeartbeats);

  await driver.setUp(precondition.hasMonitoredEndpoints);
  await driver.setUp(precondition.hasNoErrors);
  await driver.setUp(precondition.hasNoFailingCustomChecks);
  await driver.setUp(precondition.hasMonitoredEndpoints);
  await driver.setUp(precondition.hasNoDisconnectedEndpoints);
  await driver.setUp(precondition.hasEventLogItems);

  //navigate to the dashboard

  //assert that the value for failed heartbeats are the one from the pre-setted state

  //update the system state to be an new number of heartbeats

  //assert that the page updated

  await driver.goTo("dashboard");
  var x = await screen.findByLabelText("system status heart beats")
  //expect(x).toBeInTheDocument();
  //var y = await within(x).findByText('8');
  console.log(x.outerHTML);
  expect(await within(x).findByText('1')).toBeInTheDocument();

 
  
  
});
// Example: Number of failed messages changes
// Example: Number of active custom checks changes

// Rule: Should display last 10 events that have occurred
//Example: When there are 15 events, the 10 more recent are the one displayed

// Rule: Should display 'no events' when there are no events available
//Example: There are no events registered

// Should auto refresh
//Example: Displays the last 10 events and then a new event happens
