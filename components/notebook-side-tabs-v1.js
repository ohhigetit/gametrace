/* NotebookSideTabsV1 — APPROVED V5 (2026-11-10).
   Approved behavior: two icon-only Lucide-family Cross/Handshake tabs,
   bottom-right fixed overlay (no layout column), flat edge to the right,
   small Hide/Show chevron, slide-over Read/Edit.
   The Notebook page owns records. Supply onSave(type, value) to persist.
   No app data or browser storage mutations inside this reusable component.
*/
(function (global) {
  'use strict';
  const doc=global.document;
  if (!doc) return;
  const icons={
    prayer:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"/></svg>',
    commitment:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2 12 4.1 4.1a2 2 0 0 0 2.8 0l2.1-2.1"/><path d="m8 17 1.1 1.1a2 2 0 0 0 2.8 0l2.1-2.1"/><path d="m13 19 1.1 1.1a2 2 0 0 0 2.8 0L18 16"/><path d="m2 7 4 4 4-4 1.4-1.4a2 2 0 0 1 2.8 0L16 7"/><path d="m22 7-5 5"/><path d="m14 6 2.1-1a2 2 0 0 1 2.4.5L22 9"/></svg>',
    chevron:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>'
  };
  const spec={
    prayer:{title:'My Prayer',subtitle:'What guides me'},
    commitment:{title:'My Commitment',subtitle:'What I promise to give'}
  };
  function make(tag,cls,text){const node=doc.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
  function NotebookSideTabsV1({notebook,prayer='',commitment='',onSave,onOpen,onClose,bottomOffset}={}) {
    const host=typeof notebook==='string'?doc.querySelector(notebook):notebook;
    if (!(host instanceof global.Element))throw new TypeError('NotebookSideTabsV1 requires Notebook element');
    const values={prayer:String(prayer),commitment:String(commitment)};
    const rail=make('div','gt-notebook-tab-rail');
    rail.dataset.component='NotebookSideTabsV1';
    const nav=make('nav','gt-notebook-tabs-v1');
    nav.setAttribute('aria-label','Notebook personal tabs');
    nav.id='gt-notebook-tabs-'+Math.random().toString(36).slice(2,9);
    const buttons={};
    for(const type of ['prayer','commitment']){
      const button=make('button','tab '+type);
      button.type='button';button.title=spec[type].title;
      button.dataset.type=type;
      button.setAttribute('aria-label','Open '+spec[type].title);
      button.setAttribute('aria-pressed','false');
      button.innerHTML=icons[type];
      nav.appendChild(button);buttons[type]=button;
    }
    const toggle=make('button','tab-visibility');
    toggle.type='button';toggle.innerHTML=icons.chevron;
    toggle.setAttribute('aria-controls',nav.id);
    toggle.title='Hide tabs';
    rail.append(nav,toggle);
    if(bottomOffset!=null)rail.style.bottom=String(bottomOffset);
    const scrim=make('div','gt-notebook-tab-scrim');
    const panel=make('aside','gt-notebook-tab-panel');
    panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-hidden','true');panel.setAttribute('aria-label','Notebook personal statement');
    const heading=make('div','panel-head');
    const titleRow=make('div','panel-title');
    const panelIcon=make('span','panel-icon');
    const titleInfo=make('div','panel-titles');
    const title=make('h2','',spec.prayer.title);
    const subtitle=make('p','',spec.prayer.subtitle);
    titleInfo.append(title,subtitle);titleRow.append(panelIcon,titleInfo);
    const closeButton=make('button','icon-button','×');closeButton.type='button';closeButton.setAttribute('aria-label','Close panel');
    heading.append(titleRow,closeButton);
    const content=make('div','panel-content');
    const reading=make('div','panel-read');
    const label=make('p','panel-label');
    const statement=make('p','statement');
    reading.append(label,statement);
    const editingView=make('div','panel-edit');editingView.hidden=true;
    const editorLabel=make('label','edit-label');
    const editor=make('textarea','editor');editor.rows=6;editor.maxLength=3000;
    editor.id='gt-nst-editor-'+Math.random().toString(36).slice(2,9);editorLabel.htmlFor=editor.id;
    editingView.append(editorLabel,editor);
    content.append(reading,editingView);
    const footer=make('div','panel-foot');
    const cancel=make('button','action','Cancel');
    const edit=make('button','action','Edit');
    const save=make('button','action primary','Save');
    [cancel,edit,save].forEach(btn=>btn.type='button');
    footer.append(cancel,edit,save);
    panel.append(heading,content,footer);
    doc.body.append(rail,scrim,panel);
    let selected=null,editing=false,lastFocus=null,collapsed=false,scrollLocked=false,pending=false;
    function align(){
      if(!rail.isConnected)return;
      const rect=host.getBoundingClientRect(),width=rail.offsetWidth||42;
      rail.style.left=Math.max(0,Math.min(global.innerWidth-width,rect.right-width+1))+'px';
      const inView=rect.bottom>0&&rect.top<global.innerHeight;
      rail.hidden=!inView;
    }
    function setVisible(visible){
      collapsed=!visible;
      rail.classList.toggle('is-hidden',collapsed);
      nav.hidden=collapsed;
      toggle.setAttribute('aria-expanded',String(visible));
      toggle.setAttribute('aria-label',visible?'Hide Notebook side tabs':'Show Notebook side tabs');
      toggle.title=visible?'Hide tabs':'Show tabs';
    }
    function renderPanel(){
      if(!selected)return;
      const s=spec[selected],value=values[selected]||'';
      title.textContent=s.title;subtitle.textContent=s.subtitle;label.textContent=s.title.toUpperCase();
      editorLabel.textContent=s.title;panelIcon.innerHTML=icons[selected];
      statement.textContent=value||'Nothing written yet. Select Edit to add your words.';
      statement.classList.toggle('empty',!value);
      reading.hidden=editing;editingView.hidden=!editing;
      edit.hidden=editing;cancel.hidden=!editing;save.hidden=!editing;
    }
    function open(type){
      if(!spec[type])return;
      lastFocus=doc.activeElement;selected=type;editing=false;pending=false;
      panel.classList.add('open');scrim.classList.add('open');
      panel.setAttribute('aria-hidden','false');
      Object.entries(buttons).forEach(([key,b])=>b.setAttribute('aria-pressed',String(key===type)));
      renderPanel();closeButton.focus();
      if(typeof onOpen==='function')onOpen(type);
    }
    function close(){
      if(!selected||pending)return;
      const type=selected;selected=null;editing=false;
      panel.classList.remove('open');scrim.classList.remove('open');
      panel.setAttribute('aria-hidden','true');
      Object.values(buttons).forEach(b=>b.setAttribute('aria-pressed','false'));
      if(lastFocus&&lastFocus.isConnected)lastFocus.focus();
      if(typeof onClose==='function')onClose(type);
    }
    function beginEdit(){if(!selected)return;editing=true;editor.value=values[selected];renderPanel();editor.focus();}
    function cancelEdit(){editing=false;renderPanel();edit.focus();}
    async function saveEdit(){
      if(!selected||pending)return;
      const type=selected,value=editor.value.trim();
      pending=true;save.disabled=true;
      try {
        if(typeof onSave==='function')await onSave(type,value);
        values[type]=value;editing=false;renderPanel();edit.focus();
      }catch(error){
        editor.setCustomValidity(error&&error.message?error.message:'Unable to save');
        editor.reportValidity();editor.setCustomValidity('');
      }finally{pending=false;save.disabled=false;}
    }
    const onKey=(event)=>{
      if(!selected)return;
      if(event.key==='Escape'){event.preventDefault();if(editing)cancelEdit();else close();}
      if(event.key==='Tab'){
        const focusable=[...panel.querySelectorAll('button:not([hidden]):not(:disabled),textarea:not([hidden])')]
          .filter(n=>n.getClientRects().length>0&&!n.closest('[hidden]'));
        const first=focusable[0],last=focusable[focusable.length-1];
        if(event.shiftKey&&doc.activeElement===first){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&doc.activeElement===last){event.preventDefault();first.focus();}
      }
    };
    toggle.addEventListener('click',()=>setVisible(collapsed));
    Object.entries(buttons).forEach(([type,b])=>b.addEventListener('click',()=>open(type)));
    closeButton.addEventListener('click',close);scrim.addEventListener('click',close);
    edit.addEventListener('click',beginEdit);cancel.addEventListener('click',cancelEdit);
    save.addEventListener('click',saveEdit);
    doc.addEventListener('keydown',onKey);
    global.addEventListener('resize',align);global.addEventListener('scroll',align,{passive:true});
    setVisible(true);align();
    return Object.freeze({
      element:rail,open,close,
      show:()=>setVisible(true),hide:()=>setVisible(false),
      setContent:(type,value)=>{if(!spec[type])throw new TypeError('Unknown tab '+type);values[type]=String(value||'');if(selected===type)renderPanel();},
      destroy:()=>{doc.removeEventListener('keydown',onKey);global.removeEventListener('resize',align);global.removeEventListener('scroll',align);rail.remove();scrim.remove();panel.remove();}
    });
  }
  global.GameTraceNotebookSideTabsV1=Object.freeze({mount:NotebookSideTabsV1});
})(window);
