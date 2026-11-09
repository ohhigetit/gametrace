'use strict';
/* Home Court Live Game integration checks, without network/sync/data writes. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const library=fs.readFileSync('components/game-trace-components.js','utf8');
const section=(a,b)=>{const i=html.indexOf(a),j=html.indexOf(b,i);assert(i>=0&&j>i);return html.slice(i,j)};
const homeAdapter=section('function gtGBV1IntegrateCourtLive(root){','const gtALV1PreviousCourt=renderHomeCourt;');
const gamesAdapter=section('function gtGamesFeaturedBannerV1(selectedGame=null, options={}){','/* Games migration Stage 3');
assert(!homeAdapter.includes("document.createElement("),'No independent live game renderer allowed');
assert(homeAdapter.includes("gtGamesFeaturedBannerV1(game,{title:'Live Game',actionLabel:'Resume Game'})"));
assert(gamesAdapter.includes("window.GameTraceComponents.GameBannerV2("));
assert(gamesAdapter.includes('options.actionLabel||'));
assert(library.includes('function GameBannerSectionV1('));
for(const marker of ['function gtTrainingSummaryBannerSectionV8Original','gt-global-banner-cell-alignment-qa','gtGameDetailsUniversalV1()','gtGamesRecentActivityListV1()'])
 assert(html.includes(marker),'Missing previously approved component: '+marker);
const sharedCss=[':is(#homeContent,#courtContent) .gtgames-banner',
  ':is(#homeContent,#courtContent) .gtgames-compact-primary',
  '#courtContent [data-usage="home-court"]'];
for(const selector of sharedCss)assert(html.includes(selector),'Shared CSS target missing: '+selector);
function create({active=true,phase='live',isExpanded=false,gameType='regular'}={}){
 const d=new JSDOM('<!doctype html><html><body><div id="courtContent"><section data-court-section="current"><details></details></section></div></body></html>',{
   runScripts:'outside-only',url:'https://test.invalid'
 });
 const w=d.window;
 const dbGame={id:'LIVE-1',team:'Knights',opponent:'Rivals',status:'in-progress',
   gameType,date:'2026-11-09',settings:{current:2,format:'quarters'},
   league:'HS',player:'Georgina',stats:{pts:12,reb:5,ast:2,stl:3,ft:1,foul:2,tov:0},
   liveScore:[30,22]};
 w.ui={screen:'court'};
 w.liveGame=()=>active?dbGame:null;
 w.gt46Games=()=>[];
 w.gt4684GameScore=(g)=>g.liveScore;
 w.gt4684GamePhase=()=>phase==='paused'?'paused':phase==='ready'?'not-started':'running';
 w.friendlyDate=()=> 'NOV 09, 2026';
 w.C={totals:g=>g.stats,filtered:g=>g};
 w.chooseGame=(...args)=>{w.__navigation=args;};
 if(isExpanded)w.document.querySelector('details').open=true;
 w.eval(library);
 w.eval(gamesAdapter+'\n'+homeAdapter);
 w.eval('window.__run=gtGBV1IntegrateCourtLive;window.__games=gtGamesFeaturedBannerV1;');
 const root=w.document.getElementById('courtContent');
 w.__run(root);
 return {d,w,root,g:dbGame};
}
for(const phase of ['live','paused','ready']){
 const {d,w,root,g}=create({phase,isExpanded:true});
 const section=root.querySelector('[data-court-section="current"]');
 assert.equal(section.dataset.implementation,'GameBannerSectionV1');
 assert.equal(section.dataset.parent,'SectionV1');
 assert.equal(section.querySelector('h2').textContent,'Live Game');
 assert.equal(section.querySelector('.gtgames-header-action').textContent,'Resume Game');
 assert.equal(section.querySelector('.gtgames-banner').dataset.parent,'SharedBannerV2');
 assert.equal(section.querySelector('.gtgames-banner').dataset.component,'GameBannerV2');
 assert.equal(section.querySelector('.gtcompact-score').textContent,'30 – 22');
 assert.equal(section.querySelectorAll('.gtcompact-stat').length,4);
 assert.equal(section.querySelector('.gtgames-details').open,true);
 const badge=section.querySelector('.gtgames-badge').textContent;
 assert.equal(badge,phase==='paused'?'PAUSED':phase==='ready'?'NOT STARTED':'● LIVE');
 // Reuse the exact Games page adapter and component output.
 const same=w.__games(g,{title:'Live Game',actionLabel:'Resume Game'});
 const normalize=s=>{const clone=s.cloneNode(true);clone.removeAttribute('data-court-section');clone.removeAttribute('data-usage');return clone.outerHTML};
 assert.equal(normalize(section),normalize(same),'Live Game must be same shared section as Latest Game');
 section.querySelector('.gtgames-header-action').click();
 assert.deepEqual(Array.from(w.__navigation),['LIVE-1','live']);
 // On update, the summary rerenders correctly and remains a single section.
 g.liveScore=[35,28];
 w.__run(root);
 assert.equal(root.querySelectorAll('[data-court-section="current"]').length,1);
 assert.equal(root.querySelector('.gtcompact-score').textContent,'35 – 28');
 assert.equal(root.querySelector('.gtgames-details').open,true);
 d.window.close();
 console.log('PASS Home Court '+phase);
}
{
 const {d,w,root}=create({active:false});
 assert.equal(root.querySelector('[data-court-section="current"]'),null,
  'No active game must hide the section');
 d.window.close();
 console.log('PASS Home Court no active game');
}
console.log('PASS Home Court shares same Games/Game Details banner renderer and preserves approved app sections');
