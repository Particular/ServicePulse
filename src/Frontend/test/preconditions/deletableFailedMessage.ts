import type { SetupFactoryOptions } from "../driver";
import { FailedMessageStatus, type FailedMessage } from "@/resources/FailedMessage";
import { hasFailedMessage } from "./recoverability";

export interface DeletableFailedMessageTestBed {
  failedMessage: FailedMessage;
  deletedIds: string[];
}

export const hasDeletableFailedMessage =
  (
    {
      withGroupId,
      withMessageId,
      withContentType = "application/json",
      withBody = { Index: 0, Data: "" },
    }: { withGroupId: string; withMessageId: string; withContentType?: string; withBody?: Record<string, string | number | boolean> | string | number | boolean | null | undefined } = { withGroupId: "", withMessageId: "" }
  ) =>
  async ({ driver }: SetupFactoryOptions): Promise<DeletableFailedMessageTestBed> => {
    const serviceControlUrl = window.defaultConfig.service_control_url;
    const failedMessage = await driver.setUp(hasFailedMessage({ withGroupId, withMessageId, withContentType, withBody }));

    let status: FailedMessageStatus = FailedMessageStatus.Unresolved;
    const deletedIds: string[] = [];

    driver.mockEndpointDynamic(`${serviceControlUrl}errors/last/:groupId`, "get", (_url, params) =>
      Promise.resolve({
        body: { ...failedMessage, id: String(params.groupId), status },
      })
    );

    driver.mockEndpointDynamic(`${serviceControlUrl}errors/archive`, "patch", async (_url, _params, request) => {
      const ids = ((await request.json()) as string[]) ?? [];
      deletedIds.push(...ids);
      status = FailedMessageStatus.Archived;
      return { body: {} };
    });

    return { failedMessage, deletedIds };
  };
