(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GameTraceCore=api})(globalThis,()=>{
'use strict';
const GAME_TYPES=Object.freeze({regular:'Regular',playoffs:'Playoffs',finals:'Finals'});
const VERSION=12,KEY='gametrace_saved_games_v12',PREVIOUS_KEY='gametrace_saved_games_v11';
const LABELS={'2_make':'2PT Made','2_miss':'2PT Missed','3_make':'3PT Made','3_miss':'3PT Missed',ft_make:'FT Made',ft_miss:'FT Missed',reb_o:'Offensive rebound',reb_d:'Defensive rebound',assist:'Assist',steal:'Steal',block:'Block',foul:'Foul',turnover:'Turnover',touch:'Touch',pass:'Pass',drive:'Drive',deflection:'Deflection',defstop:'Defensive stop',boxout:'Box-out',highlight:'Highlight',in:'IN',out:'OUT'};
Object.assign(LABELS,{kickout:'Kick-out',paint:'Paint touch',fouldrawn:'Foul drawn',contest:'Good contest',beaten:'Beaten',inbound:'Inbound'});
Object.assign(LABELS,{game_start:'Game Start',game_end:'Game End',period_start:'Period Start',period_end:'Period End',in:'Player In',out:'Player Out'});
const REASONS={bad_pass:'Bad pass',ball_handling:'Ball handling',violation:'Violation',offensive_foul:'Offensive foul',unspecified:'Unspecified'};
const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
const now=()=>new Date().toISOString();
const clone=o=>JSON.parse(JSON.stringify(o));
const count=f=>f==='4Q'?4:2;
const label=(f,i)=>(f==='4Q'?'Q':'H')+(i+1);
const periodKey=p=>p.format+':'+(p.number-1);
const defaults=()=>({version:1,format:'4Q',current:0,durations:{'4Q':[480,480,480,480],'2H':[1200,1200]}});
function fail(msg){throw new Error(msg)}
function text(v,max=100,required=false){if(typeof v!=='string'||v.length>max||required&&!v.trim())fail('Invalid text field.');return v.trim()}
function timestamp(v){if(typeof v!=='string'||!Number.isFinite(Date.parse(v)))fail('Invalid saved date.');return v}
function validSettings(s){
 if(!s||!['4Q','2H'].includes(s.format)||!Number.isInteger(s.current)||s.current<0||s.current>=count(s.format))fail('Invalid period setup.');
 const d={};for(const f of ['4Q','2H']){if(!Array.isArray(s.durations?.[f])||s.durations[f].length!==count(f)||s.durations[f].some(n=>!Number.isInteger(n)||n<1||n>7200))fail('Invalid period duration.');d[f]=[...s.durations[f]]}
 return{version:1,format:s.format,current:s.current,durations:d};
}
function snapshot(g,key){const [f,n]=(key||g.settings.format+':'+g.settings.current).split(':'),i=Number(n);if(!['4Q','2H'].includes(f)||!Number.isInteger(i)||i<0||i>=count(f))fail('Invalid period.');return{format:f,number:i+1,label:label(f,i),configuredDurationSeconds:g.settings.durations[f][i]}}
function newGame(meta,settings=defaults()){
 const gameType=meta.gameType===undefined?'regular':meta.gameType;if(!Object.hasOwn(GAME_TYPES,gameType))fail('Choose a valid game type.');
 const date=text(meta.date,10,true);if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)fail('Choose a valid game date.');
 return{id:uid(),player:text(meta.player,80,true),number:text(meta.number||'',8),team:text(meta.team||'',80),league:text(meta.league||'',80),opponent:text(meta.opponent,80,true),gameType,date,status:'in_progress',createdAt:now(),updatedAt:now(),completedAt:null,revision:0,settings:validSettings({...settings,current:0}),events:[]};
}
function newEvent(g,code,opts={}){
 if(!Object.hasOwn(LABELS,code))fail('Choose a valid action.');
 const reason=code==='turnover'?(opts.turnoverType||'unspecified'):null;if(reason&&!Object.hasOwn(REASONS,reason))fail('Invalid turnover type.');
 return{id:uid(),code,turnoverType:reason,note:text(opts.note||'',300),createdAt:now(),updatedAt:now(),period:snapshot(g,opts.period)};
}
function eventLabel(e){return e.code==='period_start'?e.period.label+' Start':e.code==='period_end'?e.period.label+' End':e.code==='turnover'&&e.turnoverType==='offensive_foul'?'Offensive foul + TO':LABELS[e.code]}
function onCourt(g){return rawOnCourt(g)&&g.status!=='completed'&&(!g.timingVersion||periodActive(g))}
function periodOptions(g){const formats=[g.settings.format,...new Set(g.events.map(e=>e.period.format).filter(f=>f!==g.settings.format))];return formats.flatMap(f=>Array.from({length:count(f)},(_,i)=>({key:f+':'+i,label:label(f,i),seconds:g.settings.durations[f][i]})))}
function filtered(g,period='all'){return period==='all'?g.events:g.events.filter(e=>periodKey(e.period)===period)}
function totals(events){
 const t={pts:0,m2:0,a2:0,m3:0,a3:0,mft:0,aft:0,fgm:0,fga:0,oreb:0,dreb:0,reb:0,ast:0,stl:0,blk:0,pf:0,to:0,touch:0,pass:0,drive:0,deflection:0,defstop:0,boxout:0,turnovers:{bad_pass:0,ball_handling:0,violation:0,offensive_foul:0,unspecified:0}};
 for(const e of events){const c=e.code;
  if(c==='2_make'||c==='2_miss'){t.a2++;if(c==='2_make'){t.m2++;t.pts+=2}}
  if(c==='3_make'||c==='3_miss'){t.a3++;if(c==='3_make'){t.m3++;t.pts+=3}}
  if(c==='ft_make'||c==='ft_miss'){t.aft++;if(c==='ft_make'){t.mft++;t.pts++}}
  if(c==='reb_o')t.oreb++;if(c==='reb_d')t.dreb++;
  for(const[k,v]of Object.entries({assist:'ast',steal:'stl',block:'blk',foul:'pf',touch:'touch',pass:'pass',drive:'drive',deflection:'deflection',defstop:'defstop',boxout:'boxout'}))if(c===k)t[v]++;
  if(c==='turnover'){t.to++;const reason=e.turnoverType||'unspecified';t.turnovers[reason]++;if(reason==='offensive_foul')t.pf++}
 }
 t.fgm=t.m2+t.m3;t.fga=t.a2+t.a3;t.reb=t.oreb+t.dreb;return t;
}
function pct(m,a){return a?Math.round(m/a*1000)/10:null}
function pctText(m,a){const p=pct(m,a);return p===null?'—':p+'%'}
function statEvents(g,key,period='all'){
 const map={pts:['2_make','3_make','ft_make'],fg:['2_make','2_miss','3_make','3_miss'],two:['2_make','2_miss'],three:['3_make','3_miss'],ft:['ft_make','ft_miss'],reb:['reb_o','reb_d'],oreb:['reb_o'],dreb:['reb_d'],ast:['assist'],stl:['steal'],blk:['block'],to:['turnover'],touch:['touch'],pass:['pass'],drive:['drive'],deflection:['deflection'],defstop:['defstop'],boxout:['boxout']};
 return filtered(g,period).filter(e=>!key||key==='all'||key==='pf'&&(e.code==='foul'||e.code==='turnover'&&e.turnoverType==='offensive_foul')||key.startsWith('to:')&&e.code==='turnover'&&(e.turnoverType||'unspecified')===key.slice(3)||map[key]?.includes(e.code));
}
function validEvent(e){
 if(!e||!Object.hasOwn(LABELS,e.code)||!e.period)fail('Invalid saved play.');
 const f=e.period.format,n=e.period.number;if(!['4Q','2H'].includes(f)||!Number.isInteger(n)||n<1||n>count(f)||!Number.isInteger(e.period.configuredDurationSeconds)||e.period.configuredDurationSeconds<1||e.period.configuredDurationSeconds>7200)fail('Invalid play period.');
 const reason=e.code==='turnover'?(e.turnoverType||'unspecified'):null;if(reason&&!Object.hasOwn(REASONS,reason))fail('Invalid turnover type.');
 return{id:text(e.id,120,true),code:e.code,turnoverType:reason,note:text(e.note||'',300),createdAt:timestamp(e.createdAt),occurredAt:timestamp(e.occurredAt||e.createdAt),order:Number.isFinite(e.order)?e.order:0,updatedAt:timestamp(e.updatedAt||e.createdAt),period:{format:f,number:n,label:label(f,n-1),configuredDurationSeconds:e.period.configuredDurationSeconds}};
}
function validGame(g){
 if(!g||!['in_progress','completed'].includes(g.status)||!Array.isArray(g.events)||g.events.length>100000)fail('Invalid saved game.');
 const base=newGame({player:g.player,number:g.number||'',team:g.team||'',league:g.league||'',opponent:g.opponent,date:g.date,gameType:g.gameType},g.settings),events=g.events.map(validEvent);
 if(new Set(events.map(e=>e.id)).size!==events.length)fail('Duplicate play IDs in backup.');
 let finalScore=null;if(g.finalScore!==undefined&&g.finalScore!==null){if(!Number.isInteger(g.finalScore.team)||!Number.isInteger(g.finalScore.opponent)||g.finalScore.team<0||g.finalScore.opponent<0||g.finalScore.team>9999||g.finalScore.opponent>9999)fail('Invalid final score.');finalScore={team:g.finalScore.team,opponent:g.finalScore.opponent}}
 return{...base,id:text(g.id,120,true),status:g.status,createdAt:timestamp(g.createdAt),updatedAt:timestamp(g.updatedAt),completedAt:g.completedAt?timestamp(g.completedAt):null,revision:Number.isInteger(g.revision)&&g.revision>=0?g.revision:0,settings:validSettings(g.settings),events,finalScore,timingVersion:g.timingVersion===1?1:0,autoEnded:g.autoEnded===true,...(g.legacy?{legacy:clone(g.legacy)}:{})};
}
function validDB(d){
 if(!d||![11,VERSION].includes(d.version)||!Array.isArray(d.games)||d.games.length>10000)fail('Unsupported or invalid saved library.');
 const games=d.games.map(validGame);if(new Set(games.map(g=>g.id)).size!==games.length)fail('Duplicate game IDs in backup.');
 return{version:VERSION,revision:Number.isInteger(d.revision)&&d.revision>=0?d.revision:0,updatedAt:d.updatedAt?timestamp(d.updatedAt):null,activeGameId:games.some(g=>g.id===d.activeGameId)?d.activeGameId:null,prefs:{sound:d.prefs?.sound===true,nudge:d.prefs?.nudge===true,periods:d.prefs?.periods?validSettings(d.prefs.periods):defaults()},games};
}
function blankDB(){return{version:VERSION,revision:0,updatedAt:null,activeGameId:null,prefs:{sound:false,nudge:false,periods:defaults()},games:[]}}
function legacyBackup(input){
 const codeMap={to:'turnover',reb_o:'reb_o',reb_d:'reb_d'};
 const games=input.games.map(old=>{
  const settings=defaults();const pi=/^Q([1-4])$/.exec(old.period||'Q1');settings.current=pi?Number(pi[1])-1:0;
  const created=old.created||now();const game=newGame({player:old.player||'Georgina',number:old.number||'',team:old.team||'',opponent:old.opponent||'Imported game',date:new Date(created).toISOString().slice(0,10)},settings);
  game.id=String(old.id);game.createdAt=created;game.updatedAt=old.events?.at(-1)?.at||created;game.settings=settings;game.legacy=clone(old);
  if(!Array.isArray(old.events))fail('Invalid legacy game.');
  game.events=old.events.map(e=>{const code=codeMap[e.code]||e.code;if(!Object.hasOwn(LABELS,code))fail('Legacy backup includes an unsupported action: '+e.code);const m=/^Q([1-4])$/.exec(e.period||'Q1');if(!m)fail('Legacy overtime records require conversion before import.');const x=newEvent(game,code,{note:e.note||'',period:'4Q:'+(Number(m[1])-1)});x.id=String(e.id);x.createdAt=e.at||created;x.updatedAt=x.createdAt;return x});
  return game;
 });return validDB({version:VERSION,games,activeGameId:null,prefs:{sound:false,nudge:false,periods:defaults()}});
}
function readBackup(input){if(!input||input.format!=='GameTraceBackup'||!Array.isArray(input.games))fail('This is not a GameTrace backup.');if(input.version===4)return legacyBackup(input);if(![11,VERSION].includes(input.version))fail('Unsupported backup version.');return validDB(input)}
function backup(db){return{format:'GameTraceBackup',...clone(db),exportedAt:now()}}
function csv(rows){return '\ufeff'+rows.map(row=>row.map(v=>{let s=String(v??'');if(/^\s*[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}).join(',')).join('\r\n')}
function statsCSV(db){const rows=[['game_id','date','player','number','team','opponent','status','period','points','2pm','2pa','2p_pct','3pm','3pa','3p_pct','ftm','fta','ft_pct','fgm','fga','fg_pct','oreb','dreb','reb','ast','stl','blk','fouls','turnovers','touches','passes','drives','deflections','defensive_stops','box_outs','game_type','court_elapsed_seconds','period_elapsed_seconds','timing_complete','team_score','opponent_score','league']];for(const g of db.games)for(const p of [{key:'all',label:'Game'},...periodOptions(g)]){const t=totals(filtered(g,p.key));rows.push([g.id,g.date,g.player,g.number,g.team,g.opponent,g.status,p.label,t.pts,t.m2,t.a2,pct(t.m2,t.a2),t.m3,t.a3,pct(t.m3,t.a3),t.mft,t.aft,pct(t.mft,t.aft),t.fgm,t.fga,pct(t.fgm,t.fga),t.oreb,t.dreb,t.reb,t.ast,t.stl,t.blk,t.pf,t.to,t.touch,t.pass,t.drive,t.deflection,t.defstop,t.boxout,g.gameType||'regular',p.key==='all'?elapsed(g).courtSeconds:null,p.key==='all'?elapsed(g).periodSeconds:null,p.key==='all'?elapsed(g).known:null,g.finalScore?.team,g.finalScore?.opponent,g.league||''])}return csv(rows)}
function eventsCSV(db){const rows=[['game_id','date','player','opponent','event_id','period','period_length_seconds','action','turnover_type','note','recorded_at','updated_at','game_type','occurred_at','order','league']];for(const g of db.games)for(const e of g.events)rows.push([g.id,g.date,g.player,g.opponent,e.id,e.period.label,e.period.configuredDurationSeconds,eventLabel(e),e.turnoverType||'',e.note,e.createdAt,e.updatedAt,g.gameType||'regular',occurred(e),e.order||0,g.league||'']);return csv(rows)}
/* V16 chronological records: creation provenance stays immutable; occurredAt is editable. */
const occurred=e=>e.occurredAt||e.createdAt;
const isBoundary=e=>['game_start','game_end','period_start','period_end'].includes(typeof e==='string'?e:e.code);
function eventCompare(g,a,b){const index=e=>e.code==='game_start'?-1:e.code==='game_end'?100:periodOptions(g).findIndex(p=>p.key===periodKey(e.period));return index(a)-index(b)||Date.parse(occurred(a))-Date.parse(occurred(b))||(a.order||0)-(b.order||0)}
function ordered(g){return [...g.events].sort((a,b)=>eventCompare(g,a,b))}
function sortEvents(g){g.events=ordered(g)}
function rawOnCourt(g,until=Infinity){return [...g.events].filter(e=>['in','out'].includes(e.code)&&Date.parse(occurred(e))<=until).sort((a,b)=>Date.parse(occurred(a))-Date.parse(occurred(b))||(a.order||0)-(b.order||0)).at(-1)?.code==='in'}
function periodActive(g,key=g.settings.format+':'+g.settings.current){return g.events.some(e=>e.code==='period_start'&&periodKey(e.period)===key)&&!g.events.some(e=>e.code==='period_end'&&periodKey(e.period)===key)}
function appendEvent(g,code,{at=now(),...opts}={}){const e=newEvent(g,code,opts);e.occurredAt=timestamp(at);e.order=Math.max(0,...g.events.map(x=>x.order||0))+1;g.events.push(e);sortEvents(g);return e}
function startGame(g,at=now()){g.timingVersion=1;appendEvent(g,'game_start',{at});appendEvent(g,'period_start',{at});return g}
function startPeriod(g,key,at=now()){if(g.events.some(e=>e.code==='period_start'&&periodKey(e.period)===key))fail('This period has already started.');if(g.timingVersion&&g.events.some(e=>e.code==='period_start'&&periodActive(g,periodKey(e.period))))fail('End the current period first.');const e=appendEvent(g,'period_start',{period:key,at});g.settings.current=e.period.number-1;g.settings.format=e.period.format;return e}
function endPeriod(g,key=g.settings.format+':'+g.settings.current,at=now()){if(g.events.some(e=>e.code==='period_end'&&periodKey(e.period)===key))fail('This period has already ended.');const start=g.events.find(e=>e.code==='period_start'&&periodKey(e.period)===key);if(start&&Date.parse(at)<Date.parse(occurred(start)))fail('Period End must follow Period Start.');return appendEvent(g,'period_end',{period:key,at})}
function finishGame(g,{at=now(),score=g.finalScore||null,automatic=false}={}){if(g.status==='completed')return;if(!automatic){const key=g.settings.format+':'+g.settings.current;if(periodActive(g,key))endPeriod(g,key,at)}if(!g.events.some(e=>e.code==='game_end'))appendEvent(g,'game_end',{at,note:automatic?'Automatically completed 24 hours after start. Correct timing if needed.':''});g.status='completed';g.completedAt=at;g.finalScore=score;g.autoEnded=automatic;sortEvents(g)}
function expireGames(db,at=now()){let changed=0;const time=Date.parse(at);for(const g of db.games){const start=g.events.find(e=>e.code==='game_start'),began=Date.parse(start?occurred(start):g.createdAt),deadline=began+86400000;if(g.status==='in_progress'&&time>=deadline){finishGame(g,{at:new Date(deadline).toISOString(),automatic:true});g.updatedAt=at;g.revision++;changed++}}return changed}
function elapsed(g,at=now()){
 const gs=g.events.find(e=>e.code==='game_start'),ge=g.events.find(e=>e.code==='game_end');let known=!!gs&&(!g.autoEnded)&&(g.status!=='completed'||!!ge),court=0,total=0,segments=0;const problems=[];
 if(!gs)problems.push('Game Start missing');if(g.autoEnded)problems.push('Automatically ended; verify timing');if(g.status==='completed'&&!ge)problems.push('Game End missing');
 const startLimit=gs?Date.parse(occurred(gs)):-Infinity,endLimit=ge?Date.parse(occurred(ge)):Date.parse(at),subs=g.events.filter(e=>['in','out'].includes(e.code)).sort((a,b)=>Date.parse(occurred(a))-Date.parse(occurred(b))||(a.order||0)-(b.order||0));
 for(const p of periodOptions(g)){const start=g.events.find(e=>e.code==='period_start'&&periodKey(e.period)===p.key),end=g.events.find(e=>e.code==='period_end'&&periodKey(e.period)===p.key),hasRecords=g.events.some(e=>!['game_start','game_end'].includes(e.code)&&periodKey(e.period)===p.key);if(!start){if(hasRecords){known=false;problems.push(p.label+' Start missing')}continue}let b=end?Date.parse(occurred(end)):g.status==='in_progress'&&p.key===g.settings.format+':'+g.settings.current?Date.parse(at):null;if(b===null){known=false;problems.push(p.label+' End missing');continue}const a=Math.max(startLimit,Date.parse(occurred(start)));b=Math.min(endLimit,b);if(b<a){known=false;problems.push(p.label+' timing invalid');continue}segments++;total+=(b-a)/1000;let on=false,last=a;for(const sub of subs){const t=Date.parse(occurred(sub));if(t<a){on=sub.code==='in';continue}if(t>b)break;if(on)court+=(t-last)/1000;last=t;on=sub.code==='in'}if(on)court+=(b-last)/1000;
 }if(!segments)known=false;const share=known?(total?Math.min(1,Math.max(0,court/total)):0):null;return{known,courtSeconds:known?court:null,periodSeconds:known?total:null,share,visualShare:known?share:.5,problems:[...new Set(problems)]};
}
function eventBounds(g,e){let low=-Infinity,high=Infinity;for(const x of g.events){if(x.id===e.id)continue;const t=Date.parse(occurred(x));if(x.code==='game_start')low=Math.max(low,t);if(x.code==='game_end')high=Math.min(high,t);if(!isBoundary(e)&&periodKey(x.period)===periodKey(e.period)){if(x.code==='period_start')low=Math.max(low,t);if(x.code==='period_end')high=Math.min(high,t)}}return{low,high}}
function validateRecord(g,e){timestamp(occurred(e));const others=g.events.filter(x=>x.id!==e.id),same=others.filter(x=>periodKey(x.period)===periodKey(e.period)),t=Date.parse(occurred(e));if(isBoundary(e)&&others.some(x=>x.code===e.code&&(e.code.startsWith('game_')||periodKey(x.period)===periodKey(e.period))))fail('That boundary already exists. Edit its timestamp instead.');if(e.code==='game_start'&&others.some(x=>Date.parse(occurred(x))<t))fail('Game Start must precede the other records.');if(e.code==='game_end'&&others.some(x=>Date.parse(occurred(x))>t))fail('Game End must follow the other records.');if(e.code==='period_start'&&same.some(x=>!x.code.startsWith('game_')&&Date.parse(occurred(x))<t))fail('Period Start must precede its plays.');if(e.code==='period_end'&&same.some(x=>!x.code.startsWith('game_')&&Date.parse(occurred(x))>t))fail('Period End must follow its plays.');if(!e.code.startsWith('game_')){const{low,high}=eventBounds(g,e);if(t<low||t>high)fail('Keep this timestamp inside its game and period boundaries.')}for(const x of others){if(x.period.format!==e.period.format)continue;if(e.code==='period_start'&&x.code==='period_end'&&x.period.number<e.period.number&&Date.parse(occurred(x))>t)fail('This start must follow earlier periods.');if(e.code==='period_end'&&x.code==='period_start'&&x.period.number>e.period.number&&Date.parse(occurred(x))<t)fail('This end must precede later periods.')}return true}
function correctTimestamp(g,e){if(isBoundary(e))return false;const {low,high}=eventBounds(g,e);if(low>high)fail('Correct the period boundaries first.');const t=Date.parse(occurred(e)),adjusted=Math.min(high,Math.max(low,t));e.occurredAt=new Date(adjusted).toISOString();return adjusted!==t}
function saveEvent(g,e){validateRecord(g,e);if(isBoundary(e))g.autoEnded=false;const index=g.events.findIndex(x=>x.id===e.id);if(index<0)g.events.push(e);else g.events[index]=e;sortEvents(g);const end=g.events.find(x=>x.code==='game_end');if(end&&g.status==='completed')g.completedAt=occurred(end)}
function moveEvent(g,id,targetId,after=false){const original=g.events.find(e=>e.id===id),target=g.events.find(e=>e.id===targetId);if(!original||!target||id===targetId)return null;const candidate=clone(original),list=ordered(g).filter(e=>e.id!==id),index=list.findIndex(e=>e.id===targetId)+(after?1:0),before=list[index-1],next=list[index];if(!isBoundary(candidate))candidate.period=clone(target.period);const a=before?Date.parse(occurred(before)):Date.parse(occurred(next))-2000,b=next?Date.parse(occurred(next)):a+2000;candidate.occurredAt=new Date(Math.round((a+b)/2)).toISOString();candidate.order=before&&next&&a===b?((before.order||0)+(next.order||0))/2:(original.order||0);candidate.updatedAt=now();correctTimestamp(g,candidate);saveEvent(g,candidate);return candidate}
return Object.freeze({VERSION,KEY,PREVIOUS_KEY,GAME_TYPES,LABELS,REASONS,uid,now,clone,count,label,periodKey,defaults,validSettings,snapshot,newGame,newEvent,eventLabel,onCourt,periodOptions,filtered,totals,pct,pctText,statEvents,validDB,blankDB,readBackup,backup,statsCSV,eventsCSV,occurred,isBoundary,eventCompare,ordered,sortEvents,rawOnCourt,periodActive,appendEvent,startGame,startPeriod,endPeriod,finishGame,expireGames,elapsed,eventBounds,validateRecord,correctTimestamp,saveEvent,moveEvent});
});
