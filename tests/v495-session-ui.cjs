'use strict';
const fs=require('fs'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const errors=[],vc=new VirtualConsole();
vc.on('jsdomError',e=>{if(!/HTMLCanvasElement|HTMLMediaElement|navigation|window.scrollTo/.test(e.message))errors.push(e.message)});
const html=fs.readFileSync('index.html','utf8').replace('\nload();\nwindow.GameTraceFamily.boot();','\nwindow.__qa={run:code=>eval(code)};\nload();\nwindow.GameTraceFamily.boot();');
const dom=new JSDOM(html,{url:'https://test.example/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({measureText:()=>({width:10}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
w.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});
w.ResizeObserver=class{observe(){}disconnect(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLElement.prototype.setPointerCapture=()=>{};w.HTMLElement.prototype.hasPointerCapture=()=>false;
w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
w.confirm=()=>true;w.fetch=async()=>{throw Error('Unexpected network request')};w.CSS={escape:s=>s};
}});
const w=dom.window,d=w.document,wait=()=>new Promise(r=>setTimeout(r,70));
const run=code=>w.__qa.run(code);
function input(name){return [...d.querySelectorAll('#trainingContent form.gt495-form input,#trainingContent form.gt495-form textarea,#trainingContent form.gt495-form select')].find(x=>x.getAttribute('aria-label')===name||x.closest('label')?.textContent.trim().startsWith(name))}
function set(name,value){const x=input(name);assert(x,'Missing field '+name);x.value=value;x.dispatchEvent(new w.Event('input',{bubbles:true}));x.dispatchEvent(new w.Event('change',{bubbles:true}));return x}
function save(){const b=d.querySelector('#trainingContent [data-save-session]');assert(b,'Save action missing');b.click()}
function check(condition,message){assert(condition,message)}
(async()=>{
await wait();
const skip=[...d.querySelectorAll('button')].find(x=>x.textContent.trim()==='Skip');if(skip)skip.click();
await wait();check(w.__qa,'Application runtime hook missing: '+errors.join('; '));
run("celebrateTrophies=()=>{};db=C.blankDB();setPlayerContext('Georgina');navigate('training');trainingForm();");
await wait();
check(d.querySelectorAll('#trainingContent .gt495-card').length===4,'New Session should contain four cards');
check(d.querySelector('#trainingContent .gt495-card').textContent.includes('Player Information'),'Wrong section order');
check(!d.querySelector('#trainingContent .gt495-card').textContent.includes('Notes and evidence'),'Deprecated notes in form');
const kind=input('Session type');check(kind,'Session type missing');kind.value='custom';kind.dispatchEvent(new w.Event('change',{bubbles:true}));
check(!input('Custom Session Type').closest('label').hidden,'Custom type input did not open');
set('Custom Session Type','Team Practice');set('Session name','Friday Shooting');set('Player','Georgina');set('Hours','1');set('Minutes','30');
set('What did I see?','An opening in the defense');set('How did I become more?','More aggressive');set('What do I want to become more of?','A strong finisher');set('Additional Feedback','Confident and focused');
const chips=[...d.querySelectorAll('#trainingContent .gt495-chip')];check(chips.length>3,'Skills chips missing');
save();await wait();
check(run('ui.screen')==='session','New Session did not save and open detail');
const id=run('sessionUI.id'),record=run('db.trainingSessions.find(s=>s.id===sessionUI.id)');
check(record?.name==='Friday Shooting','Session not stored');
check(record?.type==='training'&&record.customType==='Team Practice','Custom type not saved compatibly');
check(record?.feedback?.additional==='Confident and focused','Additional feedback not saved');
console.log('PASS New Session, Custom Session type, feedback and retained save pipeline');
run("navigate('training');trainingForm("+JSON.stringify(id)+");");await wait();
check(d.querySelectorAll('#trainingContent .gt495-card').length===4,'Edit Session cards missing');
check(input('Session type').value==='custom','Custom type did not load for editing');
check(input('Custom Session Type').value==='Team Practice','Custom type label did not reload');
check(input('Additional Feedback').value==='Confident and focused','Additional feedback did not reload');
set('Session name','Friday Shooting Updated');save();await wait();
check(run('db.trainingSessions.length')===1,'Edit created duplicate session');
check(run('db.trainingSessions[0].name')==='Friday Shooting Updated','Edit did not update existing record');
check(run('db.trainingSessions[0].id')===id,'Edit changed record id');
check(run('db.trainingSessions[0].feedback.additional')==='Confident and focused','Edit lost feedback');
console.log('PASS Edit Session preserves IDs and feedback');
run("navigate('training');trainingForm();");await wait();
set('Session name','Unfinished practice');set('Player','Georgina');set('Hours','1');
run("sessionUI.editor.flush()");check(run("readWork('drafts').some(d=>d.fields.name==='Unfinished practice')"),'Draft not stored');
console.log('PASS local draft storage');
check(errors.length===0,'Unexpected jsdom errors: '+errors.join('; '));
console.log('PASS V46.9.5 targeted browser-model checks');
dom.window.close();
})().catch(e=>{console.error('FAIL',e.stack||e);console.error(errors.join('\n'));process.exitCode=1;dom.window.close()});
