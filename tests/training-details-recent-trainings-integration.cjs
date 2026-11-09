'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const {JSDOM}=require('jsdom');

const base='762243d476ca9878d9331d62dd15165decf5dcdf';
const original=path=>cp.execFileSync('git',['show',base+':'+path],{
 encoding:'utf8',maxBuffer:22*1024*1024
});
const html=fs.readFileSync('index.html','utf8');
const before=original('index.html');
const lib=fs.readFileSync('components/game-trace-components.js','utf8');
const css=fs.readFileSync('components/training-details-recent-trainings-v1.css','utf8');
assert.equal(lib,original('components/game-trace-components.js'),'Approved reusable library must remain unchanged');
assert(html.includes(lib),'Full app must embed canonical reusable library');
const style='<style id="gt-training-details-recent-trainings-v1">\n'+css+'\n</style>';
assert(html.includes(style),'Full app must embed scoped approved ActivityList CSS');
assert(css.includes('#sessionContent [data-page="training-details"]'),'Styles scoped to Training Details');
assert(!css.includes('#trainingContent'),'Do not restyle Trainings overview');
assert(!css.includes('#statsContent'),'Do not restyle Game Details');

function between(code,start,end){
 const a=code.indexOf(start),b=code.indexOf(end,a);
 assert(a>=0&&b>a,'Could not find expected boundary: '+start);
 return code.slice(a,b);
}
const recentStart='function gtTrainingsRecentAllTypesV1(';
const recentEnd='/* GT_APPROVED_TRAINING_SUMMARY_V8_COMPONENT_START */';
const oldRecent=between(before,recentStart,recentEnd);
const newRecent=between(html,recentStart,recentEnd);
const shellStart='/* TRAINING_DETAILS_UNIVERSAL_SHELL_V1';
const shellEnd='/* GT_TRAININGS_STEP1_END */';
const oldShell=between(before,shellStart,shellEnd);
const newShell=between(html,shellStart,shellEnd);
assert.equal(html.replace(style,'').replace(newRecent,oldRecent).replace(newShell,oldShell),before,
  'Only canonical Recent Trainings function parameters, Training Details section, and scoped styles should change');
assert(newRecent.includes('gtALV1Section({'),'Must reuse approved ActivityList V1');
assert(newShell.includes('content:[trainingSummary,sessionNotes,recentTrainings]'),'Section order must follow approved layout');
assert(newShell.includes('limit:10'),'Individual Training Details max ten');
assert(newShell.includes("returnTo:'training'"),'Recent list row must navigate to saved Training Details');

// Exercise approved Recent Trainings builder directly, including unfiltered
// Trainings-page semantics and scoped, player-specific ten-record limit.
const w=new JSDOM('<!doctype html><html><body><div id="sessionContent"></div><div id="trainingContent">Approved Trainings overview</div></body></html>',{
 url:'https://test.invalid',runScripts:'outside-only'
}).window;
w.eval(lib);
const Cmp=w.GameTraceComponents;
const records=Array.from({length:13},(_,i)=>({
 id:'g'+i,player:'Georgina',type:i%3===0?'camp':'training',
 customType:i%3===1?'Custom Training':'',
 date:'2026-10-'+String(i+1).padStart(2,'0'),
 updatedAt:'2026-10-'+String(i+1).padStart(2,'0')+'T16:30:00',
 name:'Session '+i,minutes:60+i,tags:['Footwork'],coach:'Coach'
}));
records.push({id:'a1',player:'Amanda',name:'Other player session',type:'training',date:'2026-11-02',minutes:60});
records.push({id:'z0',player:'Georgina',name:'Deleted session',type:'training',date:'2026-11-05',deletedAt:'2026-11-06',minutes:60});
w.trainingUI={player:''};
w.db={trainingSessions:records};
w.T={playerKey:x=>String(x||'').trim().toLowerCase()};
w.friendlyDate=x=>x;
w.trainingDuration=x=>String(x)+'m';
w.__opens=[];
w.openSession=(id,back)=>w.__opens.push({id,back});
w.gtALV1Section=({key,title,subtitle,items,empty})=>{
 const section=w.document.createElement('section');
 section.dataset.courtSection=key;
 section.dataset.title=title;
 section.dataset.subtitle=subtitle;
 section.items=items;
 section.dataset.empty=empty;
 return section;
};
w.eval(newRecent);
let full=w.eval('gtTrainingsRecentAllTypesV1()');
assert.equal(full.items.length,14,'Trainings overview must still show all active sessions');
assert.equal(full.items[0].id,'a1','Trainings overview still sorts most recent first');
assert.equal(full.dataset.title,'Recent Trainings');
assert.equal(full.dataset.subtitle,'Every session. Every step forward.');
let recent=w.eval("gtTrainingsRecentAllTypesV1({limit:10,player:'Georgina',returnTo:'training'})");
assert.equal(recent.items.length,10,'Training Details must show exactly ten recent sessions when available');
assert.deepEqual(recent.items.map(i=>i.id),records.slice(3,13).reverse().map(i=>i.id),
  'Player sessions must sort newest first with hard limit ten');
assert(recent.items.some(item=>item.kind==='camp'),'Camp records must be included');
assert(recent.items.some(item=>item.typeLabel.startsWith('Custom')),'Custom records must be included');
assert(recent.items.some(item=>item.kind==='training'),'Training records must be included');
assert.equal(recent.dataset.parent,'SectionV1');
assert.equal(recent.dataset.component,'ActivityList');
assert.equal(recent.querySelectorAll('button').length,0,'Presentation stub should be unmodified');
recent.items[0].open();
assert.deepEqual(w.__opens[0],{id:'g12',back:'training'},'Selected record opens actual saved session');
const amanda=w.eval("gtTrainingsRecentAllTypesV1({limit:10,player:'Amanda'})");
assert.equal(amanda.items.length,1,'Individual detail view scopes list to session player');
assert.equal(amanda.items[0].id,'a1');
w.trainingUI.player='Amanda';
const overviewFiltered=w.eval('gtTrainingsRecentAllTypesV1()');
assert.equal(overviewFiltered.items.length,1,'Existing Trainings page player filter remains intact');
w.trainingUI.player='';
w.db.trainingSessions=[];
assert.equal(w.eval("gtTrainingsRecentAllTypesV1({limit:10,player:'Georgina'})").items.length,0,
 'Empty saved sessions must render approved empty list');

// Verify Training Details page uses the same ActivityList builder, with its
// identity and proper relative placement, not a copied list implementation.
const opened=[];
w.__log=[];
w.db={trainingSessions:[{
 id:'target',player:'Georgina',name:'Skills Training',date:'2026-11-09',
 minutes:90,type:'training',tags:['Finishing'],feedback:{see:'I noticed my angles'}
}]};
w.ui={screen:'session'};
w.sessionUI={id:'target',returnTo:'training'};
w.navigate=page=>opened.push(page);
w.trainingForm=id=>opened.push('edit:'+id);
w.announce=msg=>w.__log.push(msg);
w.up1Icon=key=>{const svg=w.document.createElement('span');svg.dataset.icon=key;return svg;};
w.renderSessionDetail=()=>{
 const h=w.document.createElement('header'),btn=w.document.createElement('button');
 btn.className='gt465-header-edit';btn.textContent='Edit';
 btn.addEventListener('click',()=>opened.push('original-edit'));
 h.append(btn);w.document.getElementById('sessionContent').replaceChildren(h);
};
let args=null;
w.gtTrainingsRecentAllTypesV1=options=>{
 args=options;
 const section=w.document.createElement('section');
 section.dataset.component='ActivityList';
 section.dataset.parent='SectionV1';
 section.className='gtal-section';
 section.append(w.document.createElement('header'),w.document.createElement('div'));
 return section;
};
w.eval(newShell);
const oldGym=w.document.getElementById('trainingContent').outerHTML;
w.renderSessionDetail();
let page=w.document.querySelector('#sessionContent [data-page="training-details"]');
assert(page,'The selected Training Details page must still render');
assert.equal(page.dataset.component,'UniversalPage');
assert.equal(page.querySelector('h1').textContent,'Training Details');
const sections=[...page.querySelectorAll('.up1-content > section')];
assert.equal(sections.length,3,'Exactly three approved section components should appear');
assert.deepEqual(sections.map(e=>e.dataset.component),[
 'TrainingDetailBannerSectionV1','PlayerNotesSectionV1','ActivityList'
]);
assert.deepEqual(JSON.parse(JSON.stringify(args)),{limit:10,player:'Georgina',returnTo:'training'},
 'Recent Trainings uses the selected training record player and limit 10');
assert.equal(w.document.getElementById('trainingContent').outerHTML,oldGym,
 'Existing Trainings overview must not be modified by Training Details rendering');
page.querySelector('.gt465-header-edit').click();
page.querySelector('.up1-back').click();
assert(opened.includes('original-edit')&&opened.includes('training'),
 'Existing edit and back navigation still work');
console.log('PASS: approved ActivityList, top-ten newest player sessions and all three record types');
console.log('PASS: original Trainings overview remains unlimited; selected sessions open Training Details');
console.log('PASS: Training Summary, Player Notes, page header, Games and unrelated content remain unchanged');
