/* Scoreboard Analytics V1 — review integration; no storage mutations. */
(function(){
'use strict';
const $r=()=>document.getElementById('reportsContent'),mk=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n;};
const modes={primary:[['pts','PTS'],['reb','REB'],['ast','AST'],['stl','STL']],secondary:[['drive','DRV'],['defstop','DEF'],['to','TOV'],['pf','FLS']],shooting:[['fg','FG%'],['three','3PT%'],['ft','FT%']]};
const colors=['#087d42','#3b82a4','#b47d33','#a16c9d'];
const selection={id:null,mode:'primary',metrics:new Set(['pts']),expanded:false};
function safeInt(n){return Number.isFinite(+n)?Math.max(0,Math.round(+n)):0}
function val(r,key){const t=r.t;if(key==='fg')return t.fga?100*t.fgm/t.fga:null;if(key==='three')return t.a3?100*t.m3/t.a3:null;if(key==='ft')return t.aft?100*t.mft/t.aft:null;return t[key]??0}
function fmt(r,key){const n=val(r,key);return n===null?'—':String(Math.round(n))+(selection.mode==='shooting'?'%':'')}
function shot(r,key){const t=r.t;return key==='fg'?[t.fgm,t.fga]:key==='three'?[t.m3,t.a3]:[t.mft,t.aft]}
function select(id){selection.id=id;selection.expanded=true;renderScoreboardReview()}
function banner(rows){
 const area=mk('div','gtpo-v1-rows');
 for(const row of rows){const r=mk('div','gtpo-v1-row');for(const [label,value,sub] of row){const cell=mk('div','gtpo-v1-cell');cell.append(mk('span','gtpo-v1-label',label),mk('strong','gtpo-v1-value',value));if(sub)cell.append(mk('small','gtpo-v1-sub',sub));r.append(cell);}area.append(r);}return GameTraceComponents.SharedBannerV2({primary:area,rootClass:'gtpo-v1-banner',componentName:'PerformanceOverviewBannerV6'});
}
function overview(rows){
 const games=rows.length,w=rows.filter(({g})=>g.finalScore&&g.finalScore.team>g.finalScore.opponent).length,l=rows.filter(({g})=>g.finalScore&&g.finalScore.team<g.finalScore.opponent).length;
 const totals=rows.reduce((s,{t})=>{for(const k of ['pts','reb','ast','stl','fgm','fga','m3','a3','mft','aft'])s[k]+=t[k]||0;return s},{pts:0,reb:0,ast:0,stl:0,fgm:0,fga:0,m3:0,a3:0,mft:0,aft:0});
 const wrap=mk('div','gtpo-v1-wrap');
 const switcher=mk('div','gtpo-v1-toggle');
 let average=false;
 const body=mk('div');
 function draw(){const stats=['pts','reb','ast','stl'].map(k=>[k.toUpperCase(),games&&average?safeInt(totals[k]/games):totals[k]]);
 const rate=(m,a)=>a?Math.round(m/a*100)+'%':'—';
 const content=banner([[['GAMES PLAYED',games],['WIN–LOSS',w+'–'+l],['WIN RATE',w+l?Math.round(w/(w+l)*100)+'%':'—']],stats,[['FG',rate(totals.fgm,totals.fga),totals.fgm+' / '+totals.fga],['3PT',rate(totals.m3,totals.a3),totals.m3+' / '+totals.a3],['FT',rate(totals.mft,totals.aft),totals.mft+' / '+totals.aft]]]);
 body.replaceChildren(content);
 for(const b of switcher.children)b.setAttribute('aria-pressed',String(b.dataset.kind===(average?'avg':'total')));
 }
 for(const [kind,label] of [['total','Totals'],['avg','Averages']]){const b=mk('button','',label);b.type='button';b.dataset.kind=kind;b.addEventListener('click',()=>{average=kind==='avg';draw()});switcher.append(b);}
 wrap.append(switcher,body);draw();return GameTraceComponents.Section({title:'Performance Overview',content:wrap,kind:'gtpo-v1-section'});
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
 const trend=mk('div','gtgr-v1-trend');
 const eyebrow=mk('div','gtgr-v1-trend-eyebrow','PERFORMANCE TREND');
 const summary=mk('div','gtgr-v1-trend-summary');
 const metrics=mk('div','gtgr-v1-metrics'),chart=mk('div','gtgr-v1-chart');
 const keys=modes[selection.mode].map(([k])=>k);
 if(!keys.some(k=>selection.metrics.has(k)))selection.metrics=new Set([keys[0]]);
 const selectedKeys=keys.filter(k=>selection.metrics.has(k));
 const readable={pts:'POINTS PER GAME',reb:'REBOUNDS PER GAME',ast:'ASSISTS PER GAME',stl:'STEALS PER GAME',drive:'DRIVES PER GAME',defstop:'DEFENSIVE STOPS PER GAME',to:'TURNOVERS PER GAME',pf:'FOULS PER GAME',fg:'FIELD GOAL PERCENTAGE',three:'3-POINT PERCENTAGE',ft:'FREE THROW PERCENTAGE'};
 if(selectedKeys.length===1){
   const key=selectedKeys[0],stat=mk('div','gtgr-v1-trend-stat');
   stat.append(mk('span','gtgr-v1-trend-label',readable[key]||key.toUpperCase()));
   let result='—',unit=selection.mode==='shooting'?'%':'AVG';
   if(rows.length){
     if(selection.mode==='shooting'){
       const shots=rows.reduce((s,r)=>{const [m,a]=shot(r,key);s.m+=m;s.a+=a;return s},{m:0,a:0});
       if(shots.a)result=String(Math.round(shots.m/shots.a*100));
     }else{
       result=(rows.reduce((s,r)=>s+(val(r,key)||0),0)/rows.length).toFixed(1);
     }
   }
   const line=mk('div','gtgr-v1-trend-number');
   line.append(mk('strong','',result),mk('span','',unit));
   stat.append(line);summary.append(stat);
 }else{
   summary.append(mk('span','gtgr-v1-trend-label','MULTI-METRIC COMPARISON'));
   summary.append(mk('strong','gtgr-v1-trend-count',selectedKeys.length+' METRICS SELECTED'));
   summary.append(mk('span','gtgr-v1-trend-selected',selectedKeys.map(k=>modes[selection.mode].find(pair=>pair[0]===k)[1]).join(' · ')));
 }
 keys.forEach((key,i)=>{
   const active=selection.metrics.has(key);
   const b=mk('button','gtgr-v1-metric-rail-item',modes[selection.mode][i][1]);
   b.type='button';b.style.setProperty('--metric',colors[i]);
   b.setAttribute('aria-pressed',String(active));
   b.setAttribute('aria-label',(active?'Hide ':'Show ')+modes[selection.mode][i][1]+' on performance graph');
   b.title=modes[selection.mode][i][1];
   b.addEventListener('click',()=>{
     if(selection.metrics.has(key)){if(selection.metrics.size>1)selection.metrics.delete(key)}
     else selection.metrics.add(key);
     renderScoreboardReview();
   });
   metrics.append(b);
 });
 trend.append(eyebrow,summary,metrics,chart);root.append(trend);
 drawChart(rows,selectedKeys,chart);
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
function selectedSection(rows){
 const r=rows.find(x=>x.g.id===selection.id);if(!r)return null;
 const detail=mk('div','gt-scoreboard-detail');
 detail.append(mk('p','gt-scoreboard-context',(r.g.team||'Team')+' vs '+r.g.opponent+' · '+friendlyDate(r.g.date)));
 const open=mk('button','gt-scoreboard-open','Open Game Details →');open.type='button';open.addEventListener('click',()=>chooseGame(r.g.id,'stats'));detail.append(open);
 const nested=mk('div','gt-scoreboard-nested');
 const circles=mk('section','report-circles gt-gcs-v1');circles.dataset.component='SectionV1';
 const ch=mk('div','gt-gcs-header');const titles=mk('div','gt-gcs-heading');titles.append(mk('h2','','Game Circles'),mk('p','','Your game at a glance.'));ch.append(titles);circles.append(ch);
 const cc=mk('div','gt-gcs-content');const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('report-circle-svg');svg.setAttribute('role','img');cc.append(svg);circles.append(cc);
 const circleDetail=mk('details','gt-circle-details');circleDetail.append(mk('summary','','Labels & legend'));const cb=mk('div','gt-circle-details-body');cb.append(mk('p','',r.time.known?'Court time '+Math.round(r.time.courtSeconds/60)+' min':'Court time unavailable'));for(const [k,label] of [['reb','REB'],['pf','PF'],['to','TOV'],['ast','AST'],['stl','STL']])cb.append(mk('span','gt-scoreboard-key',label+' '+r.t[k]));circleDetail.append(cb);cc.append(circleDetail);
 nested.append(circles);
 if(window.GameTraceTimelineV1?.create){
 const tl=mk('section','gt-tls-v1');tl.dataset.component='SectionV1';const h=mk('div','gt-tls-header');h.append(mk('h2','','Game Timeline'),mk('p','','The game, play by play.'));tl.append(h);
 const cp=window.GameTraceTimelineV1.create({game:r.g,renderTimeline:reportTimeline});
 const tc=mk('div','gt-tls-content');if(cp.view)tc.append(cp.view);if(cp.filters)tc.append(cp.filters);cp.native.open=true;tc.append(cp.element);tl.append(tc);
 tl.addEventListener('click',e=>{if(e.target.closest('[data-timeline-event]')){e.preventDefault();e.stopImmediatePropagation();chooseGame(r.g.id,'stats')}},true);
 nested.append(tl);
 }
 detail.append(nested);
 const section=GameTraceComponents.Section({title:'Selected Game Analytics',content:detail,kind:'gt-scoreboard-selected-section'});
 const actions=mk('button','gt-scoreboard-collapse',selection.expanded?'Hide Analytics':'Show Analytics');actions.type='button';actions.setAttribute('aria-expanded',String(selection.expanded));actions.addEventListener('click',()=>{selection.expanded=!selection.expanded;renderScoreboardReview()});
 section.querySelector('.gtc-section-header').append(actions);nested.hidden=!selection.expanded;
 if(selection.expanded)requestAnimationFrame(()=>{if(svg.isConnected)drawGameCircles(svg,r.g,r.t,r.time)});
 return section;
}
function renderScoreboardReview(){
 if(ui.screen!=='reports')return;
 const root=$r();if(!root)return;
 root.querySelector('#gt-scoreboard-review')?.remove();
 const rows=filteredReports().sort((a,b)=>a.g.date.localeCompare(b.g.date)||a.g.id.localeCompare(b.g.id));
 if(!rows.some(x=>x.g.id===selection.id)){selection.id=rows.at(-1)?.g.id||null;selection.expanded=false;}
 const host=mk('div','gt-scoreboard-review');host.id='gt-scoreboard-review';host.append(overview(rows),records(rows));const details=selectedSection(rows);if(details)host.append(details);
 const first=root.querySelector('.reports-summary-card, .scoreboard-banner,.reports-overview,.reports-table-scroll');
 if(first)first.before(host);else root.append(host);
}
const beforeScoreboardAnalytics=renderReports;
renderReports=function(...args){const result=beforeScoreboardAnalytics.apply(this,args);if(ui.screen==='reports')renderScoreboardReview();return result};
})();
