/**
 * GameTrace TrainingFormV1 — reusable, presentation-first Training/Camp editor.
 * Depends on the LOCKED GameTraceFormComponents V1 source; never substitutes a copy.
 * Modes: new, edit, repeat. Delegates persistence, IDs, sync, awards and navigation
 * to the host application's existing onSubmit/onCancel callbacks.
 */
(function(global) {
  'use strict';
  const F = global.GameTraceFormComponents;
  if (!F || !['FormParentV1','FormSectionV1','FormFieldV1','FormActionsV1'].every(k=>typeof F[k]==='function'))
    throw new Error('TrainingFormV1 requires approved GameTraceFormComponents V1');
  const doc=global.document;
  const {FormParentV1,FormSectionV1,FormFieldV1,FormActionsV1}=F;
  const DEFAULT_SKILLS=['Shooting','Ball Handling','Finishing','Footwork','Defense','Conditioning'];
  const REFLECTION_KEYS=[
    ['see','What I Saw','What did I see?'],
    ['became','What I Became','How did I become more?'],
    ['more','What I Want to Become More','What do I want to become more of?'],
    ['additional','Additional Feedback','Additional Feedback']
  ];
  const make=(tag,attrs={})=>{
    const n=doc.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{
      if (k==='text') n.textContent=String(v);
      else if (k==='className') n.className=String(v);
      else if (v!==null&&v!==undefined) n[k]=v;
    });
    return n;
  };
  const txt=(v)=>String(v===undefined||v===null?'':v);
  const safeList=(values)=>Array.isArray(values)?values.filter(v=>typeof v==='string'&&v.trim()).map(v=>v.trim()):[];
  const localToday=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
  const focusError=(control,message)=>{
    if (control){control.setAttribute('aria-invalid','true');control.focus();}
    return message;
  };
  const integerOrZero=(v)=>v===''?0:Number(v);

  function TrainingFormV1({mode='new',session=null,defaults={},skills=DEFAULT_SKILLS,
                            today=localToday(),onSubmit,onCancel,form:existingForm=null}={}) {
    if(!['new','edit','repeat'].includes(mode)) throw new TypeError('Unsupported training form mode');
    if(mode!=='new'&&(!session||typeof session!=='object')) throw new TypeError('Edit and Repeat require a session');
    if(typeof onSubmit!=='function') throw new TypeError('TrainingFormV1 requires an onSubmit callback');
    const source=session||{};
    const data=mode==='new'?{...defaults}:source;
    const repeat=mode==='repeat';
    const backendType=data.type==='camp'?'camp':'training';
    const chosenType=data.customType?'custom':backendType;
    const duration=repeat||mode==='new'&&data.minutes===undefined?null:Number(data.minutes);
    const initialHours=duration===null?'':String(Math.floor(duration/60));
    const initialMinutes=duration===null?'':String(duration%60);
    const dateValue=repeat?today:(data.date||today);
    const feedback=repeat?{}:data.feedback||{};
    const selected=new Set(safeList(data.tags));
    const known=new Map();
    [...safeList(skills),...selected].forEach(s=>known.set(s.toLowerCase(),s));
    const form=existingForm||make('form');
    if(form.tagName!=='FORM') throw new TypeError('form must be a native form');
    form.noValidate=true;
    form.dataset.trainingFormMode=mode;
    form.dataset.trainingComponent='TrainingFormV1';
    const title=mode==='edit'?'Edit Training':mode==='repeat'?'Repeat Training':'New Training';
    const status=make('p',{className:'gt-training-form-status-v1'});
    status.hidden=true;
    status.setAttribute('role','alert');
    const input=(type,opts={})=>make('input',{type,...opts});
    const field=(label,control,opts={})=>F.FormFieldV1({label,control,...opts});
    const controls={};
    const remember=(key,el)=>{controls[key]=el;return el};
    const playerField=field('Player Name',remember('player',input('text',{value:txt(data.player),maxLength:100,autocomplete:'name'})),{required:true});
    const type=remember('uiType',make('select'));
    [['training','Training'],['camp','Camp'],['custom','Custom']].forEach(([val,label])=>type.add(new Option(label,val)));
    type.value=chosenType;
    const typeField=field('Session Type',type,{required:true});
    const custom=remember('customType',input('text',{value:txt(data.customType),maxLength:200,placeholder:'Enter session type'}));
    const customField=field('Custom Session Type',custom,{required:chosenType==='custom'});
    const toggleCustom=()=>{
      customField.hidden=type.value!=='custom';
      custom.required=type.value==='custom';
      if(customField.hidden)custom.removeAttribute('aria-invalid');
    };
    type.addEventListener('change',toggleCustom);
    toggleCustom();
    const nameField=field('Session Name',remember('name',input('text',{value:txt(data.name),maxLength:200,placeholder:'e.g. Shooting Workout'})),{required:true});
    const dateField=field('Date',remember('date',input('date',{value:dateValue,max:today})),{required:true});
    const hoursField=field('Hours',remember('hours',input('number',{value:initialHours,min:'0',max:'24',step:'1',inputMode:'numeric'})),{width:'half'});
    const minutesField=field('Minutes',remember('minutePart',input('number',{value:initialMinutes,min:'0',max:'59',step:'1',inputMode:'numeric'})),{width:'half'});
    const coachField=field('Coach / Organization',remember('coach',input('text',{value:txt(data.coach),maxLength:200,placeholder:'Optional'})));
    const locationField=field('Location',remember('location',input('text',{value:txt(data.location),maxLength:200,placeholder:'Optional'})));
    const chips=make('div',{className:'gt-training-skills-v1'});
    chips.setAttribute('role','group'); chips.setAttribute('aria-label','Skills Worked On');
    const skillHeading=make('p',{className:'gt-training-skills-heading-v1',text:'Skills Worked On'});
    const skillsHelp=make('p',{className:'gt-training-skills-help-v1',text:'Select all that apply.'});
    const refreshSkills=()=>{
      chips.replaceChildren();
      for(const skill of known.values()){
        const active=selected.has(skill);
        const button=make('button',{type:'button',className:'gt-training-skill-v1',text:(active?'✓ ':'')+skill});
        button.setAttribute('aria-pressed',String(active));
        button.addEventListener('click',()=>{if(selected.has(skill))selected.delete(skill);else selected.add(skill);refreshSkills()});
        chips.append(button);
      }
    };
    refreshSkills();
    const customSkill=remember('customSkill',input('text',{maxLength:100,placeholder:'Type a skill'}));
    const addSkill=make('button',{type:'button',className:'gt-training-add-v1',text:'+ Add Skill'});
    const addCustom=()=>{
      const newValue=customSkill.value.trim();if(!newValue)return;
      const key=newValue.toLowerCase();const normalized=known.get(key)||newValue;
      if(!known.has(key))known.set(key,normalized);
      selected.add(normalized);customSkill.value='';refreshSkills();customSkill.focus();
    };
    addSkill.addEventListener('click',addCustom);
    customSkill.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();addCustom()}});
    const skillsArea=make('div',{className:'gt-training-skills-area-v1'});
    const addRow=make('div',{className:'gt-training-custom-row-v1'});
    addRow.append(field('Custom Skills',customSkill),addSkill);
    skillsArea.append(skillHeading,chips,skillsHelp,addRow);
    const reflectionFields=REFLECTION_KEYS.map(([key,label])=>{
      const val=txt(feedback[key]);
      const control=remember('feedback_'+key,make('textarea',{rows:3,value:val,placeholder:'Optional reflection',maxLength:3000}));
      control.value=val;
      return field(label,control);
    });
    const sections=[
      FormSectionV1({title:'Player Information',content:[playerField]}),
      FormSectionV1({title:'Session Information',columns:2,content:[typeField,customField,nameField,dateField,hoursField,minutesField,coachField,locationField]}),
      FormSectionV1({title:'Skills & Focus',content:[skillsArea]}),
      FormSectionV1({title:"Player's Feedback",content:reflectionFields})
    ];
    const actions=FormActionsV1({
      secondary:{label:'Cancel',onClick:()=>{if(typeof onCancel==='function')onCancel({mode,sourceId:source.id||null})}},
      primary:{label:mode==='edit'?'Save Changes':mode==='repeat'?'Log Again':'Log Training',type:'submit'}
    });
    const primary=actions.querySelector('.gtf-action-primary-v1');
    const composed=FormParentV1({form,sections,actions,error:status,ariaLabel:title});
    composed.classList.add('gt-training-form-v1');
    const getValues=()=>({
      type:type.value==='camp'?'camp':'training',
      customType:type.value==='custom'?custom.value.trim():'',
      name:controls.name.value.trim(),
      date:controls.date.value,
      minutes:integerOrZero(controls.hours.value)*60+integerOrZero(controls.minutePart.value),
      player:controls.player.value.trim(),
      coach:controls.coach.value.trim(),location:controls.location.value.trim(),
      tags:[...selected],
      feedback:Object.fromEntries(REFLECTION_KEYS.map(([key])=>[key,controls['feedback_'+key].value.trim()]))
    });
    const showError=(message,control)=>{
      status.hidden=false;status.textContent=String(message);
      focusError(control,message);
    };
    const clearError=()=>{status.hidden=true;status.textContent='';Object.values(controls).forEach(control=>control?.removeAttribute('aria-invalid'))};
    form.addEventListener('input',()=>{if(!status.hidden)clearError()});
    form.addEventListener('change',()=>{if(!status.hidden)clearError()});
    let submitting=false;
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      if(submitting)return;
      clearError();
      if(!controls.player.value.trim())return showError('Enter a player name.',controls.player);
      if(type.value==='custom'&&!custom.value.trim())return showError('Enter a custom session type.',custom);
      if(!controls.name.value.trim())return showError('Enter a session name.',controls.name);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(controls.date.value) || controls.date.value>today)
        return showError('Enter today or an earlier valid date.',controls.date);
      const h=controls.hours.value,m=controls.minutePart.value;
      if(!/^\d*$/.test(h)||!/^\d*$/.test(m)||!Number.isInteger(Number(h))||!Number.isInteger(Number(m))||+m>59||+h>24||+h*60+(+m)<1||+h*60+(+m)>1440)
        return showError('Enter a duration between 1 minute and 24 hours.',controls.minutePart);
      submitting=true;primary.disabled=true;actions.setAttribute('aria-busy','true');
      try {
        await onSubmit(getValues(),{mode,sourceId:source.id||null,existingSession:mode==='edit'?source:null});
      } catch(error) {
        showError(error instanceof Error?error.message:String(error));
      } finally {
        submitting=false;primary.disabled=false;actions.removeAttribute('aria-busy');
      }
    });
    return Object.freeze({element:composed,mode,controls,getValues,showError,clearError});
  }
  global.GameTraceTrainingForm=Object.freeze({version:'1.0.0',TrainingFormV1});
})(typeof window!=='undefined'?window:globalThis);
