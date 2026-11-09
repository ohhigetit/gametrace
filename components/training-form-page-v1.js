/* GameTrace TrainingFormV1 page integration.
   The native editor remains the sole authority for validation, commits,
   IDs, achievements, sync, and navigation. */
(function(){
  const legacyBuilder=buildSessionEditor;
  buildSessionEditor=function trainingFormUniversalV1(opts){
    legacyBuilder(opts);
    const root=$('trainingContent'),native=root?.querySelector('form.gt495-form');
    const F=window.GameTraceTrainingForm,P=window.GameTraceComponents;
    if(!native||!F?.TrainingFormV1||!P?.UniversalPageV1||!P?.PageHeaderV1)
      throw Error('Approved Training Form and UniversalPage dependencies unavailable');
    if(native.dataset.trainingBridgeV1)return;
    native.dataset.trainingBridgeV1='true';
    const mode=opts.original&&!opts.repeat?'edit':opts.repeat?'repeat':'new';
    const field=label=>[...native.querySelectorAll('.gt495-field')]
      .find(n=>n.querySelector(':scope > span')?.textContent.trim().replace(/\s*\*$/,'').toLowerCase()===label.toLowerCase())
      ?.querySelector('input,select,textarea')||null;
    const required=label=>{const x=field(label);if(!x)throw Error('Native field missing: '+label);return x};
    const chips=()=>[...native.querySelectorAll('.gt495-chip[aria-pressed]')].map(button=>({
      name:button.textContent.replace(/^\s*✓\s*/,'').trim(),
      selected:button.getAttribute('aria-pressed')==='true',button
    }));
    const nativeType=required('Session Type');
    const original=opts.original||{};
    const data={
      id:original.id||null,type:nativeType.value==='custom'?'training':nativeType.value,
      customType:nativeType.value==='custom'?required('Custom Session Type').value:'',
      name:required('Session Name').value,date:required('Date').value,
      minutes:Number(required('Hours').value||0)*60+Number(required('Minutes').value||0),
      player:required('Player Name').value,coach:required('Coach / Organization').value,
      location:required('Location').value,
      tags:chips().filter(x=>x.selected).map(x=>x.name),
      feedback:{
        see:required('What I Saw').value,became:required('What I Became').value,
        more:required('What I Want to Become More').value,
        additional:required('Additional Feedback').value
      }
    };
    const defaults={...data};
    if(mode==='new'){delete defaults.id;delete defaults.minutes;}
    const nativeSave=native.querySelector('[data-save-session]'),
          nativeCancel=[...native.querySelectorAll('button')].find(b=>b.textContent.trim()==='Cancel'),
          nativeError=native.querySelector('.setup-error');
    if(!nativeSave||!nativeCancel||!nativeError)throw Error('Native editor actions unavailable');
    const put=(label,value)=>{
      const x=required(label);
      x.value=value==null?'':String(value);
      x.dispatchEvent(new Event('input',{bubbles:true}));
      x.dispatchEvent(new Event('change',{bubbles:true}));
    };
    function syncSkills(names){
      const wanted=new Set(names.map(x=>x.toLowerCase()));
      for(const chip of chips())if(chip.selected!==wanted.has(chip.name.toLowerCase()))chip.button.click();
      const seen=new Set(chips().map(x=>x.name.toLowerCase()));
      for(const skill of names)if(!seen.has(skill.toLowerCase())){
        const entry=required('Custom Skills');
        const add=[...native.querySelectorAll('button')].find(b=>/Add Skill/.test(b.textContent));
        if(!add)throw Error('Custom Skill action unavailable');
        entry.value=skill;add.click();seen.add(skill.toLowerCase());
      }
    }
    function onSubmit(v){
      put('Session Type',v.customType?'custom':v.type);
      put('Custom Session Type',v.customType);
      put('Player Name',v.player);
      put('Session Name',v.name);
      put('Date',v.date);
      put('Hours',Math.floor(v.minutes/60));
      put('Minutes',v.minutes%60);
      put('Coach / Organization',v.coach);
      put('Location',v.location);
      put('What I Saw',v.feedback.see);
      put('What I Became',v.feedback.became);
      put('What I Want to Become More',v.feedback.more);
      put('Additional Feedback',v.feedback.additional);
      syncSkills(v.tags);
      nativeError.textContent='';
      nativeSave.click();
      // Native save deliberately catches errors; surface them in reusable UI.
      if(nativeError.textContent.trim())throw Error(nativeError.textContent.trim());
      if(sessionUI.editor)throw Error('The training was not saved. Reopen and try again.');
    }
    const cancel=()=>nativeCancel.click();
    const title=mode==='edit'?'Edit Training':mode==='repeat'?'Repeat Training':'New Training';
    const subtitle=mode==='edit'?'UPDATE YOUR SESSION DETAILS.':'LOG THE WORK BEHIND THE GAME.';
    const form=F.TrainingFormV1({
      mode,session:mode==='new'?null:data,defaults,
      skills:chips().map(x=>x.name),today:localDate(),
      onSubmit,onCancel:cancel
    });
    const header=P.PageHeaderV1({
      title,subtitle,backIcon:up1Icon('back'),pageIcon:up1Icon('session'),
      onBack:cancel,backLabel:'Back to Gym'
    });
    native.hidden=true;native.setAttribute('aria-hidden','true');native.style.display='none';
    const page=P.UniversalPageV1({
      page:'training-form',header,content:[form.element,native],
      footerLines:['FOLLOW THE PLAY.','THE GAME. THE JOURNEY.']
    });
    root.replaceChildren(page);
    form.controls.name.focus();
  };
})();