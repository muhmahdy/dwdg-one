import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';

// Keep the preserved product and the isolated design preview as separate entries.
export default defineConfig({
 // Poll Windows edits so linked preview styles refresh reliably during review.
 server:{watch:{usePolling:process.platform==='win32',interval:500}},
 build:{rollupOptions:{input:{
  workspace:fileURLToPath(new URL('./index.html',import.meta.url)),
  preview:fileURLToPath(new URL('./dwdg-one-preview.html',import.meta.url))
 }}}
});
