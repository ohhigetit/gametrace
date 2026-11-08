/**
 * GameTrace reusable presentation components — foundation v0.1.
 * Pure DOM views; does not load records, modify app state, or perform network calls.
 * Existing app icons are injected by the integration layer (iconNode).
 */
(function (global) {
  'use strict';
  const doc = global.document;
  if (!doc) return;
  const element = (tag, className, text) => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  };
  const append = (parent, ...children) => {
    children.flat().forEach(child => {
      if (child instanceof global.Node) parent.appendChild(child);
      else if (child !== null && child !== undefined) parent.appendChild(doc.createTextNode(String(child)));
    });
    return parent;
  };
  const visible = value => value !== undefined && value !== null && String(value).trim() !== '';
  const detail = (...parts) => parts.filter(visible).join(' · ');
  const integer = value => Number.isFinite(Number(value)) ? String(Math.round(Number(value))) : '—';
  const safeDate = date => {
    if (!date) return '';
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [y,m,d] = date.split('-').map(Number);
      const dt = new Date(Date.UTC(y,m-1,d));
      if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m-1 || dt.getUTCDate() !== d) return '';
      return dt.toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).toUpperCase();
    }
    return String(date);
  };
  function actionButton(label, action, extraClass) {
    const b = element('button', 'gtc-action ' + (extraClass || ''), label);
    b.type = 'button';
    if (typeof action === 'function') b.addEventListener('click', action);
    else b.disabled = true;
    return b;
  }
  /** Section Parent — title/subtitle and optional action around arbitrary content. */
  function Section({title,subtitle,actionLabel='View All',onAction,content,kind=''}={}) {
    if (!visible(title)) throw new TypeError('Section requires title');
    const root = element('section','gtc-section ' + kind);
    const header = element('div','gtc-section-header');
    const titles = element('div','gtc-section-titles');
    append(titles, element('h2','gtc-section-title',title));
    if (visible(subtitle)) append(titles,element('p','gtc-section-subtitle',subtitle));
    append(header,titles);
    if (typeof onAction === 'function') append(header,actionButton(actionLabel,onAction,'gtc-section-action'));
    append(root,header);
    if (content) append(root,element('div','gtc-section-content'));
    if (content) append(root.lastChild,content);
    return root;
  }
  /** List Parent — shared row divisions and no global list mutation. */
  function List({items=[],renderItem,emptyText='Nothing recorded yet.'}={}) {
    if (!Array.isArray(items) || typeof renderItem !== 'function') throw new TypeError('List needs items and renderItem');
    const root=element('div','gtc-list');
    if (!items.length) append(root,element('p','gtc-empty',emptyText));
    items.forEach((item,index)=>{
      const row=renderItem(item,index);
      if (!(row instanceof global.Node)) throw new TypeError('renderItem must return a DOM node');
      row.classList.add('gtc-list-row');
      append(root,row);
    });
    return root;
  }
  function iconSlot(iconNode) {
    const slot=element('span','gtc-row-icon');
    slot.setAttribute('aria-hidden','true');
    if (iconNode instanceof global.Node) append(slot,iconNode.cloneNode(true));
    return slot;
  }
  function rowShell({iconNode,category,title,metadata,description,value,valueLabel,tone='neutral',onOpen}={}) {
    const root=typeof onOpen==='function' ? element('button','gtc-activity-row') : element('div','gtc-activity-row');
    if (root.tagName==='BUTTON') {root.type='button';root.addEventListener('click',onOpen);}
    append(root,iconSlot(iconNode));
    const copy=element('div','gtc-row-copy');
    if (visible(category)) append(copy,element('span','gtc-row-category',category));
    if (visible(title)) append(copy,element('strong','gtc-row-title',title));
    if (visible(metadata)) append(copy,element('span','gtc-row-meta',metadata));
    if (visible(description)) append(copy,element('span','gtc-row-description',description));
    append(root,copy);
    const trailing=element('span','gtc-row-trailing');
    if (visible(value)) append(trailing,element('strong','gtc-row-value gtc-tone-'+(tone==='win'?'win':tone==='loss'?'loss':'neutral'),value));
    if (visible(valueLabel)) append(trailing,element('span','gtc-row-value-label',valueLabel));
    append(root,trailing);
    return root;
  }
  function durationText(minutes) {
    const n=Number(minutes);
    if (!Number.isFinite(n) || n<0) return '';
    if (n>=60 && n%60===0) return integer(n/60)+' HR';
    return integer(n)+' MIN';
  }
  /**
   * ActivityList v0.1: mixed game/session/camp rows, chronological by date.
   * Adapter supplies already-sanitized data, callbacks and icon nodes.
   */
  function ActivityList({items=[],icons={},onOpen,emptyText='No recent activity.'}={}) {
    const sorted=items.map((item,index)=>({...item,__index:index})).sort((a,b)=>{
      const x=String(a.date||''),y=String(b.date||'');
      return y.localeCompare(x)||a.__index-b.__index;
    });
    return List({items:sorted,emptyText,renderItem:item=>{
      const type=String(item.type||'').toLowerCase();
      const game=type==='game', camp=type==='camp';
      const category=game?'GAME':camp?'CAMP':String(item.category||'TRAINING').toUpperCase();
      let value=item.value, tone=item.tone||'neutral', valueLabel=item.valueLabel;
      if(game) {
        if(!visible(value) && Number.isFinite(Number(item.homeScore)) && Number.isFinite(Number(item.awayScore))) {
          const prefix=item.result==='W'?'W':item.result==='L'?'L':item.result==='T'?'T':'';
          value=detail(prefix,integer(item.homeScore)+'–'+integer(item.awayScore)).replace(' · ',' ');
        }
        tone=item.result==='W'?'win':item.result==='L'?'loss':'neutral';
        valueLabel=valueLabel||'Final score';
      } else {value=value||durationText(item.durationMinutes);valueLabel=valueLabel||'Duration';}
      const metadata=visible(item.metadata)?item.metadata:detail(item.context,safeDate(item.date));
      return rowShell({
        iconNode:item.iconNode||icons[type]||icons.training,category,
        title:item.title||'',metadata,
        description:item.description||'',
        value,valueLabel,tone,
        onOpen:typeof onOpen==='function'?()=>onOpen(item):undefined
      });
    }});
  }
  function GoalsList({items=[],icons={},onOpen}={}) {
    return List({items,renderItem:item=>rowShell({
      iconNode:item.iconNode||icons.goal,category:item.category||'GOAL',
      title:item.title,metadata:detail(item.priority,item.progressLabel),
      description:item.description,value:item.value||'',
      valueLabel:item.valueLabel||'',onOpen:onOpen?()=>onOpen(item):undefined
    }),emptyText:'No goals yet.'});
  }
  function NotesList({items=[],icons={},onOpen}={}) {
    return List({items,renderItem:item=>{
      const root=rowShell({iconNode:item.iconNode||icons.note,
        category:item.noteType||'NOTE',title:item.question||'',
        metadata:detail(item.origin,safeDate(item.date)),
        description:'',onOpen:onOpen?()=>onOpen(item):undefined});
      const copy=root.querySelector('.gtc-row-copy');
      const quote=element('blockquote','gtc-note-quote',item.note||'');
      copy.appendChild(quote);
      return root;
    },emptyText:'No notes yet.'});
  }
  function AchievementList({items=[],icons={},onOpen}={}) {
    return List({items,renderItem:item=>rowShell({
      iconNode:item.iconNode||icons.achievement,category:item.category||'ACHIEVEMENT',
      title:item.title,metadata:detail(item.origin,safeDate(item.date)),
      description:item.description||'',value:item.value||'',valueLabel:item.valueLabel||'',
      onOpen:onOpen?()=>onOpen(item):undefined
    }),emptyText:'No achievements yet.'});
  }
  /** SharedBanner Parent v1 scaffold. Slots are DOM nodes to avoid unsafe HTML. */
  function SharedBanner({title,subtitle,status,actionLabel,onAction,primaryLeft,primaryRight,secondaryLeft,secondaryRight,secondaryLabel='Show Details'}={}) {
    if(!visible(title)) throw new TypeError('SharedBanner requires title');
    const root=element('section','gtc-banner');
    const head=element('div','gtc-banner-head');
    const copy=element('div','gtc-banner-heading');
    append(copy,element('h2','gtc-banner-title',title));
    if(visible(subtitle)) append(copy,element('p','gtc-banner-subtitle',subtitle));
    append(head,copy);
    if(visible(status)) append(head,element('span','gtc-banner-status',status));
    if(typeof onAction==='function') append(head,actionButton(actionLabel||'Open',onAction));
    append(root,head);
    const primary=element('div','gtc-banner-primary');
    append(primary,append(element('div','gtc-banner-column'),primaryLeft||''));
    if(primaryRight) append(primary,append(element('div','gtc-banner-column'),primaryRight));
    append(root,primary);
    if(secondaryLeft||secondaryRight){
      const details=element('details','gtc-banner-details');
      append(details,element('summary','gtc-banner-toggle',secondaryLabel));
      const secondary=element('div','gtc-banner-secondary');
      append(secondary,append(element('div','gtc-banner-column'),secondaryLeft||''));
      if(secondaryRight) append(secondary,append(element('div','gtc-banner-column'),secondaryRight));
      append(details,secondary);append(root,details);
    }
    return root;
  }
  global.GameTraceComponents=Object.freeze({
    version:'0.1.0',Section,List,SharedBanner,ActivityList,GoalsList,NotesList,AchievementList,
    formatDate:safeDate,formatDuration:durationText
  });
})(window);
