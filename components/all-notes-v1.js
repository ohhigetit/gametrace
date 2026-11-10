/* AllNotesV1 — approved V18 continuous note list. Content-only, no filters/header.
 * Input notes: {id,text,date (YYYY-MM-DD),activity,question,type}.
 * Parent handles data, date filtering and grouping selection.
 */
(function(global){
  'use strict';
  function el(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n;}
  const questionLabels={See:'What I saw',Become:'What I became','Become More':'What I want to become more'};
  function questionLabel(note){return questionLabels[note.question]||note.question||'Other notes';}
  function formatDate(value){
    if(!value)return '';
    const match=String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!match)return String(value);
    const d=new Date(Date.UTC(+match[1],+match[2]-1,+match[3]));
    return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
  }
  function sortDate(a,b){return String(a.date||'').localeCompare(String(b.date||''));}
  function dateCaption(items){
    const dates=items.map(n=>n.date).filter(Boolean).sort();
    if(!dates.length)return '';
    const first=formatDate(dates[0]),last=formatDate(dates[dates.length-1]);
    return first===last?first:first+' – '+last;
  }
  function groupNotes(notes,by){
    const rows=(Array.isArray(notes)?notes:[]).slice().sort((a,b)=>sortDate(b,a));
    if(by==='none')return [{title:'',items:rows,date:''}];
    const map=new Map();
    rows.forEach(note=>{
      const title=by==='question'?questionLabel(note):note.activity||'Other activity';
      // Activity groups represent dated activity instances. Question groups span dates.
      const key=by==='question'?title:title+'\u0000'+String(note.date||'');
      if(!map.has(key))map.set(key,{title,items:[]});
      map.get(key).items.push(note);
    });
    const groups=Array.from(map.values());
    if(by==='question'){
      const order=['What I saw','What I became','What I want to become more'];
      groups.sort((a,b)=>{
        const x=order.indexOf(a.title),y=order.indexOf(b.title);
        return (x===-1?99:x)-(y===-1?99:y)||a.title.localeCompare(b.title);
      });
    }
    groups.forEach(g=>g.date=dateCaption(g.items));
    return groups;
  }
  function makeEntry(note,by,onNoteClick){
    const row=el('article','gt-an-note');
    const quote=el('q','gt-an-note-text',note.text||'');
    row.appendChild(quote);
    const source=note.type==='personal'?'Personal Notes':"Player's Notes";
    const metadata=by==='activity' ? source+' · '+questionLabel(note)
      : by==='question' ? [note.activity,formatDate(note.date)].filter(Boolean).join(' · ')
      : [source,questionLabel(note),note.activity,formatDate(note.date)].filter(Boolean).join(' · ');
    row.appendChild(el('div','gt-an-note-detail',metadata));
    if(typeof onNoteClick==='function'){
      row.tabIndex=0;row.setAttribute('role','button');row.addEventListener('click',()=>onNoteClick(note));
      row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onNoteClick(note);}});
    }
    return row;
  }
  function AllNotesV1({notes=[],groupBy='activity',onNoteClick}={}){
    const root=el('div','gt-all-notes-v1');root.dataset.component='AllNotesV1';
    if(!Array.isArray(notes)||!notes.length){root.appendChild(el('p','gt-an-empty','No notes in this date range.'));return root;}
    groupNotes(notes,groupBy).forEach(g=>{
      const section=el('section','gt-an-group');
      if(groupBy!=='none'){
        const heading=el('div','gt-an-group-heading');
        const label=el('span','gt-an-group-label',g.title);
        heading.appendChild(label);
        if(g.date)heading.appendChild(el('span','gt-an-group-date',' · '+g.date));
        heading.appendChild(el('span','gt-an-group-count',g.items.length+' note'+(g.items.length===1?'':'s')));
        section.appendChild(heading);
      }
      const list=el('div','gt-an-note-list');
      g.items.forEach(note=>list.appendChild(makeEntry(note,groupBy,onNoteClick)));
      section.appendChild(list);root.appendChild(section);
    });
    return root;
  }
  global.GameTraceAllNotesV1=Object.freeze({render:AllNotesV1,groupNotes});
})(window);
