# Folder and file identities — scoped verification

Verified locally on 3 October 2026. The user selected folder and file identities first. This increment remains inside `/dwdg-one-preview.html`; the full DWDG’ONE UI/UX goal remains incomplete.

## Delivered behavior

Folders now have a sage tab/backing, inset paper and rounded front flap. File links have a cream page, folded corner and exposed sage spine. External folders and file links retain an external-link marker and explicit type text. The active atlas material references 24/26/28 and supplied calendar layers informed these shapes; still references do not establish an exact animation timing.

Decorative identities appear in the explorer, pinned shortcuts and summary inspector. Resource names, responsibility avatars, metadata and actions stay ordinary HTML. Notes, app/document links, meeting notes and templates retain their existing shared icons. No new upload service, resource collection, production store, backend or PRD-editor behavior was introduced.

One persistent controller lazily shares one WebGL surface across local 2D canvases. A hover/focus glint ends after 180ms; there is no idle rendering loop. Every host always contains a static material identity. Disabled effects, reduced motion, solid surfaces, coarse pointers, a hidden document, offscreen hosts and GPU failures select or retain that fallback. After an enhancement, changing policy deliberately retains one small idle GPU allocation; it does not mean animation is running. Destroy, context loss and renderer failure release ownership. Canvas resolution is capped at 96px ordinary / 160px large with DPR capped at two.

The actual review also exposed mobile details opening below their header after the shell restored explorer scroll. Opening below 1024px now shows the header and focuses Back. Back and Escape restore the saved explorer scroll, selection, filters and opener; reload retains this return context. A context switch during closing cannot apply another workspace's return. Desktop side-inspector opening retains its position.

## Evidence

- [Tests](tests.txt): **265/265 pass**. New checks cover type scope, inert markup, canonical actions and IDs, workspace isolation, unfinished note/caret/reference recovery, preserved product/PRD storage, one-context refresh, bounded focus/hover scheduling, initial static gates, offscreen/intersection behavior, GPU/link/empty-output/2D-copy failures, context loss and cleanup. Scroll regressions include shell recovery, keyboard Escape, reload and a workspace switch during async closing. Legacy drafts with omitted optional contributor arrays also remain recoverable.
- [Production build](build.txt): passed after the final source changes.
- [Rendered matrix](render-metrics.json): 32 settled list/file-inspector states at 1440×900, 1024×900, 390×844 and 320×844, English/Indonesian × light/dark. Every recorded document width fits its viewport. All eight corrected phone file inspectors show their header at scroll zero. [Folder checks](folder-metrics.json) add four widths in English/light, for **36 primary captures**. [Visual audit](analysis.md) records inspected images and deliberate measurement exceptions.
- [Live GPU metrics](gpu-metrics.json), from the [disposable fixture](fixture.html): idle draws remain 18→18; keyboard focus finishes with zero pending frames; ten DOM replacements still use one context. Disabled/reduced/solid modes expose all static identities. Real WebGL context loss, injected unavailable-context and shader-failure paths recover to static surfaces; unmount reports zero hosts and active contexts. These are local browser/fault-injection checks, not device-performance benchmarks. The fixture never accesses browser or product storage.
- Actual preview preference controls selected the static identities under [reduced motion](preview-reduced.jpg) and [solid surfaces](preview-solid.jpg), then were restored. [Light](static-fixture.jpg) and [dark](static-dark-fixture.jpg) fixtures expose the static folder/file at 20/40/56px; [GPU rendering](gpu-fixture.jpg) verifies the enhanced shapes. Observed maximum canvas size in this browser was 56px at DPR1; the configured 160px cap was not an observed device measurement.
- Actual 320px Back restored the file's selected row, its More button focus and explorer scroll 1056 after opening at scroll zero. Automated cases additionally cover filtering and reload. No resource-content changes were needed for the visual checks; only authorized preview navigation/preferences were exercised.

The [eight-second walkthrough](folder-file-walkthrough.mp4) consists of four settled captures of actual actions: list → folder inspector → file inspector → return. It is a stepped UI walkthrough, not continuous cursor footage or proof of the 180ms motion's frame performance.

## Practical limits and remaining work

Material hosts retain the preview's existing 40px row / 56px inspector geometry; pinned icons are 20px. This is a deliberate exception to the PRD's proposed ordinary 20px type icon. Actual desktop rows are 78–79px because of title/type/project context, and expand at narrower widths; this increment does not prove the proposed 52px desktop / 64px mobile resource density. Existing readable labels/actions are preserved, and long titles still expand naturally.

Narrow desktop-browser viewports are responsive-layout evidence. Physical phones, battery/low-power profiling, real coarse-pointer interaction, OS reduced-motion switching, 200/400% zoom, screen readers and all touch-target journeys remain unverified. Mocked tests cover the renderer's coarse/hidden/reduced/offscreen policy gates. No new focusable target was added by the decorative canvases. Broader theme/language/accessibility acceptance retains its earlier scoped evidence and gaps.

The PRD seed stays a working draft: `design-resource-identity` is Proposed P2 and `design-shaders` is Deferred P2. This user-selected bounded prototype does not approve all shader effects, role/review rules or performance policy. Native uploads remain Deferred. Schedule/availability, Updates/Organization/advanced Settings, six specialist division journeys, milestone/dependency/review workflows and complete role/interaction/device acceptance still require connected work.
