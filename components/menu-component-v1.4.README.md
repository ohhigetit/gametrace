# GameTrace Menu Component V1.4 — APPROVED (2026-11-09)

Approved standalone reusable MenuComponent, separate presentation child of existing App Navigation. The visual reference is the approved V1.4 standalone HTML.

- Grouping: YOUR GAME, YOUR PROGRESS, YOUR TEAM, ACCOUNT & SETTINGS.
- Quick actions: New Game, New Training; Home Court pale-green button appearance.
- Heading typography: approved banner cell eyebrow; navigation typography: GameTrace theme.
- Official logo: icons/gametrace-official-192.png. App integration must inject an offline/local logo node.
- App integration must inject exact page-header icons via iconFactory(screen), not approximated icons. Missing icons are explicitly flagged.
- App Navigation remains the routing/menu visibility controller. The component emits onNavigate/onClose/onQuickAction callbacks.
- New Game disables while an unfinished game exists (canCreateGame=false).
- Responsive independently scrolling menu, preserved Day/Night theme support.

**Status:** Approved component saved to development; not integrated, not deployed. Keep legacy app routes and sign-out confirmation behavior in integration layer. Do not deploy without testing every destination and orientation.
