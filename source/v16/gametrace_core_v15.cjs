(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GameTraceCore=api})(globalThis,()=>{
'use strict';
const GAME_TYPES=Object.freeze({regular:'Regular',playoffs:'Playoffs',finals:'Finals'});
const VERSION=11,KEY='gametrace_saved_games_v11';
const LABELS={'2_make':'2PT Made','2_miss':'2PT Missed','3_make':'3PT Made','3_miss':'3PT Missed',ft_make:'FT Made',ft_miss:'FT Missed',reb_o:'Offensive rebound',reb_d:'Defensive rebound',assist:'Assist',steal:'Steal',block:'Block',foul:'Foul',turnover:'Turnover',touch:'Touch',pass:'Pass',drive:'Drive',deflection:'Deflection',defstop:'Defensive stop',boxout:'Box-out',highlight:'Highlight',in:'IN',out:'OUT'};
Object.assign(LABELS,{kickout:'Kick-out',paint:'Paint touch',fouldrawn:'Foul drawn',contest:'Good contest',beaten:'Beaten',inbound:'Inbound'});
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
 return{id:uid(),player:text(meta.player,80,true),number:text(meta.number||'',8),team:text(meta.team||'',80),opponent:text(meta.opponent,80,true),gameType,date,status:'in_progress',createdAt:now(),updatedAt:now(),completedAt:null,revision:0,settings:validSettings({...settings,current:0}),events:[]};
}
function newEvent(g,code,opts={}){
 if(!Object.hasOwn(LABELS,code))fail('Choose a valid action.');
 const reason=code==='turnover'?(opts.turnoverType||'unspecified'):null;if(reason&&!Object.hasOwn(REASONS,reason))fail('Invalid turnover type.');
 return{id:uid(),code,turnoverType:reason,note:text(opts.note||'',300),createdAt:now(),updatedAt:now(),period:snapshot(g,opts.period)};
}
function eventLabel(e){return e.code==='turnover'&&e.turnoverType==='offensive_foul'?'Offensive foul + TO':LABELS[e.code]}
function onCourt(g){return [...g.events].reverse().find(e=>e.code==='in'||e.code==='out')?.code==='in'}
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
 return{id:text(e.id,120,true),code:e.code,turnoverType:reason,note:text(e.note||'',300),createdAt:timestamp(e.createdAt),updatedAt:timestamp(e.updatedAt||e.createdAt),period:{format:f,number:n,label:label(f,n-1),configuredDurationSeconds:e.period.configuredDurationSeconds}};
}
function validGame(g){
 if(!g||!['in_progress','completed'].includes(g.status)||!Array.isArray(g.events)||g.events.length>100000)fail('Invalid saved game.');
 const base=newGame({player:g.player,number:g.number||'',team:g.team||'',opponent:g.opponent,date:g.date,gameType:g.gameType},g.settings),events=g.events.map(validEvent);
 if(new Set(events.map(e=>e.id)).size!==events.length)fail('Duplicate play IDs in backup.');
 return{...base,id:text(g.id,120,true),status:g.status,createdAt:timestamp(g.createdAt),updatedAt:timestamp(g.updatedAt),completedAt:g.completedAt?timestamp(g.completedAt):null,revision:Number.isInteger(g.revision)&&g.revision>=0?g.revision:0,settings:validSettings(g.settings),events,...(g.legacy?{legacy:clone(g.legacy)}:{})};
}
function validDB(d){
 if(!d||d.version!==VERSION||!Array.isArray(d.games)||d.games.length>10000)fail('Unsupported or invalid saved library.');
 const games=d.games.map(validGame);if(new Set(games.map(g=>g.id)).size!==games.length)fail('Duplicate game IDs in backup.');
 return{version:VERSION,revision:Number.isInteger(d.revision)&&d.revision>=0?d.revision:0,updatedAt:d.updatedAt?timestamp(d.updatedAt):null,activeGameId:games.some(g=>g.id===d.activeGameId)?d.activeGameId:null,prefs:{sound:d.prefs?.sound===true,periods:d.prefs?.periods?validSettings(d.prefs.periods):defaults()},games};
}
function blankDB(){return{version:VERSION,revision:0,updatedAt:null,activeGameId:null,prefs:{sound:false,periods:defaults()},games:[]}}
function legacyBackup(input){
 const codeMap={to:'turnover',reb_o:'reb_o',reb_d:'reb_d'};
 const games=input.games.map(old=>{
  const settings=defaults();const pi=/^Q([1-4])$/.exec(old.period||'Q1');settings.current=pi?Number(pi[1])-1:0;
  const created=old.created||now();const game=newGame({player:old.player||'Georgina',number:old.number||'',team:old.team||'',opponent:old.opponent||'Imported game',date:new Date(created).toISOString().slice(0,10)},settings);
  game.id=String(old.id);game.createdAt=created;game.updatedAt=old.events?.at(-1)?.at||created;game.settings=settings;game.legacy=clone(old);
  if(!Array.isArray(old.events))fail('Invalid legacy game.');
  game.events=old.events.map(e=>{const code=codeMap[e.code]||e.code;if(!Object.hasOwn(LABELS,code))fail('Legacy backup includes an unsupported action: '+e.code);const m=/^Q([1-4])$/.exec(e.period||'Q1');if(!m)fail('Legacy overtime records require conversion before import.');const x=newEvent(game,code,{note:e.note||'',period:'4Q:'+(Number(m[1])-1)});x.id=String(e.id);x.createdAt=e.at||created;x.updatedAt=x.createdAt;return x});
  return game;
 });return validDB({version:VERSION,games,activeGameId:null,prefs:{sound:false,periods:defaults()}});
}
function readBackup(input){if(!input||input.format!=='GameTraceBackup'||!Array.isArray(input.games))fail('This is not a GameTrace backup.');if(input.version===4)return legacyBackup(input);if(input.version!==VERSION)fail('Unsupported backup version.');return validDB(input)}
function backup(db){return{format:'GameTraceBackup',...clone(db),exportedAt:now()}}
function csv(rows){return '\ufeff'+rows.map(row=>row.map(v=>{let s=String(v??'');if(/^\s*[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}).join(',')).join('\r\n')}
function statsCSV(db){const rows=[['game_id','date','player','number','team','opponent','status','period','points','2pm','2pa','2p_pct','3pm','3pa','3p_pct','ftm','fta','ft_pct','fgm','fga','fg_pct','oreb','dreb','reb','ast','stl','blk','fouls','turnovers','touches','passes','drives','deflections','defensive_stops','box_outs','game_type']];for(const g of db.games)for(const p of [{key:'all',label:'Game'},...periodOptions(g)]){const t=totals(filtered(g,p.key));rows.push([g.id,g.date,g.player,g.number,g.team,g.opponent,g.status,p.label,t.pts,t.m2,t.a2,pct(t.m2,t.a2),t.m3,t.a3,pct(t.m3,t.a3),t.mft,t.aft,pct(t.mft,t.aft),t.fgm,t.fga,pct(t.fgm,t.fga),t.oreb,t.dreb,t.reb,t.ast,t.stl,t.blk,t.pf,t.to,t.touch,t.pass,t.drive,t.deflection,t.defstop,t.boxout,g.gameType||'regular'])}return csv(rows)}
function eventsCSV(db){const rows=[['game_id','date','player','opponent','event_id','period','period_length_seconds','action','turnover_type','note','recorded_at','updated_at','game_type']];for(const g of db.games)for(const e of g.events)rows.push([g.id,g.date,g.player,g.opponent,e.id,e.period.label,e.period.configuredDurationSeconds,eventLabel(e),e.turnoverType||'',e.note,e.createdAt,e.updatedAt,g.gameType||'regular']);return csv(rows)}
return Object.freeze({VERSION,KEY,GAME_TYPES,LABELS,REASONS,uid,now,clone,count,label,periodKey,defaults,validSettings,snapshot,newGame,newEvent,eventLabel,onCourt,periodOptions,filtered,totals,pct,pctText,statEvents,validDB,blankDB,readBackup,backup,statsCSV,eventsCSV});
});
