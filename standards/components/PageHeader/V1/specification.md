# GameTrace PageHeader V1 — LOCKED

**Approved and locked:** November 7, 2026  
**Owner decision:** User approved PageHeader V1 following all-variants interactive preview and final action-icon choices.  
**Reference:** Existing approved GameTrace **Scoreboard** header styling.  
**Dependencies:** AppNavigation V1 (locked); IconFamily V1 (locked, Phosphor primary / Lucide secondary).

## Purpose and boundaries

Reusable **PageHeader** component within the UniversalPage Parent template. This standard defines only the page header. It does not alter the already locked AppNavigation, page primary content, banners, page footer, live application routing or data.

## Required structure

1. **Back action**, icon only, first in the header title row, using the existing application's navigation behavior. Its presence is required in the standard; any screen-specific behavior must be reconciled during integration.
2. **Page icon**, required, following Back.
3. **Page title**, required, immediately following the page icon.
4. **Page subtitle**, required, on its own line **aligned horizontally with the leading edge of the page icon** (not aligned with the back arrow and not indented after the icon/title text).
5. **Header action**, optional, icon-only, right-aligned in the title/header row. V1 supports only Filter and Edit.
6. **Page CTAs**, optional: a dedicated **full-width row below the title/subtitle**; absent when the page has no header CTA.

Visual sequence: `Back arrow → Page icon → Title`, with optional right-aligned action; subtitle starts at page-icon x coordinate.

## Header action icons (FINAL)

- **Filter:** Phosphor **SlidersHorizontal** (`sliders-horizontal`), triggers the *existing* page filter modal.
- **Edit:** Phosphor **PencilLine** (`pencil-line`), opens the appropriate Edit page.
- Icon-only action buttons must have descriptive accessible names, touch targets and focus states.
- No other header action types are approved for V1. Do not invent additional button variants.

## Page icon registry — approved selections

- **Home Court:** official Phosphor `CourtBasketball` (`court-basketball`).
- **Game Details:** **custom dribbling basketball** SVG concept from the approved preview, drawn in the same visual language; this is **not an official Phosphor asset**. Preserve its approved reference form until the app component is integrated and verified.
- For other page examples, use the icons shown in the approved all-variants preview, but do not treat incidental sample mappings as permission to change existing locked navigation icons.
- **IconFamily V1 applies**: Phosphor first, Lucide as secondary when required; existing approved icons preserved unless explicitly replaced.

## CTA rules (FINAL)

- Every page CTA uses the **same light-green fill** and matching border/text styling across the row; do not differentiate primary versus secondary CTA by color inside PageHeader V1.
- Equal-width buttons distribute available width among all CTAs (one fills row; two split equally; three split equally), accounting for consistent gaps.
- All CTA buttons are same height; each has an icon and label.
- The CTA row spans the available full width of the PageHeader content area (rather than the title-text-only column).
- CTA row is omitted completely when no CTAs are configured.
- Preserve usable, non-overlapping controls in iPhone portrait and landscape. Never clip labels or let buttons overflow the page.
- Examples shown in the review are **visual variants**. They do not unilaterally approve modifying existing per-page app workflows/commands.

## Layout and typography

- Follow the existing **Scoreboard** page header's neutral GameTrace theme, typography, spacing and icon/text proportions; **not** blue styling.
- Support the approved **Day** and **Courtside** themes.
- Keep text and icon colors theme-aware; no emoji substitutes for app controls.
- Back, action and CTA controls must remain keyboard/touch accessible.
- Visual review variants included: Scoreboard (Filter/no CTA), Game Details (Edit/no CTA), Games (Filter/one CTA), Gym (two CTAs), Home Court (three CTAs), Notebook (one CTA), Schedule (Filter/one CTA), Playbook (one CTA), Family Huddle (no CTA), Wall (no CTA).

## Integration safeguards

This file **locks the design**, not its deployment. Do **not** change development or production without a separate explicit integration instruction. Preserve all existing functionality and the locked AppNavigation V1. Any change to this contract requires a new version and approval.

The final approved interactive reference preview is named `GameTrace_PageHeader_V1_LOCKED_Reference.html` and was prepared in this conversation with Filter = SlidersHorizontal and Edit = PencilLine preselected. The original chooser reference is `GameTrace_PageHeader_V1_Icon_Options_PREVIEW.html`, with the user's final selections overriding its original default choices.
