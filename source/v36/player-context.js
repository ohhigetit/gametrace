/* A family-scoped device preference, never a change to a record's owner. */
const playerContext={scope:null,player:''};
const playersBeforeContext=courtPlayers;
courtPlayers=function(){const names=[...playersBeforeContext(),...db.games.map(g=>g.player),...db.trainingSessions.map(s=>s.player),...db.goals.map(g=>g.player)],seen=new Set();return names.filter(p=>{if(!p||seen.has(T.playerKey(p)))return false;seen.add(T.playerKey(p));return true}).sort((a,b)=>a.localeCompare(b))};
function syncPlayerScope(){const scope=localWorkScope();if(playerContext.scope!==scope){playerContext.scope=scope;try{playerContext.player=localStorage.getItem(workKey('player'))||''}catch{playerContext.player=''}}applyPlayerContext()}
function applyPlayerContext(){for(const state of [courtUI,trainingUI,journeyUI,trophyUI,gamesFilters,reportsState])state.player=playerContext.player}
function setPlayerContext(player){const chosen=canonicalPlayer(player);if(chosen!==playerContext.player){reportsState.selected=[];reportsState.compare=false}playerContext.scope=localWorkScope();playerContext.player=chosen;applyPlayerContext();try{localStorage.setItem(workKey('player'),playerContext.player)}catch{announce('Player selection works for this visit but could not be remembered.')}}
function attachPlayerPicker(root){
 if(!root||root.querySelector('form'))return;
 for(const select of root.querySelectorAll('select'))if(['Player','Training player','Home Court player'].includes(select.getAttribute('aria-label'))){const label=select.closest('label');if(label)label.remove();else select.remove()}
 root.querySelector('[data-player-context]')?.remove();
 const select=el('select',{'aria-label':'Selected player'}),players=courtPlayers();if(playerContext.player&&!players.includes(playerContext.player))players.push(playerContext.player);
 select.append(el('option',{value:''},'All players'));for(const p of players)select.append(el('option',{value:p},p));select.value=playerContext.player;select.addEventListener('change',()=>{setPlayerContext(select.value);trainingUI.week=null;render()});
 const picker=el('label',{class:'shared-player-picker','data-player-context':''},'Player',select);root.querySelector('.view-title,.page-heading')?.after(picker);if(!picker.parentNode)root.prepend(picker);
}
for(const [name,rootId]of [['home','homeContent'],['reports','reportsContent'],['menu','menuContent']]){
 const old=name==='home'?renderHome:name==='reports'?renderReports:renderMenu;
 const wrapped=function(){syncPlayerScope();old();attachPlayerPicker($(rootId))};if(name==='home')renderHome=wrapped;else if(name==='reports')renderReports=wrapped;else renderMenu=wrapped;
}
const goalsBeforePlayerContext=renderGoals;
renderGoals=function(){syncPlayerScope();if(playerContext.player){goalsBeforePlayerContext();attachPlayerPicker($('goalsContent'));return}
 // Priority is meaningful within one player. The overview opens each player's own list.
 journeyUI.editing=false;const root=$('goalsContent');root.replaceChildren(pageHeading('Playbook',()=>navigate('menu')),el('p',{class:'training-help'},'Each player has their own priorities and progress. Choose a player to arrange steps or record an update.'),button('+ New step',()=>goalForm(),'journey-primary'));
 for(const player of courtPlayers()){const steps=db.goals.filter(g=>!g.deletedAt&&T.playerKey(g.player)===T.playerKey(player)),active=steps.filter(g=>g.status==='active'),done=steps.filter(g=>g.status==='achieved');root.append(el('section',{class:'court-card'},el('h2',{},player),el('p',{},active.length+' active · '+done.length+' achieved'),button('Open '+player+'’s Playbook',()=>{setPlayerContext(player);renderGoals()},'journey-button')))}if(!courtPlayers().length)root.append(el('p',{},'Start with your first player and next step.'));attachPlayerPicker(root);
};
const wallBeforePlayerContext=renderTrophies;
renderTrophies=function(){syncPlayerScope();wallBeforePlayerContext();attachPlayerPicker($('trophiesContent'))};
const courtBeforePlayerContext=renderHomeCourt;
renderHomeCourt=function(){syncPlayerScope();courtBeforePlayerContext();attachPlayerPicker($('courtContent'));appendWeeklyReview($('courtContent'))};
const gymBeforePlayerContext=renderTraining;
renderTraining=function(){if(sessionUI.editor&&trainingUI.editing)return;syncPlayerScope();gymBeforePlayerContext();attachPlayerPicker($('trainingContent'))};
const navigateBeforePlayerContext=navigate;
navigate=function(screen){
 // Existing activity drilldowns explicitly choose the source's player.
 const target={court:courtUI,training:trainingUI,goals:journeyUI,trophies:trophyUI,home:gamesFilters,reports:reportsState}[screen],chosen=target?.player;
 if(playerContext.scope===localWorkScope()&&chosen!==undefined&&chosen!==playerContext.player)setPlayerContext(chosen);
 syncPlayerScope();navigateBeforePlayerContext(screen);
};
recordTrainingFromCourt=function(){navigate('training');if(ui.screen==='training')trainingForm()};
const gameFormBeforePlayerContext=gameForm;
gameForm=function(id=null,periodOnly=false){gameFormBeforePlayerContext(id,periodOnly);if(id||periodOnly)return;const field=[...document.querySelectorAll('#gameForm input')].find(n=>n.closest('label')?.textContent.startsWith('Player name'));if(field){if(!field.value&&playerContext.player){field.value=playerContext.player;field.dispatchEvent(new Event('input',{bubbles:true}))}playerSuggestions(field);field.addEventListener('change',()=>field.value=canonicalPlayer(field.value))}};
const goalFormBeforePlayerContext=goalForm;
goalForm=function(id=null){goalFormBeforePlayerContext(id);const field=[...$('goalsContent').querySelectorAll('input')].find(n=>n.closest('label')?.textContent.startsWith('Player'));if(field&&!id){field.value=playerContext.player;playerSuggestions(field);field.addEventListener('change',()=>field.value=canonicalPlayer(field.value))}};
const journeyCommitBeforePlayerContext=journeyCommit;
journeyCommit=function(change){const before=new Map(db.goals.map(g=>[g.id,fingerprint(g)]));journeyCommitBeforePlayerContext(change);if(journeyUI.editing&&ui.screen==='goals'){const changed=db.goals.find(g=>!g.deletedAt&&before.get(g.id)!==fingerprint(g));if(changed)setPlayerContext(changed.player)}};
