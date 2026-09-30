import { FailedMessageStatus } from "@/resources/FailedMessage";
import type { SetupFactoryOptions } from "../driver";

export const hasFailedMessageCounts =
  ({ failed = 0, deleted = 0 }: { failed?: number; deleted?: number }) =>
  ({ driver }: SetupFactoryOptions) => {
    const serviceControlUrl = window.defaultConfig.service_control_url;
    const counts: Record<string, number> = {
      [FailedMessageStatus.Unresolved]: failed,
      [FailedMessageStatus.Archived]: deleted,
    };

    driver.mockEndpointDynamic(`${serviceControlUrl}errors`, "get", (url) => {
      const count = counts[url.searchParams.get("status") ?? ""] ?? 0;
      return Promise.resolve({ body: [], headers: { "Total-Count": String(count) } });
    });
  };
