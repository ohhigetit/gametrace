# GameTrace PageFooter V1 — LOCKED

**Approved and locked:** November 7, 2026
**Design reference:** `GameTrace_PageFooter_V1_PREVIEW_Top_Divider.html`
**Status:** LOCKED design standard; not integrated or deployed

## Signature encouragement message

The **same exact message** appears on **every page** of the application, without rotation, personalization or page-specific variations.

**Line one:** SHOW UP. PUT IN THE WORK.  
**Line two:** TRUST THE JOURNEY.

Text, capitalization and punctuation are intentional and locked.

## Required appearance

- **Top divider:** Thin, full-width horizontal rule directly above the footer message; border color is inherited from the active GameTrace theme's border/edge token.
- **Background:** Transparent. **No enclosing card, panel, box or decorative border** other than the top divider.
- **Text alignment:** Center aligned.
- **Typography:** Bold uppercase sans serif, generous but controlled letter spacing. Follow existing GameTrace typographic system.
- **Emphasis:** First line uses regular theme text color; second line **TRUST THE JOURNEY.** uses the theme's subtle green accent.
- **Two lines:** Maintain the approved two-line composition at phone widths.
- **Spacing:** Sufficient separation between page content and top divider, and between divider and signature text. Keep line spacing compact enough to read as one statement.
- **Themes:** Support both **Day** and **Courtside**, with correct theme tokens and contrast.
- **Responsive:** Preserve readability without overlap/clipping/overflow in iPhone portrait and landscape; reduce font size and letter spacing as needed on narrower screens.
- **Position:** At the bottom of the page content, after primary content, without replacing or overlapping controls. Can be pushed toward the page bottom via flex layout when appropriate; **not a fixed/sticky overlay**.
- **Accessibility:** Semantic `<footer>` or equivalent content-info landmark; text must be readable by screen readers. The line emphasis is visual, not a semantic split into separate announcements.

## Reference implementation styling (illustrative, derived from the approved preview)

```css
.gt-page-footer {
  margin-top: auto;
  padding: 23px 0 4px;
  text-align: center;
  background: transparent;
  border: 0;
  border-top: 1px solid var(--gt-edge);
}
.gt-page-footer p {
  margin: 0;
  font-size: clamp(12px, 3.4vw, 14px);
  line-height: 1.7;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 850;
  color: var(--gt-ink);
}
.gt-page-footer .first,
.gt-page-footer .second { display: block; }
.gt-page-footer .second {
  margin-top: 1px;
  color: var(--gt-accent);
}
@media (max-width: 370px) {
  .gt-page-footer p { font-size: 11px; letter-spacing: 1px; }
}
```

This CSS is **reference guidance** and is not itself an approved app integration. The preview uses local variables `--edge`, `--ink` and `--accent`; mapped above to existing app-style tokens `--gt-edge`, `--gt-ink` and `--gt-accent`.

## Scope and preservation

- PageFooter is a **required component** in the UniversalPage Parent template.
- Reuse the same footer throughout the app; no separate footer designs by page.
- Preserve locked AppNavigation V1, IconFamily V1 and PageHeader V1.
- Do not alter page contents, workflows or existing app functionality just to implement the footer.
- **No GitHub application source changes and no development/production deployment** are authorized by this design lock.
- Future changes to the message, divider or design require explicit review and a version increment.
