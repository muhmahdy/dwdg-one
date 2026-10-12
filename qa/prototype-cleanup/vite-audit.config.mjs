// Stable QA preview: source changes are picked up only on an explicit browser reload.
import config from '../../frontend/prototype/vite.config.mjs';
export default {...config, server: {...config.server, hmr: false}};
