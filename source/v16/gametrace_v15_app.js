(()=>{'use strict';
const C=GameTraceCore,$=id=>document.getElementById(id),sheet=$('sheet');
let db=C.blankDB(),baseRevision=0,saveState='Ready',saveError='',recoveryRaw=null,returnFocus=null,choiceAnchor=null,toastTimer,audio;
const ui={screen:'home',layer:'primary',period:'all',historyPeriod:'all',stat:null,liveExpanded:false,menuReturn:'home',setup:null,newDraft:null};
function el(tag,attrs={},...children){const n=document.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(k==='class')n.className=v;else if(k==='text')n.textContent=v;else if(k.startsWith('on'))n.addEventListener(k.slice(2).toLowerCase(),v);else if(v!==undefined&&v!==null)n.setAttribute(k,String(v))}for(const c of children.flat())if(c!==null&&c!==undefined)n.append(c instanceof Node?c:document.createTextNode(String(c)));return n}
function button(text,fn,cls='',attrs={}){return el('button',{type:'button',class:cls,onclick:fn,...attrs},text)}
const game=()=>db.games.find(g=>g.id===db.activeGameId)||null;
const localDate=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function friendlyDate(s){return new Date(s+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}
function shortSaved(g){return g.updatedAt?new Date(g.updatedAt).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'Not saved yet'}
function announce(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),1600)}
function sound(){if(!db.prefs.sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=670;g.gain.setValueAtTime(.025,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.055);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.06)}catch{}}
function drawSave(){const status=$('saveStatus');status.textContent=saveState;status.dataset.state=saveState;$('retrySave').hidden=saveState!=='Not saved';$('saveErrorLine').textContent=saveState==='Not saved'?saveError:''}
function persist(replace=false){
 saveState='Saving';drawSave();
 try{
  const raw=localStorage.getItem(C.KEY);let existing=0;if(raw){try{existing=JSON.parse(raw).revision||0}catch{if(!replace)throw Error('Saved data could not be read. Export a recovery copy or restore a backup.')}}
  if(recoveryRaw&&!replace)throw Error('The saved library needs recovery. Export it before restoring a backup.');
  if(!replace&&existing!==baseRevision)throw Error('Saved data changed in another window. Export these changes or load the saved library.');
  const candidate={...db,revision:existing+1,updatedAt:C.now()};localStorage.setItem(C.KEY,JSON.stringify(candidate));db=candidate;baseRevision=candidate.revision;recoveryRaw=null;saveState='Saved';saveError='';drawSave();return true;
 }catch(e){saveState='Not saved';saveError=e.message||'Saving is unavailable. Retry or export a backup.';drawSave();return false}
}
function commit(fn,touchId=null){fn();if(touchId){const g=db.games.find(x=>x.id===touchId);if(g){g.updatedAt=C.now();g.revision++}}const ok=persist();render();return ok}
function load(){try{const raw=localStorage.getItem(C.KEY);if(raw){try{db=C.validDB(JSON.parse(raw));baseRevision=db.revision;saveState='Saved'}catch(e){recoveryRaw=raw;saveState='Not saved';saveError='The saved library could not be read. Download a recovery copy or restore a backup.'}}else{try{const p=JSON.parse(localStorage.getItem('gametrace_period_preview_v1')||'null');if(p)db.prefs.periods=C.validSettings(p)}catch{}}}catch{saveState='Not saved';saveError='Saving is unavailable in this browser. You can still export a backup.'}render()}
function closeDialog(){if(sheet.open)sheet.close()}
function openDialog(title,build,{reachable=false,anchor=null}={}){
 if(!sheet.open)returnFocus=document.activeElement;
 choiceAnchor=anchor;sheet.className='sheet'+(reachable?' reachable':'');sheet.style.removeProperty('--choice-top');$('sheetTitle').textContent=title;
 const box=$('choices');box.replaceChildren();box.className=reachable?'choices':'choices period-editor';build(box);if(!sheet.open)sheet.showModal();positionChoices();
 const focus=box.querySelector('input[type=radio]:checked')||box.querySelector('button.primary')||box.querySelector('button');focus?.focus({preventScroll:true});
}
function choices(title,items,anchor){openDialog(title,box=>{for(const [text,fn,primary]of items)box.append(button(text,fn,primary?'primary':text==='Cancel'?'cancel-choice':''))},{reachable:true,anchor})}
function positionChoices(){if(!sheet.open||!sheet.classList.contains('reachable'))return;const v=window.visualViewport,style=getComputedStyle($('app')),top=(v?.offsetTop||0)+Math.max(12,parseFloat(style.paddingTop)||0),bottom=(v?.offsetTop||0)+(v?.height||innerHeight)-Math.max(14,parseFloat(style.paddingBottom)||0),r=returnFocus?.getBoundingClientRect?.();sheet.style.setProperty('--choice-top','0px');const a=sheet.getBoundingClientRect(),b=$('choices').querySelector('button:not(.cancel-choice)').getBoundingClientRect(),y=choiceAnchor?.y??(r?r.y+r.height/2:(top+bottom)/2);sheet.style.setProperty('--choice-top',Math.round(Math.min(Math.max(top,y-(b.y+b.height/2-a.y)),Math.max(top,bottom-a.height)))+'px')}
function viewportChanged(){choiceAnchor=null;positionChoices()}
window.addEventListener('resize',viewportChanged);window.visualViewport?.addEventListener('resize',viewportChanged);
sheet.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null;choiceAnchor=null});
sheet.addEventListener('click',e=>{if(e.target!==sheet)return;const r=sheet.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog()});
sheet.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const a=[...sheet.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')].filter(x=>x.getClientRects().length&&(x.type!=='radio'||x.checked)),first=a[0],last=a.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}});
function navigate(screen){ui.screen=screen;closeDialog();render();scrollTo(0,0)}
function chooseGame(id,screen='live'){ui.liveExpanded=false;if(!db.games.some(g=>g.id===id))return;ui.period='all';ui.historyPeriod='all';ui.stat=null;commit(()=>{db.activeGameId=id});navigate(screen)}
function showStats(){if(!game())return navigate('home');navigate('stats')}
function showHistory(stat=null,period=ui.period){ui.stat=stat;ui.historyPeriod=period;navigate('history')}
function backGame(){navigate(game()?'live':'home')}
function render(){
 if(!game()&&['live','stats','history'].includes(ui.screen))ui.screen='home';
 $('app').dataset.screen=ui.screen;drawSave();
 for(const name of ['home','live','stats','history','menu','setup','settings','backup','reports'])$(name+'View').hidden=ui.screen!==name;
 $('menuLabel').textContent=ui.screen==='menu'?'Close':'Menu';$('settingsButton').setAttribute('aria-expanded',String(ui.screen==='menu'));
 const g=game();if(g)renderLive(g);
 if(ui.screen==='home')renderHome();if(ui.screen==='stats')renderStats();if(ui.screen==='history')renderHistory();
 if(ui.screen==='menu')renderMenu();if(ui.screen==='settings')renderSettings();if(ui.screen==='backup')renderBackup();if(ui.screen==='reports')renderReports();
}
function courtStatus(){const g=game(),active=g&&C.onCourt(g),complete=g?.status==='completed';$('courtStatus').textContent=complete?'GAME COMPLETED':active?'ON COURT · HOLD CENTER TO SUB':'ON BENCH · HOLD CENTER TO ENTER';$('courtStatus').classList.toggle('is-bench',!active||complete)}
function renderLive(g){
 const t=C.totals(g.events),active=C.onCourt(g),complete=g.status==='completed';
 $('teamName').textContent=g.team||g.player;$('opponentName').textContent=g.opponent;$('liveView').querySelector('.live-kicker').textContent='LIVE GAME · '+C.GAME_TYPES[g.gameType||'regular'];$('extraActionsLive').disabled=complete||!active;$('playerName').textContent=g.player+(g.number?' / '+g.number:'');
 $('period').textContent=C.label(g.settings.format,g.settings.current);$('periodControl').setAttribute('aria-label','Change period, currently '+$('period').textContent);
 for(const[k,v]of Object.entries({pts:t.pts,reb:t.reb,ast:t.ast,stl:t.stl}))$(k).textContent=v;
 $('core').textContent=active?'ON COURT':'ON BENCH';const center=document.querySelector('[data-action=SUB]');center.setAttribute('aria-label',complete?'Game completed':active?'On court. Hold to move to bench.':'On bench. Hold to enter game.');
 const last=g.events.at(-1);$('last').textContent=last?C.eventLabel(last):'Ready';$('lastPeriod').textContent=last?' · '+last.period.label:'';
 $('gameCompleted').hidden=!complete;courtStatus();
 document.querySelectorAll('.action').forEach(b=>b.setAttribute('aria-disabled',String(complete||b.dataset.action!=='SUB'&&!active)));
 $('liveStatsToggle').setAttribute('aria-expanded',String(ui.liveExpanded));$('liveStatsToggle').setAttribute('aria-label',(ui.liveExpanded?'Collapse':'Expand')+' secondary stats');$('liveSecondary').hidden=!ui.liveExpanded;
 const extra=$('liveSecondary');extra.replaceChildren();
 for(const[label,value,key]of [['3PT',t.m3+'/'+t.a3,'three'],['2PT',t.m2+'/'+t.a2,'two'],['FT',t.mft+'/'+t.aft,'ft'],['TO',t.to,'to'],['FOUL',t.pf,'pf'],['BLK',t.blk,'blk'],['OFF REB',t.oreb,'oreb'],['DEF REB',t.dreb,'dreb'],['TOUCH',t.touch,'touch'],['PASS',t.pass,'pass']]){const b=button('',()=>showHistory(key,'all'),'live-secondary-stat',{'aria-label':STAT_NAMES[key]+': '+value});b.append(el('strong',{},value),el('span',{},label));extra.append(b)}
}
function recentActions(){const g=game();if(!g)return;openDialog('Recent actions',box=>{
 box.append(el('p',{class:'setup-help'},'Latest five actions · tap to edit or delete.'));
 const list=el('div',{class:'recent-actions'});
 for(const e of [...g.events].slice(-5).reverse()){const b=button('',()=>eventEditor(e.id),'recent-action',{'data-recent-id':e.id,'aria-label':'Edit '+C.eventLabel(e)+' in '+e.period.label});b.append(el('strong',{},C.eventLabel(e)),el('small',{},e.period.label+' · '+new Date(e.createdAt).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'})));list.append(b)}
 if(!g.events.length)list.append(el('p',{class:'setup-help'},'No actions recorded yet.'));
 box.append(list,el('div',{class:'period-tools'},button('View all recorded plays',()=>showHistory(null,'all'),'primary'),button('Close',closeDialog,'cancel-choice')));
 })}
function record(code,options={}){const g=game();if(!g)return;if(g.status==='completed')return completedInfo();if(!['in','out'].includes(code)&&!C.onCourt(g)){closeDialog();announce('On bench — enter the game to record actions.');return}try{const e=C.newEvent(g,code,options);commit(()=>g.events.push(e),g.id);closeDialog();announce(C.eventLabel(e));sound()}catch(e){announce(e.message)}}
function act(a,anchor){if(sheet.open)return;const g=game();if(!g)return;if(g.status==='completed')return completedInfo();if(a!=='SUB'&&!C.onCourt(g)){announce('On bench — hold center to enter the game.');return}if(a==='SUB'){const code=C.onCourt(g)?'out':'in';choices('Confirm substitution',[['Confirm '+code.toUpperCase(),()=>record(code),true],['Cancel',closeDialog,false]],anchor);return}if(['FT','2PT','3PT'].includes(a)){const kind=a==='FT'?'ft':a==='2PT'?'2':'3';choices(a+' shot',[['Make',()=>record(kind+'_make'),true],['Miss',()=>record(kind+'_miss'),false],['Cancel',closeDialog,false]],anchor);return}if(a==='REBOUND'){choices('Rebound type',[['DEF',()=>record('reb_d'),true],['OFF',()=>record('reb_o'),true],['Cancel',closeDialog,false]],anchor);return}record({ASSIST:'assist',STEAL:'steal',FOUL:'foul',TURNOVER:'turnover',TOUCH:'touch',PASS:'pass'}[a])}
for(const b of document.querySelectorAll('.action')){
 const trigger=e=>{if(sheet.open)return;const r=b.getBoundingClientRect(),anchor={y:e?.detail>0?e.clientY:r.top+r.height/2};b.focus({preventScroll:true});b.classList.remove('just-tapped');void b.getBoundingClientRect();b.classList.add('just-tapped');setTimeout(()=>b.classList.remove('just-tapped'),300);act(b.dataset.action,anchor)};
 if(b.dataset.action==='SUB'){
  let timer=null,frame=null,start=null,held=false,pointer=null;
  const stop=()=>{clearTimeout(timer);cancelAnimationFrame(frame);b.classList.remove('holding','hold-ready');$('holdProgress').value=0;courtStatus()};
  const reset=()=>{held=false;start=null;pointer=null;stop()};
  b.addEventListener('pointerdown',e=>{if(sheet.open||!e.isPrimary||e.button!==0||pointer!==null||game()?.status==='completed')return;pointer=e.pointerId;start={x:e.clientX,y:e.clientY};held=false;b.setPointerCapture(e.pointerId);b.classList.add('holding');$('courtStatus').textContent='HOLD TO CHANGE COURT STATUS';const began=performance.now();const progress=now=>{$('holdProgress').value=Math.min(1,(now-began)/500);if(now-began<500)frame=requestAnimationFrame(progress)};frame=requestAnimationFrame(progress);timer=setTimeout(()=>{held=true;b.classList.add('hold-ready');$('courtStatus').textContent='READY — RELEASE TO CONFIRM'},500)});
  b.addEventListener('pointermove',e=>{if(e.pointerId===pointer&&start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>12){held=false;start=null;stop()}});
  b.addEventListener('pointerup',e=>{if(e.pointerId!==pointer)return;const confirm=held;reset();if(confirm)trigger(e)});
  b.addEventListener('pointercancel',reset);b.addEventListener('lostpointercapture',reset);b.addEventListener('contextmenu',e=>e.preventDefault());
  b.addEventListener('click',e=>{if(e.detail===0)trigger(e)});
 }else b.addEventListener('click',trigger);
 b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!e.repeat)trigger(e)}});
}
function periodSelector(){const g=game();if(!g)return;openDialog('Current period',box=>{box.append(el('p',{class:'setup-help'},'Change periods manually.'));const grid=el('div',{class:'period-grid'});for(let i=0;i<C.count(g.settings.format);i++){const name=C.label(g.settings.format,i),b=button('',()=>{commit(()=>g.settings.current=i,g.id);closeDialog();announce('Current period: '+name)},i===g.settings.current?'primary':'',{'aria-label':'Set current period to '+name,'aria-pressed':i===g.settings.current});b.append(el('strong',{},name),el('small',{},durationText(g.settings.durations[g.settings.format][i])));grid.append(b)}box.append(grid,el('div',{class:'period-tools'},button('Period setup',()=>gameForm(g.id,true)),button('Close',closeDialog,'cancel-choice')))})}
function durationText(n){const minutes=n/60;return Number.isInteger(minutes)?minutes+' min':Number(minutes.toFixed(2))+' min'}
function normalizedNewPeriods(settings){const result=C.clone(settings);result.current=0;for(const f of ['4Q','2H'])result.durations[f]=result.durations[f].map(n=>Math.max(1,Math.min(60,Math.round(n/60)))*60);return result}
function periodFields(parent,initial){
 const draft=C.clone(initial),section=el('fieldset',{class:'ng-section'}),legend=el('legend',{},'Game format'),modes=el('div',{class:'ng-formats'}),details=el('details',{class:'ng-lengths'}),summary=el('summary',{},el('span',{},'Period lengths')),summaryValue=el('span',{class:'ng-length-value'}),rows=el('div',{class:'ng-durations'});summary.append(summaryValue,el('span',{'aria-hidden':'true'},'⌄'));details.append(summary,rows);section.append(legend,modes,details,el('p',{class:'ng-help'},'Advance periods manually during the game.'));parent.append(section);
 function updateSummary(){const values=draft.durations[draft.format];summaryValue.textContent=values.every(n=>n===values[0])?durationText(values[0])+' each':'Custom'}
 const radios=[];
 for(const[f,label]of [['4Q','4 quarters (4Q)'],['2H','2 halves (2H)']]){const input=el('input',{type:'radio',name:'gameFormat',value:f,'aria-label':label}),lab=el('label',{class:'ng-format'},input,el('span',{},label.replace(/\s\(.+\)/,'')));input.checked=f===draft.format;input.addEventListener('change',()=>{if(input.checked){draft.format=f;draw()}});modes.append(lab);radios.push(input)}
 function draw(){
  rows.replaceChildren();radios.forEach(r=>r.checked=r.value===draft.format);
  for(let i=0;i<C.count(draft.format);i++){
   const name=C.label(draft.format,i),input=el('select',{'aria-label':name+' minutes'}),current=draft.durations[draft.format][i];
   for(let minute=1;minute<=60;minute++)input.append(el('option',{value:minute*60},minute+' min'));
   if(current%60||current>3600)input.append(el('option',{value:current},durationText(current)+' (saved)'));
   input.value=String(current);input.addEventListener('change',()=>{draft.durations[draft.format][i]=Number(input.value);updateSummary()});rows.append(el('label',{class:'ng-duration-row'},el('span',{},name),input));
  }updateSummary();
 }
 draw();return()=>C.validSettings({...draft,current:draft.format===initial.format?initial.current:0});
}
function formField(parent,label,value,attrs={}){const input=el('input',{class:'field-input',...attrs});input.value=value||'';parent.append(el('label',{class:'form-field'},label,input));return input}
function gameForm(id=null,periodOnly=false){
 const existing=id?db.games.find(g=>g.id===id):null;if(id&&!existing)return;
 const isNew=!id&&!periodOnly,mode=periodOnly?(existing?'period':'defaults'):existing?'edit':'new';
 if(isNew&&ui.newDraft){ui.setup=ui.newDraft;$('setupContent').replaceChildren(ui.setup.node);navigate('setup');return}
 const title={new:'New Game',edit:'Game details',period:'Period setup',defaults:'Period defaults'}[mode],returnTo=mode==='defaults'?'settings':ui.screen==='setup'?'home':ui.screen;
 const node=el('div',{class:'setup-page'}),form=el('form',{novalidate:'',id:'gameForm'}),heading=pageHeading(title,()=>navigate(returnTo==='menu'?(ui.menuReturn||'home'):returnTo));node.append(heading,form);
 const draftState={node,id,mode,finished:false};ui.setup=draftState;if(isNew)ui.newDraft=draftState;
 let player,number,team,opponent,gameType;
 if(!periodOnly){
  const playerSection=el('fieldset',{class:'ng-section'},el('legend',{},'Player')),playerFields=el('div',{class:'ng-fields'}),playerRow=el('div',{class:'ng-player-fields'});
  const field=(parent,label,value,attrs={})=>{const input=el('input',{...attrs});input.value=value||'';parent.append(el('label',{class:'ng-field'},label,input));return input};
  player=field(playerRow,'Player name',existing?.player||'',{required:'',maxlength:80,autocomplete:'off'});number=field(playerRow,'Jersey',existing?.number||'',{maxlength:8,inputmode:'numeric',autocomplete:'off','aria-label':'Jersey number'});playerFields.append(playerRow);team=field(playerFields,'Team',existing?.team||'',{maxlength:80,autocomplete:'off'});playerSection.append(playerFields);form.append(playerSection);
  const matchup=el('fieldset',{class:'ng-section'},el('legend',{},'Matchup')),fields=el('div',{class:'ng-fields'});opponent=field(fields,'Opponent',existing?.opponent||'',{required:'',maxlength:80,autocomplete:'off'});
  gameType=el('select',{'aria-label':'Game type'});for(const[value,label]of Object.entries(C.GAME_TYPES))gameType.append(el('option',{value},label));gameType.value=existing?.gameType||'regular';fields.append(el('label',{class:'ng-field'},'Game type',gameType));matchup.append(fields);form.append(matchup);
 }
 const initial=existing?.settings||(isNew?normalizedNewPeriods(db.prefs.periods):C.clone(db.prefs.periods)),readPeriods=periodFields(form,initial),openedRevision=existing?.revision;
 if(existing)form.append(el('p',{class:'ng-help'},'Earlier plays keep their recorded periods.'));
 const error=el('p',{class:'setup-error',role:'alert'}),actions=el('div',{class:'ng-form-footer'}),save=button(isNew?'Start Game':'Save changes',()=>{},'ng-start',{type:'submit'});actions.append(error,save);form.append(actions);
 if(existing&&!periodOnly)form.append(button(existing.status==='completed'?'Reopen game':'End game',()=>{existing.status==='completed'?reopenGame(id):endGame(id)},'setup-game-status'));
 form.addEventListener('input',()=>error.textContent='');form.addEventListener('change',()=>error.textContent='');
 form.addEventListener('submit',e=>{
  e.preventDefault();error.textContent='';try{
   const settings=readPeriods(),current=id?db.games.find(g=>g.id===id):null;if(id&&(!current||current.revision!==openedRevision))throw Error('This game changed. Reopen its details before saving.');
   if(!periodOnly){if(!player.value.trim()){player.focus();throw Error('Enter the player name.')}if(!opponent.value.trim()){opponent.focus();throw Error('Enter the opponent name.')}}
   const meta=periodOnly?null:{player:player.value.trim(),number:number.value.trim(),team:team.value.trim(),opponent:opponent.value.trim(),gameType:gameType.value,date:existing?.date||localDate()};
   if(meta)C.newGame(meta,settings);
   const before=db,candidate=C.clone(db);let created;
   if(isNew){created=C.newGame(meta,settings);candidate.games.push(created);candidate.activeGameId=created.id}
   else if(id){const target=candidate.games.find(g=>g.id===id);if(meta)Object.assign(target,meta);target.settings=settings;target.updatedAt=C.now();target.revision++;candidate.activeGameId=id}
   candidate.prefs.periods={...C.clone(settings),current:0};db=candidate;
   if(!persist()){db=before;drawSave();error.textContent='The game was not '+(isNew?'started':'updated')+'. '+saveError;return}
   draftState.finished=true;ui.setup=null;if(isNew){ui.newDraft=null;ui.period='all';ui.historyPeriod='all';ui.stat=null;ui.liveExpanded=false;navigate('live');announce('Game started')}
   else{navigate(mode==='defaults'?'settings':game()?'live':'home');announce('Game settings saved')}
  }catch(err){error.textContent=err.message}
 });
 $('setupContent').replaceChildren(node);navigate('setup');
}

function renderHome(){const root=$('homeContent');root.replaceChildren(el('div',{class:'view-title'},el('h1',{},'Games'),el('p',{},'Record a game. Follow the progress.')));if(recoveryRaw)root.append(el('div',{class:'notice error-notice'},el('p',{},saveError),button('Download recovery copy',()=>download(recoveryRaw,'GameTrace_recovery.txt','text/plain'))));
 const unfinished=db.games.filter(g=>g.status==='in_progress').sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),resume=unfinished.find(g=>g.id===db.activeGameId)||unfinished[0];
 if(resume){root.append(el('article',{class:'resume-card'},el('span',{class:'eyebrow'},'CONTINUE YOUR GAME'),el('h2',{},resume.player+' vs '+resume.opponent),el('p',{},friendlyDate(resume.date)+' · '+C.label(resume.settings.format,resume.settings.current)+' · '+(C.onCourt(resume)?'ON COURT':'ON BENCH')),el('small',{},'Last saved '+shortSaved(resume)),button('Resume game',()=>chooseGame(resume.id),'primary wide',{'data-resume':resume.id})))}
 if(!db.games.length)root.append(el('div',{class:'empty-card'},el('h2',{},'Ready for the next game?'),el('p',{},'Start with a player, opponent, and period setup.'),button('New game',()=>gameForm(),'primary wide')));
 for(const g of [...db.games].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))){const t=C.totals(g.events),card=el('article',{class:'game-card','data-game-id':g.id},el('div',{class:'card-heading'},el('h2',{},g.opponent),el('span',{class:'status-chip'},g.status==='completed'?'Completed':'In progress')),el('p',{},g.player+(g.number?' · #'+g.number:'')+' · '+C.GAME_TYPES[g.gameType||'regular']+' · '+friendlyDate(g.date)),el('div',{class:'game-summary'},t.pts+' PTS · '+t.reb+' REB · '+t.ast+' AST'),el('div',{class:'card-actions'},button(g.status==='completed'?'Review':'Resume',()=>chooseGame(g.id,g.status==='completed'?'stats':'live'),'primary'),button('History',()=>{chooseGame(g.id,'history');ui.historyPeriod='all';ui.stat=null;renderHistory()}),button('Details',()=>gameForm(g.id))));root.append(card)}
}
function periodFilter(g,value,onChange){const bar=el('div',{class:'period-filter',role:'group','aria-label':'Stats period filter'});for(const p of [{key:'all',label:'Game'},...C.periodOptions(g)])bar.append(button(p.label,()=>onChange(p.key),value===p.key?'selected':'',{'aria-pressed':value===p.key,'data-period-filter':p.key}));return bar}
const STAT_NAMES={pts:'Points',reb:'Rebounds',oreb:'Offensive rebounds',dreb:'Defensive rebounds',ast:'Assists',to:'Turnovers',stl:'Steals',blk:'Blocks',pf:'Fouls',fg:'Field goals',two:'2PT shots',three:'3PT shots',ft:'Free throws',touch:'Touches',pass:'Passes',drive:'Drives',deflection:'Deflections',defstop:'Defensive stops',boxout:'Box-outs'};
function statCard(label,value,key,sub=''){return button('',()=>showHistory(key,ui.period),'stat-card',{'aria-label':STAT_NAMES[key]+': '+value}).appendChild(el('div',{},el('span',{class:'stat-label'},label),el('strong',{},value),sub?el('small',{},sub):null)).parentElement}
function renderStats(){const g=game();if(!g)return;const valid=['all',...C.periodOptions(g).map(p=>p.key)];if(!valid.includes(ui.period))ui.period='all';const t=C.totals(C.filtered(g,ui.period)),root=$('statsContent');root.replaceChildren(el('div',{class:'view-title'},el('h1',{},'Reports'),el('p',{},g.player+' · vs '+g.opponent+' · '+C.GAME_TYPES[g.gameType||'regular'])),el('div',{class:'layer-tabs',role:'group','aria-label':'Stats layer'},button('Primary',()=>{ui.layer='primary';renderStats()},ui.layer==='primary'?'selected':'',{'aria-pressed':ui.layer==='primary'}),button('Secondary',()=>{ui.layer='secondary';renderStats()},ui.layer==='secondary'?'selected':'',{'aria-pressed':ui.layer==='secondary'})),periodFilter(g,ui.period,p=>{ui.period=p;renderStats()}));
 if(ui.layer==='primary'){
  root.append(el('div',{class:'stat-grid main-stats'},statCard('PTS',t.pts,'pts'),statCard('REB',t.reb,'reb','OFF '+t.oreb+' · DEF '+t.dreb),statCard('AST',t.ast,'ast'),statCard('TO',t.to,'to')));
  root.append(el('div',{class:'stat-grid defense-stats'},statCard('STL',t.stl,'stl'),statCard('BLK',t.blk,'blk'),statCard('FOULS',t.pf,'pf')));
  const table=el('table',{class:'shooting-table'},el('caption',{},'Shooting'),el('thead',{},el('tr',{},el('th',{scope:'col'},'Shot'),el('th',{scope:'col'},'Made / Att.'),el('th',{scope:'col'},'%')))),body=el('tbody');
  for(const[label,m,a,key]of[['FG',t.fgm,t.fga,'fg'],['3PT',t.m3,t.a3,'three'],['2PT',t.m2,t.a2,'two'],['FT',t.mft,t.aft,'ft']])body.append(el('tr',{},el('th',{scope:'row'},button(label,()=>showHistory(key,ui.period))),el('td',{},button(m+' / '+a,()=>showHistory(key,ui.period), '',{'aria-label':label+' '+m+' made from '+a+' attempts'})),el('td',{},C.pctText(m,a))));table.append(body);root.append(table);
 }else{
  root.append(el('div',{class:'stat-grid activity-stats'},...Object.entries({touch:'TOUCHES',pass:'PASSES',drive:'DRIVES',deflection:'DEFLECTIONS',defstop:'DEF STOPS',boxout:'BOX-OUTS'}).map(([key,label])=>statCard(label,t[key],key))));
  const detail=el('section',{class:'detail-panel'},el('h2',{},'Turnover detail'));for(const[key,name]of Object.entries(C.REASONS))detail.append(button('',()=>showHistory('to:'+key,ui.period),'detail-row').appendChild(el('span',{},name,el('b',{},t.turnovers[key]))).parentElement);root.append(detail);
 }
 root.append(el('p',{class:'view-note'},'Tap a stat to review its recorded plays.'));
}
function renderHistory(){const g=game();if(!g)return;const valid=['all',...C.periodOptions(g).map(p=>p.key)];if(!valid.includes(ui.historyPeriod))ui.historyPeriod='all';const title=ui.stat?.startsWith('to:')?C.REASONS[ui.stat.slice(3)]+' turnovers':STAT_NAMES[ui.stat]||'Recorded plays',root=$('historyContent');root.replaceChildren(el('div',{class:'view-title'},el('h1',{},title),el('p',{},g.player+' · vs '+g.opponent)),periodFilter(g,ui.historyPeriod,p=>{ui.historyPeriod=p;renderHistory()}));if(ui.stat)root.append(button('Show all action types',()=>{ui.stat=null;renderHistory()},'small-tool'));
 const events=C.statEvents(g,ui.stat,ui.historyPeriod);root.append(el('p',{class:'view-note'},events.length+' recorded '+(events.length===1?'play':'plays')+' · newest entries first'));
 if(!events.length)root.append(el('div',{class:'empty-card'},el('p',{},'No matching plays recorded.'),button('Add missed play',()=>eventEditor(null),'primary')));
 for(const e of [...events].reverse()){const b=button('',()=>eventEditor(e.id),'event-row',{'data-event-id':e.id,'aria-label':'Edit '+C.eventLabel(e)+' in '+e.period.label});b.append(el('span',{class:'event-period'},e.period.label),el('span',{class:'event-info'},el('strong',{},C.eventLabel(e)),e.turnoverType&&e.turnoverType!=='offensive_foul'?el('small',{},C.REASONS[e.turnoverType]):null,e.note?el('small',{},e.note):null),el('span',{class:'event-edit'},'Edit'));root.append(b)}
}
function eventEditor(id=null){const g=game();if(!g)return;const original=id?g.events.find(e=>e.id===id):null;if(id&&!original)return;
 openDialog(original?'Edit recorded play':'Add missed play',box=>{
 const form=el('form',{novalidate:'',id:'eventForm'}),action=el('select',{class:'field-input','aria-label':'Action'}),outcome=el('select',{class:'field-input','aria-label':'Outcome'}),reason=el('select',{class:'field-input','aria-label':'Turnover type'}),period=el('select',{class:'field-input','aria-label':'Play period'}),note=el('textarea',{class:'field-input',maxlength:300,rows:2,'aria-label':'Play note'});
 const types=[['3','3PT shot'],['2','2PT shot'],['ft','Free throw'],['reb','Rebound'],['assist','Assist'],['steal','Steal'],['block','Block'],['foul','Foul'],['turnover','Turnover'],['touch','Touch'],['pass','Pass'],['drive','Drive'],['deflection','Deflection'],['defstop','Defensive stop'],['boxout','Box-out'],['highlight','Highlight'],['in','IN'],['out','OUT']];for(const[v,l]of types)action.append(el('option',{value:v},l));
 for(const[v,l]of Object.entries(C.REASONS))reason.append(el('option',{value:v},l));
 const current=original?.code||({pts:'2_make',reb:'reb_d',ast:'assist',to:'turnover',stl:'steal',blk:'block',pf:'foul',two:'2_make',three:'3_make',ft:'ft_make'}[ui.stat]||'2_make');
 if(original&&!types.some(([v])=>v===current)&&!/^([23]|ft|reb)_/.test(current))action.append(el('option',{value:current},C.LABELS[current]));
 action.value=current.startsWith('2_')?'2':current.startsWith('3_')?'3':current.startsWith('ft_')?'ft':current.startsWith('reb_')?'reb':current;
 const outcomeWrap=el('label',{class:'form-field'},'Outcome',outcome),reasonWrap=el('label',{class:'form-field'},'Turnover type',reason);
 const options=C.periodOptions(g);for(const p of options)period.append(el('option',{value:p.key},p.label));period.value=original?C.periodKey(original.period):(ui.historyPeriod!=='all'?ui.historyPeriod:g.settings.format+':'+g.settings.current);
 note.value=original?.note||'';reason.value=original?.turnoverType||'unspecified';
 const drawOutcome=()=>{outcome.replaceChildren();const a=action.value;outcomeWrap.hidden=!['2','3','ft','reb','foul'].includes(a);reasonWrap.hidden=a!=='turnover';if(['2','3','ft'].includes(a)){outcome.append(el('option',{value:'make'},'Made'),el('option',{value:'miss'},'Missed'))}else if(a==='reb'){outcome.append(el('option',{value:'d'},'Defensive'),el('option',{value:'o'},'Offensive'))}else if(a==='foul'){outcome.append(el('option',{value:'personal'},'Personal foul'),el('option',{value:'offensive'},'Offensive foul + turnover'))}};
 action.addEventListener('change',drawOutcome);drawOutcome();if(original){if(/_(make|miss)$/.test(original.code))outcome.value=original.code.split('_')[1];if(original.code.startsWith('reb_'))outcome.value=original.code.slice(4)}
 form.append(el('label',{class:'form-field'},'Action',action),outcomeWrap,reasonWrap,el('label',{class:'form-field'},'Period',period),el('label',{class:'form-field'},'Optional note',note));
 const error=el('p',{class:'setup-error',role:'alert'}),actions=el('div',{class:'form-actions'},button('Cancel',closeDialog,'cancel-choice'),button(original?'Save changes':'Add play',()=>{},'primary',{type:'submit'}));form.append(error,actions);box.append(form);
 form.addEventListener('submit',e=>{e.preventDefault();try{let code=action.value,type=reason.value;if(['2','3','ft'].includes(code))code+='_'+outcome.value;else if(code==='reb')code+='_'+outcome.value;else if(code==='foul'&&outcome.value==='offensive'){code='turnover';type='offensive_foul'}const candidate=C.newEvent(g,code,{turnoverType:type,note:note.value,period:period.value});if(original){candidate.id=original.id;candidate.createdAt=original.createdAt;if(C.periodKey(original.period)===period.value)candidate.period=C.clone(original.period)}commit(()=>{if(original)g.events[g.events.findIndex(x=>x.id===id)]=candidate;else g.events.push(candidate)},g.id);closeDialog();announce(original?'Play updated':'Play added')}catch(err){error.textContent=err.message}});
 if(original){const confirm=el('div',{class:'inline-delete',hidden:''},el('p',{},'Delete this recorded play?'),button('Keep play',()=>confirm.hidden=true),button('Delete play',()=>{commit(()=>g.events=g.events.filter(e=>e.id!==id),g.id);closeDialog();announce('Play deleted')},'danger'));box.append(button('Delete this play',()=>confirm.hidden=false,'danger wide delete-start'),confirm)}
 })}
function completedInfo(){openDialog('Game completed',box=>box.append(el('p',{class:'setup-help'},'Review or correct its history, or reopen the game to record more plays.'),el('div',{class:'period-tools'},button('Review history',()=>showHistory(null,'all'),'primary'),button('Reopen game',reopenGame),button('Close',closeDialog,'cancel-choice'))))}
function endGame(id=null){const g=typeof id==='string'?db.games.find(g=>g.id===id):game();if(!g)return;choices('End this game?',[['End game',()=>{commit(()=>{g.status='completed';g.completedAt=C.now();db.activeGameId=g.id;if(ui.setup?.id===g.id)ui.setup.finished=true},g.id);ui.period='all';navigate('stats');announce('Game completed')},true],['Cancel',closeDialog,false]])}
function reopenGame(id=null){const g=typeof id==='string'?db.games.find(g=>g.id===id):game();if(!g)return;commit(()=>{g.status='in_progress';g.completedAt=null;db.activeGameId=g.id;if(ui.setup?.id===g.id)ui.setup.finished=true},g.id);navigate('live');announce('Game reopened')}
    function syncControllerAssets(){
      const ink=getComputedStyle($('app')).color;
      for(const image of document.querySelectorAll('.gt-controller-asset')){
        const svg=atob(image.dataset.asset).replace(/stroke="currentColor"/g,'stroke="'+ink+'"').replace(/stroke-width="2"/g,'stroke-width="1.9"');
        image.setAttribute('href','data:image/svg+xml;base64,'+btoa(svg));
      }
    }

const THEME_KEY='gametrace_appearance';
let appearance='courtside';
function applyAppearance(value){appearance=value==='day'?'day':'courtside';document.documentElement.dataset.theme=appearance;$('app').dataset.appearance=appearance==='day'?'light':'dark';document.querySelector('meta[name="theme-color"]').content=appearance==='day'?'#f7f8f5':'#101211';syncControllerAssets()}
try{applyAppearance(localStorage.getItem(THEME_KEY))}catch{applyAppearance('courtside')}
function setAppearance(value){applyAppearance(value);try{localStorage.setItem(THEME_KEY,appearance)}catch{announce('Appearance changed for this session; device storage is unavailable.')}settings()}
const MENU_ICON_DATA={"plus": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 12h14\"/><path d=\"M12 5v14\"/></svg>", "menu": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 5h16\"/><path d=\"M4 12h16\"/><path d=\"M4 19h16\"/></svg>", "circle-play": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z\"/><circle cx=\"12\" cy=\"12\" r=\"10\"/></svg>", "layers": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z\"/><path d=\"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12\"/><path d=\"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17\"/></svg>", "chart-no-axes-combined": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 16v5\"/><path d=\"M16 14v7\"/><path d=\"M20 10v11\"/><path d=\"m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15\"/><path d=\"M4 18v3\"/><path d=\"M8 14v7\"/></svg>", "archive": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect width=\"20\" height=\"5\" x=\"2\" y=\"3\" rx=\"1\"/><path d=\"M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8\"/><path d=\"M10 12h4\"/></svg>", "settings-2": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M14 17H5\"/><path d=\"M19 7h-9\"/><circle cx=\"17\" cy=\"17\" r=\"3\"/><circle cx=\"7\" cy=\"7\" r=\"3\"/></svg>"};
function menuIcon(name){const icon=el('span',{class:'menu-icon','aria-hidden':'true'});icon.innerHTML=MENU_ICON_DATA[name]||'';return icon}
function pageHeading(title,back=backGame){return el('div',{class:'page-heading'},button('←',back,'page-back',{'aria-label':'Back'}),el('h1',{},title))}
function openMenu(){if(ui.screen==='menu')return navigate(ui.menuReturn||'home');ui.menuReturn=ui.screen;navigate('menu')}
function renderMenu(){
 const root=$('menuContent'),g=game();root.replaceChildren(el('div',{class:'view-title'},el('h1',{},'Menu')));
 const quick=button('',()=>gameForm(),'menu-new-game');quick.append(menuIcon('plus'),el('span',{},'New Game'));root.append(quick);
 const nav=el('nav',{class:'main-navigation','aria-label':'Main navigation'});
 for(const[title,icon,target,fn]of [['Live Game','circle-play','live',()=>navigate('live')],['Games','layers','home',()=>navigate('home')],['Reports','chart-no-axes-combined','stats',()=>navigate(g?'stats':'reports')],['Backup & Export','archive','backup',()=>navigate('backup')],['Settings','settings-2','settings',()=>navigate('settings')]]){
  const b=button('',fn,title==='Settings'?'navigation-settings':'',{'data-navigation':title}),label=el('span',{},title);if(title==='Live Game')label.append(el('small',{},g?g.player+' · vs '+g.opponent:'No active game'));b.append(menuIcon(icon),label,el('span',{'aria-hidden':'true'},'›'));b.disabled=title==='Live Game'&&!g;if(ui.menuReturn===target)b.setAttribute('aria-current','page');nav.append(b);
 }root.append(nav);
}
function settings(){navigate('settings')}
function renderSettings(){
 const root=$('settingsContent');root.replaceChildren(pageHeading('Settings',()=>navigate('menu')));
 const section=el('section',{class:'settings-section'},el('h2',{},'Appearance')),appearanceGroup=el('div',{class:'appearance-options',role:'group','aria-label':'Appearance'});
 for(const[value,label]of [['courtside','Courtside · Dark'],['day','Day Game · Light']])appearanceGroup.append(button(label,()=>setAppearance(value),'',{'aria-pressed':appearance===value,'data-appearance':value}));section.append(appearanceGroup);root.append(section);
 const soundSection=el('section',{class:'settings-section'},el('h2',{},'Sound')),soundButton=button('Sound '+(db.prefs.sound?'On':'Off'),()=>{commit(()=>db.prefs.sound=!db.prefs.sound);if(db.prefs.sound)sound()},'settings-row',{'aria-pressed':db.prefs.sound});soundSection.append(soundButton);root.append(soundSection);
 root.append(el('section',{class:'settings-section'},el('h2',{},'Game defaults'),button('Period defaults',()=>gameForm(null,true),'settings-row'),el('p',{class:'view-note'},'Choose the starting format and period lengths for new games.')));
}
function dataMenu(){navigate('backup')}
function renderBackup(){
 const root=$('backupContent');root.replaceChildren(pageHeading('Backup & Export',()=>navigate('menu')),el('p',{class:'view-note'},'JSON backups keep all games and plays. CSV exports are for analysis.'));
 const backups=el('section',{class:'settings-section'},el('h2',{},'Backups'),button('Export backup (JSON)',exportBackup,'settings-row'),button('Import backup',()=>$('importInput').click(),'settings-row'));
 const exports=el('section',{class:'settings-section'},el('h2',{},'Spreadsheet exports'),button('Export stats (CSV)',()=>download(C.statsCSV(db),'GameTrace_stats.csv','text/csv'),'settings-row'),button('Export plays (CSV)',()=>download(C.eventsCSV(db),'GameTrace_plays.csv','text/csv'),'settings-row'));root.append(backups,exports);
 if(recoveryRaw)root.append(button('Download recovery copy',()=>download(recoveryRaw,'GameTrace_recovery.txt','text/plain'),'settings-row'));
}
function renderReports(){const root=$('reportsContent');root.replaceChildren(pageHeading('Reports',()=>navigate('menu')));if(!db.games.length){root.append(el('p',{class:'view-note'},'Start a game to review its stats.'),button('New Game',()=>gameForm(),'primary wide'));return}for(const g of [...db.games].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)))root.append(button(g.player+' · vs '+g.opponent,()=>chooseGame(g.id,'stats'),'settings-row'))}
function extraActions(){const g=game();if(!g)return;openDialog('More actions',box=>{const grid=el('div',{class:'menu-grid'});for(const[code,label]of [['drive','Drive'],['defstop','Def Stop'],['block','Block'],['deflection','Deflection'],['boxout','Box-out'],['highlight','Highlight']]){const b=button(label,()=>record(code));b.disabled=g.status==='completed'||!C.onCourt(g);grid.append(b)}box.append(grid,button('Close',closeDialog,'cancel-choice wide'))})}

function download(content,name,type){const url=URL.createObjectURL(new Blob([content],{type})),a=el('a',{href:url,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),20000)}
function exportBackup(){download(JSON.stringify(C.backup(db),null,2),'GameTrace_backup_'+localDate()+'.json','application/json')}
function importPreview(imported){const existing=new Set(db.games.map(g=>g.id)),fresh=imported.games.filter(g=>!existing.has(g.id));openDialog('Import backup',box=>{
 box.append(el('p',{class:'setup-help'},imported.games.length+' games in this backup. '+fresh.length+' new games. Existing game IDs are kept unchanged when importing new games.'));
 const add=button('Import '+fresh.length+' new '+(fresh.length===1?'game':'games'),()=>{commit(()=>{db.games.push(...C.clone(fresh));if(!db.activeGameId)db.activeGameId=fresh[0]?.id||null});navigate('home');announce('New games imported')},'primary wide');add.disabled=!fresh.length;box.append(add,button('Restore entire backup',()=>restorePreview(imported),'danger wide delete-start'),el('div',{class:'period-tools'},button('Cancel',closeDialog,'cancel-choice')));
 })}
function restorePreview(imported){openDialog('Replace saved library?',box=>{box.append(el('p',{class:'setup-help'},'This replaces '+db.games.length+' current games with '+imported.games.length+' games from the backup. Download the current backup first.'),el('div',{class:'period-tools'},button('Download current backup & restore',()=>{exportBackup();db=C.clone(imported);persist(true);ui.period='all';ui.historyPeriod='all';ui.stat=null;navigate('home');announce(saveState==='Saved'?'Backup restored':'Restored in memory — not saved')},'danger'),button('Cancel',()=>importPreview(imported),'cancel-choice')))})}
async function importFile(file){try{if(file.size>100*1024*1024)throw Error('This backup is too large to open.');const parsed=C.readBackup(JSON.parse(await file.text()));importPreview(parsed)}catch(e){openDialog('Backup not imported',box=>box.append(el('p',{class:'setup-help'},e.message||'This file could not be read.'),button('Close',closeDialog,'wide')))}}
function saveDetails(){openDialog('Saving status',box=>{box.append(el('p',{class:'setup-help'},saveState==='Not saved'?saveError:'Your games are saved on this device. Use a JSON backup to keep a separate copy.'),el('div',{class:'period-tools'},button('Retry saving',()=>{persist();render();if(saveState==='Saved')closeDialog()},'primary'),button('Export backup',exportBackup),button(saveState==='Not saved'?'Export changes & load saved':'Load saved library',()=>{try{if(saveState==='Not saved')exportBackup();const raw=localStorage.getItem(C.KEY);if(!raw)throw Error('No saved library found.');db=C.validDB(JSON.parse(raw));baseRevision=db.revision;recoveryRaw=null;saveState='Saved';saveError='';ui.screen='home';closeDialog();render()}catch(e){announce(e.message)}}),button('Close',closeDialog,'cancel-choice')))} )}
$('brandHome').addEventListener('click',()=>navigate('home'));$('periodControl').addEventListener('click',periodSelector);$('settingsButton').addEventListener('click',openMenu);$('retrySave').addEventListener('click',()=>{persist();render()});$('saveStatus').addEventListener('click',saveDetails);
$('gameDetailsLive').addEventListener('click',()=>{const g=game();if(g)gameForm(g.id)});$('extraActionsLive').addEventListener('click',extraActions);
$('homeNew').addEventListener('click',()=>gameForm());$('statsBack').addEventListener('click',backGame);$('statsHistory').addEventListener('click',()=>showHistory(null,ui.period));$('historyBack').addEventListener('click',backGame);$('historyAdd').addEventListener('click',()=>eventEditor());$('completedReview').addEventListener('click',()=>showHistory(null,'all'));
$('lastAction').addEventListener('click',recentActions);$('liveStatsToggle').addEventListener('click',()=>{ui.liveExpanded=!ui.liveExpanded;renderLive(game())});
$('importInput').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';if(f)importFile(f)});
window.addEventListener('storage',e=>{if(e.key!==C.KEY||!e.newValue)return;try{const updated=C.validDB(JSON.parse(e.newValue));if(updated.revision===baseRevision)return;if(saveState==='Saved'&&!sheet.open&&!(ui.setup&&!ui.setup.finished)&&ui.screen!=='settings'){if(updated.games.some(g=>g.id===db.activeGameId))updated.activeGameId=db.activeGameId;db=updated;baseRevision=db.revision;render()}else{saveState='Not saved';saveError='Saved data changed in another window. Export these changes or load the saved library.';drawSave()}}catch{}});
load();
})();
