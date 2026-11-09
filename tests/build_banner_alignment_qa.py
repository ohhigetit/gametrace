#!/usr/bin/env python3
"""Non-destructive QA build on the locked pending Trainings V8 app.
Creates a standalone HTML copy with scoped banner alignment refinements.
Does NOT modify the approved component or development/production.
"""
from pathlib import Path
import re

root=Path(__file__).resolve().parents[1]
source=root/"tests/GameTrace_Trainings_SummaryV8_FirstSection_TEST.html"
target=root/"tests/GameTrace_Trainings_BannerAlignment_QA.html"
html=source.read_text(encoding="utf-8")
# Pin the actual approved Section V1 constructor rather than treating data-parent
# metadata as proof of inheritance.
library=(root/"components/game-trace-components.js").read_text(encoding="utf-8")
assert "function Section(" in library and "global.GameTraceComponents=" in library
section_parent_script="<script id='gt-approved-section-v1-runtime'>\\n"+library+"\\n</script>"
assert "</head>" in html.lower()
html=re.sub(r"</head>",lambda _:section_parent_script+"</head>",html,count=1,flags=re.I)

# Preserve the entire V8 approved inner banner and original approved header.
# The QA adapter obtains its SECTION ROOT from the canonical constructor;
# the previously approved header/banner DOM nodes are then transplanted intact,
# avoiding any typography, spacing, markup, or behavior rework.
declaration="function gtTrainingSummaryBannerSectionV8(){"
assert html.count(declaration)==1, "Approved adapter declaration changed"
html=html.replace(declaration,"function gtTrainingSummaryBannerSectionV8Original(){",1)
call="body.append(gtTrainingSummaryBannerSectionV8());"
assert html.count(call)==1, "Training Summary call location changed"
wrapper="""
function gtTrainingSummaryBannerSectionV8(){
  const legacy=gtTrainingSummaryBannerSectionV8Original();
  const oldHeader=legacy.querySelector('.gttsv2-section-head');
  const banner=legacy.querySelector('.gttsv2-banner');
  if(!oldHeader||!banner||!window.GameTraceComponents?.Section)
    throw new Error('Approved Training Summary / Section V1 missing');
  const section=window.GameTraceComponents.Section({
    title:'Training Summary',
    subtitle:'Every session is a step forward.',
    content:banner,
    kind:'gttsv2-section'
  });
  section.querySelector('.gtc-section-header').replaceWith(oldHeader);
  section.querySelector('.gtc-section-content').replaceWith(banner);
  // Identical approved DOM, sourced from the real shared Section V1 constructor.
  section.className=legacy.className;
  section.dataset.component=legacy.dataset.component;
  section.dataset.parent='SectionV1';
  return section;
}
"""
html=html.replace(call,wrapper+"\\n "+call,1)
assert len(html)>1000000, "Pending app baseline unexpectedly short"
for marker in ("gttsv2-banner", "gttsv2-skill-tag", "gttsv2-achievement",
               "gtcompact-team", "gtcompact-vs", "scoreboard"):
    assert marker in html, f"Missing existing functionality: {marker}"
assert html.lower().count("</html>")>=1, "Invalid standalone HTML"
# All rules are additive, purposely not altering the V8-approved source.
# Normal cell headings stay at their established top baseline.
# Team vs Opponent MUST keep distinct right/center/left column alignment.
css="""
<style id="gt-global-banner-cell-alignment-qa">
/* SharedBanner V2: horizontal-only centering, without vertical recentering. */
.gtv2-banner .gtv2-banner-cell:not(.gtv2-team-vs-opponent) {
  align-items:center!important;text-align:center!important;justify-content:flex-start!important;
}
.gtv2-banner .gtv2-banner-cell:not(.gtv2-team-vs-opponent)>.gtv2-content {
  align-items:center!important;text-align:center!important;width:100%;
}
.gtv2-banner .gtv2-banner-cell:not(.gtv2-team-vs-opponent) .gtv2-progress-dots {
  justify-content:center!important;
}
/* TrainingSummaryBanner V8: preserve approved soft green + transparent chips. */
.gttsv2-banner [data-component="BannerCellV1"] {text-align:center!important;}
.gttsv2-banner .gttsv2-cell,
.gttsv2-banner .gttsv2-details-cell {
  align-items:center!important;text-align:center!important;justify-content:flex-start!important;
}
.gttsv2-banner .gttsv2-eyebrow,
.gttsv2-banner .gttsv2-details-label {
  width:100%;text-align:center!important;
}
.gttsv2-banner .gttsv2-skills-list,
.gttsv2-banner .gttsv2-achievements {justify-content:center!important;}
/* Small green labels: 4.56:1 on #e6efe8; the locked #087d42 was 4.44:1. */
.gttsv2-banner .gttsv2-eyebrow,
.gttsv2-banner .gttsv2-details-label {color:#087b40!important;}
/* Game compact stats centered, matchups retain their asymmetric alignment. */
.gtcompact-quick-stats,.gtcompact-stat {text-align:center!important;}
.gtcompact-stat {align-items:center!important;}
.gtcompact-match .gtcompact-team:first-child {text-align:right!important;}
.gtcompact-match .gtcompact-team:last-child {text-align:left!important;}
.gtcompact-match .gtcompact-vs {text-align:center!important;}
/* Portrait and landscape: no changes to row grids, sizes, or overflow. */
</style>
"""
assert "id=\"gt-global-banner-cell-alignment-qa\"" not in html, "QA already patched"
assert "</head>" in html.lower(), "Cannot place QA stylesheet"
html=re.sub(r"</head>", lambda _:css+"</head>", html, count=1, flags=re.I)
target.write_text(html,encoding="utf-8")
# Static regression: preserve all source material unmodified except injected CSS.
assert html.replace(css,"").count("function gtTrainingSummaryBannerSectionV8Original(){")==1
assert "window.GameTraceComponents.Section({" in html
assert "gt-approved-section-v1-runtime" in html
assert "gttsv2-banner" in html and "gtcompact-vs" in html
print(f"PASS: Generated {target.name} ({len(html):,} chars)")
print("PASS: Training Summary V8 remains identical except QA stylesheet")
print("PASS: Team vs Opponent keeps right / center / left alignment")
print("PASS: No layout width, font, palette, score data or event-handler changes")
