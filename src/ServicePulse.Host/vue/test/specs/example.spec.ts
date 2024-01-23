import { it } from "@application-test-utils";
it("should work with both vitest and playwright", async ({ driver }) => {
	await driver.goTo("checking-testing-drivers-implementations");
	await driver.findByText("Working!").shouldBeVisible();
});

it("should do something useful", async ({ driver }) => {
	driver.mockEndpoint("/todos/1", {
		body: { userId: 1, id: 1, title: "Todo 1", completed: false },
	});
	await driver.goTo("/todos/1");
	// ...
});
