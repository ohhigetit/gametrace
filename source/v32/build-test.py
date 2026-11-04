"""Generate an isolated downloadable HTML from the current local app build."""
from pathlib import Path
p=Path(__file__).parent
repo=p.parents[1]
s=(repo/'index.html').read_text().replace('localStorage','v32TestStorage')
s=s.replace("DB_NAME='gametrace-video-library-v1'", "DB_NAME='gametrace-v32-test-video-library-v1'")
pre="""<script>const v32TestStorage=(()=>{const memory=new Map(),prefix='gametrace_v32_test_20261103:';return{getItem(k){try{return window.localStorage.getItem(prefix+k)??memory.get(k)??null}catch{return memory.get(k)??null}},setItem(k,v){memory.set(k,String(v));try{window.localStorage.setItem(prefix+k,String(v))}catch{}},removeItem(k){memory.delete(k);try{window.localStorage.removeItem(prefix+k)}catch{}}}})();</script>"""
css='<style>html[data-theme] #app.gt-app #layoutTestButton{background:var(--gt-surface);color:var(--gt-muted);border:1px solid var(--gt-edge);min-height:38px;padding:5px 8px;font-size:10px;border-radius:10px;flex:0 0 auto}</style>'
s=s.replace('</head>',css+pre+'</head>')
needle='\nload();\nwindow.GameTraceFamily.boot();'
assert needle in s
s=s.replace(needle,'\n'+(p/'test-preview.js').read_text()+needle)
s=s.replace('<title>','<title>TEST · ',1)
out=repo.parent/'deliverables'/'GameTrace_V32_Score_Journey_Reflections_TEST.html'
out.parent.mkdir(exist_ok=True)
out.write_text(s)
(repo/'preview'/'index.html').write_text(s)
print(out)
