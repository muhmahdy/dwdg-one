import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';

// Dev server for the clickable prototype. The prototype reads brand and design-system files
// from ../../.planning, so the server root is the repository root and the page opens at
// /frontend/prototype/index.html. Use with: vite --config frontend/prototype/vite.config.mjs
export default defineConfig({
 root:fileURLToPath(new URL('../..',import.meta.url)),
 // Poll Windows edits so linked preview styles refresh reliably during review.
 server:{watch:{usePolling:process.platform==='win32',interval:500}}
});
