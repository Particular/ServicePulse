import { http, HttpResponse } from "msw";
import type { SetupWorker } from "msw/browser";
import { SetupServer } from "msw/node";

export const makeMockEndpoint =
  ({ mockServer }: { mockServer: SetupServer | SetupWorker }) =>
  (
    endpoint: string,
    {
      body,
      method = "get",
      status = 200,
      headers = {},
      callback = () => {},
    }: {
      body: Record<string, any> | string | number | boolean | null | undefined;
      method?: "get" | "post" | "put" | "patch" | "delete";
      status?: number;
      headers?: { [key: string]: string };
      callback?: () => void;
    }
  ) => {
    const url = new URL(endpoint);
    const path = url.origin + url.pathname;
    const expectedParams = Object.fromEntries(url.searchParams.entries()); // The expected params that the mock endpoint should receive extracted from the endpoint API URL

    mockServer.use(
      http[method](path, ({ request }) => {
        if (callback) {
          callback();
        }

        const actualParams = Object.fromEntries(new URL(request.url).searchParams.entries()); // Actual params from the request that was intercepted

        //console.log(`Mocked Endpoint: ${url.pathname}, \n Expect Params: ${JSON.stringify(expectedParams)}, \n Actual Params: ${JSON.stringify(actualParams)}`);

        if (expectedParams) {
          for (const key in expectedParams) {
            if (expectedParams[key] !== actualParams[key]) {
              console.error(`Expected param "${key}" to be "${expectedParams[key]}" but got "${actualParams[key]}"`);
              throw new Error(`Parameter mismatch: expected "${expectedParams[key]}" for "${key}" but got "${actualParams[key]}"`);
            }
          }
        }

        return HttpResponse.json(body, { status, headers });
      })
    );
  };
