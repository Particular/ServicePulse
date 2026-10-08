import dayjs from "@/utils/dayjs";
import type GroupOperation from "@/resources/GroupOperation";
import type { SetupFactoryOptions } from "../driver";

export interface FailedMessageGroupOptions {
  title?: string;
  type?: string;
  count?: number;
  comment?: string;
  firstFailedDaysAgo?: number;
  lastFailedDaysAgo?: number;
  lastRetriedDaysAgo?: number;
}

export const createFailedMessageGroup = (
  id: string,
  { title = `Failed group ${id}`, type = "Exception Type and Stack Trace", count = 1, comment = "", firstFailedDaysAgo = 5, lastFailedDaysAgo = 1, lastRetriedDaysAgo }: FailedMessageGroupOptions = {}
): GroupOperation => {
  const group: GroupOperation = {
    id,
    title,
    type,
    count,
    comment,
    first: dayjs().subtract(firstFailedDaysAgo, "day").toISOString(),
    last: dayjs().subtract(lastFailedDaysAgo, "day").toISOString(),
    operation_status: "None",
    operation_progress: 0,
    need_user_acknowledgement: false,
  };

  if (lastRetriedDaysAgo !== undefined) {
    group.operation_completion_time = dayjs().subtract(lastRetriedDaysAgo, "day").toISOString();
    group.last_operation_completion_time = group.operation_completion_time;
  }

  return group;
};

export interface FailedMessageGroupsTestBed {
  groups: GroupOperation[];
  requestedClassifiers: string[];
  retriedGroupIds: string[];
  deletedGroupIds: string[];
  removedNoteGroupIds: string[];
}

export const hasFailedMessageGroups =
  ({ groups = [] }: { groups?: GroupOperation[] } = {}) =>
  ({ driver }: SetupFactoryOptions): FailedMessageGroupsTestBed => {
    const serviceControlUrl = window.defaultConfig.service_control_url;
    const table = [...groups];
    const bed: FailedMessageGroupsTestBed = { groups: table, requestedClassifiers: [], retriedGroupIds: [], deletedGroupIds: [], removedNoteGroupIds: [] };

    driver.mockEndpointDynamic(`${serviceControlUrl}recoverability/groups{/:classifier}?`, "get", (_url, params) => {
      bed.requestedClassifiers.push(params.classifier ? decodeURIComponent(String(params.classifier)) : "");
      return Promise.resolve({ body: table.map((group) => ({ ...group })) });
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}recoverability/groups/id/:groupId`, "get", (_url, params) => {
      const group = table.find((candidate) => candidate.id === String(params.groupId));
      return Promise.resolve({ body: group ?? {}, status: group ? 200 : 404 });
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}recoverability/groups/:groupId/errors`, "get", () => Promise.resolve({ body: [], headers: { "Total-Count": "0" } }));

    driver.mockEndpointDynamic(`${serviceControlUrl}recoverability/groups/:groupId/comment`, "delete", (_url, params) => {
      const groupId = String(params.groupId);
      const group = table.find((candidate) => candidate.id === groupId);
      if (group) {
        group.comment = "";
      }
      bed.removedNoteGroupIds.push(groupId);
      return Promise.resolve({ body: {} });
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}recoverability/groups/:groupId/errors/retry`, "post", (_url, params) => {
      const groupId = String(params.groupId);
      const index = table.findIndex((group) => group.id === groupId);
      if (index >= 0) {
        table.splice(index, 1);
      }
      bed.retriedGroupIds.push(groupId);
      return Promise.resolve({ body: {} });
    });

    driver.mockEndpointDynamic(`${serviceControlUrl}recoverability/groups/:groupId/errors/archive`, "post", (_url, params) => {
      const groupId = String(params.groupId);
      const group = table.find((candidate) => candidate.id === groupId);
      if (group) {
        group.operation_status = "ArchiveCompleted";
        group.operation_progress = 1;
        group.need_user_acknowledgement = true;
        group.operation_completion_time = dayjs().toISOString();
      }
      bed.deletedGroupIds.push(groupId);
      return Promise.resolve({ body: {} });
    });

    return bed;
  };
