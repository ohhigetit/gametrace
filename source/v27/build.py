from pathlib import Path
p=Path(__file__).parent
s=(p/'baseline-camera.html').read_text()
def replace(old,new,count=1):
 global s
 assert s.count(old)>=count,old[:100]
 s=s.replace(old,new,count)
replace('<script>','<script>\n'+(p/'training-core.js').read_text()+'\n</script><script>')
replace('return{...base,id:text(g.id,120,true),','return{...base,feedback:GameTraceTraining.feedback(g.feedback),id:text(g.id,120,true),')
replace('return{version:VERSION,revision:Number.isInteger(d.revision)','return{trainingSessions:GameTraceTraining.validSessions(d.trainingSessions),version:VERSION,revision:Number.isInteger(d.revision)')
replace('function blankDB(){return{version:VERSION,','function blankDB(){return{trainingSessions:[],version:VERSION,')
replace("for(const name of ['home','live','stats','history','menu','setup','settings','backup','reports'])","for(const name of ['home','live','stats','history','menu','setup','settings','backup','reports','training','family'])")
replace("if(ui.screen==='menu')renderMenu();","if(ui.screen==='training')renderTraining();if(ui.screen==='family')renderFamily();if(ui.screen==='menu')renderMenu();")
replace("['Backup & Export','archive','backup',()=>navigate('backup')]","['Trainings and Camps','layers','training',()=>navigate('training')],['Family Cloud','archive','family',()=>navigate('family')],['Backup & Export','archive','backup',()=>navigate('backup')]",2)
replace("if(ui.scoreDraft?.id===id)target.finalScore=ui.scoreDraft.score;","if(ui.scoreDraft?.id===id)target.finalScore=ui.scoreDraft.score;if(ui.feedbackDraft?.id===id)target.feedback=ui.feedbackDraft.feedback;")
replace('function addSummaryFields(id){','function addSummaryFields(id){appendGameFeedbackFields(id);')
# Replace old content-only swipe with whole-page recognizer in the extension.
a=s.index("let reportSwipe=null;const swipeRoot=$('statsContent');")
b=s.index('\n',a)
s=s[:a]+s[b:]
replace("drawSave();return true;","drawSave();queueMicrotask(()=>window.GameTraceFamily?.schedule());return true;")
replace("\nload();\nsetInterval",'\n'+(p/'app.js').read_text()+'\n'+(p/'family.js').read_text()+"\nload();\nwindow.GameTraceFamily.boot();\nsetInterval")
replace('GameTrace V26 — Nine Sound Tones','GameTrace V27 — Training and Family')
replace('</head>','<style>\n'+(p/'style.css').read_text()+'\n</style></head>')
replace('<section class="app-view" id="reportsView"','<section class="app-view" id="trainingView" hidden><div class="content" id="trainingContent"></div></section><section class="app-view" id="familyView" hidden><div class="content" id="familyContent"></div></section><section class="app-view" id="reportsView"')
replace("const put=data=>transact('readwrite',store=>store.put(data));","const put=data=>transact('readwrite',store=>store.put(data));\nwindow.GameTraceRecordings={list,put,refresh:()=>refreshLibrary()};")
replace("await put(item);return item}","await put(item);window.dispatchEvent(new CustomEvent('gt-recording-saved',{detail:{id:item.id}}));return item}")
replace("exported:false};await put(item)","exported:false,gameId:window.GameTraceFamily?.activeGameId()||null};await put(item)")
replace("const actions=document.createElement('div');actions.className='gt-video-actions';", "meta.textContent+=' · '+(item.cloudStatus||'On this device');const actions=document.createElement('div');actions.className='gt-video-actions';")
replace("add('Export',async()=>", "if(window.GameTraceFamily?.connected())add(item.cloudStatus==='Uploaded'?'Upload again':'Upload to family',async()=>{try{await window.GameTraceFamily.upload(item,true);refreshLibrary()}catch(e){say(e.message)}});\nadd('Export',async()=>")
replace("'This replaces '+db.games.length+' current games with '+imported.games.length+' games from the backup. Download the current backup first.'","'This replaces all saved games and training sessions on this device with the backup. Download the current backup first.'",2)
# Import preview override in extension handles sessions transactionally.
(p/'GameTrace_V27_Training_Family.html').write_text(s)
(p.parents[1]/'index.html').write_text(s)
print('Built V27 on exact C1.10.3 camera baseline')
