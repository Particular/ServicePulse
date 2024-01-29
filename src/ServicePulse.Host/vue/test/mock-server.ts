import { setupServer } from 'msw/node';

export const mockServer = setupServer();

// mockServer.events.on('request:start', ({ request }) => {
//     console.log('Outgoing:', request.method, request.url)
//   })


