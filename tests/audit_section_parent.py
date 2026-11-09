from pathlib import Path
s=Path("tests/GameTrace_Trainings_SummaryV8_FirstSection_TEST.html").read_text()
for token in ["function gtTrainingSummaryBannerSectionV8(", "gtTrainingSummaryBannerSectionV8 = ", "body.append(gtTrainingSummaryBannerSectionV8());", "GameTraceComponents.Section(", "data-parent=\\\"SectionV1\\\""]:
 print(token, s.count(token))
 i=s.find(token)
 if i>=0: print(repr(s[max(0,i-140):i+850]))

for token in ["function gtTrainingsRecentAllTypesV1(", "function gtTrainingSummaryBannerSectionV8(", "gttsv2-section-head", "Recent Trainings"]:
 print("AUDIT",token,"count",s.count(token))
 pos=s.find(token)
 if pos>=0: print(s[max(0,pos-120):pos+2400][:2400])
