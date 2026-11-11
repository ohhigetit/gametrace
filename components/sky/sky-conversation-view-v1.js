/* Sky Conversation V1.1 — fixed chat, contextual buttons, read adapter and gated saves.
 * Host supplies authorized dataService and onSaveDiscovery. No network or database writes here.
 */
(function(g){'use strict';
const C=g.GameTraceSkyV1,{e,btn}=C;
C.SkyConversationViewV1=function({
 avatarSrc,threads=[],notes=[],player='Georgina',dataService=null,
 onBack,onSendMessage,onSaveDiscovery,onApproveDiscovery
}={}){
 const root=e('main','sky-view'),allNotes=[...notes],overlay=e('div','sky-sheet-bg');overlay.hidden=true;
 let selected=[],thread=null,busy=false;const sheet=e('div','sky-sheet');sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');
 const closer=btn('✕','sky-close',closeSheet),sheetTitle=e('h2'),sheetDesc=e('p'),sheetItems=e('div');
 sheet.append(closer,sheetTitle,sheetDesc,sheetItems);overlay.append(sheet);
 overlay.addEventListener('click',ev=>{if(ev.target===overlay)closeSheet()});
 function closeSheet(){overlay.hidden=true;}
 function showSheet(title,description,choices){sheetTitle.textContent=title;sheetDesc.textContent=description;sheetItems.replaceChildren();
  choices.forEach(({title,detail,action})=>{const item=btn('','choice',()=>{closeSheet();action?.()});item.append(e('strong','',title),e('span','',detail||''));sheetItems.append(item)});
  if(!choices.length)sheetItems.append(e('p','','No matching records are available.'));
  overlay.hidden=false;
 }
 const safeSearch=(query='',limit=12)=>{
  if(!dataService?.search)return [];
  try{
   const result=dataService.search({player,query,kinds:['note','training','game'],limit});
   return (result?.items||[]).filter(r=>r.text&&/feedback\.|notes|body/i.test(r.field||''));
  }catch(error){console.warn('Sky notes search unavailable:',error);return [];}
 };
 function normalized(r){return {id:r.key||r.id, key:r.key||r.id,text:r.text,source:[r.date,r.title||r.source].filter(Boolean).join(' · '),kind:r.kind,recordId:r.recordId,field:r.field};}
 function availableNotes(query=''){const indexed=safeSearch(query,30).map(normalized);const local=allNotes.filter(n=>!query||[n.text,n.source].join(' ').toLowerCase().includes(query.toLowerCase()));
  return [...indexed,...local].filter((n,i,a)=>a.findIndex(m=>m.id===n.id)===i);
 }
 function addNotes(query=''){
  const choices=availableNotes(query).filter(n=>!selected.some(s=>s.id===n.id)).slice(0,25).map(n=>({title:n.source||'Original note',detail:n.text,action:()=>{selected.push(n);context.setNotes(selected);say('sky','I added that original note as context. What would you like to discover from it?');}}));
  showSheet('Find original notes','Records are read from the connected GameTrace data adapter when available. Originals remain unchanged.',choices);
 }
 function history(){showSheet('Your conversations','Choose an available conversation.',threads.map(t=>({title:t.title,detail:`${(t.noteIds||[]).length} related notes · ${t.status||'Ongoing'}`,action:()=>loadThread(t)})));}
 function newThread(){loadThread({id:'new',title:'New Conversation',noteIds:[],messages:[]});}
 const header=C.ConversationHeaderV1({title:'New Conversation',avatarSrc,onBack:onBack||(()=>showSheet('Sky Conversations','Choose an action',[{title:'New conversation',detail:'Start a new notes review',action:newThread},{title:'Conversation history',detail:'Reopen an available thread',action:history}])),onRename:()=>{const name=prompt('Conversation title',thread?.title||'');if(name?.trim()){thread.title=name.trim();header.setTitle(thread.title)}},onHistory:history,onComplete:()=>{if(thread)thread.status='Completed';say('sky','Conversation marked complete locally. No GameTrace record was changed.')},onDelete:()=>{if(confirm('Clear this local conversation?'))newThread()}});
 const context=C.ConversationContextV1({onAdd:()=>addNotes(),onRemove:id=>{selected=selected.filter(n=>n.id!==id);context.setNotes(selected)}});
 const messages=C.ConversationMessagesV1({avatarSrc});
 const composer=C.ConversationComposerV1({onSend:msg=>sendUser(msg),onAttach:()=>addNotes(),onRecap:()=>sendUser('Please recap the evidence and unresolved questions from this review.'),onDiscover:()=>sendUser('Please propose a standards-valid discovery based on my selected notes. Ask me one clarification question first if needed.'),disclaimer:dataService?'Authorized notes adapter connected · Saves require app confirmation':'Standalone conversation · Live GameTrace saving requires host integration'});
 function say(role,text){const m={role,text:String(text||'')};thread?.messages?.push(m);return messages.appendMessage(m);}
 function showOptions(list,onSelect){messages.appendOptions(list,onSelect||((value)=>sendUser(value)));}
 function chooseDestination(){
  say('sky','Where would you like to take this reflection?');
  showOptions([{label:'My DNA',value:'My DNA'},{label:'Playbook',value:'Playbook'},{label:'Help Me Decide',value:'Help me decide'}],value=>{
   say('player',value);thread.destination=value;
   if(value==='My DNA'){
    say('sky','Which kind of discovery are we working on?');
    showOptions(['I See','I Am','Help Me Decide'],cat=>{say('player',cat);thread.category=cat;offerNotes();});
   }else {thread.category=value==='Playbook'?'I Will Become':null;offerNotes();}
  });
 }
 function offerNotes(){
  const recent=availableNotes().slice(0,5);say('sky',recent.length?'Here are recent reflections I can find. Pick one, or search for a specific note.':'I can help you find a note. The connected data adapter has no eligible reflections available yet.');
  const opts=recent.map(n=>({label:(n.source||'Reflection').slice(0,48),value:n.id,note:n}));
  opts.push({label:'Find a specific note',value:'search'});
  showOptions(opts,(value,opt)=>{
   if(value==='search'){addNotes();return;}
   const n=opt.note;selected=[n];context.setNotes(selected);
   say('player','Review: '+(n.source||'selected note'));sendUser('Please refine this original reflection for '+(thread.category||'the right My DNA or Playbook category')+': '+n.text,{suppressPlayer:true});
  });
 }
 function opening(){
  say('sky','Hey G! Are we refining your notes today?');
  showOptions([{label:"Yes, let's go!",value:'Yes'},{label:'Not right now',value:'No'}],value=>{
   say('player',value==='Yes'?"Yes, let's refine notes.":"Not right now.");
   if(value==='Yes')chooseDestination();
   else {say('sky',"Of course, G. What would you like to talk about?");}
  });
 }
 async function sendUser(msg,{suppressPlayer=false}={}){
  if(busy)return;messages.clearOptions();if(!suppressPlayer)say('player',msg);
  if(typeof onSendMessage!=='function'){say('sky',"I can help select notes here, but live AI isn't connected in this component. Connect an AI response handler to continue refining.");return;}
  busy=true;composer.setDisabled(true);
  try{
   const result=await onSendMessage(msg,{thread,selectedNotes:[...selected],player,category:thread?.category,destination:thread?.destination,sourceKeys:selected.map(n=>n.key).filter(Boolean)});
   if(typeof result==='string'){say('sky',result);}
   else if(result&&typeof result==='object'){
    if(result.text)say('sky',result.text);
    if(result.discovery)showDiscovery(result.discovery);
    if(Array.isArray(result.options)&&result.options.length)showOptions(result.options);
   }else say('sky','I could not get a response. Please try again.');
  }catch(err){say('sky','I could not reach Sky right now. Your original notes are unchanged.');console.warn('Sky response failed',err);}
  finally{busy=false;composer.setDisabled(false);}
 }
 function showDiscovery(discovery){
  const category=discovery.category||thread?.category||'I SEE';
  const sourceKeys=discovery.sourceKeys||selected.map(n=>n.key).filter(Boolean);
  const card=C.DiscoveryCardV1({category,statement:discovery.statement,sourceKeys,
   onDiscuss:()=>sendUser('Please discuss the evidence and meaning of this proposed statement.'),
   onRefine:(old,done)=>{const revised=prompt('Refine proposed statement (not saved):',old);if(revised?.trim())done(revised)},
   onApprove:async proposal=>{
    if(typeof onSaveDiscovery!=='function'){say('sky','Saving is not connected to the authorized GameTrace write service yet. This remains a proposal.');return {saved:false};}
    try{
     const validated=dataService?.prepareProposal?dataService.prepareProposal({player,category:proposal.category,statement:proposal.statement,sourceKeys:proposal.sourceKeys}):{...proposal,player,destination:category==='I WILL BECOME'?'playbook':'myDNA',status:'PROPOSED_NOT_SAVED'};
     const result=await onSaveDiscovery({player,threadId:thread?.id,proposal:validated});
     if(result?.saved===true){say('sky',category==='I WILL BECOME'?'Saved to Playbook.':'Saved to My DNA.');return result;}
     say('sky','The save was not confirmed. Your statement remains a proposal.');return {saved:false};
    }catch(err){say('sky','Saving failed; no successful save was confirmed.');throw err;}
   }
  });messages.appendNode(card.element);
 }
 root.append(header.element,context.element,messages.element,composer.element);
 function loadThread(t){
  thread={...t,messages:[]};header.setTitle(t.title||'New Conversation');selected=availableNotes().filter(n=>(t.noteIds||[]).includes(n.id));context.setNotes(selected);messages.clear();
  if(Array.isArray(t.messages)&&t.messages.length){t.messages.forEach(m=>say(m.role,m.text));}
  else if(selected.length){say('sky','I have your selected note. Shall we refine it for My DNA or Playbook?');chooseDestination();}
  else opening();
 }
 loadThread(threads[0]||{id:'new',title:'New Conversation',noteIds:[],messages:[]});
 return {element:root,overlay,loadThread,getSelectedNotes:()=>[...selected],getThread:()=>({...thread,messages:[...(thread?.messages||[])]}),showDiscovery,searchNotes:availableNotes,destroy:()=>{root.remove();overlay.remove()}};
};
})(window);