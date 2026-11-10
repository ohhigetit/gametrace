/** GameTrace Performance Overview V6 + Section V1 composition.
 * Requires GameTraceSharedBannerV2 and GameTraceComponents.Section.
 * No storage, route or backend effects. Illustration data belongs only in preview.
 */
(function(global){
'use strict';
const doc=global.document;
if(!doc)return;
const make=(tag,cls,content)=>{const e=doc.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=String(content);return e;};
const whole=n=>Number.isFinite(Number(n))&&Number(n)>=0?Math.round(Number(n)):0;
const pct=(a,b)=>b>0?Math.round(100*a/b)+'%':'—';
function PerformanceOverviewBanner(data={}){
 const api=global.GameTraceSharedBannerV2;
 if(!api)throw new Error('SharedBannerV2 must be loaded');
 const games=whole(data.gamesPlayed), wins=whole(data.wins), losses=whole(data.losses);
 const stats=data.stats||{}, shooting=data.shooting||{};
 const performance=make('div','gtpo-performance');
 const toolbar=make('div','gtpo-toolbar');
 toolbar.append(make('span','gtv2-cell-label','Performance'));
 const segment=make('div','gtpo-segment');
 segment.setAttribute('role','group');segment.setAttribute('aria-label','Statistics display');
 toolbar.append(segment);
 const grid=make('div','gtpo-stats');
 const nodes=[];
 for(const [key,label] of [['pts','PTS'],['reb','REB'],['ast','AST'],['stl','STL']]){
   const cell=make('div','gtpo-stat'), value=make('strong','gtv2-cell-value');
   cell.append(make('span','gtv2-cell-label',label),value);grid.append(cell);
   nodes.push({value,total:whole(stats[key])});
 }
 function setMode(mode){
   nodes.forEach(({value,total})=>value.textContent=String(mode==='averages'&&games?Math.round(total/games):mode==='averages'?0:total));
   for(const b of segment.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.mode===mode));
 }
 for(const [mode,label] of [['totals','Totals'],['averages','Averages']]){
   const b=make('button','gtpo-mode',label);b.type='button';b.dataset.mode=mode;
   b.addEventListener('click',()=>setMode(mode));segment.append(b);
 }
 performance.append(toolbar,grid);
 function shot(k,label){
   const entry=shooting[k]||{},made=whole(entry.made),attempted=whole(entry.attempted);
   return {align:'center',compact:true,content:{type:'stat',label,value:pct(made,attempted),subtext:made+' / '+attempted}};
 }
 const banner=api.SharedBannerV2({primaryRows:[
   {divider:true,cells:[
     {align:'center',compact:true,content:{type:'stat',label:'Games Played',value:games}},
     {align:'center',compact:true,content:{type:'stat',label:'Win–Loss',value:wins+'–'+losses}},
     {align:'center',compact:true,content:{type:'stat',label:'Win Rate',value:pct(wins,wins+losses)}}
   ]},
   {cells:[{align:'center',compact:true,content:performance}]},
   {divider:true,cells:[shot('fg','FG'),shot('three','3PT'),shot('ft','FT')]}
 ]});
 banner.classList.add('gtpo-banner');setMode('totals');return banner;
}
function PerformanceOverviewSection({data}={}){
 const components=global.GameTraceComponents;
 if(!components?.Section)throw new Error('Section parent must be loaded');
 const section=components.Section({title:'Performance Overview',content:PerformanceOverviewBanner(data),kind:'gtpo-section'});
 return section;
}
global.GameTracePerformanceOverview=Object.freeze({version:'6.0.0',PerformanceOverviewBanner,PerformanceOverviewSection});
})(window);
