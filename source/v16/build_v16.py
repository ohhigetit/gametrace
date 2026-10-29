from pathlib import Path
import json,subprocess,html,re,base64
p=Path(__file__).parent
source=(p/'GameTrace_V15_Menu_Game_Setup.html').read_text()
app=(p/'gametrace_v15_app.js').read_text()
app=app.replace('function gameForm(', 'function baseGameForm(',1).replace('function renderLive(', 'function baseRenderLive(',1)
app=app.replace('function chooseGame(', 'function baseChooseGame(',1)
app=app.replace("input.value=value||''", "input.value=value??''")
app=app.replace("save=button(isNew?'Start Game':'Save changes',()=>{},'ng-start',{type:'submit'})", "save=button(isNew?'Start Game':'Save changes',()=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})),'ng-start',{type:'button'})")
app=app.replace("form.addEventListener('input',()=>error.textContent='');form.addEventListener('change',()=>error.textContent='');", "form.addEventListener('input',()=>error.textContent='');form.addEventListener('change',()=>error.textContent='');form.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))}});")
app=app.replace("const raw=localStorage.getItem(C.KEY);if(raw){try{db=C.validDB(JSON.parse(raw));baseRevision=db.revision;saveState='Saved'}", "const raw=localStorage.getItem(C.KEY)||localStorage.getItem(C.PREVIOUS_KEY);if(raw){try{db=C.validDB(JSON.parse(raw));const migrated=!localStorage.getItem(C.KEY);baseRevision=migrated?0:db.revision;saveState='Saved';if(migrated)persist()}")
app=app.replace("}render()}\nfunction closeDialog", "}expireSavedGames();render()}\nfunction closeDialog",1)
app=app.replace("if(isNew){created=C.newGame(meta,settings);candidate.games.push(created);candidate.activeGameId=created.id}","if(isNew){if(candidate.games.some(g=>g.status==='in_progress'))throw Error('Finish the current game before starting another.');created=C.startGame(C.newGame(meta,settings));candidate.games.push(created);candidate.activeGameId=created.id}")
app=app.replace("target.settings=settings;target.updatedAt=C.now();", "if(target.timingVersion&&target.events.some(e=>!['game_start','period_start'].includes(e.code))&&settings.format!==target.settings.format)throw Error('This game already has recorded plays. Keep its format; period lengths remain editable.');target.settings=settings;target.updatedAt=C.now();")
app=app.replace("if(meta)Object.assign(target,meta);", "if(meta)Object.assign(target,meta);if(ui.scoreDraft?.id===id)target.finalScore=ui.scoreDraft.score;")
app=app.replace("navigate(mode==='defaults'?'settings':game()?'live':'home')", "navigate(mode==='defaults'?'settings':returnTo==='stats'?'stats':game()?'live':'home')")
app=app.replace("const last=g.events.at(-1);", "const last=C.ordered(g).at(-1);")
app=app.replace("for(const e of [...g.events].slice(-5).reverse())", "for(const e of C.ordered(g).slice(-5).reverse())")
app=app.replace("new Date(e.createdAt).toLocaleTimeString", "new Date(C.occurred(e)).toLocaleTimeString")
app=app.replace("if(saveState==='Saved'&&!sheet.open&&!(ui.setup&&!ui.setup.finished)&&ui.screen!=='settings')", "if(saveState==='Saved'&&!sheet.open&&!reportEditorActive&&!(ui.setup&&!ui.setup.finished)&&ui.screen!=='settings')")
names=['pencil','grip-vertical','chevron-right','plus','arrow-left']
script="const l=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/lucide');process.stdout.write(JSON.stringify(Object.fromEntries("+json.dumps(names)+".map(n=>[n,l.icons[n.split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join('')]]))))"
nodes=json.loads(subprocess.check_output(['node','-e',script],text=True))
icons={name:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+''.join('<'+tag+' '+' '.join(k+'="'+html.escape(str(v),quote=True)+'"' for k,v in attrs.items())+'/>' for tag,attrs in value)+'</svg>' for name,value in nodes.items()}
extra='const REPORT_ICONS='+json.dumps(icons)+';\n'+(p/'gametrace_v16_flow.js').read_text()+'\n'+(p/'gametrace_v16_report.js').read_text()
app=app.replace('\nload();\n})();','\n'+extra+'\nload();\nsetInterval(expireSavedGames,30000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)expireSavedGames()});\n})();')
assert extra in app
source=source.replace((p/'gametrace_v15_app.js').read_text(),app,1)
source=source.replace((p/'gametrace_core_v15.cjs').read_text(),(p/'gametrace_core_v16.cjs').read_text(),1)
source=source.replace('GameTrace V15 — Menu & Game Setup','GameTrace V16 — Your Games & Game Report',1)
icon_root=p/'app_icons'
if (icon_root/'gametrace-circle-180.png').exists():
    data=lambda size:'data:image/png;base64,'+base64.b64encode((icon_root/f'gametrace-circle-{size}.png').read_bytes()).decode()
    metadata='<link rel="icon" type="image/png" sizes="32x32" href="'+data(32)+'"><link rel="apple-touch-icon" sizes="180x180" href="'+data(180)+'"><link rel="manifest" href="./manifest.webmanifest"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="GameTrace"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
    source=source.replace('<title>',metadata+'<title>',1)
    source=source.replace('id="brandHome"', 'id="brandHome"',1)
    source=re.sub(r'(<button[^>]*id="brandHome"[^>]*>)',lambda m:m.group(1)+'<img class="app-brand-icon" src="'+data(32)+'" alt="" width="32" height="32">',source,count=1)
source=source.replace('</style>','\n'+(p/'gametrace_v16.css').read_text()+'\n</style>',1)
# Keep existing DOM IDs for navigation listeners, with no duplicated bottom report/library CTAs.
source=source.replace('<nav class="view-footer" aria-label="Game library tools">','<nav class="view-footer" hidden aria-label="Game library tools">')
source=source.replace('<nav class="view-footer" aria-label="Stats navigation">','<nav class="view-footer" hidden aria-label="Stats navigation">')
(p/'gametrace_v16_app.js').write_text(app)
out=p/'GameTrace_V16_Your_Games_and_Report.html';out.write_text(source);print(out.resolve())
