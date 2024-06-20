import { screen, within } from "@testing-library/vue";

export function endpointDetailsGraphsAverageValues() {
  const graphDetails = screen.getByRole("grid", { name: "detail-graphs-data" });
  const allGraphCurrentValues = within(graphDetails).getAllByLabelText("metric-average-value");

  const data = allGraphCurrentValues.map((element) => {
    return element.textContent?.split(" ")[0] || null;
  });

  return data;
}
