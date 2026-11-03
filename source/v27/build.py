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
# Keep deleted plays in the shared game so any family device can restore them.
replace('id:text(g.id,120,true),status:g.status','id:text(g.id,120,true),deletedEvents:Array.isArray(g.deletedEvents)?g.deletedEvents.map(validEvent):[],status:g.status')
replace('fn(target,candidate);target.updatedAt=C.now();','fn(target,candidate);preserveDeletedPlays(before.games.find(g=>g.id===id),target);target.updatedAt=C.now();')
replace('function commit(fn,touchId=null){fn();','function commit(fn,touchId=null){const beforeGame=touchId?C.clone(db.games.find(g=>g.id===touchId)):null;fn();if(touchId)preserveDeletedPlays(beforeGame,db.games.find(g=>g.id===touchId));')
# Local recording deletion is recoverable; no video bytes are removed.
replace("const rows=(await list()).sort((a,b)=>b.created-a.created);", "const allRows=await list(),rows=allRows.filter(item=>!item.deletedAt).sort((a,b)=>b.created-a.created);const removed=allRows.filter(item=>item.deletedAt);")
replace("target.append(note);", "target.append(note);if(removed.length){const trash=document.createElement('details'),title=document.createElement('summary');title.textContent='Recently deleted recordings ('+removed.length+')';trash.append(title);for(const item of removed){const restore=document.createElement('button');restore.textContent='Restore '+item.name;restore.onclick=async()=>{item.deletedAt=null;await put(item);refreshLibrary()};trash.append(restore)}target.append(trash)}")
replace("if(!confirm('Permanently delete this recording from GameTrace?'))return;await remove(item.id);", "if(!confirm('Move this recording to Recently deleted? You can restore it in My Recordings. This does not free device storage.'))return;item.deletedAt=Date.now();await put(item);")
replace('function addSummaryFields(id){','function addSummaryFields(id){appendGameFeedbackFields(id);')
# Replace old content-only swipe with whole-page recognizer in the extension.
a=s.index("let reportSwipe=null;const swipeRoot=$('statsContent');")
b=s.index('\n',a)
s=s[:a]+s[b:]
replace("drawSave();return true;","drawSave();queueMicrotask(()=>window.GameTraceFamily?.schedule());return true;")
replace("\nload();\nsetInterval",'\n'+(p/'app.js').read_text()+'\n'+(p/'family.js').read_text()+'\n'+(p.parent/'v28/features.js').read_text()+'\n'+(p.parent/'v29/live.js').read_text()+"\nload();\nwindow.GameTraceFamily.boot();\nsetInterval")
replace('GameTrace V26 — Nine Sound Tones','GameTrace V27 — Training and Family')
replace('</head>','<style>\n'+(p/'style.css').read_text()+'\n'+(p.parent/'v28/features.css').read_text()+'\n'+(p.parent/'v29/live.css').read_text()+'\n</style></head>')
replace('<section class="app-view" id="reportsView"','<section class="app-view" id="trainingView" hidden><div class="content" id="trainingContent"></div></section><section class="app-view" id="familyView" hidden><div class="content" id="familyContent"></div></section><section class="app-view" id="reportsView"')
replace("const put=data=>transact('readwrite',store=>store.put(data));","const put=data=>transact('readwrite',store=>store.put(data));\nwindow.GameTraceRecordings={list,put,refresh:()=>refreshLibrary()};")
replace("await put(item);return item}","await put(item);window.dispatchEvent(new CustomEvent('gt-recording-saved',{detail:{id:item.id}}));return item}")
replace("exported:false};await put(item)","exported:false,gameId:window.GameTraceFamily?.activeGameId()||null};await put(item)")
replace("const actions=document.createElement('div');actions.className='gt-video-actions';", "meta.textContent+=' · '+(item.cloudStatus||'On this device');const actions=document.createElement('div');actions.className='gt-video-actions';")
replace("add('Export',async()=>", "if(window.GameTraceFamily?.connected())add(item.cloudStatus==='Uploaded'?'Upload again':'Upload to family',async()=>{try{await window.GameTraceFamily.upload(item,true);refreshLibrary()}catch(e){say(e.message)}});\nadd('Export',async()=>")
replace("'This replaces '+db.games.length+' current games with '+imported.games.length+' games from the backup. Download the current backup first.'","'This replaces all saved games and training sessions on this device with the backup. Download the current backup first.'",2)
# Import preview override in extension handles sessions transactionally.

# V28: goal data, manual start, timeout and score event extensions.
import re
rules=(p.parent/'v28/game-core.js').read_text()
for chunk in rules.split('// @replace ')[1:]:
 name,body=chunk.split('\n',1)
 body=body.split('// @helpers')[0].strip()
 start=s.index('function '+name+'(')
 match=re.search(r'\n(?=function |const |return Object)',s[start:])
 assert match,name
 end=start+match.start()
 s=s[:start]+body+s[end:]
helpers=rules.split('// @helpers\n')[1]
replace('return Object.freeze({VERSION,',helpers+'\nreturn Object.freeze({prepareGame,scoreAt,paused,startTimeout,endTimeout,validateGameFlow,reconcileGame,VERSION,')
replace("Object.assign(LABELS,{game_start:","Object.assign(LABELS,{team_1:'Team +1',team_2:'Team +2',team_3:'Team +3',opponent_1:'Opponent +1',opponent_2:'Opponent +2',opponent_3:'Opponent +3',timeout_start:'Timeout',timeout_end:'Resume Game',score_set:'Score correction'});\nObject.assign(LABELS,{game_start:")
replace('return{id:uid(),player:', 'return{pendingStart:false,scoreTracking:false,id:uid(),player:')
replace('id:text(g.id,120,true),deletedEvents:', 'id:text(g.id,120,true),pendingStart:g.pendingStart===true,scoreTracking:g.scoreTracking===true,deletedEvents:')
replace('return{trainingSessions:','return{goals:GameTraceTraining.validGoals(d.goals),goalOrders:GameTraceTraining.validGoalOrders(d.goalOrders),trainingSessions:')
replace('function blankDB(){return{trainingSessions:','function blankDB(){return{goals:[],goalOrders:[],trainingSessions:')
replace("created=C.startGame(C.newGame(meta,settings))", "created=C.prepareGame(meta,settings)")
replace("isNew?'Start Game':'Save changes'", "isNew?'Create Game':'Save changes'")
replace("announce('Game started')", "announce('Game saved · tap Start Game when ready')")
replace("(isNew?'started':'updated')", "(isNew?'saved':'updated')")
replace("function startPeriod(g,key,at=now()){", "function startPeriod(g,key,at=now()){if(g.pendingStart)fail('Start the game first.');")
replace("function finishGame(g,{at=now(),score=g.finalScore||null,automatic=false}={}){if(g.status==='completed')return;", "function finishGame(g,{at=now(),score=g.finalScore||null,automatic=false}={}){if(g.status==='completed')return;if(g.pendingStart)fail('Start the game before ending it.');if(paused(g))endTimeout(g,at);if(g.scoreTracking&&score){const current=scoreAt(g);if(current.team!==score.team||current.opponent!==score.opponent)appendEvent(g,'score_set',{at,scoreTeam:score.team,scoreOpponent:score.opponent});}")
replace('g.finalScore=score;g.autoEnded=', 'g.finalScore=g.scoreTracking?scoreAt(g):score;g.autoEnded=')
replace("if(g.status==='in_progress'&&time>=deadline)", "if(g.status==='in_progress'&&!g.pendingStart&&time>=deadline)")
replace("game.id=String(old.id);", "game.pendingStart=false;game.scoreTracking=false;game.id=String(old.id);")
replace("function onCourt(g){return rawOnCourt(g)", "function onCourt(g){return !g.pendingStart&&!paused(g)&&rawOnCourt(g)")
replace("return{id:uid(),code,turnoverType:reason,", "if(code==='score_set'&&![opts.scoreTeam,opts.scoreOpponent].every(n=>Number.isInteger(n)&&n>=0&&n<=9999))fail('Enter both whole-number scores.');return{...(code==='score_set'?{scoreTeam:opts.scoreTeam,scoreOpponent:opts.scoreOpponent}:{}),timeoutId:opts.timeoutId||'',id:uid(),code,turnoverType:reason,")
replace("return{id:text(e.id,120,true),code:e.code,", "if(e.code==='score_set'&&![e.scoreTeam,e.scoreOpponent].every(n=>Number.isInteger(n)&&n>=0&&n<=9999))fail('Invalid score correction.');return{...(e.code==='score_set'?{scoreTeam:e.scoreTeam,scoreOpponent:e.scoreOpponent}:{}),timeoutId:e.timeoutId?text(e.timeoutId,120):'',id:text(e.id,120,true),code:e.code,")
replace("function eventLabel(e){return e.code===", "function eventLabel(e){if(e.code==='score_set')return 'Score set · '+e.scoreTeam+'–'+e.scoreOpponent;return e.code===")
replace("preserveDeletedPlays(before.games.find(g=>g.id===id),target);target.updatedAt", "preserveDeletedPlays(before.games.find(g=>g.id===id),target);C.reconcileGame(target);target.updatedAt")
replace("if(touchId)preserveDeletedPlays(beforeGame,db.games.find(g=>g.id===touchId));", "if(touchId){const target=db.games.find(g=>g.id===touchId);preserveDeletedPlays(beforeGame,target);if(target)C.reconcileGame(target);}")
replace("'training','family']", "'training','family','goals','trophies']")
replace("if(ui.screen==='training')renderTraining();", "if(ui.screen==='goals')renderGoals();if(ui.screen==='trophies')renderTrophies();if(ui.screen==='training')renderTraining();")
replace("['Trainings and Camps','layers','training',()=>navigate('training')],", "['Trainings and Camps','layers','training',()=>navigate('training')],['Goals','layers','goals',()=>navigate('goals')],['Trophy Cabinet','archive','trophies',()=>navigate('trophies')],",2)
replace('<section class="app-view" id="trainingView"', '<section class="app-view" id="goalsView" hidden><div class="content" id="goalsContent"></div></section><section class="app-view" id="trophiesView" hidden><div class="content" id="trophiesContent"></div></section><section class="app-view" id="trainingView"')
# Show team/opponent/timeout markers even when the player was on the bench.
replace("['reb_o','reb_d','assist','steal','foul','turnover','touch','pass'].includes(e.code)","['reb_o','reb_d','assist','steal','foul','turnover','touch','pass','team_1','team_2','team_3','opponent_1','opponent_2','opponent_3','score_set','timeout_start','timeout_end'].includes(e.code)")
replace("if(!courtBeforeRecord(g,e)){b.remove();return}", "if(!courtBeforeRecord(g,e)&&!isGameContextEvent(e)){b.remove();return}")
# Training custom skills remain ordinary bounded tags, also retained in CSV/backup.
replace("T.TAGS.forEach(t=>{", "trainingSkillChoices(original).forEach(t=>{")
replace("tags.append(tagList);form.append(tags);", "tags.append(tagList);const readCustom=appendCustomSkills(tags);form.append(tags);")
replace("tags:Object.keys(checks).filter(t=>checks[t].checked),feedback:", "tags:[...Object.keys(checks).filter(t=>checks[t].checked),...readCustom()],awardEligible:repeat||!original?true:original.awardEligible,awardContext:repeat?null:original?.awardContext,feedback:")
replace("GameTrace V27 — Training and Family", "GameTrace V28 — Goals and Journey")
replace('GameTrace V28 — Goals and Journey','GameTrace V29 — Live Game')
(p/'GameTrace_V27_Training_Family.html').write_text(s)
(p.parents[1]/'index.html').write_text(s)
print('Built V27 on exact C1.10.3 camera baseline')
