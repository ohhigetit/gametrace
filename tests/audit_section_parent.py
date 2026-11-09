from pathlib import Path
s=Path("tests/GameTrace_Trainings_SummaryV8_FirstSection_TEST.html").read_text()
for token in ["function gtTrainingSummaryBannerSectionV8(", "gtTrainingSummaryBannerSectionV8 = ", "body.append(gtTrainingSummaryBannerSectionV8());", "GameTraceComponents.Section(", "data-parent=\\\"SectionV1\\\""]:
 print(token, s.count(token))
 i=s.find(token)
 if i>=0: print(repr(s[max(0,i-140):i+850]))
