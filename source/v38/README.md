# V38 — connected activity review

Approved scope: complete the pending refinements and deploy to development. Production remains V36. No user-data reset or live SQL execution.

- Session History and Schedule use the same `games-list-row` component, text structure, arrow and theme rules as Previous Games. Session actions remain on the session detail page; schedule actions move to an event detail page. Read-only feed events stay read-only.
- Upcoming / Calendar switches share the same event list. Marked month dates select a day and display only its events below the calendar; Show whole month clears the selection.
- Every Notebook activity has a two-column table: original questions 30%, expanded feedback 70%, with full wrapping and no truncation. Notes and historical answers retain their original meaning. Search highlights answers; empty fields remain omitted.
- My Prayer and My Commitment have separate routes and full reading pages, with individual player selection, editing, and Back to Notebook. Editor saves return to the correct page. No activity-page quick links.
- Home Court shows the next five upcoming events for the selected player, Add Event and View Schedule. Event rows open details. Game events include Create Game. The Games card keeps View all games, current-game resume and recent results; its redundant Your games/New Game actions are removed. The main New Game quick action remains.
- Scheduled Create Game prefills player, team, opponent and scheduled date. The date is editable on the new-game form and survives persistence. Existing unfinished-game protection remains; Create Game never starts play. Replacing an unsaved New Game form asks first.

The V37 Notebook/Schedule cloud migration remains a prerequisite. No database connector or management credential is available in this environment. The prepared setup page `/cloud/notebook-schedule-update.html` offers Copy SQL and manual-copy fallback, preserving memberships, existing data, conflict/history checks and recovery. Without capability 6, new personal/schedule records stay local with a notice. Existing game/session sync remains active. During dev testing, all participating family devices must use the updated dev build before editing new shared record types; older production versions do not understand these records.

Calendar feeds use actual network access in the development runtime, while isolated test HTML intentionally blocks fetch/cloud requests. Direct feeds depend on provider CORS, with ICS file import as fallback. Refresh is manual. Existing UTC/TZID/DST, daily/weekly recurrence and unsupported-rule warnings remain intact. No write-back or background subscription polling is added.

Build: `python3 source/v27/build.py`. Isolated preview: `python3 source/v38/build-preview.py`. Runtime copies must match. Validation includes `tests/v38-ui.cjs` plus existing V37/core/game/family regressions. Physical iPhone recording, provider feed access and real two-account sync remain live acceptance checks.
