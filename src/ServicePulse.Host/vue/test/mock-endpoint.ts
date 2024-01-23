import { http } from 'msw';
import { SetupWorker } from 'msw/browser'
import { SetupServer } from 'msw/lib/node';

export const makeMockEndpoint =
  ({ mockServer }: { mockServer: SetupServer | SetupWorker }) =>
  (
    endpoint: string,
    {
      body,
      method = 'get',
      status = 200,
    }: {
      body: string | [unknown] | Record<string | number, unknown>;
      method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
      status?: number;
    },
  ) => {
    mockServer.use(
      http[method](endpoint, ()=>
        new Response(JSON.stringify(body), {
            status: status,
            headers: {
              'Content-Type': 'application/json',
            },
          })
      ),
    );
  };


  