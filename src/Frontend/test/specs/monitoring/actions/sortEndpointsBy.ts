import UserEvent from "@testing-library/user-event";
import { endpointSortingColumnWithName } from "../questions/endpointSortingColumnWithName";
import { columnName } from "@/components/monitoring/EndpointListRow.vue";

export async function sortEndpointsBy({ column }: { column: columnName | string }) {
  const filterRegEx = new RegExp(column, "i");
  await UserEvent.click(await endpointSortingColumnWithName(filterRegEx));
}
