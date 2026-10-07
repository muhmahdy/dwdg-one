# Resource material identities — visual notes

Scope: folder, external-folder, and file identities in the separate DWDG’ONE preview. Resource labels, actions, stores, and unrelated UI icons retain their existing behavior.

## Reference translation

Inspected references 24 (purple depth), 26 (green document), and 28 (monochrome glass), plus the supplied calendar control. Reference 26 supplies the separated paper planes and green backing; 24/28 supply localized rims and highlights. The calendar reference supplies the soft upper edge and inset object layers. The new folder has a visible tab, cream paper inset, and sage front flap. The file has a folded cream page and exposed sage paper backing. Neither requires a background tile to remain recognizable.

The existing 40px row and 56px inspector hosts are retained; pinned identities are 20px. The 40/56px host is a deliberate continuation of this preview’s existing identity geometry, larger than the PRD’s proposed 20px ordinary type icon. Labels and the existing row minimum are unchanged; long text still expands naturally.

## Actual visual evidence

- `static-fixture.jpg` and `static-dark-fixture.jpg`: corrected static folder and file shapes are recognizable at 20px, 40px, and 56px. The file has an exposed sage spine, cut corner, and external marker. The earlier faint file in `static-first.jpg` is superseded.
- `gpu-fixture.jpg`: enhanced folder flap and file fold remain clear; the file's exposed backing now matches the static left spine. Effects stay inside the material identity.
- Reviewed all 32 settled `list/file-{1440,1024,390,320}-{en,id}-{light,dark}.jpg` frames. Themes and interface languages match filenames. Native captures are 1437×898 / 1021×897 for requested desktop viewports, and 390×844 / 320×844 on narrow viewports. No material clipping or document-width overflow appears; recorded geometry also reports no overflow.
- Existing list rows measure 78–79px on desktop because they show title, type, and project context. At 1024px with an inspector, they expand to 86–125px; narrow list rows expand naturally with wrapped titles/context. This verifies preserved layout, not achievement of a uniform 64px row target.
- `preview-reduced.jpg` and `preview-solid.jpg`: static folder silhouettes remain visible in the actual list, with unchanged labels and actions.
- All eight corrected phone file inspectors open at scroll 0. The 56px material, header, title, Edit/Pin, external-link action, and close focus outline are visible. Long explanatory/property text wraps naturally. Earlier retained-scroll captures are superseded by these replacements.

Static geometry is always present in the markup. CSS shows it under reduced motion, solid surfaces, and coarse pointer policy; the optional canvas stays inside the identity. `gpu-metrics.json` reports one context, unchanged draw count during idle, a bounded focus glint with no pending frames afterward, one context after ten identity replacements, and static recovery under disabled/reduced/solid policy, context loss, GPU unavailability, and shader failure. Unmount reports zero hosts and zero active contexts. Actual observed maximum canvas size is 56px at DPR1; configured caps are 96px ordinary / 160px large, not an observed 160px rendering claim.

Physical touch/coarse-pointer behavior and a full browser/device performance profile are not established by this visual audit. Narrow desktop-browser viewports are responsive-layout evidence, not physical-phone testing. This identity slice does not establish full PRD acceptance.
