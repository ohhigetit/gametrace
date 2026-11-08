# GameTrace IconFamily V1 — LOCKED

**Approved:** November 7, 2026  
**Status:** LOCKED — design standard  
**Scope:** PageHeader V1 and future application components; does not authorize changes to the current application or already locked components.

## Icon-family precedence
1. **Primary:** Phosphor Icons — choose an appropriate Phosphor icon first.
2. **Secondary:** Lucide Icons — fallback when Phosphor does not have a suitable icon.
3. **Approved existing icons:** Retain existing approved custom/application icons, especially within AppNavigation V1, unless explicitly approved for replacement.

## Visual rules
- Default look: outline.
- Nominal size: 24 × 24 CSS pixels (adapt contextually while keeping consistent optical sizing).
- Theme color: use inherited `currentColor` from the GameTrace theme rather than hard-coded hues.
- Weight: consistent optical stroke weight across components, including when mixing the two families. Phosphor uses its own weight choices; Lucide uses stroke width.
- Alignment: center on common icon grid; align with nearby title, text or button.
- Interactive icon-only buttons require meaningful accessible labels and adequate touch targets.
- Preserve the approved GameTrace brand logo as a custom asset. Do not recreate or replace it.
- Do not use emoji as replacements for application interface icons.

## PageHeader V1 provisional icon mapping
- Back arrow: Phosphor `ArrowLeft`.
- Filter: Phosphor `Funnel`.
- Edit: Phosphor `PencilSimple`.
- Page icons and CTA icons: Phosphor first, Lucide only if needed.
- These mappings describe design intent; PageHeader V1 is still being reviewed and not automatically locked by this file.

## Inheritance and compatibility
- AppNavigation V1 remains LOCKED against its previously approved existing runtime reference. This IconFamily standard does not authorize reworking its current menu icons, header, layout or behavior.
- New icons should be explicitly registered by page/action and checked in both Day and Courtside themes before integration.
- Any change to family priority, core style, or approved registered icon requires user review and a new version.

## Preservation and implementation boundaries
This is a **saved and locked standard**, not an integrated icon-library migration. The running GameTrace app and its dependencies are unchanged. Do not load two whole icon packs unnecessarily; prefer only the required SVG assets/components at implementation time, subject to each library's license and attribution requirements.

Official catalogs: https://phosphoricons.com/ and https://lucide.dev/icons/
