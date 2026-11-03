from pathlib import Path
p=Path(__file__).parent
source=(p/'GameTrace_V21_Final_Refinements.html').read_text();old=(p/'gametrace_v21_app.js').read_text()
pos=old.rfind('function renderReports(){');app=old[:pos]+old[pos:].replace('function renderReports(){','function renderReportsV21(){',1)
app=app.replace('\nload();\nsetInterval','\n'+(p/'gametrace_v22.js').read_text()+'\nload();\nsetInterval')
source=source.replace(old,app,1).replace('</head>','<style>'+(p/'gametrace_v22.css').read_text()+'</style></head>',1).replace('GameTrace V21 — Final Refinements','GameTrace V22 — Compact Reports')
(p/'gametrace_v22_app.js').write_text(app);(p/'GameTrace_V22_Compact_Reports.html').write_text(source);print('Built V22')
