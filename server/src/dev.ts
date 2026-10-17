/* Development entry: `npm run dev -w server` (reads server/.env.local, listens on this machine only). The browser's dev server
   proxies /api here. The production entry is main.ts. */
import { createApp } from './app.ts';
import { loadConfig } from './config.ts';
import { createHubGateway } from './lib/hub/gateway.ts';
import { createSpokeGateway } from './lib/spoke/gateway.ts';
import { startServer } from './start.ts';

const config = loadConfig();
const app = createApp({ config, hub: createHubGateway(config), spokes: createSpokeGateway() });
const running = await startServer(app, { port: config.port, host: '127.0.0.1' });
console.log(`dwdg server listening on http://127.0.0.1:${running.port}/api`);
