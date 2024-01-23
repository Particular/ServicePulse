import { it } from "@application-test-utils";
it("should work with both vitest and playwright", async ({ driver }) => {
	await driver.goTo("checking-testing-drivers-implementations");
	await driver.findByText("Working!").shouldBeVisible();
});