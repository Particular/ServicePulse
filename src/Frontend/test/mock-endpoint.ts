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
    mockServer.use(
      http[method](endpoint, () => {
        if (callback) {
          callback();
        }
        return HttpResponse.json(body, { status: status });
      })
    );
  };
