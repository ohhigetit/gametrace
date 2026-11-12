
/* Sky V1.4 — visual integration only. No network/API, no reads or writes to player data. */
(function(){
  'use strict';
  if(window.GameTraceSkyV1)return;
  const mk=(tag,props={},...children)=>{const n=document.createElement(tag);for(const [k,v] of Object.entries(props)){if(k==='class')n.className=v;else if(k==='text')n.textContent=v;else n.setAttribute(k,v)}for(const child of children)n.append(child);return n};
  const trigger=mk('button',{id:'gt-sky-launcher',type:'button','aria-label':'Open Sky companion','aria-haspopup':'dialog','aria-expanded':'false'});
  const avatar=mk('img',{class:'gt-sky-avatar',src:'https://raw.githubusercontent.com/ohhigetit/gametrace/review/sky-v13-dev-baseline-20261111/components/sky-avatar-96.webp',alt:'','aria-hidden':'true',width:'38',height:'38',decoding:'async'});
  trigger.append(avatar,mk('span',{class:'gt-sky-label',text:'Sky'}));
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

  // Read-only, local context bridge. Nothing is sent to a server.
  // The host app can register its authoritative state getter at any time.
  const dataBridge=(function(){
    let provider=null;
    const allowed=['games','trainings','notes','goals','schedule'];
    const clean=(value,depth=0)=>{
      if(depth>5)return null;
      if(Array.isArray(value))return value.slice(0,100).map(v=>clean(v,depth+1));
      if(value && typeof value==='object'){
        const out={};
        for(const [k,v] of Object.entries(value)){
          if(/token|password|secret|auth|email|phone|address|cookie|credential|session|apikey|api_key/i.test(k))continue;
          if(Object.keys(out).length>=35)break;
          out[k]=clean(v,depth+1);
        }
        return out;
      }
      return typeof value==='string'?value.slice(0,1000):typeof value==='number'||typeof value==='boolean'?value:null;
    };
    function connect(fn){
      if(typeof fn!=='function')throw new TypeError('Sky requires a read-only snapshot provider');
      provider=fn;
      return true;
    }
    function snapshot(){
      if(!provider)connectGameTraceStore();
      if(!provider)return {connected:false,reason:'No registered provider',diagnostics:{dbVisible:typeof db!=='undefined',windowDbVisible:typeof window.db!=='undefined',appRootVisible:!!document.getElementById('app'),documentReady:document.readyState,origin:location.origin}};
      let raw;
      try{raw=provider()}catch(e){return {connected:false,reason:'GameTrace data is temporarily unavailable'}}
      if(!raw||typeof raw!=='object')return {connected:false,reason:'No valid GameTrace snapshot'};
      const data={};
      for(const key of allowed)if(Array.isArray(raw[key]))data[key]=clean(raw[key]);
      return {connected:true,at:new Date().toISOString(),data,counts:Object.fromEntries(allowed.map(k=>[k,Array.isArray(data[k])?data[k].length:0]))};
    }
    return Object.freeze({connect,snapshot});
  })();
  window.GameTraceSkyData=dataBridge;

  // Actual GameTrace V42+ local model: db.trainingSessions and db.personalRecords
  // are verified in the app source. Other collections are used only if present.
  // No mutations, persistence, authentication reads, or outgoing requests.
  function connectGameTraceStore(){
    if(typeof window.__gtSkyReadOnlyProvider==='function'){
      dataBridge.connect(window.__gtSkyReadOnlyProvider);
      return true;
    }
    if(typeof db==='undefined'||!db||typeof db!=='object')return false;
    const fields={
      games:['id','date','team','opponent','player','status','finalScore','scoreTracking','settings','events'],
      trainings:['id','date','player','type','minutes','title','focus','skills','notes','activities','achievements'],
      notes:['id','date','player','title','text','content','body','answer','answers','questions','source','gameId','trainingId'],
      goals:['id','date','player','title','description','target','deadline','dueDate','status','progress','steps'],
      schedule:['id','date','player','team','opponent','title','activity','type','start','end','location','source']
    };
    const pick=(row,type)=>{
      if(!row||typeof row!=='object'||row.deletedAt)return null;
      const result={};
      for(const key of fields[type])if(Object.prototype.hasOwnProperty.call(row,key))result[key]=row[key];
      return Object.keys(result).length?result:null;
    };
    const records=()=>Array.isArray(db.personalRecords)?db.personalRecords:[];
    const classify=(group)=>records().filter(r=>group.includes(String(r?.type||'').toLowerCase())).map(r=>pick(r,group===noteTypes?'notes':group===goalTypes?'goals':'schedule')).filter(Boolean);
    const noteTypes=['note','notes','player_note','player_notes','reflection'];
    const goalTypes=['goal','goals','playbook','next_step'];
    const scheduleTypes=['schedule','event'];
    dataBridge.connect(()=>({
      games:(Array.isArray(db.games)?db.games:[]).map(r=>pick(r,'games')).filter(Boolean),
      trainings:(Array.isArray(db.trainingSessions)?db.trainingSessions:[]).map(r=>pick(r,'trainings')).filter(Boolean),
      notes:classify(noteTypes),
      goals:classify(goalTypes),
      schedule:classify(scheduleTypes)
    }));
    return true;
  }
  // Defer registration until app startup finishes; retry when main app initializes.
  if(!connectGameTraceStore()){
    window.addEventListener('load',connectGameTraceStore,{once:true});
    let retries=0;
    const retryTimer=setInterval(()=>{if(connectGameTraceStore()||++retries>=40)clearInterval(retryTimer)},250);
  }


  const conversation=[];
  let priorFocus=null;
  let priorOverflow='';
  function add(role,text){conversation.push({role,text});const node=mk('div',{class:'gt-sky-message','data-role':role},mk('small',{text:role==='player'?'You':'Sky (preview)'}),document.createTextNode(text));messages.append(node);messages.scrollTop=messages.scrollHeight}
  add('sky','Hi! I’m Sky, your GameTrace companion. Data access is read-only and stays on this device. Type “my data” to check the connection. AI conversations are not connected yet.');
  function open(){priorFocus=document.activeElement;overlay.hidden=false;trigger.setAttribute('aria-expanded','true');priorOverflow=document.body.style.overflow;document.body.style.overflow='hidden';input.focus({preventScroll:true})}
  function shut(){overlay.hidden=true;trigger.setAttribute('aria-expanded','false');document.body.style.overflow=priorOverflow;(priorFocus?.isConnected?priorFocus:trigger).focus({preventScroll:true})}
  trigger.addEventListener('click',open);close.addEventListener('click',shut);
  overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)shut()});
  overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();shut()}else if(e.key==='Tab'){const targets=[close,input,send];const i=targets.indexOf(document.activeElement);if(e.shiftKey&&i===0){e.preventDefault();send.focus()}else if(!e.shiftKey&&i===2){e.preventDefault();close.focus()}}});
  form.addEventListener('submit',e=>{e.preventDefault();const value=input.value.trim();if(!value)return;add('player',value);input.value='';if(['my data','data status','connect data','what data do you have'].includes(value.toLowerCase().replace(/[?]$/,''))){const state=dataBridge.snapshot();add('sky',state.connected?'Read-only GameTrace data connected: '+Object.entries(state.counts).map(([k,n])=>k+': '+n).join(', ')+'. No information has been sent externally.':'GameTrace data is not connected. Diagnostic: '+JSON.stringify(state.diagnostics||{reason:state.reason})+'. No player data was accessed.')}else{add('sky','Sky is still in local preview mode. You can type “my data” to check the GameTrace read-only connection. Gemini is not connected.')}input.focus()});
  // Preserve the app cover: Sky becomes available only after entry.
  const cover=document.getElementById('gt-app-cover');
  const refreshVisibility=()=>{trigger.hidden=Boolean(cover && getComputedStyle(cover).display!=='none' && getComputedStyle(cover).visibility!=='hidden' && !cover.hidden && cover.getAttribute('aria-hidden')!=='true' && !document.documentElement.classList.contains('gt-cover-dismissed') && document.documentElement.classList.contains('gt-cover-open'));};
  refreshVisibility();
  const observer=new MutationObserver(refreshVisibility);
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  if(cover)observer.observe(cover,{attributes:true,attributeFilter:['class','style','hidden','aria-hidden']});
  window.GameTraceSkyV1={open,close:shut,conversation};
})();
