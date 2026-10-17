/* Starts the HTTP server around an app and stops it cleanly. Shared by the production entry (main.ts) and the development
   entry (dev.ts); tests start it on a free port. */
import { serve } from '@hono/node-server';
import type { Hono } from 'hono';

export interface RunningServer {
  /** The port actually listening (useful when 0 was asked for). */
  port: number;
  /** Stops accepting connections, lets requests in flight finish (up to `graceMs`), then closes. */
  stop: (graceMs?: number) => Promise<void>;
}

export function startServer(app: Pick<Hono, 'fetch'>, options: { port: number; host: string }): Promise<RunningServer> {
  return new Promise((resolve, reject) => {
    const server = serve({ fetch: app.fetch, port: options.port, hostname: options.host }, (info) => {
      resolve({
        port: info.port,
        stop: (graceMs = 10_000) =>
          new Promise<void>((done) => {
            // keep-alive connections would hold the close open: end the idle ones now and the rest after the grace period
            server.close(() => {
              done();
            });
            if ('closeIdleConnections' in server) server.closeIdleConnections();
            setTimeout(() => {
              if ('closeAllConnections' in server) server.closeAllConnections();
            }, graceMs).unref();
          }),
      });
    });
    server.once('error', reject);
  });
}
