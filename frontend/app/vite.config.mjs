import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';

const here = relative => fileURLToPath(new URL(relative, import.meta.url));

// Keep the preserved product and the isolated design preview as separate entries.
export default defineConfig({
 // This config lives with the app; `npm run dev|build|preview` pass it with --config.
 root:here('.'),
 // Keep .env at the repository root, next to .env.example.
 envDir:here('../..'),
 // Poll Windows edits so linked preview styles refresh reliably during review.
 server:{watch:{usePolling:process.platform==='win32',interval:500}},
 build:{
  // Same output location as before the restructure: <repo>/dist
  outDir:here('../../dist'),
  emptyOutDir:true,
  rollupOptions:{input:{
   workspace:here('./index.html'),
   preview:here('./dwdg-one-preview.html')
  }}
 }
});
