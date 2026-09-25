import type QueueAddress from "@/resources/QueueAddress";
import type Redirect from "@/resources/Redirect";
import type { RemoteInstance } from "@/resources/RemoteInstance";
import type Message from "@/resources/Message";
import type { LicensedEndpointDetails } from "@/resources/LicenseDetails";
import type { SetupFactoryOptions } from "../driver";

export const knownQueuesDefaultHandler = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}errors/queues/addresses`, {
    body: <QueueAddress[]>[],
  });
};

export const redirectsDefaultHandler = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}redirects`, {
    body: <Redirect[]>[],
  });
};

export const hasRemoteInstances =
  (body: RemoteInstance[] = []) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`${window.defaultConfig.service_control_url}configuration/remotes`, {
      body,
    });
  };

export const hasMessages =
  (body: Message[] = []) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpointDynamic(`${window.defaultConfig.service_control_url}messages2/*`, "get", () =>
      Promise.resolve({
        body,
      })
    );
  };

export interface RedirectsTestBed {
  redirects: Redirect[];
  retriedQueues: string[];
}

export const createRedirectFixture = (from: string, to: string, id = `redirect-${from}`): Redirect => ({
  message_redirect_id: id,
  from_physical_address: from,
  to_physical_address: to,
  last_modified: new Date().toISOString(),
});

export const hasKnownQueues =
  (addresses: string[] = []) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`${window.defaultConfig.service_control_url}errors/queues/addresses`, {
      body: addresses.map((physical_address) => <QueueAddress>{ physical_address, failed_message_count: 0 }),
    });
  };

export const hasRedirects =
  (redirects: Redirect[] = []) =>
  ({ driver }: SetupFactoryOptions) => {
    driver.mockEndpoint(`${window.defaultConfig.service_control_url}redirects`, {
      body: redirects,
      headers: { "Total-Count": String(redirects.length) },
    });
  };

// ServiceControl rejects a redirect whose source already has a redirect ("Duplicate"),
// or which would chain onto / be chained by an existing redirect ("Dependents").
const findConflict = (table: Redirect[], currentId: string, from: string, to: string): RedirectConflict | null => {
  const others = table.filter((redirect) => redirect.message_redirect_id !== currentId);

  if (others.some((redirect) => redirect.from_physical_address === from)) {
    return "Duplicate";
  }

  if (others.some((redirect) => redirect.from_physical_address === to || redirect.to_physical_address === to || redirect.to_physical_address === from)) {
    return "Dependents";
  }

  return null;
};

export type RedirectConflict = "Duplicate" | "Dependents";
const conflictResponse = (conflict: RedirectConflict) => Promise.resolve({ body: {}, status: 409, headers: { "X-Particular-Reason": conflict } });

// Models the ServiceControl redirects API closely enough
export const hasManageableRedirects =
  ({ redirects = [], knownQueues = [], retryStatus = 200 }: { redirects?: Redirect[]; knownQueues?: string[]; retryStatus?: number } = {}) =>
  ({ driver }: SetupFactoryOptions): RedirectsTestBed => {
    const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
    const table = [...redirects];
    const retriedQueues: string[] = [];

    driver.mockEndpointDynamic(`${serviceControlInstanceUrl}redirects`, "get", () =>
      Promise.resolve({
        body: table,
        headers: { "Total-Count": table.length.toString() },
      })
    );

    driver.mockEndpointDynamic(`${serviceControlInstanceUrl}errors/queues/addresses`, "get", () =>
      Promise.resolve({
        body: knownQueues.map((physical_address) => <QueueAddress>{ physical_address, failed_message_count: 0 }),
      })
    );

    driver.mockEndpointDynamic(`${serviceControlInstanceUrl}redirects`, "post", async (_url, _params, request) => {
      const { fromphysicaladdress: from, tophysicaladdress: to } = (await request.json()) as { fromphysicaladdress: string; tophysicaladdress: string };

      const conflict = findConflict(table, "", from, to);
      if (conflict) {
        return conflictResponse(conflict);
      }

      table.push(createRedirectFixture(from, to, `redirect-${from}-${to}`));
      return { body: {} };
    });

    driver.mockEndpointDynamic(`${serviceControlInstanceUrl}redirects/:id`, "put", async (_url, params, request) => {
      const id = String(params.id);
      const { fromphysicaladdress: from, tophysicaladdress: to } = (await request.json()) as { fromphysicaladdress: string; tophysicaladdress: string };

      const conflict = findConflict(table, id, from, to);
      if (conflict) {
        return conflictResponse(conflict);
      }

      const existing = table.find((redirect) => redirect.message_redirect_id === id);
      if (!existing) {
        return Promise.resolve({ body: {}, status: 404 });
      }

      existing.from_physical_address = from;
      existing.to_physical_address = to;
      existing.last_modified = new Date().toISOString();
      return { body: {} };
    });

    driver.mockEndpointDynamic(`${serviceControlInstanceUrl}redirects/:id`, "delete", (_url, params) => {
      const id = String(params.id);
      const index = table.findIndex((redirect) => redirect.message_redirect_id === id);
      if (index >= 0) {
        table.splice(index, 1);
      }
      return Promise.resolve({ body: {} });
    });

    driver.mockEndpointDynamic(`${serviceControlInstanceUrl}errors/queues/:queue/retry`, "post", (_url, params) => {
      retriedQueues.push(String(params.queue));
      return Promise.resolve(retryStatus >= 400 ? { body: {}, status: retryStatus } : { body: {} });
    });

    return { redirects: table, retriedQueues };
  };

export const licenseDetailsDefaultHandler = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`${window.defaultConfig.service_control_url}license/details`, {
    body: <LicensedEndpointDetails>{
      products: [],
      endpoints: [],
      infrastructure_queues: [],
      excluded_queues: [],
      service_end_date: "2026-12-31T00:00:00Z",
      valid_id: true,
    },
  });
};
