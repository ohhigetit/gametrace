/* Sky Discovery Card V1.1 — confirmation-gated action, never simulates persistence. */
(function(g){'use strict';const C=g.GameTraceSkyV1,{e,btn}=C;
 C.DiscoveryCardV1=function({category='I SEE',statement='',sourceKeys=[],onDiscuss,onRefine,onApprove,onDismiss}={}){
  const root=e('article','sky-card'),state=e('small','',`${category} · PROPOSED · NOT SAVED`),quote=e('blockquote','',statement);
  const actions=e('div','sky-actions');let busy=false,saved=false;
  const discuss=btn('Discuss more','',()=>onDiscuss?.());
  const refine=btn('Refine','',()=>{if(busy||saved)return;onRefine?.(quote.textContent,text=>{if(text?.trim()){quote.textContent=text.trim();state.textContent=`${category} · REFINED · NOT SAVED`;}})});
  const save=btn(category==='I WILL BECOME'?'Approve & Save to Playbook':'Approve & Save to My DNA','primary',async()=>{
   if(busy||saved)return;
   if(typeof onApprove!=='function'){state.textContent=`${category} · SAVE UNAVAILABLE · NOT SAVED`;return;}
   if(!g.confirm('Approve and save this exact statement?\n\n'+quote.textContent))return;
   busy=true;save.disabled=true;state.textContent=`${category} · SAVING…`;
   try{
    const result=await onApprove({category,statement:quote.textContent,sourceKeys:[...sourceKeys]});
    if(result?.saved===true){
     saved=true;state.textContent=`${category} · SAVED`;
     [discuss,refine,save,dismiss].forEach(b=>b.disabled=true);
    }else{state.textContent=`${category} · NOT SAVED`;}
   }catch(err){state.textContent=`${category} · SAVE FAILED · NOT SAVED`;root.title=String(err?.message||err);}
   finally{busy=false;if(!saved)save.disabled=false;}
  });
  const dismiss=btn('Dismiss','',()=>{if(busy)return;onDismiss?.();root.remove();});
  actions.append(discuss,refine,save,dismiss);root.append(state,quote,actions);
  return {element:root,getStatement:()=>quote.textContent};
 };
})(window);
