import { fireEvent } from "@testing-library/vue";
import { sortByColumn, endpointSortingColumnWithName } from "../questions/endpointSortingColumnWithName";

export async function sortEndpointsBy({ column }: { column: sortByColumn }) {
  const filterRegEx = new RegExp(column, "i");
  await fireEvent.click(await endpointSortingColumnWithName(filterRegEx));
}
