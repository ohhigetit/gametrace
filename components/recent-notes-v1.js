/* RecentNotesV1 — content only. No SectionV1 header, router or data mutations.
   Input: up to 6 normalized note objects {id,text,activity,date,question,fullText}.
   Caller retains ownership of the source notes and handles navigation. */
(function(global){
  'use strict';
  const POS=['a','b','c','d','e','f'];
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function compactText(value,max){const text=String(value||'').trim();return text.length>max?text.slice(0,max-1).trimEnd()+'…':text;}
  function recentNotesV1(notes,opts){
    const rows=(Array.isArray(notes)?notes:[]).slice(0,6),options=opts||{};
    if(!rows.length)return '<div class="gt-recent-notes-v1"><p class="rn-empty">No recent notes yet.</p></div>';
    return '<div class="gt-recent-notes-v1"><div class="rn-cells">'+rows.map((n,i)=>{
      const text=compactText(n.text||n.fullText||'',options.previewMaxLength||100);
      const length=text.length>65?'verylong':text.length>42?'long':'short';
      const meta=[n.activity,n.date].filter(Boolean).join(' · ');
      return '<button type="button" class="rn-cell rn-'+POS[i]+'" data-rn-index="'+i+'" aria-label="Read note: '+esc(text)+'"><span class="rn-text" data-length="'+length+'">'+esc(text)+'</span><span class="rn-meta">'+esc(meta)+'</span></button>';
    }).join('')+'</div><div class="rn-detail" data-rn-detail hidden aria-live="polite"></div></div>';
  }
  function mountRecentNotesV1(target,notes,opts){
    const el=typeof target==='string'?document.querySelector(target):target;
    if(!el)throw new Error('RecentNotesV1 target not found');
    const rows=(Array.isArray(notes)?notes:[]).slice(0,6);
    el.innerHTML=recentNotesV1(rows,opts);
    const content=el.querySelector('.gt-recent-notes-v1'),detail=content&&content.querySelector('[data-rn-detail]');
    if(!content||!detail)return;
    content.addEventListener('click',e=>{
      const close=e.target.closest('[data-rn-close]');
      if(close){detail.hidden=true;detail.innerHTML='';return;}
      const cell=e.target.closest('[data-rn-index]');
      if(!cell)return;
      const n=rows[Number(cell.dataset.rnIndex)];
      if(!n)return;
      if(opts&&typeof opts.onNoteClick==='function'){opts.onNoteClick(n);return;}
      detail.innerHTML='<div class="rn-detail-head"><span>'+esc([n.activity,n.date,n.question].filter(Boolean).join(' · '))+'</span><button type="button" class="rn-detail-close" data-rn-close>Close</button></div><blockquote>“'+esc(n.fullText||n.text||'')+'”</blockquote>';
      detail.hidden=false;
    });
  }
  global.GameTraceRecentNotesV1={render:recentNotesV1,mount:mountRecentNotesV1};
})(typeof window!=='undefined'?window:globalThis);