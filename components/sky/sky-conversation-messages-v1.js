/* Sky Conversation Messages V1.1 — independently scrollable feed with contextual options. */
(function(g){'use strict';const C=g.GameTraceSkyV1,{e,avatar,btn}=C;
 C.ConversationMessagesV1=function({avatarSrc}={}){
  const root=e('section','sky-feed');root.setAttribute('aria-label','Conversation with Sky');root.setAttribute('aria-live','polite');root.setAttribute('role','log');
  let activeOptions=null;
  const nearBottom=()=>root.scrollHeight-root.scrollTop-root.clientHeight<110;
  const keepBottom=wasNear=>{if(wasNear)root.scrollTop=root.scrollHeight;};
  function clear(){activeOptions=null;root.replaceChildren();}
  function appendMessage({role,text}){
   const atBottom=nearBottom(),row=e('div',role==='player'?'sky-message mine':'sky-message');
   if(role!=='player')row.append(avatar(avatarSrc));
   const bubble=e('div','sky-bubble');if(role!=='player')bubble.append(e('div','sky-author','Sky'));
   bubble.append(document.createTextNode(text||''));row.append(bubble);root.append(row);keepBottom(atBottom);return row;
  }
  function appendNode(node){const atBottom=nearBottom();root.append(node);keepBottom(atBottom);return node;}
  function clearOptions(){if(activeOptions){activeOptions.querySelectorAll('button').forEach(b=>b.disabled=true);activeOptions=null;}}
  function appendOptions(options=[],onSelect){
   clearOptions();if(!Array.isArray(options)||!options.length)return null;
   const wrap=e('div','sky-quick-replies');wrap.setAttribute('role','group');wrap.setAttribute('aria-label','Suggested replies');
   options.slice(0,5).forEach(option=>{
    const label=typeof option==='string'?option:option.label;
    const value=typeof option==='string'?option:(option.value??label);
    if(!label)return;
    const action=btn(label,'sky-quick-reply',()=>{clearOptions();onSelect?.(String(value),option);});
    wrap.append(action);
   });
   if(!wrap.children.length)return null;appendNode(wrap);activeOptions=wrap;return wrap;
  }
  return {element:root,clear,appendMessage,appendNode,appendOptions,clearOptions,scrollToBottom:()=>{root.scrollTop=root.scrollHeight;}};
 };
})(window);
