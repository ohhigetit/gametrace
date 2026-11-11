
/* Sky V1.2 — visual integration only. No network/API, no reads or writes to player data. */
(function(){
  'use strict';
  if(window.GameTraceSkyV1)return;
  const mk=(tag,props={},...children)=>{const n=document.createElement(tag);for(const [k,v] of Object.entries(props)){if(k==='class')n.className=v;else if(k==='text')n.textContent=v;else n.setAttribute(k,v)}for(const child of children)n.append(child);return n};
  const trigger=mk('button',{id:'gt-sky-launcher',type:'button','aria-label':'Open Sky companion','aria-haspopup':'dialog','aria-expanded':'false',text:'✦  Sky'});
  const overlay=mk('div',{id:'gt-sky-overlay',hidden:''});
  const panel=mk('section',{id:'gt-sky-panel',role:'dialog','aria-modal':'true','aria-labelledby':'gt-sky-title',tabindex:'-1'});
  const handle=mk('div',{class:'gt467-handle','aria-hidden':'true'});
  const heading=mk('div',{},mk('h2',{id:'gt-sky-title',text:'✦ Sky'}),mk('p',{class:'gt-sky-subtitle',text:'Your GameTrace Companion'}));
  const close=mk('button',{id:'gt-sky-close',type:'button','aria-label':'Close Sky',text:'×'});
  const header=mk('header',{class:'gt467-modal-header'},heading,close);
  const messages=mk('div',{id:'gt-sky-messages',role:'log','aria-live':'polite','aria-relevant':'additions'});
  const input=mk('input',{id:'gt-sky-input',type:'text',autocomplete:'off',placeholder:'Ask Sky anything…','aria-label':'Message Sky',maxlength:'2000'});
  const send=mk('button',{id:'gt-sky-send',type:'submit',text:'Send'});
  const form=mk('form',{id:'gt-sky-form'},input,send);
  panel.append(handle,header,messages,form);overlay.append(panel);document.body.append(trigger,overlay);
  const conversation=[];
  let priorFocus=null;
  function add(role,text){conversation.push({role,text});const node=mk('div',{class:'gt-sky-message','data-role':role},mk('small',{text:role==='player'?'You':'Sky (preview)'}),document.createTextNode(text));messages.append(node);messages.scrollTop=messages.scrollHeight}
  add('sky','Hi! I’m Sky, your GameTrace companion. This is a UI preview. GameTrace data and Gemini are not connected yet.');
  function open(){priorFocus=document.activeElement;overlay.hidden=false;trigger.setAttribute('aria-expanded','true');document.body.style.setProperty('--gt-sky-prev-overflow',document.body.style.overflow);document.body.style.overflow='hidden';input.focus({preventScroll:true})}
  function shut(){overlay.hidden=true;trigger.setAttribute('aria-expanded','false');document.body.style.overflow='';(priorFocus||trigger).focus({preventScroll:true})}
  trigger.addEventListener('click',open);close.addEventListener('click',shut);
  overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)shut()});
  overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();shut()}else if(e.key==='Tab'){const targets=[close,input,send];const i=targets.indexOf(document.activeElement);if(e.shiftKey&&i===0){e.preventDefault();send.focus()}else if(!e.shiftKey&&i===2){e.preventDefault();close.focus()}}});
  form.addEventListener('submit',e=>{e.preventDefault();const value=input.value.trim();if(!value)return;add('player',value);input.value='';add('sky','Sky’s interface is ready. The Gemini API and GameTrace context connection will be added after this component is approved.');input.focus()});
  window.GameTraceSkyV1={open,close:shut,conversation};
})();
