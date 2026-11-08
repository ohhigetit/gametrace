# GameTrace UniversalPage Parent V1 — LOCKED

**Status:** LOCKED AND APPROVED
**Approved:** November 7, 2026
**Authoritative visual review:** `standards/previews/UniversalPage_Parent_V1_ApprovedNav_SourceDerived_PREVIEW.html` on branch `standards/app-navigation-v1`.
**AppNavigation authority:** Existing pinned GameTrace development application at commit `3ca115579ef889d84de2b1da31f1cec8ee604354`. The source-derived review HTML is a design preview, not a substitute for the full runtime.

## Required parent structure

Every applicable GameTrace page follows this exact ordered hierarchy:

1. **AppNavigation V1** (required) — reuse the existing LOCKED navigation unchanged; preserve original logo, menu arrangement, menu labels, iconography, layout and routing behavior.
2. **PageHeader V1** (required) — reuse the LOCKED header with back arrow, page icon/title, required subtitle, optional right-side Filter/Edit icon action and optional full-width CTA row.
3. **Primary Content** (required) — **one generic page-owned content container**; its structure and features belong to the individual page, not the parent. The parent must not impose any banners, extra content sections, dashboards, cards, or layouts.
4. **PageFooter V1** (required) — reuse the LOCKED shared footer with the thin full-width top divider and fixed encouragement message:

   **SHOW UP. PUT IN THE WORK.**
   **TRUST THE JOURNEY.**

The parent must not invent additional page-level areas. Its responsibility is consistent structure, responsive containment, and composition of approved components.

## Approved reusable component dependencies

- AppNavigation V1: `standards/components/AppNavigation/V1/`. Locked implementation is **the actual pinned development runtime**; not a reconstructed mock.
- IconFamily V1: `standards/design-system/IconFamily/V1/`. Phosphor primary, Lucide secondary; preserve approved existing AppNavigation icons. Use the approved page-header icon mappings.
- PageHeader V1: `standards/components/PageHeader/V1/`. Filter = Phosphor SlidersHorizontal; Edit = Phosphor PencilLine; Home Court icon = basketball court; Game Details = approved custom dribbling basketball SVG; same light-green fill on all optional CTA buttons, equally divided width.
- PageFooter V1: `standards/components/PageFooter/V1/`. Required on all applicable pages; message is identical, centered, uppercase and bold, second line highlighted in theme green, transparent background and top divider.

## Responsive and appearance

- Support both **Day** and **Courtside** themes through the existing GameTrace theme tokens.
- Maintain approved page margins, title/subtitle alignment, safe-area behavior and layout consistency.
- Support iPhone portrait and landscape, including responsive controls with no clipping, overflow or overlap.
- Primary Content can grow without covering the footer; footer stays after content and is not a fixed overlay.
- Follow accessible controls, focus states and minimum comfortable touch sizes.

## Approval and preservation boundaries

- **User approved** the source-derived preview after rejecting two earlier reconstructions of AppNavigation.
- The final approved visual preview is a *source-derived standalone demonstration*. It includes original source-derived header markup, embedded original logo asset, navigation menu order/icons and styles. Its simplified page-switching mechanism is **not** the production routing implementation.
- **The pinned development runtime remains the authority for exact AppNavigation layout and behavior.** Do not replace it with the preview's simplified switching, and do not treat earlier reconstructed preview files as authoritative.
- Preserve all existing functions, data, forms, live tracking, camera, reports, navigation states and cloud sync in any later implementation.
- Integration requires a **separate explicit request**; this lock does not deploy or change development or production.
- Subsequent changes to the parent structure or a locked dependency require separate review, approval and versioning.

## Reference links

- Locked review file: `standards/previews/UniversalPage_Parent_V1_ApprovedNav_SourceDerived_PREVIEW.html`
- Pinned original app: `https://github.com/ohhigetit/gametrace/blob/3ca115579ef889d84de2b1da31f1cec8ee604354/index.html`
