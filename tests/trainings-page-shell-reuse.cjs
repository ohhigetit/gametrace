'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const {JSDOM}=require('jsdom');
const baseline='2e4a4e7a86a643aa85f2041a3349c0adc18302d9';
const html=fs.readFileSync('index.html','utf8');
const lib=fs.readFileSync('components/game-trace-components.js','utf8');
const oldHtml=cp.execFileSync('git',['show',baseline+':index.html'],{encoding:'utf8',maxBuffer:10*1024*1024});
const oldLib=cp.execFileSync('git',['show',baseline+':components/game-trace-components.js'],{encoding:'utf8',maxBuffer:10*1024*1024});
assert(html.includes(lib),'App must embed canonical shared component library unchanged');
const getBlock=(src,from,to)=>{
 const a=src.indexOf(from),b=src.indexOf(to,a);
 assert(a>=0&&b>a,'Cannot locate '+from);
 return src.slice(a,b+to.length);
};
const from='const gtTrainingsStep1Original=renderTraining;',to='/* GT_TRAININGS_STEP1_END */';
const oldBlock=getBlock(oldHtml,from,to);
const newBlock=getBlock(html,from,to);
assert.equal(html,oldHtml.replace(oldLib,lib).replace(oldBlock,newBlock),
 'Only shared component constructors and Trainings page assembler may change');
assert(newBlock.includes('parent.UniversalPageV1('));
assert(newBlock.includes('parent.PageHeaderV1('));
assert(newBlock.includes('content:[],'));
assert(newBlock.includes('gtTrainingsStep1Original.apply(this,args)'));
const approvedFn=getBlock(oldBlock,'function gtTrainingSummaryBannerSectionV8(){','\n body.append(gtTrainingSummaryBannerSectionV8());');
assert(newBlock.includes(approvedFn.slice(0,approvedFn.indexOf('\n body.append'))),
 'Preserve approved Training Summary V8 renderer for subsequent integration');
const win=()=>{
 const w=new JSDOM('<!doctype html><html><body><div id="trainingContent"></div></body></html>',{
  runScripts:'outside-only',url:'https://test.invalid'}).window;
 w.eval(lib);
 w.ui={screen:'training'};
 w.trainingUI={editing:false};
 w.__actions=[];
 w.up1Icon=name=>{const icon=w.document.createElement('span');icon.dataset.icon=name;return icon;};
 w.navigate=page=>w.__actions.push('navigate:'+page);
 w.trainingForm=()=>w.__actions.push('trainingForm');
 w.gtTrainingsRecentAllTypesV1=()=>w.document.createElement('section');
 w.gtTrainingSummaryBannerSectionV8Original=()=>{
   const s=w.document.createElement('section');s.dataset.component='TrainingSummaryBannerSectionV8';
   const banner=w.document.createElement('div');banner.className='gttsv2-banner';s.append(banner);return s;
 };
 w.gtALV1Section=()=>{const s=w.document.createElement('section');s.innerHTML='<header class="gtal-header">Training Summary</header>';return s;};
 return w;
};
const oldW=win(),newW=win();
const oldFn=oldW.eval('('+getBlock(oldBlock,'function gtTrainingsStep1Universal(){','\nrenderTraining=function').slice(0,-'\nrenderTraining=function'.length)+')');
const newFn=newW.eval('('+getBlock(newBlock,'function gtTrainingsStep1Universal(){','\nrenderTraining=function').slice(0,-'\nrenderTraining=function'.length)+')');
oldFn();newFn();
const oldRoot=oldW.document.querySelector('#trainingContent'),newRoot=newW.document.querySelector('#trainingContent');
const oldPage=oldRoot.querySelector('.up1-page'),newPage=newRoot.querySelector('.up1-page');
assert(oldPage&&newPage,'Universal page missing');
assert.equal(newPage.dataset.page,'trainings');
assert.equal(newPage.dataset.component,'UniversalPage');
assert.equal(newPage.dataset.version,'V1');
assert.equal(newPage.querySelector('.up1-header').dataset.component,'PageHeader');
assert.equal(newPage.querySelector('.up1-content').dataset.component,'PrimaryContent');
assert.equal(newPage.querySelector('.up1-footer').dataset.component,'PageFooter');
assert.equal(newPage.querySelector('h1').textContent,'Trainings');
assert.equal(newPage.querySelector('.up1-subtitle-v1').textContent,'THE WORK YOU PUT IN. THE PROGRESS YOU MAKE.');
assert.equal(oldPage.querySelector('.up1-header').outerHTML,newPage.querySelector('.up1-header').outerHTML,
 'Approved Trainings header DOM must be byte-for-byte identical');
assert.equal(oldPage.querySelector('.up1-footer').outerHTML,newPage.querySelector('.up1-footer').outerHTML,
 'Approved footer DOM must be identical');
assert.equal(newPage.querySelector('.up1-content').children.length,0,
 'PrimaryContent must be empty for section-by-section integration');
newPage.querySelector('button[aria-label="Back to Home Court"]').click();
newPage.querySelector('button[aria-label="Log Session"]').click();
assert.deepEqual(newW.__actions,['navigate:court','trainingForm']);
newW.trainingUI.editing=true;newFn();assert.equal(newRoot.firstElementChild,newPage,
 'Do not replace training edit screen while editing');
newW.trainingUI.editing=false;newW.ui.screen='session';newFn();assert.equal(newRoot.firstElementChild,newPage,
 'Do not replace session detail screen');
newW.ui.screen='training';
const form=newW.document.createElement('form');form.className='training-form';newRoot.append(form);
newFn();assert.equal(newRoot.lastElementChild,form,'Do not overwrite active edit form');
console.log('PASS reusable UniversalPage V1 / PageHeader V1 Training shell');
console.log('PASS exact approved header/footer DOM parity and working Back/Log Session');
console.log('PASS empty PrimaryContent, preserved source functions, no other page changes');
