/* V42: approved UI refinements and family-only, read-only live feed. */
const subtitles42={court:'Keep showing up. Your work adds up.',home:'Every game is part of your story.',stats:'Look back. Learn. Take it forward.',reports:'See how your games add up.',training:'Put in the work. Build your game.',session:'What you practiced. What you learned.',goals:'Choose your focus. Take the next step.',notebook:'Notice it. Write it. Grow from it.',prayer:'Take a moment before you begin.',commitment:'What you choose to bring, every day.',schedule:'Know what’s next. Show up ready.',trophies:'Recognize the effort. Celebrate the milestones.',family:'One family. A shared journey.',backup:'Keep a copy. Pick up where you left off.'};
const playerScope42=syncPlayerScope;
syncPlayerScope=function(){playerScope42();if(!playerContext.player){const names=courtPlayers();playerContext.player=names.find(p=>T.playerKey(p)==='georgina')||(names.length===1?names[0]:'Georgina');applyPlayerContext()}};
function titleAction42(root,button){const header=root?.querySelector('.page-heading,.view-title');if(!header||!button)return;header.classList.add('v42-title-actions');button.classList.add('v42-title-action');header.append(button)}
const styleBefore42=stylePage43;
stylePage43=function(root,screen){styleBefore42(root,screen);if(!root)return;const header=root.querySelector('.page-heading,.view-title'),title=header?.querySelector('h1');if(title&&!title.querySelector('[data-page-icon]')){const icon=menuIcon(pageIcons43[screen]||'layers');icon.dataset.pageIcon='';title.prepend(icon)}
 root.querySelectorAll(':scope>.review-subtitle,:scope>.v42-subtitle,:scope>.training-kicker,.training-toolbar>.training-kicker,.view-title>p').forEach(n=>n.remove());
 let subtitle=subtitles42[screen];if(screen==='setup')subtitle=ui.setup?.mode==='new'?'Set it up now. Start when play begins.':'';if(screen==='training'&&trainingUI.editing||screen==='goals'&&journeyUI.editing)subtitle='';
 if(header&&subtitle)header.after(el('p',{class:'v42-subtitle'},subtitle));
 if(screen==='court'&&title){const icon=title.querySelector('[data-page-icon]');title.replaceChildren(...(icon?[icon]:[]),document.createTextNode('Georgina’s Home Court'))}
 if(screen==='training'&&!trainingUI.editing)titleAction42(root,root.querySelector('[data-log-session]'));
 if(screen==='goals'&&!journeyUI.editing)titleAction42(root,[...root.querySelectorAll('button')].find(b=>/^\+?\s*New goal$/i.test(b.textContent)));
 if(screen==='notebook')titleAction42(root,[...root.querySelectorAll('button')].find(b=>b.textContent==='Add Note'));
 if(screen==='schedule')titleAction42(root,[...root.querySelectorAll('button')].find(b=>b.textContent==='Add Event'));
 if(screen==='stats')titleAction42(root,[...root.querySelectorAll('.report-heading button')].find(b=>b.textContent==='Scoreboard'));
 root.querySelectorAll('.training-toolbar').forEach(n=>{if(!n.textContent.trim()&&!n.querySelector('button,input,select'))n.remove()});
};
function dockFilters42(line,details){const summary=details.querySelector('summary');if(summary)summary.hidden=true;const trigger=button('Filters',()=>{details.open=!details.open;trigger.setAttribute('aria-expanded',String(details.open))},'family-link',{'aria-expanded':details.open,'data-filter-trigger':''}),previous=details.ontoggle;details.ontoggle=e=>{previous?.call(details,e);trigger.setAttribute('aria-expanded',String(details.open))};line.append(trigger);line.after(details);details.classList.remove('v42-header-filters');}
function removePlayerMeta42(root){if(!root)return;for(const n of root.querySelectorAll('.gt-list-row small,.gt-trophy-row .gt-row-detail small,.report-meta,.training-kicker,.review-meta')){if(n.closest('form,.report-editor'))continue;n.textContent=n.textContent.replace(/\bGeorgina(?:[’']s)?\s*[·|]?\s*/gi,'').trim();if(!n.textContent)n.remove()}}
const gamesBefore44=renderHome;
renderHome=function(){gamesBefore44();const root=$('homeContent');removePlayerMeta42(root);const current=root.querySelector('.games-current'),g=liveGame();if(current&&g){const score=g.scoreTracking?C.scoreAt(g):g.finalScore,status=g.pendingStart?'Ready':C.paused(g)?'Paused':C.periodActive(g)?'In progress':'Period break',banner=el('section',{class:'v42-current-banner review-work-banner','data-current-game-banner':g.id});banner.append(el('div',{class:'v42-banner-heading'},el('h2',{},'Current Game'),el('span',{class:'review-status'},status)),el('strong',{class:'v42-matchup'},g.team||'Team',el('span',{},'vs '+g.opponent)),el('div',{class:'v42-current-score'},el('strong',{},score?score.team+' – '+score.opponent:'—'),el('span',{},g.pendingStart?'Not started':C.label(g.settings.format,g.settings.current)+' of '+C.count(g.settings.format))),button(g.pendingStart?'Open Game':'Resume Game',()=>chooseGame(g.id,'live'),'primary'));const h=[...root.querySelectorAll('.games-section-title')].find(h=>h.textContent==='Current Game');h?.remove();current.replaceWith(banner)}const filter=root.querySelector('[data-game-filters]'),previous=root.querySelector('.previous-title');if(filter&&previous){const line=el('div',{class:'v42-section-row'});previous.before(line);line.append(previous);const summary=filter.querySelector('summary');summary.textContent='Filters';dockFilters42(line,filter)}};
for(const [id,prior,setter]of [['courtContent',renderHomeCourt,fn=>renderHomeCourt=fn],['trainingContent',renderTraining,fn=>renderTraining=fn],['trophiesContent',renderTrophies,fn=>renderTrophies=fn]])setter(function(...args){const r=prior(...args);removePlayerMeta42($(id));return r});
const notebookBefore44=renderNotebook;
renderNotebook=function(){notebookUI.search='';notebookBefore44();const root=$('notebookContent');const search=root.querySelector('input[type=search]');if(search){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));search.closest('label')?.remove()}const heading=[...root.querySelectorAll('label')].find(n=>/^Search feedback/.test(n.textContent));heading?.remove();removePlayerMeta42(root)};
const wallBefore44=renderTrophies;
renderTrophies=function(){wallBefore44();const root=$('trophiesContent'),banner=root.querySelector('.wall-featured,.trophy-cabinet-hero');for(const n of [...root.children]){if(n===banner)break;if(n.matches('p:not(.v42-subtitle)'))n.remove()}root.querySelectorAll('.review-collection-heading label').forEach(n=>n.classList.add('v42-inline-select'))};
const scheduleFilters42={type:'',from:'',to:'',team:'',source:'',open:false};
function scheduleMatches42(r){const f=scheduleFilters42,date=T.dateKey(new Date(r.start));return(!f.type||r.activity===f.type)&&(!f.from||date>=f.from)&&(!f.to||date<=f.to)&&(!f.team||r.team===f.team)&&(!f.source||(f.source==='manual'?!r.source:r.source===f.source))}
const scheduleBefore44=renderSchedule;
renderSchedule=function(){scheduleUI.view='upcoming';scheduleBefore44();if(ui.screen!=='schedule')return;const root=$('scheduleContent');root.querySelector('.schedule-calendar')?.remove();const action=root.querySelector('.gt-schedule-actions'),add=action?.querySelector('.primary');if(add){add.textContent='Add Event';titleAction42(root,add)}for(const line of root.querySelectorAll(':scope>.row-actions')){if([...line.querySelectorAll('button')].some(b=>['Upcoming','Calendar'].includes(b.textContent)))line.remove()}
 const f=scheduleFilters42,filters=el('details',{class:'v42-schedule-filters','data-schedule-filters':''},el('summary',{},'Filters'));filters.open=f.open;filters.ontoggle=()=>{if(filters.isConnected)f.open=filters.open};const fields=el('div',{class:'reports-filters'}),select=(label,key,options)=>{const input=el('select',{'aria-label':label});for(const[value,text]of options)input.append(el('option',{value},text));input.value=f[key];input.onchange=()=>{f[key]=input.value;f.open=true;renderSchedule()};fields.append(el('label',{class:'form-field'},label,input))};
 select('Event type','type',[['','All events'],['game','Game'],['training','Training'],['camp','Camp']]);for(const[key,label]of [['from','From'],['to','To']]){const input=formField(fields,label,f[key],{type:'date','aria-label':'Schedule '+label.toLowerCase()});input.onchange=()=>{f[key]=input.value;f.open=true;renderSchedule()}}
 const records=db.personalRecords.filter(r=>r.type==='schedule'&&!r.deletedAt);select('Team','team',[['','All teams'],...[...new Set(records.map(r=>r.team).filter(Boolean))].sort().map(t=>[t,t])]);const sources=new Map(records.filter(r=>r.source).map(r=>[r.source,r.sourceName||'Imported calendar']));select('Calendar source','source',[['','All sources'],['manual','Manually Added'],...sources.entries()]);fields.append(button('Clear Filters',()=>{Object.assign(f,{type:'',from:'',to:'',team:'',source:''});renderSchedule()},'family-link'));if(f.from&&f.to&&f.from>f.to)fields.append(el('p',{role:'alert'},'Choose an end date on or after the start date.'));filters.append(fields);
 const row=el('div',{class:'v42-section-row'},el('h2',{},scheduleUI41.past?'Past Events':'Upcoming')),list=[...root.children].find(n=>n.querySelector('[data-schedule-id]')&&!n.hasAttribute('data-past-events-list'));if(list)list.before(row);else root.querySelector('[data-past-events]')?.after(row);dockFilters42(row,filters);let count=0;for(const event of root.querySelectorAll('[data-schedule-id]')){const r=db.personalRecords.find(r=>r.id===event.dataset.scheduleId);if(!r)continue;const match=scheduleMatches42(r)&&!(f.from&&f.to&&f.from>f.to);event.hidden=!match;if(match&&!event.closest('[hidden]'))count++}if(!count)row.after(el('p',{class:'review-meta','data-schedule-empty':''},'No events match this view.'));const past=root.querySelector('[data-past-events]');if(past)root.append(past);removePlayerMeta42(root);stylePage43(root,'schedule')};
const scheduleFormBefore44=scheduleForm;scheduleForm=function(...args){const r=scheduleFormBefore44(...args);if(sheet.open&&$('sheetTitle').textContent==='Add Schedule')$('sheetTitle').textContent='Add Event';return r};
function notesAction42(root,selector){const section=root.querySelector(selector);if(!section)return;const title=section.querySelector('h2'),action=[...section.querySelectorAll('button')].find(b=>/edit/i.test(b.textContent));if(title&&action){const line=el('div',{class:'v42-section-row'});title.before(line);line.append(title,action)}}
const statsBefore44=renderStats;
renderStats=function(){statsBefore44();const root=$('statsContent'),g=game();if(!g)return;const performance=root.querySelector('.report-performance');if(performance){const main=performance.querySelector('.report-stats'),banner=el('section',{class:'report-performance v42-performance review-work-banner','data-performance-banner':''},el('h2',{},'Performance')),more=el('details',{'data-more-stats':''},el('summary',{},'More Stats'));more.open=!!reportState.expanded;for(const n of [...performance.children])if(n!==main&&!n.matches('summary,h2'))more.append(n);if(main)banner.append(main);banner.append(more);performance.replaceWith(banner)}notesAction42(root,'[data-player-feedback]');notesAction42(root,'[data-game-notes]');
 const record=[...root.querySelectorAll('.report-record')].find(n=>!n.classList.contains('score-journey-section'));if(record){record.classList.add('v42-record');const playsPanel=record.querySelector('[data-record-list]'),scoresPanel=record.querySelector('.score-journey-section');if(playsPanel&&scoresPanel){playsPanel.id='v42-recorded-plays';scoresPanel.id='v42-score-journey';playsPanel.setAttribute('role','tabpanel');scoresPanel.setAttribute('role','tabpanel');for(const tab of record.querySelectorAll('[data-record-tab]'))tab.setAttribute('aria-controls',tab.dataset.recordTab==='plays'?playsPanel.id:scoresPanel.id)}for(const b of record.querySelectorAll('[data-arrange-plays],[data-arrange-journey],.review-move-controls'))b.remove();for(const b of record.querySelectorAll('.report-record-toolbar button')){if(b.textContent==='Correct score')b.remove();else if(/Add play|Add score event/i.test(b.textContent)){b.classList.add('primary','v42-add-record');b.textContent=/score/i.test(b.textContent)?'Add Score Event':'Add Play'}}
 for(const n of record.querySelectorAll('.report-order-hint'))n.textContent='Tap an event to edit · drag its handle to reorder.';
 for(const node of record.querySelectorAll('[data-record-id]')){node.querySelector('[data-edit-record]')?.remove();const head=node.querySelector('.report-play-head'),id=node.dataset.recordId;if(head){head.classList.add('v42-event-row');head.tabIndex=0;head.setAttribute('role','button');head.setAttribute('aria-label','Edit '+C.eventLabel(g.events.find(e=>e.id===id)));head.onclick=e=>{if(!e.target.closest('[data-drag-id],button,input,select,textarea')&&!reportDrag)eventEditor(id)};head.onkeydown=e=>{if(e.target===head&&['Enter',' '].includes(e.key)){e.preventDefault();eventEditor(id)}}}}
 for(const old of [...record.querySelectorAll('[data-score-journey-id]')]){const id=old.dataset.scoreJourneyId,event=g.events.find(e=>e.id===id);if(!event)continue;const outer=old.parentElement,head=el('div',{class:'report-play-head v42-event-row',role:'button',tabindex:0,'aria-label':'Edit '+C.eventLabel(event),'data-score-journey-id':id}),handle=button('',()=>{},'report-drag',{'data-drag-id':id,'aria-label':'Move '+C.eventLabel(event)+'. Drag or use arrow keys.'});handle.append(reportIcon('grip-vertical'));const score=g.scoreTracking?C.scoreAt(g,id):null;head.append(handle,el('div',{class:'report-play-label'},el('span',{},C.eventLabel(event)),el('small',{},event.period.label+' · '+recordTime(event)),event.note?el('small',{},event.note):null),score?el('strong',{class:'v42-record-score'},score.team+' – '+score.opponent):null);outer.dataset.recordId=id;outer.dataset.journeyRecord='';head.onclick=e=>{if(!e.target.closest('[data-drag-id],button,input,select,textarea')&&!reportDrag)openScoreJourneyRecord(id)};head.onkeydown=e=>{if(e.target===head&&['Enter',' '].includes(e.key)){e.preventDefault();openScoreJourneyRecord(id)}};old.replaceWith(head)}
 }
 removePlayerMeta42(root);stylePage43(root,'stats');};
recordDropTarget=function(y){document.querySelectorAll('.report-play.drop-before,.report-play.drop-after').forEach(e=>e.classList.remove('drop-before','drop-after'));const rows=[...$('statsContent').querySelectorAll('[data-record-id]')].filter(e=>!e.closest('[hidden]')&&e.dataset.recordId!==reportDrag.id);const found=rows.reduce((best,row)=>{const r=row.getBoundingClientRect(),distance=y<r.top?r.top-y:y>r.bottom?y-r.bottom:0;return!best||distance<best.distance?{row,distance}:best},null);if(!found)return;const r=found.row.getBoundingClientRect();reportDrag.target=found.row.dataset.recordId;reportDrag.after=y>r.top+r.height/2;found.row.classList.add(reportDrag.after?'drop-after':'drop-before')};
moveReportRecord=function(id,target,after){const g=game();if(!g||reportEditorActive)return;try{transaction(g.id,t=>C.moveEvent(t,id,target,after));reportState.editorId=null;reportState.adding=false;reportState.adjustedId=id;reportState.status='Record moved · timestamp adjusted.';renderStats();announce('Record moved · timestamp adjusted')}catch(e){announce(e.message)}};
const journeyOpenBefore44=openScoreJourneyRecord;
openScoreJourneyRecord=function(id){const result=journeyOpenBefore44(id);if(ui.screen==='stats'&&reportState.editorId===id){reportUI41.tab='plays';renderStats()}return result};
const liveBefore44=renderLive;
renderLive=function(g){liveBefore44(g);const root=$('liveView');root.querySelector('[data-live-edit-game]')?.remove();const title=$('playerName');title.setAttribute('role','button');title.tabIndex=0;title.setAttribute('aria-label','Edit game '+gameTitle(g));title.onclick=()=>{if($('app').classList.contains('gt-camera-recording'))return announce('Stop recording before editing game details.');gameForm(g.id)};title.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();title.click()}};$('live-player-subtitle')?.remove();const hint=root.querySelector('.live-compact-score-help>span');if(hint)hint.textContent='Player baskets count automatically.';};
let progressDialog42=false;
const dialogBefore44=openDialog;
openDialog=function(title,build,options){const left=progressDialog42||(sheet.open&&sheet.classList.contains('v42-left-thumb')&&/End|quarter|half|period|Resume|Ready|Start Game|Timeout/i.test(title));dialogBefore44(title,build,options);if(left)sheet.classList.add('v42-left-thumb')};
for(const [name,prior]of [['circle',openPeriodCircle],['period',periodAction],['timeout',toggleTimeout],['end',endGame]]){const wrap=function(...args){progressDialog42=true;try{return prior(...args)}finally{progressDialog42=false}};if(name==='circle')openPeriodCircle=wrap;else if(name==='period')periodAction=wrap;else if(name==='timeout')toggleTimeout=wrap;else endGame=wrap}
const sessionBefore44=renderSessionDetail;renderSessionDetail=function(){sessionBefore44();notesAction42($('sessionContent'),'[data-training-feedback]');for(const section of $('sessionContent').querySelectorAll('.session-detail-section'))if(section.querySelector('h2')?.textContent==='Progress Notes'){const h=section.querySelector('h2'),b=[...section.querySelectorAll('button')].find(b=>/edit/i.test(b.textContent));if(b){const row=el('div',{class:'v42-section-row'});h.before(row);row.append(h,b)}}removePlayerMeta42($('sessionContent'));stylePage43($('sessionContent'),'session')};
const gameFormBefore44=gameForm;gameForm=function(...args){const r=gameFormBefore44(...args);if(ui.screen==='setup'){const form=$('gameForm'),player=[...form?.querySelectorAll('input')||[]].find(n=>n.closest('label')?.firstChild?.textContent==='Player name');if(player&&!player.value)player.value=playerContext.player||'Georgina';stylePage43($('setupContent'),'setup')}return r};

const verifyBefore42=verifyFamilyMembership;verifyFamilyMembership=async function(){const ok=await verifyBefore42();if(ok)try{const feature=await familyRpc('gt_cloud_features',{});scheduleCloud41=feature?.version>=7}catch{}return ok};


/* Scoreboard Option 1: restore the V42 Your Games summary and keep every
 * game-table statistic in one fixed-width, no-sideways-scroll table.
 * Display formatting does not modify game/event storage or calculations.
 */
function scoreboardWhole43(value){
  return String(value ?? '—').replace(/-?\d+\.\d+(?=%|\b)/g,token=>{
    const number=Number(token);
    return Number.isFinite(number)?String(Math.round(number)):token;
  });
}
function scoreboardCompactTable43(){
  if(ui.screen!=='reports')return;
  const root=$('reportsContent'),table=root?.querySelector('.reports-table');
  if(!table||!table.tHead?.rows?.length)return;
  const header=table.tHead.rows[0],count=header.cells.length;
  const width=count===12
    ? [27,7,7,7,7,7,6,6,6,6,6,8]
    : [Math.max(24,100-(count-1)*7),...Array(count-1).fill(Math.min(7,76/(count-1)))];
  const sum=width.reduce((a,b)=>a+b,0);
  // Colgroup is the single source of truth for header and row alignment.
  const cols=document.createElement('colgroup');
  width.forEach(n=>cols.append(el('col',{style:'width:'+(n/sum*100).toFixed(3)+'%'})));
  table.querySelector('colgroup')?.remove();
  table.prepend(cols);
  table.classList.add('v43-full-width-table');
  table.closest('.reports-table-scroll')?.classList.add('v43-no-side-scroll');
  // Tighten only the player table; summary design, buttons and collapsed stats stay intact.
  for(const row of table.querySelectorAll('tbody tr,tfoot tr')){
    for(const cell of row.cells){
      if(cell.cellIndex===0)continue;
      const leaves=cell.querySelectorAll('span,small');
      if(leaves.length){
        for(const node of leaves)if(!node.children.length)node.textContent=scoreboardWhole43(node.textContent.trim());
      }else if(!cell.children.length)cell.textContent=scoreboardWhole43(cell.textContent.trim());
    }
  }
  const banner=root.querySelector('.scoreboard-banner');
  if(banner){
    banner.classList.remove('v43-scoreboard-all');
    for(const node of banner.querySelectorAll('.scoreboard-banner-metrics strong,[data-summary-all-stats] td'))
      if(!node.children.length)node.textContent=scoreboardWhole43(node.textContent.trim());
    // Totals/Average redraw the original summary; preserve its exact structure and collapse state.
    for(const toggle of banner.querySelectorAll('[data-mode]')){
      if(toggle.dataset.scoreboardInteger43)continue;
      toggle.dataset.scoreboardInteger43='yes';
      toggle.addEventListener('click',()=>{
        queueMicrotask(()=>{
          for(const node of banner.querySelectorAll('.scoreboard-banner-metrics strong,[data-summary-all-stats] td'))
            if(!node.children.length)node.textContent=scoreboardWhole43(node.textContent.trim());
        });
      });
    }
  }
  // Recreate the optional sticky header after changing table geometry.
  if(typeof reportsStickyCleanup==='function'){reportsStickyCleanup();reportsStickyCleanup=null;}
  if(typeof installReportsHeader==='function'){
    reportsStickyCleanup=installReportsHeader(root);
    root.querySelector('.reports-floating-header .reports-table')?.classList.add('v43-full-width-table');
  }
}
const reportsBeforeScoreboard43=renderReports;
renderReports=function(){reportsBeforeScoreboard43();scoreboardCompactTable43()};
