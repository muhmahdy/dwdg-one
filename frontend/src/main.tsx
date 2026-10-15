import '@fontsource/geist/400.css';
import '@fontsource/geist/500.css';
import '@fontsource/geist/600.css';
import '@fontsource/geist/700.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';
import '@fontsource/geist-mono/600.css';
import './styles/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Links from the prototype used hash routes (#/projects/p-roadmap); keep them working (decision M8).
if (window.location.hash.startsWith('#/')) window.history.replaceState(null, '', window.location.hash.slice(1));

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
