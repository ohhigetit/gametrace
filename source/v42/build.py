from pathlib import Path
root=Path(__file__).resolve().parents[2]
p=Path(__file__).resolve().parent
html=(p/'base.html').read_text()
import re
html=re.sub(r'<title>.*?</title>','<title>GameTrace</title>',html,count=1)
script=(p/'refinements.js').read_text()+'\n'+(p/'live-feed.js').read_text()
assert html.count('\nload();\nwindow.GameTraceFamily.boot();')==1
html=html.replace('\nload();\nwindow.GameTraceFamily.boot();','\n'+script+'\nload();\nwindow.GameTraceFamily.boot();')
html=html.replace('</head>','<meta name="gametrace-release" content="V42"><style id="v42-refinements">\n'+(p/'refinements.css').read_text()+'\n</style></head>')
for target in [root/'index.html',p/'GameTrace_V42.html',root/'templates/current/GameTrace.html']:
 target.parent.mkdir(parents=True,exist_ok=True);target.write_text(html)
print('Built GameTrace V42')
