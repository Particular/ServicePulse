import { screen } from "@testing-library/vue";

export enum sortByColumn {
  ENDPOINTNAME = "name",
  QUEUELENGTH = "queueLength",
  THROUGHPUT = "throughput",
  SCHEDULEDRETRIES = "scheduledRetries",
  PROCESSINGTIME = "processingTime",
  CRITICALTIME = "criticalTime",
}

export async function endpointSortingColumnWithName(optionText: RegExp | string) {
  const filterRegEx = new RegExp(optionText, "i");
  return await screen.findByRole("button", { name: optionText });
}
