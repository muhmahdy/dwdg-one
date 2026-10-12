# Frontend

Everything that runs in the browser.

| Folder | What it is | How to run |
|---|---|---|
| `app/` | Vite + vanilla JavaScript application: the preserved workspace and the dwdg'ONE preview | `npm run dev` from the repository root, then open `http://127.0.0.1:5173/` (preview: `/dwdg-one-preview.html`) |
| `prototype/` | Clickable dwdg'ONE prototype, demo data only | Serve the repository root and open `/frontend/prototype/index.html`; see `prototype/README.md` |
| `concepts/` | Early concept pages (reference only) | Open the HTML files directly |

`app/src/` is split into `domain/` (rules, no UI), `shared/ui/`, `experience/` (workspace UI, by page), `dwdg-one/` (preview, by feature) and `legacy/` (v0.3). `prototype/` is split into `core/` (store, language, shell), `screens/` (work, projects and plans, schedule, performance, accounts) and `divisions/` (HR and SnG, EE and Consulting, FnL and MCIT).

- Every page and the file that renders it: [docs/PAGE_MAP.md](../docs/PAGE_MAP.md)
- Folder layout and dependency direction: [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
