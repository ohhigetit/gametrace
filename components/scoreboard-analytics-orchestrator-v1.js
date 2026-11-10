/**
 * GameTrace Scoreboard Analytics V1 — selected-game integration controller.
 * On the review branch only. Uses original DOM nodes supplied by the app,
 * preserving bound interactions (no clone, no duplicate circles/timelines).
 * No writes to game records, selection, cloud storage, or routing.
 */
(function(global) {
  'use strict';
  const doc=global.document;
  if(!doc)return;
  function create({root,getGames,renderRecords,renderCircle,renderTimeline,onOpenGame,initialGameId=null}={}) {
    if(!(root instanceof global.Element))throw new TypeError('Scoreboard root required');
    for(const [name,fn] of Object.entries({getGames,renderRecords,renderCircle,renderTimeline}))
      if(typeof fn!=='function')throw new TypeError(name+' callback required');
    let selectedGameId=initialGameId;
    let expanded=false;
    let available=[];
    const eventHandlers=new Set();
    const host=doc.createElement('section');
    host.className='gt-scoreboard-selected';
    host.dataset.component='SelectedGameAnalyticsSectionV1';
    host.dataset.parent='SectionV1';
    const head=doc.createElement('div');head.className='gtc-section-header';
    const title=doc.createElement('h2');title.className='gtc-section-title';title.textContent='Selected Game Analytics';
    const toggle=doc.createElement('button');toggle.type='button';toggle.className='gtc-action';toggle.textContent='Show Analytics';toggle.setAttribute('aria-expanded','false');
    const slot=doc.createElement('div');slot.className='gt-scoreboard-selected-content';slot.hidden=true;
    const context=doc.createElement('p');context.className='gt-scoreboard-selected-context';
    const circles=doc.createElement('div');circles.dataset.slot='game-circle';
    const timeline=doc.createElement('div');timeline.dataset.slot='game-timeline';
    const open=doc.createElement('button');open.type='button';open.className='gtc-action';open.textContent='Open Game Details';
    head.append(title,toggle);slot.append(context,circles,timeline,open);host.append(head,slot);root.append(host);
    function selected(){return available.find(g=>String(g.id)===String(selectedGameId))||null;}
    function update(){
      const g=selected();
      host.hidden=!g;
      if(!g){expanded=false;slot.hidden=true;toggle.setAttribute('aria-expanded','false');return;}
      const date=typeof g.date==='string'?g.date:'';
      context.textContent=[g.team||'',g.opponent?'vs '+g.opponent:'',date].filter(Boolean).join(' · ');
      slot.hidden=!expanded;
      toggle.textContent=expanded?'Hide Analytics':'Show Analytics';
      toggle.setAttribute('aria-expanded',String(expanded));
      if(!expanded)return;
      // Adapters return the ORIGINAL approved DOM nodes. Never clone.
      // Adapter must not mutate activeGameId or persist any selection.
      const c=renderCircle(g),t=renderTimeline(g);
      if(c instanceof global.Node)circles.replaceChildren(c);else circles.replaceChildren();
      if(t instanceof global.Node)timeline.replaceChildren(t);else timeline.replaceChildren();
    }
    function selectGame(id,{expand=true}={}){
      const found=available.find(g=>String(g.id)===String(id));
      if(!found)return false;
      selectedGameId=found.id;expanded=Boolean(expand);update();
      for(const fn of eventHandlers)fn(found);
      return true;
    }
    function refresh(){
      const games=getGames();
      available=Array.isArray(games)?games.filter(g=>g&&g.id!==undefined&&!g.deletedAt&&g.status==='completed'):[];
      if(!selected())selectedGameId=available[0]?.id??null;
      // RenderRecords wires graph point and matrix row to selectGame.
      // It is responsible for reflecting the selected game visually.
      renderRecords({games:available,selectedGameId,onSelectGame:id=>selectGame(id),onOpenGame});
      update();
    }
    toggle.addEventListener('click',()=>{expanded=!expanded;update();});
    open.addEventListener('click',()=>{const g=selected();if(g&&typeof onOpenGame==='function')onOpenGame(g.id);});
    refresh();
    return Object.freeze({
      refresh,selectGame,getSelectedGameId:()=>selectedGameId,
      onSelect(fn){if(typeof fn!=='function')throw new TypeError('Listener required');eventHandlers.add(fn);return()=>eventHandlers.delete(fn);}
    });
  }
  global.GameTraceScoreboardAnalyticsV1=Object.freeze({version:'1.0.0-review',create});
})(window);
