'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('tests/GameTrace_Trainings_BannerAlignment_QA.html','utf8');
const canonical=fs.readFileSync('components/game-trace-components.js','utf8');
const start='/* GT_APPROVED_TRAINING_SUMMARY_V8_COMPONENT_START */\\n';
const end='/* GT_APPROVED_TRAINING_SUMMARY_V8_COMPONENT_END */\\n';
const a=html.indexOf(start);
const b=html.indexOf(end,a);
assert(a>=0&&b>a,'V8 component/adapter boundaries lost');
const code=html.slice(a+start.length,b);
assert(code.includes('function gtTrainingSummaryBannerSectionV8Original()'),
       'Unmodified V8 adapter alias missing');
const c=html.indexOf('function gtTrainingSummaryBannerSectionV8(){',b);
const d=html.indexOf('body.append(gtTrainingSummaryBannerSectionV8());',c);
assert(c>=0&&d>c,'Section V1 adapter wrapper missing');
const wrap=html.slice(c,d);
assert(wrap.includes('window.GameTraceComponents.Section({'), 'Parent constructor not invoked');
const dom=new JSDOM('<!doctype html><html><body></body></html>',{
 runScripts:'outside-only',url:'https://test.invalid'
});
const w=dom.window;
w.trainingUI={player:'Georgina'};
w.db={trainingSessions:[
 {id:'t1',player:'Georgina',type:'training',name:'Shooting',date:'2026-11-08',minutes:90,tags:['Shooting','Finishing']},
 {id:'t2',player:'Georgina',type:'camp',name:'Fall Camp',date:'2026-11-07',minutes:120,tags:['Ball handling']},
 {id:'t3',player:'Georgina',type:'training',customType:'Team Practice',name:'Practice',date:'2026-11-06',minutes:60,tags:['Defense']},
 {id:'t4',player:'Georgina',type:'training',name:'Performance & Agility',date:'2026-11-05',minutes:60,tags:['Agility']}
]};
w.T={playerKey:v=>String(v||'').toLowerCase(),
 summarize:items=>({sessions:items,totalMinutes:items.reduce((a,s)=>a+s.minutes,0),current:2,longest:4,next:10,earned:[5]})};
w.eval(canonical);
let calls=0;
const originalSection=w.GameTraceComponents.Section;
const spySection=(args)=>{calls++;return originalSection(args)};
Object.defineProperty(w,'GameTraceComponents',{configurable:true,value:
 Object.freeze({...w.GameTraceComponents,Section:spySection})});
w.eval(code+'\n'+wrap+'\nwindow.__original=gtTrainingSummaryBannerSectionV8Original;window.__parent=gtTrainingSummaryBannerSectionV8;');
const legacy=w.__original();
const actual=w.__parent();
assert.equal(calls,1,'Section V1 constructor must run exactly once');
assert.equal(actual.dataset.parent,'SectionV1');
assert.equal(actual.dataset.component,'TrainingSummaryBannerSectionV8');
assert.equal(actual.querySelector('.gttsv2-banner').dataset.parent,'SharedBannerV2');
assert.equal(actual.querySelectorAll('[data-component="BannerCellV1"]').length,6);
assert.equal(actual.querySelectorAll('[data-component="BannerRowV1"]').length,3);
assert.equal(actual.textContent,legacy.textContent,'Approved wording and values changed');
assert.equal(actual.querySelector('.gttsv2-section-head').outerHTML,
             legacy.querySelector('.gttsv2-section-head').outerHTML,'Approved header changed');
assert.equal(actual.querySelector('.gttsv2-banner').outerHTML,
             legacy.querySelector('.gttsv2-banner').outerHTML,'Approved banner DOM changed');
assert(!actual.querySelector('.gtc-section-header,.gtc-section-content'),
 'Generated non-approved wrapper markup leaked into approved layout');
console.log('PASS: real canonical Section V1 constructor called, all approved V8 DOM/values preserved');
dom.window.close();
