//import { it } from "@application-test-utils";
import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { screen, within } from '@testing-library/dom';

import * as precondition from "../../preconditions";
describe("Endpoints should be automatically listed as they are discovered", () => {
  it("Example: There are 4 endpoints already discovered by the backend", async ({ driver }) => {

    //Service control requests minimum setup. TODO: encapsulate for reuse.
    await driver.setUp(precondition.hasActiveLicense);
    await driver.setUp(precondition.hasServiceControlMainInstance);
    await driver.setUp(precondition.hasServiceControlMonitoringInstance);
    await driver.setUp(precondition.hasUpToDateServiceControl);
    await driver.setUp(precondition.hasUpToDateServicePulse);
    await driver.setUp(precondition.hasNoErrors);
    await driver.setUp(precondition.hasNoFailingCustomChecks);
    await driver.setUp(precondition.hasMonitoredEndpoints);
    await driver.setUp(precondition.hasNoDisconnectedEndpoints);
    await driver.setUp(precondition.hasEventLogItems);
    await driver.setUp(precondition.hasFiveActiveOneFailingHeartbeats);

    //Arrange
    await driver.setUp(precondition.hasMonitoredEndpoints);

    //Act
    await driver.goTo("monitoring");
    //Assert
    expect(await screen.findByText("A.C.Test.Shipping")).toBeInTheDocument();
    //expect(await within(heartbeats).findByText('1')).toBeInTheDocument();   

  });
})
