/* Production entry: `node server/src/main.ts`. One process on a small host (a container on Render, Railway or Fly, or a service on
   a server). It reads its settings from the environment (server/.env.example lists them), listens on PORT on all interfaces
   (HOST to change that), answers GET /api/health for the host's health check, and stops cleanly on SIGTERM so a new version
   can take over without cutting requests in half. Nothing is read from a file here: the host supplies the environment. */
import { createApp } from './app.ts';
import { loadConfig } from './config.ts';
import { createHubGateway } from './lib/hub/gateway.ts';
import { createSpokeGateway } from './lib/spoke/gateway.ts';
import { startServer } from './start.ts';

let config;
try {
  config = loadConfig();
} catch (err) {
  // The message names the missing settings and never their values.
  console.error(err instanceof Error ? err.message : 'The server settings could not be read.');
  process.exit(1);
}

const app = createApp({ config, hub: createHubGateway(config), spokes: createSpokeGateway() });
const wanted = process.env.HOST?.trim();
const host = wanted === undefined || wanted === '' ? '0.0.0.0' : wanted;
const running = await startServer(app, { port: config.port, host });
console.log(`dwdg server listening on http://${host}:${running.port}/api`);

let stopping = false;
const shutdown = (signal: string) => {
  if (stopping) return;
  stopping = true;
  console.log(`${signal}: finishing the requests in flight, then stopping.`);
  void running.stop().then(() => process.exit(0));
};
process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  shutdown('SIGINT');
});

// A bug that escapes everything else must not leave a half-working process: log it and let the host start a fresh one.
process.on('uncaughtException', (err) => {
  console.error('uncaught_exception', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('unhandled_rejection', reason);
  process.exit(1);
});
