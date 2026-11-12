
/* Sky review: read-only local snapshots; no Gemini API calls, writes, or external player-data transmission. */
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
      if(!provider)return {connected:false,reason:'No registered provider',diagnostics:{version:'sky-bridge-probe-v2',bridgePresent:typeof window.__gtSkyReadOnlyProvider==='function',dbVisible:typeof db!=='undefined',windowDbVisible:typeof window.db!=='undefined',appRootVisible:!!document.getElementById('app'),documentReady:document.readyState,origin:location.origin}};
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
      trainings:['id','date','player','type','minutes','name','feedback','notes'],
      notes:['id','date','player','title','text','content','body','notes','feedback','source','gameId','trainingId'],
      goals:['id','date','player','title','status','targetDate','achievedAt','entries'],
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


  // Re-check deferred bridge registration after original app scripts finish.
  window.addEventListener('pageshow',connectGameTraceStore);

  // Sky V1.7: local rule-based retrieval using the read-only GameTrace provider.
  function answerFromData(question){
    const state=dataBridge.snapshot();
    if(!state.connected)return 'GameTrace data is not connected. '+(state.reason||'');
    const data=state.data||{};
    const arr=(key)=>Array.isArray(data[key])?data[key]:[];
    const str=(value)=>String(value===undefined||value===null?'':value).trim();
    const clip=(value,n=250)=>str(value).slice(0,n);
    const date=(value)=>str(value).slice(0,10)||'date unavailable';
    const byLatest=(a,b)=>str(b.date||b.start).localeCompare(str(a.date||a.start));
    const notes=[...arr('notes')].sort(byLatest);
    const q=str(question).toLowerCase();
    const linesForNote=(note)=>{
      const labels={see:'What I Saw',became:'What I Became',more:'What I Want to Become More',additional:'Additional Notes',well:'What Went Well',challenge:'Challenge',next:'Next Focus'};
      const out=Object.entries(note.feedback||{}).filter(([key,value])=>labels[key]&&str(value)).map(([key,value])=>labels[key]+': '+clip(value,320));
      if(str(note.notes))out.push('Note: '+clip(note.notes,300));
      if(str(note.text))out.push('Note: '+clip(note.text,300));
      return out;
    };
    if(/last game|latest game|recent game|game performance|how did i perform/.test(q)){
      const games=[...arr('games')].sort(byLatest);
      if(!games.length)return 'No recorded games are available here.';
      const game=games[0];
      let result='Latest game: '+clip(game.team||'Your team',80)+' vs '+clip(game.opponent||'opponent not recorded',80)+' on '+date(game.date)+'.';
      const score=game.finalScore;
      if(score&&str(score.team)&&str(score.opponent))result+=' Final score: '+score.team+'–'+score.opponent+'.';
      if(str(game.status))result+=' Status: '+clip(game.status,30)+'.';
      const note=notes.find(n=>n.gameId===game.id);
      if(note&&linesForNote(note).length)result+='\nPlayer Notes: '+linesForNote(note).slice(0,3).join(' | ');
      return result;
    }
    if(/training|practice|practiced|sessions/.test(q)){
      const sessions=[...arr('trainings')].sort(byLatest);
      if(!sessions.length)return 'No trainings are available here.';
      const last=sessions[0];
      let result=sessions.length+' training sessions found. Latest: '+clip(last.name||last.type||'Training',90)+' on '+date(last.date)+(str(last.minutes)?' ('+last.minutes+' minutes)':'')+'.';
      result+='\nRecent sessions: '+sessions.slice(0,5).map(s=>clip(s.name||s.type||'Training',65)+' — '+date(s.date)).join('; ')+'.';
      const note=notes.find(n=>n.trainingId===last.id);
      if(note&&linesForNote(note).length)result+='\nLatest reflection: '+linesForNote(note).slice(0,2).join(' | ');
      return result;
    }
    if(/notes|note|reflection|what i saw|what i became|wrote|observations/.test(q)){
      if(!notes.length)return 'No Player Notes or reflections were found.';
      return notes.length+' note records found. Three most recent:\n'+notes.slice(0,3).map(n=>(n.source||'Note')+' ('+date(n.date)+'): '+(linesForNote(n).slice(0,3).join(' | ')||'No note text')).join('\n');
    }
    if(/goal|playbook|target|next steps/.test(q)){
      const goals=arr('goals');
      if(!goals.length)return 'No Playbook goals were found.';
      const active=goals.filter(g=>g.status!=='achieved');
      const lines=active.slice(0,6).map(g=>{
        const entries=[...(Array.isArray(g.entries)?g.entries:[])].sort(byLatest);
        return '• '+clip(g.title||'Untitled goal',120)+(str(g.targetDate)?' (target '+date(g.targetDate)+')':'')+(entries.length&&str(entries[0].rating)?' — latest self-rating '+entries[0].rating+'/5':'');
      });
      return goals.length+' Playbook goals: '+active.length+' active, '+(goals.length-active.length)+' achieved.'+(lines.length?'\n'+lines.join('\n'):'');
    }
    if(/schedule|upcoming|next event|calendar/.test(q)){
      const today=new Date().toISOString().slice(0,10);
      const events=arr('schedule').filter(e=>date(e.start||e.date)>=today).sort((a,b)=>str(a.start||a.date).localeCompare(str(b.start||b.date))).slice(0,5);
      if(!events.length)return 'No upcoming events were found in this preview.';
      return 'Upcoming events:\n'+events.map(e=>'• '+date(e.start||e.date)+' — '+clip(e.title||e.activity||'Event',130)).join('\n');
    }
    return 'I can summarize your latest game, trainings, Player Notes, Playbook goals, and upcoming schedule. Try one of those questions. Gemini is not connected yet.';
  }
  window.GameTraceSkyAnswers=Object.freeze({ask:answerFromData});

  const conversation=[];
  let priorFocus=null;
  let priorOverflow='';
  function add(role,text){conversation.push({role,text});const node=mk('div',{class:'gt-sky-message','data-role':role},mk('small',{text:role==='player'?'You':'Sky (preview)'}),document.createTextNode(text));messages.append(node);messages.scrollTop=messages.scrollHeight}
  add('sky','Hi! I’m Sky, your GameTrace companion. Data access is read-only and stays on this device. Ask about games, trainings, Player Notes, goals, or your schedule. Type “my data” to check the connection. Gemini is not connected.');
  function open(){priorFocus=document.activeElement;overlay.hidden=false;trigger.setAttribute('aria-expanded','true');priorOverflow=document.body.style.overflow;document.body.style.overflow='hidden';input.focus({preventScroll:true})}
  function shut(){overlay.hidden=true;trigger.setAttribute('aria-expanded','false');document.body.style.overflow=priorOverflow;(priorFocus?.isConnected?priorFocus:trigger).focus({preventScroll:true})}
  trigger.addEventListener('click',open);close.addEventListener('click',shut);
  overlay.addEventListener('pointerdown',e=>{if(e.target===overlay)shut()});
  overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();shut()}else if(e.key==='Tab'){const targets=[close,input,send];const i=targets.indexOf(document.activeElement);if(e.shiftKey&&i===0){e.preventDefault();send.focus()}else if(!e.shiftKey&&i===2){e.preventDefault();close.focus()}}});
  form.addEventListener('submit',e=>{e.preventDefault();const value=input.value.trim();if(!value)return;add('player',value);input.value='';if(['my data','data status','connect data','what data do you have'].includes(value.toLowerCase().replace(/[?]$/,''))){const state=dataBridge.snapshot();add('sky',state.connected?'Read-only GameTrace data connected: '+Object.entries(state.counts).map(([k,n])=>k+': '+n).join(', ')+'. No information has been sent externally.':'GameTrace data is not connected. Diagnostic: '+JSON.stringify(state.diagnostics||{reason:state.reason})+'. No player data was accessed.')}else{add('sky',answerFromData(value))}input.focus()});
  // Preserve the app cover: Sky becomes available only after entry.
  const cover=document.getElementById('gt-app-cover');
  const refreshVisibility=()=>{trigger.hidden=Boolean(cover && getComputedStyle(cover).display!=='none' && getComputedStyle(cover).visibility!=='hidden' && !cover.hidden && cover.getAttribute('aria-hidden')!=='true' && !document.documentElement.classList.contains('gt-cover-dismissed') && document.documentElement.classList.contains('gt-cover-open'));};
  refreshVisibility();
  const observer=new MutationObserver(refreshVisibility);
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  if(cover)observer.observe(cover,{attributes:true,attributeFilter:['class','style','hidden','aria-hidden']});
  window.GameTraceSkyV1={open,close:shut,conversation};
})();
