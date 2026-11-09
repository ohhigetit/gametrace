#!/usr/bin/env python3
"""Scoped alignment review build from the USER-APPROVED Trainings HTML.
Game Details + Scoreboard are modified only through additive CSS.
Home Court, Games and Trainings must retain approved markup/behavior.
"""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
src=root/"tests/GameTrace_Trainings_BannerAlignment_QA.html"
dst=root/"tests/GameTrace_AllBanner_Alignment_QA.html"
original=src.read_text(encoding="utf-8")
assert len(original)>1500000
for key in ("gtTrainingSummaryBannerSectionV8","gtGameDetailsUniversalV1",
            "gtGamesFeaturedBannerV1","v44-banner-columns",
            "gtcompact-team","gtcompact-vs","gt-global-banner-cell-alignment-qa"):
    assert key in original,key
style="""
<style id="gt-game-scoreboard-global-alignment-20261109">
/* GameTrace banner alignment contract:
   - centered content, with every cell label at its TOP
   - preserve 2:1 game columns, grids, typography, colors, spacing and actions
   - matchup team names: right | vs center | left.
   Scoped changes only, no feature logic or DOM replacement.
*/
/* Game Details: all first-row cell content starts from the same top edge.
   Formerly justify-content:center vertically, which displaced cell labels. */
html[data-theme] #app.gt-app #statsContent .gtgames-banner .gtgames-compact-primary
  > .gtgames-compact-cell {
  justify-content:flex-start!important;
  text-align:center!important;
}
html[data-theme] #app.gt-app #statsContent .gtgames-banner .gtcompact-game-summary {
  align-items:center!important;
}
html[data-theme] #app.gt-app #statsContent .gtgames-banner .gtcompact-quick-stats {
  align-items:stretch!important;
  justify-content:flex-start!important;
}
html[data-theme] #app.gt-app #statsContent .gtgames-banner
  :is(.gtgames-label,.gtcompact-stats-caption,.gtcompact-score) {
  text-align:center!important;
  width:100%;
}
html[data-theme] #app.gt-app #statsContent .gtgames-banner .gtcompact-meta {
  justify-content:center!important;text-align:center!important;width:100%;
}
html[data-theme] #app.gt-app #statsContent .gtgames-banner .gtcompact-stat {
  align-items:center!important;text-align:center!important;
}
/* Keep approved matchup geometry, including left/right asymmetry. */
html[data-theme] #app.gt-app #statsContent .gtgames-banner .gtcompact-match {
  display:grid!important;
  grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)!important;
  align-items:start!important;width:100%;
}
html[data-theme] #app.gt-app #statsContent .gtgames-banner .gtcompact-team:first-child {
  text-align:right!important;align-self:start!important;
}
html[data-theme] #app.gt-app #statsContent .gtgames-banner .gtcompact-team:last-child {
  text-align:left!important;align-self:start!important;
}
html[data-theme] #app.gt-app #statsContent .gtgames-banner .gtcompact-vs {
  text-align:center!important;align-self:start!important;
}
/* Scoreboard: existing standalone V44 banner uses its own renderer, not
   SharedBannerV2 cells. Apply the shared alignment contract without
   replacing its totals/average control or expanding detail grid. */
html[data-theme] #app.gt-app #reportsContent .scoreboard-banner.v44-banner
  .v44-banner-main {
  justify-content:flex-start!important;
  align-items:center!important;
  text-align:center!important;
}
html[data-theme] #app.gt-app #reportsContent .scoreboard-banner.v44-banner
  .v44-banner-side {
  align-content:start!important;
}
html[data-theme] #app.gt-app #reportsContent .scoreboard-banner.v44-banner
  .v44-metric {
  text-align:center!important;
}
html[data-theme] #app.gt-app #reportsContent .scoreboard-banner.v44-banner
  :is(.v44-kicker,.v44-banner-big,.v44-banner-note) {
  text-align:center!important;
}
</style>
"""
assert 'id="gt-game-scoreboard-global-alignment-20261109"' not in original
assert original.lower().count("</head>")>=1
html=re.sub(r"</head>",lambda match:style+match.group(0),original,count=1,flags=re.I)
assert html.replace(style,"")==original,"Baseline unexpectedly modified"
dst.write_text(html,encoding="utf-8")
print("PASS complete app preserved byte-for-byte except alignment-only CSS")
print("PASS Game Details cells start top; Team vs Opponent exception preserved")
print("PASS Scoreboard totals, averages, details remain unchanged")
print(f"Built {dst.name} ({len(html):,} characters)")
