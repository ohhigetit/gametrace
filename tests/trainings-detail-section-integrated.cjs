'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const {JSDOM}=require('jsdom');
const base='28db800e0c6587e925f6d2fb18bcc362a6fa68c1';
const approvedDetail='f6ada665b8994e9babbb2659dcf309946d12c2c6';
const app=fs.readFileSync('index.html','utf8');
const lib=fs.readFileSync('components/game-trace-components.js','utf8');
const css=fs.readFileSync('components/training-detail-banner-v1.css','utf8');
const readAt=(sha,file)=>cp.execFileSync('git',['show',sha+':'+file],{encoding:'utf8',maxBuffer:12*1024*1024});
const oldApp=readAt(base,'index.html'),oldLib=readAt(base,'components/game-trace-components.js');
const approvedCss=readAt(approvedDetail,'components/training-detail-banner-v1.css');
assert.equal(css,approvedCss,'CSS must be the exact approved training detail banner stylesheet');
assert(app.includes(lib),'The standalone app must embed the actual canonical component library');
const style='<style id="gt-training-detail-banner-v1-reusable">\n'+css+'\n</style>';
assert(app.includes(style),'The approved stylesheet must be embedded in full HTML');
const newContent="   content:[gtTrainingsDetailBannerFromRecordsV1()],\n   contentLabel:'Trainings page content',";
const oldContent="   content:[],\n   contentLabel:'Trainings page content',";
const adapterMark="/* TRAININGS_DETAIL_BANNER_STAGE1:";
const priorMark="/* TRAININGS_PAGE_REBUILD_V1:";
const a=app.indexOf(adapterMark),b=app.indexOf(priorMark,a);
assert(a>=0&&b>a,'Missing read-only training detail data adapter');
const adapter=app.slice(a,b);
const recovered=app.replace(lib,oldLib).replace(style,'').replace(adapter,'').replace(newContent,oldContent);
assert.equal(recovered,oldApp,'Only approved component extension, scoped CSS and Trainings page section should change');
assert(/parent\.TrainingDetailBannerSectionV1\(/.test(adapter));
assert(/title:'Training Details',subtitle:'',onAction:null/.test(adapter));
assert(/\.filter\(s=>s&&!s.deletedAt&&matches\(s\)\)/.test(adapter));
assert(/db\.trainingSessions/.test(adapter));
const windowWith=(source,options={})=>{
 const w=new JSDOM('<!doctype html><html><body><div id="trainingContent"></div></body></html>',{
  url:'https://test.invalid/',runScripts:'outside-only'}).window;
 w.eval(source);
 w.ui={screen:'training'};
 w.trainingUI={editing:false,player:'Georgina'};
 w.T={playerKey:v=>String(v||'').toLowerCase()};
 w.db={trainingSessions:[]};
 w.__actions=[];
 w.up1Icon=name=>{const n=w.document.createElement('span');n.dataset.icon=name;return n;};
 w.navigate=x=>w.__actions.push('navigate:'+x);
 w.trainingForm=()=>w.__actions.push('trainingForm');
 return w;
};
const w=windowWith(lib);
const C=w.GameTraceComponents;
for(const name of ['UniversalPageV1','PageHeaderV1','BannerSectionV1','SharedBannerV2','TrainingDetailBannerV1','TrainingDetailBannerSectionV1']){
 assert.equal(typeof C[name],'function','Missing parent component '+name);
}
const make=(opts={})=>C.TrainingDetailBannerSectionV1({
 session:{id:'session-1',name:'Finishing',date:'2026-11-08',kind:'Skills Training',
   minutes:90,coach:'Coach',location:'Gym',skills:['Finishing','Footwork']},
 title:'Training Details',subtitle:'',onAction:null,...opts
});
const section=make();
assert.equal(section.dataset.component,'TrainingDetailBannerSectionV1');
assert.equal(section.dataset.parent,'BannerSectionV1');
assert.equal(section.dataset.foundation,'SectionV1');
assert.equal(section.querySelector('h2').textContent,'Training Details');
assert.equal(section.querySelector('.section-sub'),null,'No section subtitle permitted');
assert.equal(section.querySelector('.section-action'),null,'No section CTA permitted');
const banner=section.querySelector('.training-banner');
assert(banner,'Reusable training banner missing');
assert.equal(banner.dataset.component,'TrainingDetailBannerV1');
assert.equal(banner.dataset.parent,'SharedBannerV2');
assert.equal(banner.querySelector('.session-name').textContent,'Finishing');
assert.equal(banner.querySelector('.minutes').textContent,'90');
assert.equal(banner.querySelectorAll('.tag').length,2);
assert(!/player.?s? notes/i.test(section.textContent),'Player Notes must be absent');
const details=section.querySelector('details');assert(!details.open);details.open=true;assert(details.open);
const empty=make({session:null});
assert.equal(empty.querySelector('.training-banner'),null);
assert.equal(empty.querySelector('h2').textContent,'Training Details');
assert.equal(empty.querySelector('.section-sub'),null);
assert.equal(empty.querySelector('.section-action'),null);
const shellStart=app.indexOf('function gtTrainingsStep1Universal(){',b);
const shellEnd=app.indexOf('\nrenderTraining=function(...args){',shellStart);
assert(shellStart>0&&shellEnd>shellStart);
w.eval(adapter+'\n'+app.slice(shellStart,shellEnd));
w.db.trainingSessions=[
 {id:'old',player:'Georgina',name:'Older training',type:'training',date:'2026-11-06',updatedAt:'2026-11-06',minutes:40,coach:'A',tags:['Shooting']},
 {id:'latest',player:'Georgina',name:'Finishing & Footwork',type:'training',date:'2026-11-09',updatedAt:'2026-11-09',minutes:75,coach:'B',location:'School',tags:['Finishing','Footwork']},
 {id:'deleted',player:'Georgina',name:'Deleted item',type:'camp',date:'2026-11-11',deletedAt:'2026-11-11',minutes:120,tags:[]},
 {id:'other-player',player:'Amanda',name:'Other player',type:'camp',date:'2026-11-10',updatedAt:'2026-11-10',minutes:180,tags:[]}
];
w.eval('gtTrainingsStep1Universal()');
const page=w.document.querySelector('#trainingContent .up1-page');
assert(page,'Universal page missing');
assert.equal(page.dataset.component,'UniversalPage');
assert.equal(page.dataset.page,'trainings');
assert.equal(page.querySelector('.up1-header').dataset.component,'PageHeader');
assert.equal(page.querySelector('h1').textContent,'Trainings');
assert.equal(page.querySelector('.up1-subtitle-v1').textContent,'THE WORK YOU PUT IN. THE PROGRESS YOU MAKE.');
const main=page.querySelector('.up1-content');
assert.equal(main.dataset.component,'PrimaryContent');
assert.equal(main.children.length,1,'Only approved Training Details section should be integrated');
const live=main.firstElementChild;
assert.equal(live.dataset.pageSection,'training-details');
assert.equal(live.querySelector('h2').textContent,'Training Details');
assert.equal(live.querySelector('.section-action'),null);
assert.equal(live.querySelector('.section-sub'),null);
assert.equal(live.querySelector('.session-name').textContent,'Finishing & Footwork');
assert.equal(live.querySelector('.minutes').textContent,'75');
assert.equal(live.querySelectorAll('.tag').length,2);
assert.equal(live.querySelector('article').dataset.gameId,'latest');
assert(!live.textContent.includes('Deleted item'));
assert(!live.textContent.includes('Other player'));
assert(!/player.?s? notes/i.test(live.textContent));
page.querySelector('button[aria-label="Back to Home Court"]').click();
page.querySelector('button[aria-label="Log Session"]').click();
assert.deepEqual(w.__actions,['navigate:court','trainingForm']);
w.trainingUI.player='Amanda';
w.eval('gtTrainingsStep1Universal()');
assert.equal(w.document.querySelector('.session-name').textContent,'Other player');
assert.equal(w.document.querySelector('.minutes').textContent,'3');
assert.equal(w.document.querySelector('.unit').textContent,'HOURS');
w.db.trainingSessions=[];
w.eval('gtTrainingsStep1Universal()');
assert.equal(w.document.querySelector('.training-banner'),null);
assert.equal(w.document.querySelector('.gt-training-detail-section h2').textContent,'Training Details');
assert(w.document.querySelector('.gt-banner-section-empty')?.textContent.includes('No completed training'));
w.trainingUI.editing=true;
const previous=w.document.querySelector('#trainingContent').firstElementChild;
w.eval('gtTrainingsStep1Universal()');
assert.equal(w.document.querySelector('#trainingContent').firstElementChild,previous,'Editing guard should preserve form screen');
const form=w.document.createElement('form');form.className='training-form';
w.trainingUI.editing=false;w.document.querySelector('#trainingContent').append(form);
w.eval('gtTrainingsStep1Universal()');
assert(w.document.querySelector('#trainingContent').contains(form),'Active form guard must preserve form');
w.close();
// Regression check: GameBanner V2 and GameBannerSection must generate same markup as the approved DEV shell baseline.
const oldWindow=windowWith(oldLib);
for(const data of [
 {gameId:'g1',team:'Knights',opponent:'Panthers',score:['55','50'],contextDate:'Nov 9',badgeText:'WIN',stats:{pts:18,reb:7,ast:4,stl:2}},
 {gameId:'g2',team:'Knights',opponent:'Panthers',score:['10','12'],contextDate:'Nov 9',badgeText:'● LIVE',tone:'live',stats:{pts:4,reb:1}}
]){
 const old=oldWindow.GameTraceComponents.GameBannerSectionV1({title:'Game Summary',banner:oldWindow.GameTraceComponents.GameBannerV2(data),onAction:()=>{}});
 const next=C.GameBannerSectionV1({title:'Game Summary',banner:C.GameBannerV2(data),onAction:()=>{}});
 assert.equal(next.outerHTML,old.outerHTML,'Previously approved Game Banner DOM must remain unchanged');
}
assert.equal(typeof C.TrainingDetailBannerV1,'function');
console.log('PASS: exact approved Training Detail design and real reusable parent constructors');
console.log('PASS: Trainings page live data selection, title only, no subtitle/action/notes, empty state, edit safeguards');
console.log('PASS: unchanged approved Games and Game Details GameBanner markup and shared PageHeader');
