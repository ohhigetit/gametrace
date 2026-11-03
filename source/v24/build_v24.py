from pathlib import Path
p=Path(__file__).parent
base=(p.parent/'v22/GameTrace_V22_Compact_Reports.html').read_text()
cover=(p/'gametrace_cover_v24.html').read_text()
a=cover.index('<script>')
app=base.replace('<body>','<body>\n'+cover[:a],1).replace('</body>',cover[a:]+'\n</body>',1).replace('GameTrace V22 — Compact Reports','GameTrace V24 — Cinematic Cover')
(p/'GameTrace_V24_Cinematic_Cover.html').write_text(app)
print('Built V24 from deployed V22 and approved cover')
