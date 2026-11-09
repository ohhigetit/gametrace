'use strict';
/* Compare DOM from the exact approved DEV baseline to the migrated reusable components.
   This test uses isolated fixtures ONLY; it never inserts records into the application. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const {JSDOM}=require('jsdom');
const baseline='0a0c17eb19e8a64e071cb785052af1c04e2a5ee1';
const oldHtml=cp.execFileSync('git',['show',baseline+':index.html'],{encoding:'utf8',maxBuffer:6*1024*1024});
const newHtml=fs.readFileSync('index.html','utf8');
const library=fs.readFileSync('components/game-trace-components.js','utf8');
const start='function gtGamesFeaturedBannerV1(selectedGame=null, options={}){';
const stop='/* Games migration Stage 3';
function extract(html) {
 const a=html.indexOf(start),b=html.indexOf(stop,a);
 assert(a>=0&&b>a,'Games adapter boundaries intact');
 return html.slice(a,b);
}
assert(newHtml.includes(library),'App must inline the exact canonical component library for offline support');
assert(newHtml.includes('gtTrainingSummaryBannerSectionV8Original'),'Approved training V8 retained');
assert(newHtml.includes('gt-global-banner-cell-alignment-qa'),'Approved banner CSS retained');
assert(newHtml.includes('gtGameDetailsUniversalV1'),'Game Details retained');
assert(newHtml.includes('gtGamesRecentActivityListV1'),'Games activity list retained');
for(const fn of ['SharedBannerV2','GameBannerV2','GameBannerSectionV1'])
 assert(library.includes('function '+fn+'('),'Real reusable '+fn+' must be exported');
const examples=[
 {name:'completed win',live:false,chosen:false,
  game:{id:'G1',date:'2026-11-08',team:'Knights',opponent:'Eagles',
   status:'completed',gameType:'Regular',league:'Fall League',player:'Georgina',
   finalScore:{team:54,opponent:42},stats:{pts:18,reb:4,ast:3,stl:2,ft:4,foul:2,tov:1}}},
 {name:'completed loss',live:false,chosen:true,
  game:{id:'G2',date:'2026-11-08',team:'Knights',opponent:'Lions',
   status:'completed',finalScore:{team:39,opponent:43},
   stats:{pts:11,reb:2,ast:1,stl:0}}},
 {name:'active live game',live:true,chosen:false,
  game:{id:'L1',date:'2026-11-09',team:'Knights',opponent:'Falcons',
   status:'in-progress',gameType:'Playoffs',settings:{current:2,format:'quarters'},
   liveScore:[22,17],stats:{pts:10,reb:3,ast:2,stl:1,ft:2,foul:0,tov:0}}},
 {name:'active paused game',live:true,paused:true,chosen:false,
  game:{id:'L2',date:'2026-11-09',team:'Knights',opponent:'Bears',
   status:'in-progress',settings:{current:1,format:'halves'},
   liveScore:[15,14],stats:{pts:6,reb:2,ast:2,stl:0}}},
 {name:'empty state',live:false,empty:true}
];
function build(source,mode,c) {
 const dom=new JSDOM('<!doctype html><html><head></head><body></body></html>',{
  runScripts:'outside-only',url:'https://test.invalid'
 });
 const w=dom.window;
 const g=c.empty?null:c.game;
 w.liveGame=()=>c.live?g:null;
 w.gt46Games=()=>c.empty?[]:[g];
 w.gt4684GameScore=x=>x.liveScore;
 w.gt4684GamePhase=()=>c.paused?'paused':'running';
 w.friendlyDate=date=>'NOV 08, 2026';
 w.C={filtered:x=>x,totals:x=>x.stats||{}};
 w.chooseGame=(...args)=>{w.__clicked=args};
 if(mode==='new')w.eval(library);
 w.eval(source+'\nwindow.__render=gtGamesFeaturedBannerV1;');
 const opts=c.chosen?{title:'Game Summary',hideOpenAction:true}:{};
 const result=w.__render(c.chosen?g:null,opts);
 w.document.body.append(result);
 return {dom,w,result};
}
function normalize(root) {
 const clone=root.cloneNode(true);
 clone.removeAttribute('data-parent');
 clone.removeAttribute('data-implementation');
 const banner=clone.querySelector('.gtgames-banner');
 if(banner)banner.dataset.component='GameBannerV1';
 return clone.outerHTML;
}
for(const c of examples) {
 const before=build(extract(oldHtml),'old',c);
 const after=build(extract(newHtml),'new',c);
 assert.equal(normalize(after.result),normalize(before.result),c.name+' must preserve approved HTML');
 if(!c.empty){
  assert.equal(after.result.querySelector('.gtgames-banner')?.dataset.parent,'SharedBannerV2');
  assert.equal(after.result.querySelectorAll('[data-component="BannerRowV1"]').length,1);
  assert.equal(after.result.querySelectorAll('[data-component="BannerCellV1"]').length,4);
  const details=after.result.querySelector('.gtgames-details');
  assert(details,c.name+' details');
  details.open=true;
  details.dispatchEvent(new after.w.Event('toggle'));
  assert.equal(details.querySelector('summary').textContent,'Hide Details');
  if(!c.chosen) {
   const button=after.result.querySelector('.gtgames-header-action');
   assert(button,'open-action preserved');
   button.click();
   assert.deepEqual(Array.from(after.w.__clicked),[c.game.id,c.live?'live':'stats']);
  } else assert(!after.result.querySelector('.gtgames-header-action'),'Game Details should omit open action');
 }
 before.dom.window.close();
 after.dom.window.close();
 console.log('PASS '+c.name);
}
console.log('PASS Games banner V2 real component reuse, DOM parity, handlers and approved V8 preservation');
