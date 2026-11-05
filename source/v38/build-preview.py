"""Build a standalone sample-data preview without touching ordinary app storage/cloud."""
from pathlib import Path
p=Path(__file__).parent
repo=p.parents[1]
s=(repo/'index.html').read_text().replace('localStorage','v38TestStorage').replace('sessionStorage','v38TestSession')
s=s.replace("DB_NAME='gametrace-video-library-v1'", "DB_NAME='gametrace-v38-workflow-test-video-library-v1'")
pre="""<script>
const v38TestStorage=(()=>{const memory=new Map(),prefix='gametrace_v38_workflow_test:';return{get length(){try{return Object.keys(window.localStorage).filter(k=>k.startsWith(prefix)).length}catch{return memory.size}},key(i){try{return Object.keys(window.localStorage).filter(k=>k.startsWith(prefix))[i]?.slice(prefix.length)||null}catch{return [...memory.keys()][i]||null}},getItem(k){try{return window.localStorage.getItem(prefix+k)??memory.get(k)??null}catch{return memory.get(k)??null}},setItem(k,v){memory.set(k,String(v));try{window.localStorage.setItem(prefix+k,String(v))}catch{}},removeItem(k){memory.delete(k);try{window.localStorage.removeItem(prefix+k)}catch{}}}})();
const v38TestSession=(()=>{const memory=new Map();return{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)}})();
</script>"""
s=s.replace('</head>',pre+'</head>')
needle='\nload();\nwindow.GameTraceFamily.boot();'
assert needle in s
s=s.replace(needle,'\n'+(p/'test-preview.js').read_text()+needle)
s=s.replace('<title>','<title>LOCAL TEST · ',1)
(repo/'preview').mkdir(exist_ok=True)
(repo/'preview/index.html').write_text(s)
print('Built isolated V38 browser preview')
