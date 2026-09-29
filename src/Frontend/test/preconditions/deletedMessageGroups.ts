import dayjs from "@/utils/dayjs";
import type FailureGroupView from "@/resources/FailureGroupView";
import type { SetupFactoryOptions } from "../driver";

export type DeletedMessageGroupRow = FailureGroupView & { last_operation_completion_time?: string };

export interface DeletedMessageGroupOptions {
  title?: string;
  type?: string;
  count?: number;
  comment?: string;
  firstFailedDaysAgo?: number;
  lastFailedDaysAgo?: number;
  lastRetriedDaysAgo?: number;
}

export const createDeletedMessageGroup = (
  id: string,
  { title = `Deleted group ${id}`, type = "Endpoint Name", count = 1, comment = "", firstFailedDaysAgo = 5, lastFailedDaysAgo = 1, lastRetriedDaysAgo }: DeletedMessageGroupOptions = {}
): DeletedMessageGroupRow => {
  const group: DeletedMessageGroupRow = {
    id,
    title,
    type,
    count,
    comment,
    first: dayjs().subtract(firstFailedDaysAgo, "day").toISOString(),
    last: dayjs().subtract(lastFailedDaysAgo, "day").toISOString(),
  };

  if (lastRetriedDaysAgo !== undefined) {
    group.last_operation_completion_time = dayjs().subtract(lastRetriedDaysAgo, "day").toISOString();
  }

  return group;
};

export interface DeletedMessageGroupsTestBed {
  groups: DeletedMessageGroupRow[];
  restoredGroupIds: string[];
}

export const hasDeletedMessageGroups =
  ({ groups = [] }: { groups?: DeletedMessageGroupRow[] } = {}) =>
  ({ driver }: SetupFactoryOptions): DeletedMessageGroupsTestBed => {
    const serviceControlUrl = window.defaultConfig.service_control_url;
    const table = [...groups];
    const restoredGroupIds: string[] = [];

    driver.mockEndpointDynamic(`${serviceControlUrl}errors/groups{/:classifier}`, "get", () => Promise.resolve({ body: [...table] }));

    driver.mockEndpointDynamic(`${serviceControlUrl}recoverability/groups/:groupId/errors/unarchive`, "post", (_url, params) => {
      const groupId = String(params.groupId);
      const index = table.findIndex((group) => group.id === groupId);
      if (index >= 0) {
        table.splice(index, 1);
      }
      restoredGroupIds.push(groupId);
      return Promise.resolve({ body: {} });
    });

    return { groups: table, restoredGroupIds };
  };
