import { http, HttpResponse } from "msw";
import type { SetupWorker } from "msw/browser";
import { SetupServer } from "msw/node";
import { MockEndpointOptions } from "./driver";

export const makeMockEndpoint =
  ({ mockServer }: { mockServer: SetupServer | SetupWorker }) =>
  (endpoint: string, { body, method = "get", status = 200, headers = {} }: MockEndpointOptions) => {
    mockServer.use(http[method](endpoint, () => HttpResponse.json(body, { status: status, headers: headers })));
  };

export const makeMockEndpointWithQueryString =
  ({ mockServer }: { mockServer: SetupServer | SetupWorker }) =>
  (endpoint: string, callBack: (url: URL) => MockEndpointOptions) => {
    mockServer.use(
      http.get(endpoint, ({ request }) => {
        const url = new URL(request.url.toString());
        const { body, status = 200, headers = {} } = callBack(url);
        return HttpResponse.json(body, { status: status, headers: headers });
      })
    );
  };
