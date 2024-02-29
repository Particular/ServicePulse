//import { it } from "@application-test-utils";
import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { fireEvent, screen } from "@testing-library/vue";

import * as precondition from "../../preconditions";

describe("List of monitoring endpoints should be filterable by the name", () => {
  it("Example: Filtering by the full name of an endpoint", async ({ driver }) => {
    //Service control requests minimum setup. Todo: encapsulate for reuse.
    await driver.setUp(precondition.hasActiveLicense);
    await driver.setUp(precondition.hasServiceControlMainInstance);
    await driver.setUp(precondition.hasServiceControlMonitoringInstance);
    await driver.setUp(precondition.hasUpToDateServiceControl);
    await driver.setUp(precondition.hasUpToDateServicePulse);
    await driver.setUp(precondition.hasNoErrors);
    await driver.setUp(precondition.hasNoFailingCustomChecks);
    await driver.setUp(precondition.hasNoDisconnectedEndpoints);
    await driver.setUp(precondition.hasEventLogItems);
    await driver.setUp(precondition.hasFiveActiveOneFailingHeartbeats);
    await driver.setUp(precondition.hasRecoverabilityGroups);
    await driver.setUp(precondition.hasHistoryPeriodDataForOneMinute);
    
    //Arrange
    await driver.setUp(precondition.hasMonitoredEndpoints);
    
    //Act
    await driver.goTo("monitoring");

    //Asssert 
    //Check the sales endpoint still shows right before filtering
    expect(await screen.findByRole('link', { name: /a\.c\.sales/i })).toBeInTheDocument();
   
    //Act
    var filterByNameInput = await screen.findByLabelText("filter by name");
    expect(filterByNameInput).toBeInTheDocument();
    await fireEvent.update(filterByNameInput,"A.C.ClientUI");

    //Assert
    //Confirm the sales endpoint no longer shows in the list after filtering
    expect(screen.queryByRole('link', { name: /a\.c\.sales/i })).toBeNull();
    //Confirm the sales endpoint Still shows in the list after filtering
    expect(screen.queryByRole('link', { name: /a\.c\.clientui/i })).toBeInTheDocument();
  });
});
