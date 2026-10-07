# DWDG Workspace v0.3 verification — 24 September 2026

This report covers the local browser preview and source-level shared-mode checks. The previous [verification](verification.md) describes the older prototype and is not v0.3 evidence.

## Product and reference review

- Personal Home leads with Needs You, Today, and My Work. Division metrics and visualization are not crammed into its first viewport.
- Strategy & Growth uses a Now / Next / Later initiative horizon. Legal & Finance uses requests, approvals, and an IDR budget flow. Human Resource uses recruitment and member journeys. Marketing, Communication & IT uses content delivery and publishing stages. These are different working views in one shell.
- External Engagement and Consulting remain discoverable as limited summaries.
- The v0.3 warm canvas, local Pretendard, compact operational surfaces, tactile controls, and bounded Prism effect replace the previous KPI grid and full-page green wash. Live Prism count observed: one on desktop Strategy, zero on the inspected mobile views.
- Compared against the pack's positive and negative references: no motivational Home, overloaded first viewport, or dense Strategy dashboard was observed in the inspected screens. Visualizations serve the corresponding workflows.

## Browser checks

- Inspected Home and Strategy at desktop size, Legal & Finance at tablet size, and Home, Human Resource, Marketing/Communication/IT, Schedule, and Gantt at mobile size. Also checked a 720 px-wide layout as a narrow equivalent to 1440 px at 200% scaling. No page-level horizontal overflow was observed in those views. Actual browser zoom was not changed.
- Local Pretendard loaded and rendered. The header computed font included Pretendard with Inter fallback.
- Workspace switching, global search, division editors, project-detail editor, task-form validation, selected-day agenda, Gantt range switching, and Gantt keyboard movement were exercised. Invalid task dates retained the draft and displayed an inline error. The Gantt test task was moved one day and restored.
- The inspected browser session reported no console errors or warnings.
- Responsive dock and controls were corrected after the narrow-width check.

## Captures

- [Desktop Personal Home](v03-home-desktop.jpg)
- [Desktop Strategy & Growth](v03-strategy-desktop.jpg)
- [Mobile Personal Home](v03-home-mobile.jpg)
- [Mobile Human Resource](v03-hr-mobile.jpg)
- [Mobile Marketing, Communication & IT](v03-mcit-mobile.jpg)

## Verification boundary

Automated model, domain, backend-contract, and import tests plus the production build are run before delivery. SQL migrations were syntax-parsed, but database policy tests and end-to-end shared flows require a configured Supabase project and disposable test database. The repository has no Google OAuth configuration or designated first-admin email, so live sign-in, invitation enforcement, private file uploads, realtime conflict handling, and multi-user permissions cannot be claimed as deployed or browser-verified. Reduced-motion and static fallback paths were reviewed in code; OS preference switching and Safari/Firefox rendering were not exercised here.
