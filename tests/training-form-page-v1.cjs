'use strict';
/** Review-only Training Form V1 integration regression. Run: node tests/training-form-page-v1.cjs */
const fs=require('fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const errors=[],vc=new VirtualConsole();
vc.on('jsdomError',e=>{if(!/HTMLCanvasElement|HTMLMediaElement|navigation|window.scrollTo/.test(e.message))errors.push(e.message)});
const html=fs.readFileSync('index.html','utf8').replace('\nload();\nwindow.GameTraceFamily.boot();',
 '\nwindow.__qa={run:code=>eval(code)};\nload();\nwindow.GameTraceFamily.boot();');
const dom=new JSDOM(html,{url:'https://test.example/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({measureText:()=>({width:10}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
w.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
w.ResizeObserver=class{observe(){}disconnect(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLElement.prototype.setPointerCapture=()=>{};w.HTMLElement.prototype.hasPointerCapture=()=>false;
w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
w.confirm=()=>true;w.fetch=async()=>{throw Error('Unexpected network request')};w.CSS={escape:s=>s};
}});
const w=dom.window,d=w.document,wait=()=>new Promise(resolve=>setTimeout(resolve,85));
const run=code=>w.__qa.run(code);
const root=()=>d.getElementById('trainingContent');
function input(label){
 const target=[...root().querySelectorAll('.gt-training-form-v1 .gtf-field-v1')]
  .find(e=>e.querySelector('.gtf-label-v1')?.textContent.replace('*','').trim().toLowerCase()===label.toLowerCase());
 assert(target,'Missing reusable field: '+label);
 return target.querySelector('input,select,textarea');
}
function set(label,value){
 const x=input(label);x.value=value;
 x.dispatchEvent(new w.Event('input',{bubbles:true}));
 x.dispatchEvent(new w.Event('change',{bubbles:true}));
 return x;
}
function clickSave(){
 const b=root().querySelector('.gt-training-form-v1 .gtf-action-primary-v1');
 assert(b,'Training Form V1 save action missing');b.click();
}
function count(){return root().querySelectorAll('[data-component="FormSectionV1"]').length}
(async()=>{
 await wait();
 const skip=[...d.querySelectorAll('button')].find(x=>x.textContent.trim()==='Skip');if(skip)skip.click();
 await wait();
 assert(w.__qa,'Application test hook missing: '+errors.join('; '));
 run("celebrateTrophies=()=>{};db=C.blankDB();setPlayerContext('Georgina');navigate('training');trainingForm();");
 await wait();
 assert(root().querySelector('[data-component="UniversalPage"][data-page="training-form"]'),'UniversalPage V1 not in use');
 assert(root().querySelector('[data-component="PageHeader"]'),'PageHeader V1 not in use');
 assert(root().querySelector('[data-component="FormParentV1"]'),'Form Parent V1 not in use');
 assert(count()===4,'Expected four reusable form section cards');
 assert(root().querySelector('form.gt495-form[hidden]'),'Native editor should be retained but hidden');
 assert(root().querySelector('.up1-title h1')?.textContent==='New Training','New Training header incorrect');
 set('Session Type','custom');assert(!input('Custom Session Type').closest('.gtf-field-v1').hidden,'Custom type should be visible');
 set('Custom Session Type','Team Practice');
 set('Session Name','Friday Shooting');
 set('Hours','1');set('Minutes','30');
 set('What I Saw','An opening in the defense');
 set('What I Became','More aggressive');
 set('What I Want to Become More','A stronger finisher');
 set('Additional Feedback','Confident and focused');
 const chips=[...root().querySelectorAll('.gt-training-form-v1 .gt-training-skill-v1')];
 assert(chips.length>3,'Skills missing');chips[0].click();
 set('Custom Skills','Passing');
 root().querySelector('.gt-training-add-v1').click();
 clickSave();await wait();
 assert(run('ui.screen')==='session','New Training did not save');
 const id=run('sessionUI.id'),record=run('db.trainingSessions.find(s=>s.id===sessionUI.id)');
 assert(record?.name==='Friday Shooting'&&record?.minutes===90,'Session payload incorrect');
 assert(record?.customType==='Team Practice'&&record?.type==='training','Custom type persistence incorrect');
 assert(record?.tags.includes('Passing'),'Custom skill was not saved');
 assert(record?.feedback?.additional==='Confident and focused','Additional feedback not saved');
 console.log('PASS new training, custom type/skill, native save, feedback');
 run("navigate('training');trainingForm("+JSON.stringify(id)+");");await wait();
 assert(root().querySelector('.up1-title h1')?.textContent==='Edit Training','Edit header incorrect');
 assert(count()===4&&input('Session Name').value==='Friday Shooting','Edit not prefilled');
 assert(input('Additional Feedback').value==='Confident and focused','Edit feedback not prefilled');
 set('Session Name','Friday Shooting Updated');clickSave();await wait();
 assert(run('db.trainingSessions.length')===1,'Edit should not create duplicate');
 assert(run('db.trainingSessions[0].id')===id,'Edit changed record ID');
 assert(run('db.trainingSessions[0].name')==='Friday Shooting Updated','Edit was not persisted');
 console.log('PASS edit preserves ID and feedback');
 run("navigate('training');trainingForm("+JSON.stringify(id)+",true);");await wait();
 assert(root().querySelector('.up1-title h1')?.textContent==='Repeat Training','Repeat header incorrect');
 assert(input('Hours').value===''&&input('Minutes').value==='','Repeat must clear duration');
 assert(input('What I Saw').value==='','Repeat must clear reflections');
 assert(input('Session Name').value==='Friday Shooting Updated','Repeat must retain name');
 set('Minutes','50');clickSave();await wait();
 assert(run('db.trainingSessions.length')===2,'Repeat must create an additional record');
 assert(run('db.trainingSessions[0].id')===id,'Repeat replaced original record');
 console.log('PASS repeat creates new record and preserves original');
 run("navigate('training');trainingForm();");await wait();
 const drafts=run("readWork('drafts').length");
 root().querySelector('.gtf-action-secondary-v1').click();await wait();
 assert(run("readWork('drafts').length")===drafts,'Cancel should not write drafts');
 assert(errors.length===0,'Unexpected jsdom errors: '+errors.join('; '));
 console.log('PASS Training Form V1 integration regression');
 dom.window.close();
})().catch(e=>{console.error('FAIL',e.stack||e);console.error(errors.join('\n'));process.exitCode=1;dom.window.close()});
