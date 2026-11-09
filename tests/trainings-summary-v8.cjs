'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const previous=fs.readFileSync('tests/GameTrace_Trainings_Recent_AllTypes_TEST.html','utf8');
const integrated=fs.readFileSync('tests/GameTrace_Trainings_SummaryV8_FirstSection_TEST.html','utf8');
const approved=fs.readFileSync('components/approved/TrainingSummaryBannerV8.approved.html','utf8');
const styles=[...approved.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g)].map(m=>m[1]).slice(1);
assert.equal(styles.length,4,'Approved V8 component must have four CSS blocks');
for(const css of styles)assert(integrated.includes(css),'An approved V8 CSS block was modified');
const approvedScript=approved.match(/<script>([\s\S]*?)<\/script>/)[1].split('\nconst sample=')[0].trim();
assert(integrated.includes(approvedScript),'Original approved component renderer must be reused exactly');
const styleStart='<!-- GT_APPROVED_TRAINING_SUMMARY_V8_STYLES_START -->\n';
const styleEnd='<!-- GT_APPROVED_TRAINING_SUMMARY_V8_STYLES_END -->\n';
const codeStart='/* GT_APPROVED_TRAINING_SUMMARY_V8_COMPONENT_START */\n';
const codeEnd='/* GT_APPROVED_TRAINING_SUMMARY_V8_COMPONENT_END */\n';
const a=integrated.indexOf(styleStart),b=integrated.indexOf(styleEnd,a),c=integrated.indexOf(codeStart),d=integrated.indexOf(codeEnd,c);
assert(a>=0&&b>a&&c>=0&&d>c,'Source boundaries missing');
const css=integrated.slice(a+styleStart.length,b);
const code=integrated.slice(c+codeStart.length,d);
const cleaned=integrated.replace(styleStart+css+styleEnd,'').replace(codeStart+code+codeEnd,'')
  .replace('body.append(gtTrainingSummaryBannerSectionV8());\n ','');
assert.equal(cleaned,previous,'The approved Trainings baseline has unrelated changes');
const first='body.append(gtTrainingSummaryBannerSectionV8());\n body.append(gtTrainingsRecentAllTypesV1());';
assert(integrated.includes(first),'Training Summary must precede Recent Trainings');
assert(!integrated.includes('body.append(gtTrainingsPlayerNotesV1())'),'Rejected Player Notes must not appear');
assert(code.includes("T.summarize(records)"),'Use existing GameTrace training summary model');
assert(code.includes('for(const skill of (Array.isArray(s.tags)?s.tags:[]))'),'Use real logged skills');
assert(code.includes('s.customType'),'Include custom sessions');
assert(code.includes('summary.earned'),'Use real earned achievements');
assert(!code.includes('trainingCommit(')&&!code.includes('transaction('),'Banner must be read-only');
// Execute actual locked renderer and production adapter with representative data in a DOM.
const dom=new JSDOM('<!doctype html><html><body></body></html>',{runScripts:'outside-only',url:'https://test.invalid'});
const w=dom.window;
w.trainingUI={player:'Georgina'};
w.db={trainingSessions:[
 {id:'t1',player:'Georgina',type:'training',name:'Shooting',date:'2026-11-08',minutes:90,tags:['Shooting','Finishing']},
 {id:'t2',player:'Georgina',type:'camp',name:'Fall Camp',date:'2026-11-07',minutes:120,tags:['Ball handling']},
 {id:'t3',player:'Georgina',type:'training',customType:'Team Practice',name:'Team Practice',date:'2026-11-06',minutes:60,tags:['Defense']},
 {id:'t4',player:'Georgina',type:'training',name:'Performance & Agility',date:'2026-11-05',minutes:60,tags:['Agility']},
 {id:'d',player:'Georgina',type:'camp',name:'Deleted',date:'2026-11-04',minutes:500,deletedAt:'2026-11-06',tags:['Hidden Skill']},
 {id:'p',player:'Other',type:'training',name:'Other Player',date:'2026-11-04',minutes:200,tags:['Hidden Skill']}
]};
w.T={
 playerKey:v=>String(v||'').toLowerCase(),
 summarize:items=>({sessions:items,totalMinutes:items.reduce((a,s)=>a+s.minutes,0),
 current:2,longest:4,next:10,earned:[5]})
};
w.eval(code+'\nwindow.__renderTrainingSummary=gtTrainingSummaryBannerSectionV8;');
const section=w.__renderTrainingSummary();
assert.equal(section.dataset.component,'TrainingSummaryBannerSectionV8');
assert.equal(section.dataset.parent,'SectionV1');
assert.equal(section.querySelector('.gttsv2-banner').dataset.parent,'SharedBannerV2');
assert.equal(section.querySelector('.gttsv2-hero-number').textContent,'4','All 4 session categories must count');
assert(section.textContent.includes('6.5'),'Total duration is 390 minutes = 6.5 hours');
for(const label of ['Skills','Performance','Camps','Other','Shooting','Finishing','Defense','Agility'])assert(section.textContent.includes(label),'Missing category or skill '+label);
assert(!section.textContent.includes('Hidden Skill'),'Deleted or unrelated-player records leaked into banner');
assert.equal(section.querySelectorAll('[data-component="BannerRowV1"]').length,3,'Three visible rows expected');
assert.equal(section.querySelectorAll('[data-component="BannerCellV1"]').length,6,'2+1+3 cells expected');
assert(!section.querySelector('details, summary'),'No Show Details allowed');
dom.window.close();
console.log('PASS Training Summary V8: exact design source, 3-row structure, all session types, skills, true totals, original Trainings retained.');
