/* Scoreboard Analytics V1 — review integration; no storage mutations. */
(function(){
'use strict';
const $r=()=>document.getElementById('reportsContent'),mk=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n;};
const modes={primary:[['pts','PTS'],['reb','REB'],['ast','AST'],['stl','STL']],secondary:[['drive','DRV'],['defstop','DEF'],['to','TOV'],['pf','FLS']],shooting:[['fg','FG%'],['three','3PT%'],['ft','FT%']]};
const colors=['#087d42','#3b82a4','#b47d33','#a16c9d'];
const selection={id:null,mode:'primary',metrics:new Set(['pts'])};
function safeInt(n){return Number.isFinite(+n)?Math.max(0,Math.round(+n)):0}
function val(r,key){const t=r.t;if(key==='fg')return t.fga?100*t.fgm/t.fga:null;if(key==='three')return t.a3?100*t.m3/t.a3:null;if(key==='ft')return t.aft?100*t.mft/t.aft:null;return t[key]??0}
function fmt(r,key){const n=val(r,key);return n===null?'—':String(Math.round(n))+(selection.mode==='shooting'?'%':'')}
function shot(r,key){const t=r.t;return key==='fg'?[t.fgm,t.fga]:key==='three'?[t.m3,t.a3]:[t.mft,t.aft]}
function select(id){selection.id=id;renderScoreboardReview()}
/* Approved Performance Overview Banner V7.1: 30 / 35 / 35, native SharedBanner V2 wrapper. */
function overview(rows){
 const games=rows.length;
 const wins=rows.filter(({g})=>g.finalScore&&g.finalScore.team>g.finalScore.opponent).length;
 const losses=rows.filter(({g})=>g.finalScore&&g.finalScore.team<g.finalScore.opponent).length;
 const t=rows.reduce((sum,{t})=>{for(const k of ['pts','reb','ast','stl','fgm','fga','m3','a3','mft','aft'])sum[k]+=(t[k]||0);return sum},{pts:0,reb:0,ast:0,stl:0,fgm:0,fga:0,m3:0,a3:0,mft:0,aft:0});
 const wrap=mk('div','gtpo-v71-wrap');
 let average=true;
 const body=mk('div','gtpo-v71-body');
 const make=(tag,klass,text)=>mk(tag,klass,text);
 const pct=(m,n)=>n?Math.round(m/n*100):null;
 const metric=(k)=>games?(average?(t[k]/games).toFixed(1):String(t[k])):'—';
 function cell(inner,kind){
  const node=make('div','gtv2-banner-cell gtpo-v71-cell gtpo-v71-'+kind);
  node.dataset.component='BannerCellV2';node.append(inner);return node;
 }
 function recordColumn(){
  const col=make('div','gtpo-v71-column');
  col.append(make('span','gtpo-v71-kicker','Season record'));
  const record=make('div','gtpo-v71-record');
  record.append(make('span','',wins),make('span','gtpo-v71-dash','–'),make('span','',losses));col.append(record);
  col.append(make('div','gtpo-v71-record-desc','Wins / Losses'));
  const percent=pct(wins,wins+losses);
  col.append(make('div','gtpo-v71-winrate',percent===null?'—':percent+'%'),make('div','gtpo-v71-winrate-label','WIN RATE'));
  const track=make('div','gtpo-v71-win-track'),fill=make('div','gtpo-v71-win-fill');
  track.setAttribute('role','img');track.setAttribute('aria-label',wins+' wins and '+losses+' losses');
  fill.style.width=(percent||0)+'%';track.append(fill);col.append(track);
  col.append(make('p','gtpo-v71-game-count',games+' GAMES PLAYED'));return col;
 }
 function productionColumn(){
  const col=make('div','gtpo-v71-column');
  col.append(make('span','gtpo-v71-kicker','Player production'));
  const head=make('div','gtpo-v71-prod-heading'),control=make('div','gtpo-v71-mode-switch');
  control.setAttribute('role','group');control.setAttribute('aria-label','Player production display');
  for(const [type,label] of [['avg','AVG'],['total','TOTAL']]){
   const button=make('button','',label);button.type='button';
   button.setAttribute('aria-pressed',String((type==='avg')===average));
   button.addEventListener('click',()=>{average=type==='avg';draw()});control.append(button);
  }
  head.append(control);col.append(head);
  const list=make('div','gtpo-v71-production');
  for(const [key,label] of [['pts','PTS'],['reb','REB'],['ast','AST'],['stl','STL']]){
   const stat=make('div','gtpo-v71-stat');
   stat.append(make('span','gtpo-v71-stat-label',label),make('strong','gtpo-v71-stat-value',metric(key)));
   list.append(stat);
  }col.append(list);return col;
 }
 function shootingColumn(){
  const col=make('div','gtpo-v71-column');
  col.append(make('span','gtpo-v71-kicker','Shooting efficiency'));
  const list=make('div','gtpo-v71-shooting');
  for(const [name,m,n] of [['FG',t.fgm,t.fga],['3PT',t.m3,t.a3],['FT',t.mft,t.aft]]){
   const percent=pct(m,n),item=make('div','gtpo-v71-shot'),head=make('div','gtpo-v71-shot-head');
   head.append(make('span','gtpo-v71-shot-name',name),make('strong','gtpo-v71-shot-value',percent===null?'—':percent+'%'));
   const track=make('div','gtpo-v71-shot-bar'),fill=make('div','gtpo-v71-shot-fill');
   track.setAttribute('role','progressbar');track.setAttribute('aria-label',name+' shooting percentage');
   track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');
   if(percent!==null)track.setAttribute('aria-valuenow',String(percent));
   fill.style.width=(percent||0)+'%';track.append(fill);
   item.append(head,track,make('span','gtpo-v71-shot-count',m+' / '+n+' MADE / ATTEMPTED'));
   list.append(item);
  }col.append(list);return col;
 }
 function draw(){
  const row=make('div','gtv2-banner-row gtpo-v71-row');
  row.dataset.component='BannerRowV2';
  row.append(cell(recordColumn(),'record-col'),cell(productionColumn(),'production-col'),cell(shootingColumn(),'shooting-col'));
  const banner=GameTraceComponents.SharedBannerV2({primary:row,rootClass:'gtv2-banner gtpo-v71-banner',componentName:'PerformanceOverviewBannerV7_1'});
  banner.dataset.parent='SharedBannerV2';
  body.replaceChildren(banner);
 }
 wrap.append(body);draw();
 return GameTraceComponents.Section({title:'Performance Overview',content:wrap,kind:'gtpo-v71-section'});
}
function drawChart(rows,keys,host){
 host.replaceChildren();const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 560 178');svg.setAttribute('role','img');svg.setAttribute('aria-label','Game performance trend for '+keys.join(', '));svg.classList.add('gtgr-v1-plot');
 const max=Math.max(1,...rows.flatMap(r=>keys.map(k=>val(r,k)||0)));const X=i=>32+i*(500/Math.max(1,rows.length-1)),Y=n=>145-(n/max)*113;
 for(let i=0;i<4;i++){const y=145-i*37.7,line=document.createElementNS(ns,'line');for(const [k,v] of Object.entries({x1:30,x2:536,y1:y,y2:y,stroke:'var(--gt-line,#dfe5dc)','stroke-width':.7}))line.setAttribute(k,v);svg.append(line)}
 keys.forEach(key=>{const ci=modes[selection.mode].findIndex(x=>x[0]===key),pts=rows.filter(r=>val(r,key)!==null),path=document.createElementNS(ns,'polyline');path.setAttribute('points',pts.map(r=>X(rows.indexOf(r))+','+Y(val(r,key))).join(' '));path.setAttribute('fill','none');path.setAttribute('stroke',colors[ci]);path.setAttribute('stroke-width','1.65');path.setAttribute('stroke-linejoin','round');svg.append(path);
 for(const r of pts){const i=rows.indexOf(r),circle=document.createElementNS(ns,'circle');circle.setAttribute('cx',X(i));circle.setAttribute('cy',Y(val(r,key)));circle.setAttribute('r',r.g.id===selection.id?5:3);circle.setAttribute('fill',colors[ci]);circle.setAttribute('stroke','var(--gt-surface,#fff)');circle.setAttribute('stroke-width','1.5');circle.style.cursor='pointer';circle.setAttribute('tabindex','0');circle.setAttribute('aria-label',r.g.opponent+', '+key+' '+fmt(r,key));circle.addEventListener('click',()=>select(r.g.id));circle.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(r.g.id)}});svg.append(circle)}
 });
 host.append(svg);
}
function records(rows){
 const root=mk('div','gtgr-v1-analytics');
 const views=mk('div','gtgr-v1-views');for(const mode of Object.keys(modes)){const b=mk('button','',mode[0].toUpperCase()+mode.slice(1));b.type='button';b.setAttribute('aria-pressed',String(selection.mode===mode));b.addEventListener('click',()=>{selection.mode=mode;selection.metrics=new Set([modes[mode][0][0]]);renderScoreboardReview()});views.append(b)}root.append(views);
 const chart=mk('div','gtgr-v1-chart'),metrics=mk('div','gtgr-v1-metrics');
 const keys=modes[selection.mode].map(([key])=>key);
 if(!keys.some(key=>selection.metrics.has(key)))selection.metrics=new Set([keys[0]]);
 const selectedKeys=keys.filter(key=>selection.metrics.has(key));
 root.append(chart,metrics);drawChart(rows,selectedKeys,chart);
 keys.forEach((key,i)=>{
   const active=selection.metrics.has(key);
   const button=mk('button','gtgr-v1-metric-rail-item',modes[selection.mode][i][1]);
   button.type='button';
   button.style.setProperty('--metric',colors[i]);
   button.setAttribute('aria-pressed',String(active));
   button.setAttribute('aria-label',(active?'Hide ':'Show ')+modes[selection.mode][i][1]+' on performance graph');
   button.addEventListener('click',()=>{
     if(selection.metrics.has(key)){if(selection.metrics.size>1)selection.metrics.delete(key)}
     else selection.metrics.add(key);
     renderScoreboardReview();
   });
   metrics.append(button);
 });
 const table=mk('div','gtgr-v1-table'),header=mk('div','gtgr-v1-data-row gtgr-v1-head');header.append(mk('span','','GAME'),mk('span','','W/L'));for(const [key,label] of modes[selection.mode]){const s=mk('span',selection.metrics.has(key)?'is-active':'',label);header.append(s)}table.append(header);
 for(const r of [...rows].reverse()){
 const b=mk('button','gtgr-v1-data-row'+(r.g.id===selection.id?' is-selected':''));b.type='button';b.setAttribute('aria-pressed',String(r.g.id===selection.id));b.addEventListener('click',()=>select(r.g.id));
 const identity=mk('span','gtgr-v1-identity');identity.append(mk('strong','',r.g.opponent||'Opponent'),mk('small','',friendlyDate(r.g.date)));b.append(identity);
 const win=r.g.finalScore?.team>r.g.finalScore?.opponent,loss=r.g.finalScore?.team<r.g.finalScore?.opponent;
 b.append(mk('span','gtgr-v1-result '+(win?'win':loss?'loss':''),win?'W':loss?'L':'—'));
 for(const [key] of modes[selection.mode]){const cell=mk('span','gtgr-v1-number'+(selection.metrics.has(key)?' is-active':''),fmt(r,key));if(selection.mode==='shooting'){const [m,a]=shot(r,key);cell.append(mk('small','',m+'/'+a))}b.append(cell)}table.append(b);
 }root.append(table);if(!rows.length)root.append(mk('p','', 'No completed games match these filters.'));
 return GameTraceComponents.Section({title:'Game Records',content:root,kind:'gtgr-v1-section'});
}
/* TimelineSection V1 uses the same approved composition as Game Details.
   The native Timeline V1 renderer, filter controls, event listeners and chart remain intact. */
function approvedTimelineSection(game){
 const section=mk('section','gt-tls-v1');section.dataset.component='SectionV1';
 const header=mk('div','gt-tls-header');
 const heading=mk('div','gt-tls-heading');
 heading.append(mk('h2','','Game Timeline'),mk('p','','The game, play by play.'));
 header.append(heading);
 const filterButton=mk('button','gt-tls-filter-button gt-tls-filter-icon');
 filterButton.type='button';filterButton.setAttribute('aria-label','Show timeline filters');
 filterButton.setAttribute('aria-expanded','false');filterButton.title='Timeline filters';
 filterButton.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h5m4 0h7M4 12h11m4 0h1M4 18h2m4 0h10"/><circle cx="11" cy="6" r="2"/><circle cx="17" cy="12" r="2"/><circle cx="8" cy="18" r="2"/></svg><span class="gt-tls-filter-status" aria-hidden="true" hidden></span>';
 header.append(filterButton);section.append(header);
 const content=mk('div','gt-tls-content');content.dataset.slot='content';content.dataset.component='TimelineV1';
 const filterPanel=mk('div','gt-tls-filter-panel');filterPanel.hidden=true;filterPanel.setAttribute('aria-label','Timeline display filters');
 const parts=window.GameTraceTimelineV1.create({game,renderTimeline:reportTimeline});
 const nativeView=parts.view,nativeFilters=parts.filters;
 if(nativeView){nativeView.classList.add('gt-tls-native-view');filterPanel.append(nativeView)}
 if(nativeFilters){
  nativeFilters.classList.add('gt-tls-native-score-filters');
  filterPanel.append(nativeFilters);
  const controls=mk('div','gt-tls-filter-actions');
  const reset=mk('button','gt-tls-filter-reset','Reset to all');reset.type='button';
  reset.addEventListener('click',()=>{
   for(const input of nativeFilters.querySelectorAll('input[type="checkbox"]')){
    if(!input.checked){input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}))}
   }
   const select=nativeView?.querySelector('select');
   if(select&&select.value!=='all'){select.value='all';select.dispatchEvent(new Event('change',{bubbles:true}))}
   syncFilterCount();
  });
  const done=mk('button','gt-tls-filter-done','Done');done.type='button';
  done.addEventListener('click',()=>{filterPanel.hidden=true;filterButton.setAttribute('aria-expanded','false')});
  controls.append(reset,done);filterPanel.append(controls);
  nativeFilters.addEventListener('change',syncFilterCount);
 }
 nativeView?.querySelector('select')?.addEventListener('change',syncFilterCount);
 function syncFilterCount(){
  if(!nativeFilters)return;
  const inputs=[...nativeFilters.querySelectorAll('input[type="checkbox"]')];
  const selected=inputs.filter(input=>input.checked).length;
  const view=nativeView?.querySelector('select')?.value||'all';
  const active=selected<inputs.length||view!=='all';
  const indicator=filterButton.querySelector('.gt-tls-filter-status');
  if(indicator)indicator.hidden=!active;
  filterButton.classList.toggle('is-active',active);
  filterButton.setAttribute('aria-label',active?'Timeline display customized. Open filters':'Show timeline filters');
 }
 filterButton.addEventListener('click',()=>{
  const opening=filterPanel.hidden;filterPanel.hidden=!opening;
  filterButton.setAttribute('aria-expanded',String(opening));
 });
 content.append(filterPanel);
 parts.native.open=true;
 content.append(parts.element);
 section.append(content);
 syncFilterCount();
 return section;
}
function selectedSection(rows){
 const r=rows.find(x=>x.g.id===selection.id);
 if(!r)return null;
 const detail=mk('div','gt-scoreboard-detail');
 detail.append(mk('p','gt-scoreboard-context',(r.g.team||'Team')+' vs '+r.g.opponent+' · '+friendlyDate(r.g.date)));
 const nested=mk('div','gt-scoreboard-nested');
 const circles=mk('section','report-circles gt-gcs-v1');circles.dataset.component='SectionV1';
 const ch=mk('div','gt-gcs-header'),titles=mk('div','gt-gcs-heading');
 titles.append(mk('h2','','Game Circles'),mk('p','','Your game at a glance.'));ch.append(titles);circles.append(ch);
 const cc=mk('div','gt-gcs-content'),svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.classList.add('report-circle-svg');svg.setAttribute('role','img');cc.append(svg);circles.append(cc);
 const circleDetail=mk('details','gt-circle-details');
 circleDetail.append(mk('summary','','Labels & legend'));
 const cb=mk('div','gt-circle-details-body');
 cb.append(mk('p','',r.time.known?'Court time '+Math.round(r.time.courtSeconds/60)+' min':'Court time unavailable'));
 for(const [k,label] of [['reb','REB'],['pf','PF'],['to','TOV'],['ast','AST'],['stl','STL']])cb.append(mk('span','gt-scoreboard-key',label+' '+r.t[k]));
 circleDetail.append(cb);cc.append(circleDetail);
 nested.append(circles);
 if(window.GameTraceTimelineV1?.create)nested.append(approvedTimelineSection(r.g));
 detail.append(nested);
 const section=GameTraceComponents.Section({title:'Selected Game Analytics',content:detail,kind:'gt-scoreboard-selected-section'});
 const open=mk('button','gt-scoreboard-open','Open Game Details →');open.type='button';
 open.addEventListener('click',()=>chooseGame(r.g.id,'stats'));
 const sectionHeader=section.querySelector('.gtc-section-header');
 if(sectionHeader)sectionHeader.append(open);
 requestAnimationFrame(()=>{if(svg.isConnected)drawGameCircles(svg,r.g,r.t,r.time)});
 return section;
}
function renderScoreboardReview(){
 if(ui.screen!=='reports')return;
 const root=$r();if(!root)return;
 root.querySelector('#gt-scoreboard-review')?.remove();
 const rows=filteredReports().sort((a,b)=>a.g.date.localeCompare(b.g.date)||a.g.id.localeCompare(b.g.id));
 if(!rows.some(x=>x.g.id===selection.id)){selection.id=rows.at(-1)?.g.id||null;}
 const host=mk('div','gt-scoreboard-review');host.id='gt-scoreboard-review';host.append(overview(rows),records(rows));const details=selectedSection(rows);if(details)host.append(details);
 const first=root.querySelector('.reports-summary-card, .scoreboard-banner,.reports-overview,.reports-table-scroll');
 if(first)first.before(host);else root.append(host);
}
const beforeScoreboardAnalytics=renderReports;
renderReports=function(...args){const result=beforeScoreboardAnalytics.apply(this,args);if(ui.screen==='reports')renderScoreboardReview();return result};
})();
