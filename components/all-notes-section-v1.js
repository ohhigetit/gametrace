/* AllNotesSectionV1 — instantiates the REAL approved GameTraceComponents.Section
 * and adds scoped header filter accordion without changing the shared parent.
 * Data is supplied by caller; nothing is written to app storage.
 */
(function(global){
  'use strict';
  const options=[
    ['last30','Last 30 Days'],['last7','Last 7 Days'],['today','Today'],
    ['thismonth','This Month'],['last90','Last 90 Days'],
    ['all','All Dates'],['custom','Custom Range']
  ];
  function el(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n;}
  function select(id,values,selected){const s=el('select');s.id=id;values.forEach(([v,t])=>{const o=el('option','',t);o.value=v;s.appendChild(o);});s.value=selected;return s;}
  let serial=0;
  function localISO(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
  function daysBefore(today,days){const d=new Date(today.getFullYear(),today.getMonth(),today.getDate());d.setDate(d.getDate()-days);return localISO(d);}
  function filterByDate(notes,range,from,to,today){
    let low='',high=localISO(today);
    if(range==='all')high='';
    else if(range==='last30')low=daysBefore(today,29);
    else if(range==='last7')low=daysBefore(today,6);
    else if(range==='today')low=high;
    else if(range==='thismonth')low=localISO(new Date(today.getFullYear(),today.getMonth(),1));
    else if(range==='last90')low=daysBefore(today,89);
    else if(range==='custom'){low=from;high=to;}
    if(low&&high&&low>high)return {notes:[],error:'Start date must be on or before end date.'};
    return {notes:(Array.isArray(notes)?notes:[]).filter(n=>{
      // App integration must supply dates in ISO YYYY-MM-DD.
      const date=String(n.date||'');return /^\d{4}-\d{2}-\d{2}$/.test(date)&&(!low||date>=low)&&(!high||date<=high);
    }),error:''};
  }
  function AllNotesSectionV1({notes=[],title='All Notes',subtitle='Every observation, lesson, and aspiration in one place.',onNoteClick,today=new Date()}={}){
    const Parent=global.GameTraceComponents&&global.GameTraceComponents.Section;
    const Content=global.GameTraceAllNotesV1&&global.GameTraceAllNotesV1.render;
    if(typeof Parent!=='function')throw new Error('Approved GameTraceComponents.Section is required.');
    if(typeof Content!=='function')throw new Error('AllNotesV1 is required.');
    const root=Parent({title,subtitle,content:el('div','gt-an-content-mount'),kind:'gt-all-notes-section-v1'});
    root.dataset.component='AllNotesSectionV1';root.dataset.parent='SectionV1';
    const header=root.querySelector('.gtc-section-header'),mount=root.querySelector('.gt-an-content-mount');
    if(!header||!mount)throw new Error('Expected approved SectionV1 DOM contract.');
    const id='gt-an-filter-'+(++serial);
    const trigger=el('button','gt-an-filter-trigger');trigger.type='button';trigger.title='Show or hide filters';
    trigger.setAttribute('aria-label','Show or hide All Notes filters');trigger.setAttribute('aria-controls',id);trigger.setAttribute('aria-expanded','false');
    trigger.innerHTML='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4"/><circle cx="8" cy="7" r="2" fill="white"/><circle cx="16" cy="12" r="2" fill="white"/></svg>';
    header.appendChild(trigger);
    const filters=el('div','gt-an-filter-accordion');filters.id=id;filters.hidden=true;
    const row=el('div','gt-an-filter-row');
    function control(labelText,controlNode){const wrapper=el('div','gt-an-control');const label=el('label','',labelText);label.htmlFor=controlNode.id;wrapper.append(label,controlNode);return wrapper;}
    const by=select(id+'-group',[['activity','Activity'],['question','Question'],['none','None']],'activity');
    const range=select(id+'-range',options,'last30');
    row.append(control('Group By',by),control('Date Range',range));filters.appendChild(row);
    const custom=el('div','gt-an-custom-range');custom.hidden=true;
    const from=el('input');from.type='date';from.id=id+'-from';const to=el('input');to.type='date';to.id=id+'-to';
    from.value=localISO(new Date(today.getFullYear(),today.getMonth(),1));to.value=localISO(today);
    custom.append(control('From',from),control('To',to));filters.appendChild(custom);
    const feedback=el('span','gt-an-filter-feedback');feedback.setAttribute('aria-live','polite');filters.appendChild(feedback);
    header.insertAdjacentElement('afterend',filters);
    function render(){
      custom.hidden=range.value!=='custom';
      const filtered=filterByDate(notes,range.value,from.value,to.value,today);
      feedback.textContent=filtered.error||filtered.notes.length+' note'+(filtered.notes.length===1?'':'s')+' in selected range';
      mount.replaceChildren(Content({notes:filtered.notes,groupBy:by.value,onNoteClick}));
    }
    trigger.addEventListener('click',()=>{filters.hidden=!filters.hidden;trigger.setAttribute('aria-expanded',String(!filters.hidden));});
    [by,range,from,to].forEach(node=>node.addEventListener('change',render));
    render();
    root.updateNotes=newNotes=>{notes=newNotes;render();};
    return root;
  }
  global.GameTraceAllNotesSectionV1=Object.freeze({render:AllNotesSectionV1});
})(window);
