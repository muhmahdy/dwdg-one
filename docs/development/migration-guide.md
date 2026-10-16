# Migration guide: porting a prototype feature to React

How every feature moves from `frontend/prototype/` to `frontend/src/`. Follow it for each module so the codebase stays uniform. Progress lives in `docs/audit/feature-matrix.md`.

## Folder layout

```
src/features/
  auth/ work/ operations/ projects/ programs/ resources/ schedule/ updates/ organisation/ settings/
  performance/ accounts/ pins/ search/
  divisions/
    hr/      Human Resources: attendance, monitoring, recognition, HR people        (div-hr-sng.js)
    sng/     Strategy & Growth: initiatives, research & decisions                   (div-hr-sng.js)
    ee/      External Engagement: relationships, opportunities, follow-ups          (div-ee-cons.js)
    cons/    Consulting: engagements, staffing, knowledge, cohorts                  (div-ee-cons.js)
    fnl/     Finance & Legal: requests, budget, register, period reviews            (div-fnl-mcit.js)
    mcit/    Marketing Communication & IT: content, IT requests, accounts register  (div-fnl-mcit.js)
```

Inside each feature:

| Folder | Holds |
|---|---|
| `components/` | React components: pages (`XxxPage.tsx`), panels (`XxxPanel.tsx`), menus (`XxxMenu.tsx`), pieces |
| `services/` | Pure rules (who may, what is visible, derived values) and actions (functions that call `act()`) |
| `types/` | The feature's record types, when they are not core workspace types |
| `index.ts` | Registers the feature's pages, panels and menus |

## Rules

1. **Behaviour comes from the prototype.** Read the whole prototype code for the feature, including later scripts that wrap or override it (`{ const x0 = X; X = ... }` blocks, "last script wins"). Port the final behaviour, not the first definition.
2. **Rules are pure functions** in `services/`, taking `(db, me, …)`. Components never compute permissions inline.
3. **Every change goes through `act()`** (`lib/workspace/transaction.ts`): mutate the Immer draft, push notifications and change-log entries through the shared helpers (`notify`, `logChange` in `lib/workspace/feed.ts`), and pass the Undo recipe to `toast(msg, undo)`. Undo recipes find records by id; they never keep references to draft objects.
4. **Screen state** (open panel, open menu, page filters) goes through `setUi()`. Per-device preferences go through `setSession()`.
5. **Text** always goes through `t()` with the prototype's English string as the key. New strings go into `lib/i18n/added.id.ts` with their Indonesian text.
6. **Styling** is Tailwind only. Port each CSS rule the element uses:
   - a pixel font size from `components.css`, `app.css`, `screens.css`, `perf.css`, `accounts.css` or a division CSS file becomes the density class `text-dNN` (`text-d12h` for 12.5px); sizes in `calm.css`, `simple.css`, `friendly.css`, and on avatars, icons and keys, stay fixed (`text-[15px]`);
   - `[data-look="comfortable"]` rules become `comfortable:` variants, `body[data-look="simple"]` rules `simple:`, `[data-look="compact"]` rules `compact:`, `[data-theme="dark"]` rules `dark:`;
   - `@media (max-width: 760px)` becomes `max-[760px]:`, `599px` becomes `phone:`, `(hover: hover)` becomes `hoverable:`;
   - shared visual pieces live in `components/ui` (`Button`, `Tag`, `StatusBadge`, `Row` …); do not copy their classes.
7. **Records keep their shape.** Field names stay the prototype's; new fields need a decision-log entry.
8. **Demo-only seeding stays demo-only.** Lazy "first use" seeding that inserts example records runs only when `env.demo` is set. In production a store starts empty with its version number.
9. **Accessibility** comes along: roles, `aria-*`, labels, keyboard handlers, focus order.
10. **Check** each page against `qa/refactor-baseline/` (desktop and mobile), then update the feature matrix and rebuild the traceability matrix (`node scripts/qa/build-traceability.mjs`).
