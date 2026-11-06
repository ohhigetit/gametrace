/* V44 presentation refinements: compact custom columns and two neutral-text banners.
 * No stored game, training, sync or backup schema changes.
 */
const scoreboardColumns44=['Game','PTS','FG%','3PT','2PT','FT','REB','AST','STL','TO','PF','MIN','W/L','Final score'];
const scoreboardColumnsKey44='gametrace_scoreboard_columns_v44';
const scoreboardModeKey44='gametrace_scoreboard_mode_v44';
function readScoreboardChoice44(key,fallback){
  try { const value=localStorage.getItem(key);return value===null?fallback:JSON.parse(value); }
  catch {return fallback}
}
function saveScoreboardChoice44(key,value){
  try{localStorage.setItem(key,JSON.stringify(value))}catch{}
}
function normalizeColumns44(value){
  if(!Array.isArray(value))return scoreboardColumns44.slice();
  return ['Game',...scoreboardColumns44.slice(1).filter(x=>value.includes(x))];
}
let scoreboardVisible44=normalizeColumns44(readScoreboardChoice44(scoreboardColumnsKey44,scoreboardColumns44));
let scoreboardStatsOpen44=false;
const savedMode44=readScoreboardChoice44(scoreboardModeKey44,'total');
if(savedMode44==='total'||savedMode44==='average')scoreboard40.average=savedMode44==='average';
function whole44(value){
  return Number.isFinite(value)?String(Math.round(value)):'—';
}
function totalStats44(rows){
  const sum=k=>rows.reduce((n,r)=>n+(Number(r.t[k])||0),0);
  const known=rows.filter(r=>r.time.known);
  const shooting=(makes,attempts)=>{
    const m=sum(makes),a=sum(attempts);
    return {makes:m,attempts:a,rate:a?whole44(100*m/a)+'%':'—'};
  };
  return {sum,known,shooting};
}
function metric44(label,value){
  return el('div',{class:'v44-metric'},el('strong',{},String(value)),el('small',{},label));
}
function updateScoreboardBanner44(){
  const root=$('reportsContent'),banner=root?.querySelector('.scoreboard-banner');
  if(!banner||ui.screen!=='reports')return;
  const rows=filteredReports(),average=scoreboard40.average,n=rows.length;
  const {sum,known,shooting}=totalStats44(rows);
  const value=k=>average?(n?whole44(sum(k)/n):'—'):whole44(sum(k));
  const shot=(m,a)=>shooting(m,a);
  const fg=shot('fgm','fga'),three=shot('m3','a3'),two=shot('m2','a2'),ft=shot('mft','aft');
  const record=rows.reduce((acc,r)=>{const v=gameResult40(r.g);if(v==='W')acc.w++;else if(v==='L')acc.l++;else if(v==='D')acc.d++;return acc},{w:0,l:0,d:0});
  const subtitle=n+' '+(n===1?'game':'games')+' · '+record.w+'W – '+record.l+'L'+(record.d?' · '+record.d+'D':'');
  const metric=k=>value(k);
  const main=el('div',{class:'v44-banner-main'},
    el('span',{class:'v44-kicker'},average?'Average Points':'Total Points'),
    el('strong',{class:'v44-banner-big'},metric('pts')),
    el('small',{class:'v44-banner-note'},subtitle));
  const supporting=el('div',{class:'v44-banner-side'},
    metric44('FG%',fg.rate),metric44('REB',metric('reb')),
    metric44('AST',metric('ast')),metric44('STL',metric('stl')));
  const modes=el('div',{class:'v44-segments',role:'group','aria-label':'Scoreboard totals or average'});
  for(const [id,label]of [['total','Totals'],['average','Average']]){
    modes.append(button(label,()=>{
      scoreboardStatsOpen44=!!banner.querySelector('details[data-summary-all-stats]')?.open;
      scoreboard40.average=id==='average';
      saveScoreboardChoice44(scoreboardModeKey44,id);
      updateScoreboardBanner44();
    },'v44-mode',{'data-mode':id,'aria-pressed':(id==='average')===average}));
  }
  const header=el('div',{class:'v44-banner-head'},
    el('div',{},el('h2',{},'Your Games'),el('p',{class:'v44-banner-subtitle'},'Your performance at a glance.')),modes);
  const columns=el('div',{class:'v44-banner-columns'},main,supporting);
  const details=el('details',{class:'v44-banner-details','data-summary-all-stats':''},
    el('summary',{},'All Statistics',el('span',{'aria-hidden':'true'},'⌄')));
  details.open=scoreboardStatsOpen44;
  details.addEventListener('toggle',()=>{if(details.isConnected)scoreboardStatsOpen44=details.open});
  const entries=[
    ['Shooting','FG',fg],['Shooting','3PT',three],['Shooting','2PT',two],['Shooting','FT',ft],
    ['Rebounds','Offensive rebounds',metric('oreb')],['Rebounds','Defensive rebounds',metric('dreb')],
    ['Defense','Blocks',metric('blk')],['Defense','Deflections',metric('deflection')],['Defense','Defensive stops',metric('defstop')],
    ['Defense','Box outs',metric('boxout')],['Activity','Touches',metric('touch')],['Activity','Passes',metric('pass')],['Activity','Drives',metric('drive')],
    ['Other','Turnovers',metric('to')],['Other','Personal fouls',metric('pf')]
  ];
  const tm=known.reduce((sec,r)=>sec+r.time.courtSeconds,0);
  entries.push(['Other','Minutes played',known.length?elapsedText(tm/(average?known.length:1)):'—']);
  const body=el('div',{class:'v44-extra-grid'});
  for(const [group,label,v] of entries){
    let shown=v;
    if(v&&typeof v==='object'){
      const count=average&&n?whole44(v.makes/n)+'/'+whole44(v.attempts/n):v.makes+'/'+v.attempts;
      shown=count+' · '+v.rate;
    }
    body.append(el('div',{class:'v44-extra-stat'},el('span',{},label),el('strong',{},String(shown))));
  }
  details.append(body);
  banner.classList.add('v44-banner');
  banner.replaceChildren(header,columns,details);
}
function columnControls44(){
  const root=$('reportsContent'),filters=root?.querySelector('[data-game-filters]');
  if(!filters||ui.screen!=='reports')return;
  const section=el('fieldset',{class:'v44-column-filter'},el('legend',{},'Display Columns'));
  section.append(el('p',{class:'v44-column-help'},'Choose the statistics in the table. Game stays visible.'));
  const actions=el('div',{class:'v44-column-actions'});
  const choose=cols=>{
    scoreboardVisible44=normalizeColumns44(cols);
    saveScoreboardChoice44(scoreboardColumnsKey44,scoreboardVisible44);
    renderReports();
  };
  actions.append(
    button('Select All',()=>choose(scoreboardColumns44),'family-link'),
    button('Clear Selection',()=>choose(['Game']),'family-link'),
    button('Reset to Default',()=>choose(scoreboardColumns44),'family-link'));
  section.append(actions);
  const options=el('div',{class:'v44-column-options'});
  for(const name of scoreboardColumns44){
    const check=el('input',{type:'checkbox','aria-label':'Show '+name+' column'});
    check.checked=scoreboardVisible44.includes(name);
    if(name==='Game')check.disabled=true;
    else check.addEventListener('change',()=>{
      const next=new Set(scoreboardVisible44);
      if(check.checked)next.add(name);else next.delete(name);
      choose([...next]);
    });
    options.append(el('label',{},check,el('span',{},name)));
  }
  section.append(options);
  (filters.querySelector('.reports-filters')||filters).append(section);
}
function visibleTable44(){
  const root=$('reportsContent'),table=root?.querySelector('.reports-table');
  if(!table||ui.screen!=='reports'||!table.tHead?.rows.length)return;
  const names=[...table.tHead.rows[0].cells].map(c=>c.textContent.trim());
  const indices=names.map((name,i)=>scoreboardVisible44.includes(name)?i:-1).filter(i=>i>=0);
  // Source columns may change in future. Always preserve the Game cell.
  if(!indices.includes(0))indices.unshift(0);
  table.querySelector('colgroup')?.remove();
  const colgroup=el('colgroup');
  const first=indices.length===1?100:Math.min(39,Math.max(25,100/indices.length*3));
  const available=100-first;
  const unit=indices.length===1?0:available/(indices.length-1);
  const widths=indices.map((i,j)=>j===0?first:unit);
  const allIndices=Array.from({length:names.length},(_,i)=>i);
  allIndices.forEach(i=>colgroup.append(el('col',{style:'width:'+(indices.includes(i)?widths[indices.indexOf(i)].toFixed(4):'0')+'%'})));
  table.prepend(colgroup);
  for(const row of table.querySelectorAll('tr')){
    [...row.cells].forEach((cell,i)=>{
      if(row.cells.length!==names.length)return;
      const visible=indices.includes(i);
      cell.hidden=!visible;
      if(!visible)cell.style.display='none';
      else cell.style.removeProperty('display');
    });
  }
  table.classList.add('v44-column-table');
  const wrapper=table.closest('.reports-table-scroll');
  wrapper?.classList.add('v44-column-scroll');
  // Keep the cloned sticky header exactly in sync with the selected columns.
  reportsStickyCleanup?.();reportsStickyCleanup=null;
  if(typeof installReportsHeader==='function'){
    reportsStickyCleanup=installReportsHeader(root);
    const copy=root.querySelector('.reports-floating-header .reports-table');
    if(copy){
      copy.classList.add('v43-full-width-table','v44-column-table');
      [...copy.tHead.rows[0].cells].forEach((cell,i)=>{
        if(!indices.includes(i)){cell.hidden=true;cell.style.display='none';}
      });
    }
  }
}
function enhanceScoreboard44(){
  if(ui.screen!=='reports'||reportsState.compare)return;
  columnControls44();
  updateScoreboardBanner44();
  visibleTable44();
}
const reportsBefore44Enhancements=renderReports;
renderReports=function(){reportsBefore44Enhancements();enhanceScoreboard44()};

function enhanceGymBanner44(){
  if(ui.screen!=='training'||trainingUI.editing)return;
  const root=$('trainingContent'),banner=root?.querySelector('[data-gym-work]');
  if(!banner)return;
  const all=(db.trainingSessions||[]).filter(s=>!s.deletedAt&&s.date<=localDate()&&(!trainingUI.player||T.playerKey(s.player)===T.playerKey(trainingUI.player)));
  const weeks=trainingUI.range==='all'?null:Number(trainingUI.range);
  const from=weeks===null?'0000-01-01':weeks===1?T.week(localDate()):(()=>{
    const d=new Date(T.week(localDate())+'T12:00:00');d.setDate(d.getDate()-(weeks-1)*7);return T.dateKey(d);
  })();
  const sessions=all.filter(s=>s.date>=from);
  const minutes=type=>sessions.filter(s=>!type||s.type===type).reduce((n,s)=>n+(Number(s.minutes)||0),0);
  const summary=T.summarize(all);
  const title=el('div',{class:'v44-banner-head'},
    el('div',{},el('h2',{},'Your Training'),el('p',{class:'v44-banner-subtitle'},'The work behind the game.')));
  const left=el('div',{class:'v44-banner-main'},
    el('span',{class:'v44-kicker'},'Total Training'),
    el('strong',{class:'v44-banner-big'},whole44(minutes()/60),el('span',{class:'v44-banner-unit'},'HRS')),
    el('small',{class:'v44-banner-note'},weeks===null?'All completed work':sessions.length+' '+(sessions.length===1?'session':'sessions')+' in selected range'));
  const weekStart=T.week(localDate());
  const thisWeek=all.filter(s=>s.date>=weekStart).length;
  const side=el('div',{class:'v44-banner-side'},
    metric44('Sessions',sessions.length),metric44('Training HRS',whole44(minutes('training')/60)),
    metric44('Camp HRS',whole44(minutes('camp')/60)),metric44('Week Streak',summary.current));
  banner.classList.add('v44-banner');
  banner.replaceChildren(title,el('div',{class:'v44-banner-columns'},left,side));
}
const trainingBefore44Enhancements=renderTraining;
renderTraining=function(){trainingBefore44Enhancements();enhanceGymBanner44()};
