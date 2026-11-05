/* Device-local drafts never enter the completed-record envelope or family sync. */
const sessionUI={id:null,returnTo:'training',editor:null};
const localWorkScope=()=>String(familyState.familyId||'device')+':'+String(familyUser()||'guest');
const workKey=kind=>'gametrace-work-v36:'+localWorkScope()+':'+kind;
function readWork(kind){try{const value=JSON.parse(localStorage.getItem(workKey(kind))||'[]');return Array.isArray(value)?value:[]}catch{return[]}}
function writeWork(kind,items){localStorage.setItem(workKey(kind),JSON.stringify(items))}
function canonicalPlayer(name){const trimmed=String(name||'').trim();return courtPlayers().find(p=>T.playerKey(p)===T.playerKey(trimmed))||trimmed}
function playerSuggestions(input){const id='players-'+C.uid(),list=el('datalist',{id});courtPlayers().forEach(p=>list.append(el('option',{value:p})));input.setAttribute('list',id);input.after(list)}
function openSession(id,returnTo='training'){
 const source=db.trainingSessions.find(s=>s.id===id);if(source?.player)setPlayerContext(source.player);
 sessionUI.id=id;sessionUI.returnTo=returnTo;navigate('session');
}
function renderSessionDetail(){
 const root=$('sessionContent'),s=db.trainingSessions.find(s=>s.id===sessionUI.id),back=()=>navigate(sessionUI.returnTo==='session'?'training':sessionUI.returnTo);
 root.replaceChildren(pageHeading(s?.name||'Session unavailable',back));
 if(!s||s.deletedAt){root.append(el('p',{},s?'This session is in Recently deleted. Restore it from Gym.':'This session is no longer available.'),button('Open Gym',()=>navigate('training'),'primary'));return}
 root.append(el('p',{class:'training-kicker'},s.type==='camp'?'Camp':'Training'),el('p',{class:'session-summary'},[s.player||'Player not set',friendlyDate(s.date),trainingDuration(s.minutes)].join(' · ')));
 if(s.coach||s.location)root.append(el('p',{},[s.coach,s.location].filter(Boolean).join(' · ')));
 const actions=el('div',{class:'row-actions'},button('Edit session',()=>{navigate('training');trainingForm(s.id)},'primary'),button('Repeat session',()=>{navigate('training');trainingForm(s.id,true)},'journey-button'),button('Delete session',()=>{if(!confirm('Move this session to Recently deleted? Its hours will be removed.'))return;try{trainingCommit(d=>{const target=d.trainingSessions.find(x=>x.id===s.id);if(!target||fingerprint(target)!==fingerprint(s))throw Error('Session changed. Reopen before deleting.');target.deletedAt=C.now();target.updatedAt=C.now()});navigate('training')}catch(e){announce(e.message)}},'family-link'));
 root.append(actions,el('section',{class:'session-detail-section'},el('h2',{},'Skills worked on'),el('p',{},s.tags.length?s.tags.join(' · '):'No skills recorded.')));
 const reflection=el('section',{class:'training-reflections session-detail-section','data-training-feedback':''},el('h2',{},'Player Feedback'));appendReflectionSummary(reflection,s.feedback,'session');root.append(reflection,activityPlaybookPanel('session',s.id));
 const evidence=el('section',{class:'session-detail-section'},el('h2',{},'Notes and evidence'),el('p',{class:'feedback-answer'},s.notes||'No progress notes recorded.'));if(s.clipLink)evidence.append(el('a',{href:s.clipLink,target:'_blank',rel:'noopener noreferrer'},'View clip'));root.append(evidence);
}
const sessionRowBeforeDetail=trainingRow;
trainingRow=function(s){const row=sessionRowBeforeDetail(s);row.querySelector('.training-reflections')?.remove();row.querySelector('.activity-playbook')?.remove();const title=row.querySelector('h3');title.replaceChildren(button(s.name,()=>openSession(s.id),'session-title-link',{'data-open-session':s.id}));return row};
const linkedActivityBeforeDetail=openLinkedPlaybookActivity;
openLinkedPlaybookActivity=function(kind,id,player){const s=playbookActivity(kind,id);if(kind==='session'&&s&&!s.deletedAt&&samePlaybookPlayer(player,s.player))return openSession(id,'goals');return linkedActivityBeforeDetail(kind,id,player)};

function trainingForm(id=null,repeat=false,resumeId=null,preset=null){
 const drafts=readWork('drafts'),resume=resumeId?drafts.find(d=>d.id===resumeId):null;
 if(resumeId&&!resume)return announce('This draft is no longer available.');
 if(resume){id=resume.sourceId;repeat=resume.mode==='repeat'}
 const original=id?db.trainingSessions.find(s=>s.id===id):null;
 if(id&&(!original||original.deletedAt))return announce('Restore the original session before opening this draft.');
 const resultId=resume?.resultId||(original&&!repeat?original.id:C.uid());
 if(resume&&resume.mode!=='edit'&&db.trainingSessions.some(s=>s.id===resultId)){announce('This draft was already saved as a completed session.');return openSession(resultId)}
 const existingDraft=!resume&&drafts.find(d=>d.mode===(original&&!repeat?'edit':'new')&&d.sourceId===(original?.id||null)&&!(d.mode!=='edit'&&db.trainingSessions.some(s=>s.id===d.resultId)));
 if(existingDraft&&!repeat&&!preset?.skipDraft){openDialog('Unfinished session',box=>box.append(el('p',{},'A draft is already saved on this device.'),button('Resume draft',()=>{closeDialog();trainingForm(null,false,existingDraft.id)},'primary'),button('Start another',()=>{closeDialog();trainingFormFresh()},'journey-button'),button('Cancel',closeDialog)));return}
 function trainingFormFresh(){trainingForm(id,repeat,null,{...preset,skipDraft:true})}
 // skipDraft is handled by an explicit new-draft intent, without deleting existing work.
 buildSessionEditor({id,repeat,original,resultId,resume,preset});
}
function buildSessionEditor({id,repeat,original,resultId,resume,preset}){
 const mode=original&&!repeat?'edit':repeat?'repeat':'new',now=C.now(),base=resume?.fields||{type:original?.type||preset?.type||'training',name:original?.name||preset?.name||'',date:repeat?localDate():original?.date||localDate(),hours:repeat?'':original?String(Math.floor(original.minutes/60)):'',minutes:repeat?'':original?String(original.minutes%60):'',player:original?.player||preset?.player||playerContext.player||'',coach:original?.coach||preset?.coach||'',location:original?.location||preset?.location||'',tags:original?.tags||preset?.tags||[],feedback:repeat?{}:original?.feedback||{},notes:repeat?'':original?.notes||'',clipLink:repeat?'':original?.clipLink||''};
 const editor={id:resume?.id||C.uid(),resultId,sourceId:id,mode,scope:localWorkScope(),baseFingerprint:resume?.baseFingerprint||(original?fingerprint(original):null),createdAt:resume?.createdAt||now,timer:null,flush:null};sessionUI.editor=editor;trainingUI.editing=true;
 const root=$('trainingContent'),form=el('form',{class:'training-form',novalidate:''}),error=el('p',{class:'setup-error',role:'alert'}),status=el('p',{class:'training-help',role:'status','data-draft-status':''});
 function closeEditor(){if(flush()){trainingUI.editing=false;sessionUI.editor=null;renderTraining();announce('Draft kept on this device.')}else error.textContent='Draft could not be saved. Keep this page open or discard it explicitly.'}
 root.replaceChildren(pageHeading(mode==='edit'?'Edit session':mode==='repeat'?'Repeat session':'Log completed session',closeEditor),form);
 form.append(el('p',{class:'training-help'},'Log completed work in a few taps. Add reflections when you’re ready. Drafts stay on this device until you save the session.'),error,status);
 const type=el('select',{'aria-label':'Session type'},el('option',{value:'training'},'Training'),el('option',{value:'camp'},'Camp'));type.value=base.type;form.append(el('label',{class:'form-field'},'Session type',type));
 const name=formField(form,'Session name',base.name,{maxlength:200,required:''}),player=formField(form,'Player',base.player,{maxlength:100,'aria-label':'Session player'});playerSuggestions(player);
 const date=formField(form,'Date',base.date,{type:'date',max:localDate(),required:''}),duration=el('div',{class:'training-grid'}),hours=formField(duration,'Hours',base.hours,{type:'number',min:0,max:24,step:1,inputmode:'numeric'}),minutes=formField(duration,'Minutes',base.minutes,{type:'number',min:0,max:59,step:1,inputmode:'numeric'});form.append(duration);
 const presetCheck=el('input',{type:'checkbox','aria-label':'Save as a quick preset'});form.append(el('label',{class:'custom-skill-toggle'},presetCheck,'Save as a quick preset'),el('p',{class:'training-help'},'Presets reuse the title, player, type, skills, coach and location. Duration and reflections start fresh.'));
 form.append(button('Save session',save,'primary',{'data-save-session':''}),el('p',{class:'training-help'},'Everything below is optional.'));
 const details=el('details',{},el('summary',{},'Coach and location')),coach=formField(details,'Coach / organization',base.coach,{maxlength:200}),location=formField(details,'Location',base.location,{maxlength:200});form.append(details);
 const tagChoices=el('div',{class:'training-tags'}),tags=el('fieldset',{},el('legend',{},'Skills worked on'),tagChoices),checks=new Map();for(const t of [...new Set([...trainingSkillChoices(original),...(base.tags||[])])]){const c=el('input',{type:'checkbox','aria-label':t});c.checked=base.tags.includes(t);checks.set(t,c);tagChoices.append(el('label',{},c,t))}const custom=formField(tags,'Custom skills (separate with commas)',base.custom||'',{maxlength:300});form.append(tags);
 const reflections=el('section',{class:'training-reflections','data-training-feedback':''},el('h2',{},'Player Feedback · optional')),readFeedback=feedbackFields(reflections,base.feedback,'session');form.append(reflections);
 const evidence=el('details',{},el('summary',{},'Progress notes and clip link · optional')),notes=el('textarea',{maxlength:3000,rows:3,'aria-label':'Progress notes'});notes.value=base.notes;evidence.append(el('label',{class:'form-field'},'Progress notes',notes));const clipLink=formField(evidence,'Clip link',base.clipLink,{type:'url',maxlength:2000});form.append(evidence);
 form.append(el('div',{class:'form-actions'},button('Save session',save,'primary',{'data-save-session':''}),button('Save draft & close',closeEditor,'journey-button')),el('div',{class:'draft-secondary-actions'},button('Cancel',closeEditor,'family-link'),button('Discard draft',()=>{if(!confirm('Discard this unfinished draft? Completed sessions will stay unchanged.'))return;try{writeWork('drafts',readWork('drafts').filter(d=>d.id!==editor.id));clearTimeout(editor.timer);sessionUI.editor=null;trainingUI.editing=false;renderTraining()}catch(e){error.textContent='Could not discard the draft. '+e.message}},'family-link')));
 function read(){return{type:type.value,name:name.value,date:date.value,hours:hours.value,minutes:minutes.value,player:player.value,coach:coach.value,location:location.value,tags:[...checks].filter(([,c])=>c.checked).map(([t])=>t),custom:custom.value,feedback:readFeedback(),notes:notes.value,clipLink:clipLink.value,savePreset:presetCheck.checked}}
 presetCheck.checked=!!base.savePreset;
 function flush(){clearTimeout(editor.timer);if(editor.scope!==localWorkScope()){status.textContent='Account changed. Return to your original account to save this draft.';return false}try{const draft={id:editor.id,resultId,sourceId:id,mode,baseFingerprint:editor.baseFingerprint,createdAt:editor.createdAt,updatedAt:C.now(),fields:read()};writeWork('drafts',[...readWork('drafts').filter(d=>d.id!==editor.id),draft]);status.textContent='Draft saved on this device';return true}catch{status.textContent='Draft could not be saved on this device. Keep this page open.';return false}}
 editor.flush=flush;
 form.addEventListener('input',()=>{status.textContent='Saving draft…';clearTimeout(editor.timer);editor.timer=setTimeout(flush,300)});form.addEventListener('change',flush);form.addEventListener('submit',e=>{e.preventDefault();save()});
 function save(){try{
  if(editor.scope!==localWorkScope())throw Error('Your family or account changed. Reopen this session before saving.');
  const f=read();if(!f.name.trim())throw Error('Enter a session name.');T.date(f.date);if(f.date>localDate())throw Error('Use today or an earlier date for completed work.');if(!/^\d*$/.test(f.hours)||!/^\d*$/.test(f.minutes)||Number(f.minutes)>59)throw Error('Enter whole hours and minutes (0–59).');
  const stamp=C.now(),entry=T.validSession({...(mode==='edit'?original:{}),id:resultId,type:f.type,name:f.name.trim(),date:f.date,minutes:Number(f.hours)*60+Number(f.minutes),player:canonicalPlayer(f.player),coach:f.coach,location:f.location,tags:T.validTags([...f.tags,...f.custom.split(',').map(t=>t.trim()).filter(Boolean)]),feedback:f.feedback,notes:f.notes,clipLink:f.clipLink.trim(),createdAt:mode==='edit'?original.createdAt:stamp,updatedAt:stamp,awardEligible:mode==='edit'?original.awardEligible:true,awardContext:mode==='edit'?original.awardContext:null});
  trainingCommit(d=>{const i=d.trainingSessions.findIndex(s=>s.id===resultId);if(mode==='edit'){if(i<0||d.trainingSessions[i].deletedAt||fingerprint(d.trainingSessions[i])!==editor.baseFingerprint)throw Error('This session changed since the draft began. Your draft is kept; reopen the latest session before editing.');d.trainingSessions[i]=entry}else{if(i>=0)throw Error('This session was already saved. Open it from Gym.');d.trainingSessions.push(entry)}});
  clearTimeout(editor.timer);let note='Session saved';try{writeWork('drafts',readWork('drafts').filter(d=>d.id!==editor.id));if(f.savePreset){const p={id:C.uid(),type:entry.type,name:entry.name,player:entry.player,coach:entry.coach,location:entry.location,tags:entry.tags},items=readWork('presets').filter(x=>!(x.name===p.name&&x.player===p.player&&x.type===p.type));writeWork('presets',[...items,p])}}catch{note+=' · local draft/preset storage needs attention'}
  sessionUI.editor=null;trainingUI.editing=false;openSession(resultId);announce(note);
 }catch(e){error.textContent=e.message;flush()}}
 flush();name.focus();scrollTo(0,0);
}
const gymBeforeQuickLog=renderTraining;
renderTraining=function(){if(sessionUI.editor)clearTimeout(sessionUI.editor.timer);sessionUI.editor=null;gymBeforeQuickLog();const root=$('trainingContent'),panel=el('section',{class:'quick-log-panel'},el('h2',{},'Quick log')),matches=x=>!trainingUI.player||T.playerKey(x.player||x.fields?.player||'')===T.playerKey(trainingUI.player);
 const drafts=readWork('drafts').filter(d=>matches(d.fields)&&!(d.mode!=='edit'&&db.trainingSessions.some(s=>s.id===d.resultId)));if(drafts.length){panel.append(el('h3',{},'Unfinished on this device'));for(const d of drafts){const row=el('div',{class:'quick-log-row'},button((d.fields.name||'Untitled session')+' · Resume draft',()=>trainingForm(null,false,d.id),'journey-button',{'data-resume-draft':d.id}),button('Discard',()=>{if(!confirm('Discard this draft?'))return;try{writeWork('drafts',readWork('drafts').filter(x=>x.id!==d.id));renderTraining()}catch(e){announce('Draft was not discarded. '+e.message)}},'family-link'));panel.append(row)}}
 const presets=readWork('presets').filter(matches);if(presets.length){panel.append(el('h3',{},'Saved presets'));for(const p of presets)panel.append(el('div',{class:'quick-log-row'},button(p.name,()=>buildSessionEditor({id:null,repeat:false,original:null,resultId:C.uid(),resume:null,preset:p}),'journey-button',{'data-use-preset':p.id}),button('Remove preset',()=>{try{writeWork('presets',readWork('presets').filter(x=>x.id!==p.id));renderTraining()}catch(e){announce('Preset was not removed. '+e.message)}},'family-link')))}if(!presets.length)panel.append(el('p',{class:'training-help'},'Save a regular session as a preset for faster logging next time.'));panel.append(el('p',{class:'training-help'},'Drafts and presets belong to this device and signed-in family account. Only completed sessions sync.'));root.querySelector('.training-toolbar').after(panel);attachPlayerPicker(root)};
const navigateBeforeDrafts=navigate;
navigate=function(screen){const editor=sessionUI.editor;if(editor&&trainingUI.editing&&screen!=='training'){if(!editor.flush()&&!confirm('Your draft could not be saved. Leave this page and lose these changes?'))return;clearTimeout(editor.timer);trainingUI.editing=false}navigateBeforeDrafts(screen);if(ui.screen!== 'training'&&editor)sessionUI.editor=null};
window.addEventListener('beforeunload',()=>sessionUI.editor?.flush(),{capture:true});
