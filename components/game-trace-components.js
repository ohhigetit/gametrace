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
  function ActivityList({items=[],existingRows=null,icons={},onOpen,emptyText='No recent activity.'}={}) {
    // Preserve existing app row nodes and their listeners when integrating an approved legacy list.
    // No data parsing, cloning or callback recreation is needed.
    if (Array.isArray(existingRows)) return List({items:existingRows,emptyText,renderItem:row=>row});
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
  /** Approved AchievementList V1 icon — B Championship, outline only.
   * Matches ActivityList neutral ink; no fill, background, or icon box.
   * Source of truth: approved/AchievementList_V1_Championship_Outline_APPROVED.html
   */
  function championshipTrophyIcon() {
    const svg=doc.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 256 256');
    svg.setAttribute('fill','none');
    svg.setAttribute('stroke','currentColor');
    svg.setAttribute('stroke-width','12');
    svg.setAttribute('stroke-linecap','round');
    svg.setAttribute('stroke-linejoin','round');
    svg.setAttribute('aria-hidden','true');
    svg.classList.add('gtc-achievement-trophy');
    const d=["M73 34h110v75c0 38-24 65-55 65s-55-27-55-65V34Z","M73 57H39v35c0 31 18 51 46 51M183 57h34v35c0 31-18 51-46 51","M128 174v32M94 221h68M106 206h44","m128 70 7 15 17 2-12 12 3 17-15-8-15 8 3-17-12-12 17-2Z"];
    d.forEach(value=>{
      const path=doc.createElementNS(svg.namespaceURI,'path');
      path.setAttribute('d',value);
      path.setAttribute('fill','none');
      svg.appendChild(path);
    });
    return svg;
  }
  function AchievementList({items=[],icons={},onOpen}={}) {
    return List({items,renderItem:item=>rowShell({
      iconNode:item.iconNode||icons.achievement||championshipTrophyIcon(),category:item.category||'ACHIEVEMENT',
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

  /**
   * SharedBanner V2 parent (Games presentation).
   * Ownership: presentation DOM only. No storage, global game state, or analytics.
   * It preserves the existing approved gtgames-* DOM/CSS contract.
   */
  function SharedBannerV2({gameId,primary,details}={}) {
    if (!(primary instanceof global.Node)) throw new TypeError('SharedBannerV2 requires a primary row');
    const root=element('article','gtgames-banner');
    root.dataset.component='GameBannerV2';
    root.dataset.parent='SharedBannerV2';
    if (gameId !== undefined && gameId !== null) root.dataset.gameId=String(gameId);
    append(root,primary);
    if (details) append(root,details);
    return root;
  }
  /** GameBanner V2: approved read-only, reusable game summary presentation. */
  function GameBannerV2({gameId,team,opponent,score,contextDate,gameType,
                         badgeText,tone='',period=null,stats={},details={},note=''}={}) {
    const row=element('div','gtgames-compact-primary');
    row.dataset.component='BannerRowV1';
    const left=element('div','gtgames-compact-cell gtcompact-game-summary');
    left.dataset.component='BannerCellV1';
    append(left,element('span','gtgames-label','GAME SUMMARY'));
    const match=element('div','gtcompact-match');
    append(match,element('span','gtcompact-team',team||'Your Team'),
      element('span','gtcompact-vs','vs'),element('span','gtcompact-team',opponent||'Opponent'));
    append(left,match,element('div','gtcompact-score',score[0]+' – '+score[1]));
    const meta=element('div','gtcompact-meta');
    append(meta,element('span','',contextDate+(gameType?' · '+gameType:'')),
      element('span','gtgames-badge '+tone,badgeText));
    if (period !== null) append(meta,element('span','',period));
    append(left,meta);
    const right=element('div','gtgames-compact-cell gtcompact-quick-stats');
    right.dataset.component='BannerCellV1';
    append(right,element('span','gtgames-label gtcompact-stats-caption','TOP STATS'));
    const quick=element('div','gtcompact-stats-grid');
    [['PTS','pts'],['REB','reb'],['AST','ast'],['STL','stl']].forEach(([label,key])=>{
      const stat=element('div','gtcompact-stat');
      append(stat,element('span','gtcompact-stat-label',label),
        element('strong','gtcompact-stat-number',integer(stats[key])));
      append(quick,stat);
    });
    append(right,quick);
    append(row,left,right);
    const extra=element('details','gtgames-details');
    const toggle=element('summary','','Show Details');
    extra.addEventListener('toggle',()=>{toggle.firstChild.textContent=extra.open?'Hide Details':'Show Details'});
    append(extra,toggle);
    const secondary=element('div','gtgames-secondary');
    const info=element('div','gtgames-detail-cell');
    const secondaryStats=element('div','gtgames-detail-cell');
    info.dataset.component=secondaryStats.dataset.component='BannerCellV1';
    append(info,element('strong','gtgames-label','MORE GAME DETAILS'));
    append(secondaryStats,element('strong','gtgames-label','MORE PLAYER STATS'));
    const field=(target,label,value)=>{
      if(value===undefined||value===null||value==='')return;
      const line=element('div','gtgames-detail');
      append(line,element('span','',label),element('b','',String(value)));
      append(target,line);
    };
    field(info,'Date',details.date);
    field(info,'League',details.league);
    field(info,'Game type',details.gameType);
    field(info,'Player',details.player);
    for(const [label,key] of [['FT','ft'],['Fouls','foul'],['Turnovers','tov']]){
      const val=details[key];
      if(val!==undefined&&val!==null&&Number.isFinite(Number(val)))
        field(secondaryStats,label,Math.round(Number(val)));
    }
    append(secondary,info,secondaryStats,element('div','gtgames-note',note));
    append(extra,secondary);
    return SharedBannerV2({gameId,primary:row,details:extra});
  }
  /**
   * GameBannerSection V1: reuse the approved Section V1 constructor but
   * retain its existing Games/Game Details header and spacing markup exactly.
   */
  function GameBannerSectionV1({title='Latest Game',banner,emptyText='No games recorded yet.',
                                actionLabel='View Game →',onAction}={}) {
    const content=banner||element('div','gtgames-no-game',emptyText);
    const section=Section({title,content,kind:'gtgames-featured'});
    const heading=element('div','gtgames-featured-heading');
    append(heading,element('h2','',title));
    if(typeof onAction==='function'){
      const button=element('button','gtgames-open gtgames-header-action',actionLabel);
      button.type='button';
      button.addEventListener('click',onAction);
      append(heading,button);
    }
    section.querySelector('.gtc-section-header').replaceWith(heading);
    section.querySelector('.gtc-section-content').replaceWith(content);
    section.className='gtgames-featured';
    section.dataset.component='SectionV1';
    section.dataset.parent='SectionV1';
    section.dataset.implementation='GameBannerSectionV1';
    return section;
  }

  global.GameTraceComponents=Object.freeze({
    version:'0.2.0',Section,List,SharedBanner,SharedBannerV2,GameBannerV2,GameBannerSectionV1,ActivityList,GoalsList,NotesList,AchievementList,
    formatDate:safeDate,formatDuration:durationText
  });
})(window);
