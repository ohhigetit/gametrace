/* Home Court connects existing records; routes and persisted record keys stay compatible. */
const courtUI={player:''};
const SECTION_NAMES={Reports:'Scoreboard','Trainings and Camps':'Gym','Next Steps':'Playbook','Trophy Cabinet':'Wall','Family Cloud':'Family Huddle'};
const headingBeforeHomeCourt=pageHeading;
pageHeading=function(title,back){return headingBeforeHomeCourt(SECTION_NAMES[title]||title,back)};
const courtIcon=paths=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths+'</svg>';
Object.assign(MENU_ICON_DATA,{
 court:courtIcon('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 4v16M2 9h4v6H2m20-6h-4v6h4"/><circle cx="12" cy="12" r="3"/>'),
 gym:courtIcon('<path d="M6 9v6m12-6v6M3 7v10m18-10v10M6 12h12M1 12h2m18 0h2"/>'),
 playbook:courtIcon('<path d="M4 3h14a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V3Zm0 14h16M8 3v14m4-10 4 4m0-4-4 4"/>'),
 wall:courtIcon('<rect x="3" y="3" width="7" height="8" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="3" y="15" width="7" height="6" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/>'),
 family:courtIcon('<circle cx="9" cy="7" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3m0-17a3 3 0 0 1 0 6m3 4a6 6 0 0 1 3 5v2"/>')
});
const HOME_SECTIONS=[
 ['Home Court','court','court'],['Games','circle-play','home'],
 ['Scoreboard','chart-no-axes-combined','reports'],['Gym','gym','training'],
 ['Playbook','playbook','goals'],['Wall','wall','trophies'],['Family Huddle','family','family']
];
function recordTrainingFromCourt(){navigate('training');if(ui.screen!=='training')return;trainingUI.player=courtUI.player;trainingForm();const player=[...$('trainingContent').querySelectorAll('label')].find(l=>l.firstChild?.textContent==='Player')?.querySelector('input');if(player){player.setAttribute('aria-label','Player');if(courtUI.player)player.value=courtUI.player}}
renderMenu=function(){
 const root=$('menuContent');root.replaceChildren(el('div',{class:'view-title'},el('h1',{},'Menu')));
 const actions=el('div',{class:'court-quick-actions'});
 actions.append(button('＋ New Game',()=>gameForm(),'primary',{'aria-label':'New Game'}),button('＋ Record Training',recordTrainingFromCourt,'court-secondary',{'aria-label':'Record Training'}));
 root.append(actions);
 const nav=el('nav',{class:'main-navigation','aria-label':'Main navigation'});
 const current=['live','stats','history','setup'].includes(ui.menuReturn)?'home':ui.menuReturn;
 for(const[title,icon,target]of [...HOME_SECTIONS,['Backup & Export','archive','backup'],['Settings','settings-2','settings']]){
  const b=button('',()=>navigate(target),target==='backup'?'court-support-start':'',{'data-navigation':title});
  b.append(menuIcon(icon),el('span',{},title),el('span',{'aria-hidden':'true'},'›'));
  if(current===target)b.setAttribute('aria-current','page');nav.append(b);
 }
 root.append(nav);
};
function courtPlayers(){return [...new Set([
 ...db.games.filter(g=>!g.deletedAt).map(g=>g.player),
 ...db.trainingSessions.filter(s=>!s.deletedAt).map(s=>s.player),
 ...db.goals.filter(g=>!g.deletedAt).map(g=>g.player),...customFamilyAwards().map(a=>a.player)
 ].filter(Boolean))].sort((a,b)=>a.localeCompare(b))}
function courtMatches(player){return !courtUI.player||T.playerKey(player)===T.playerKey(courtUI.player)}
function courtOpen(target){
 const player=courtUI.player;
 if(target==='training'){trainingUI.player=player;trainingUI.week=null}
 if(target==='goals')journeyUI.player=player;
 if(target==='trophies'){trophyUI.player=player;trophyUI.category='all'}
 if(target==='reports')reportsState.player=player;
 if(target==='home')gamesFilters.player=player;
 navigate(target);
}
function courtSection(title,link,target,key){
 const section=el('section',{class:'court-card','data-court-section':key});
 section.append(el('div',{class:'court-section-heading'},el('h2',{},title),button(link+' →',()=>courtOpen(target),'court-link')));
 return section;
}
function courtActivityRow(title,meta,fn,attrs={}){
 const b=button('',fn,'court-activity',attrs);
 b.append(el('span',{},el('strong',{},title),el('small',{},meta)),el('span',{'aria-hidden':'true'},'›'));return b;
}
function renderHomeCourt(){
 const root=$('courtContent'),players=courtPlayers();
 if(courtUI.player&&!players.some(p=>T.playerKey(p)===T.playerKey(courtUI.player)))courtUI.player='';
 root.replaceChildren(el('div',{class:'view-title court-title'},el('p',{class:'training-kicker'},'Follow the Play. The Game. The Journey.'),el('h1',{},'Home Court'),el('p',{class:'view-note'},'Your work. Your growth. Your basketball journey.')));
 if(players.length){const select=el('select',{'aria-label':'Home Court player'});select.append(el('option',{value:''},'All players'));for(const p of players)select.append(el('option',{value:p},p));select.value=courtUI.player;select.addEventListener('change',()=>{courtUI.player=select.value;renderHomeCourt()});root.append(el('label',{class:'court-player'},'Player',select))}
 if(recoveryRaw)root.append(el('div',{class:'notice error-notice'},el('p',{},saveError),button('Download recovery copy',()=>download(recoveryRaw,'GameTrace_recovery.txt','text/plain'))));
 const quick=el('div',{class:'court-quick-actions'},button('＋ New Game',()=>gameForm(),'primary',{'aria-label':'New Game'}),button('＋ Record Training',recordTrainingFromCourt,'court-secondary',{'aria-label':'Record Training'}));root.append(quick);
 const active=liveGame();
 if(active){const selected=courtMatches(active.player),box=courtSection('Current game','Your games','home','current');box.append(el('p',{class:'training-kicker'},active.pendingStart?'Ready · not started':C.paused(active)?'Timeout · playing time paused':'In progress'),el('h3',{},active.player+' · vs '+active.opponent));if(!selected)box.append(el('p',{class:'training-help'},'This active game belongs to another player.'));
 box.append(button(active.pendingStart?'Open game':'Resume tracking',()=>chooseGame(active.id,'live'),'primary',{'data-court-resume':active.id}));root.append(box)}
 else root.append(el('p',{class:'court-idle'},'No active game. Record a completed session or create a game when you’re ready.'));
 const sessions=db.trainingSessions.filter(s=>courtMatches(s.player)),summary=T.summarize(sessions),work=courtSection('Work and progress','Gym','training','work');
 const metric=button('',()=>courtOpen('training'),'court-work-summary');metric.append(trainingPower(summary),el('span',{class:'court-work-numbers'},el('strong',{},trainingHours(summary.totalMinutes)+' hrs'),el('span',{},'Completed training and camps'),el('small',{},summary.sessions.length+' sessions · '+summary.current+'-week streak')));work.append(metric);
 work.append(el('p',{class:'training-help'},!summary.sessions.length?'Every completed session starts building your journey.':summary.next?trainingDuration(Math.max(0,summary.next*60-summary.totalMinutes))+' to the '+summary.next+'-hour ring.':'100 hours and counting. Keep building.'));
 if(!courtUI.player&&players.length>1)work.append(el('p',{class:'training-help'},'Combined hours and streak across all players. Select a player for their own progress.'));
 root.append(work);
 const focus=courtSection('Your focus','Playbook','goals','focus'),focusPlayers=courtUI.player?[courtUI.player]:players;
 const topSteps=focusPlayers.map(p=>T.goalOrder(db.goals,db.goalOrders,p)[0]).filter(Boolean);
 if(!topSteps.length)focus.append(el('p',{class:'training-help'},'Choose a next step in your Playbook to give your work a direction.'),button('Open Playbook',()=>courtOpen('goals'),'court-secondary'));
 for(const g of topSteps.slice(0,3)){
  const last=g.entries.filter(e=>!e.deletedAt).sort((a,b)=>a.date.localeCompare(b.date)||a.createdAt.localeCompare(b.createdAt)).at(-1);
  const row=courtActivityRow(g.title,g.player+' · '+(last?'Self-rated progress '+last.rating+' of 5':'No progress update yet'),()=>{journeyUI.player=g.player;navigate('goals');const card=[...$('goalsContent').querySelectorAll('[data-goal-id]')].find(n=>n.dataset.goalId===g.id);if(card){card.open=true;card.scrollIntoView({block:'center'})}},{'data-court-goal':g.id});
  const points=el('span',{class:'court-progress-points','aria-hidden':'true'});for(let i=1;i<=5;i++)points.append(el('i',{class:last&&i<=last.rating?'filled':''}));row.firstElementChild.append(points);focus.append(row);
 }
 if(topSteps.length>3)focus.append(el('p',{class:'training-help'},'Open Playbook to see every player’s next steps.'));root.append(focus);
 const recent=courtSection('Recent activity','Games','home','recent');
 const activity=[...db.games.filter(g=>!g.deletedAt&&courtMatches(g.player)).map(g=>({id:g.id,date:g.date,updated:g.updatedAt,title:'vs '+g.opponent,meta:g.player+' · '+(g.pendingStart?'Not started':g.status==='completed'?'Game':'Game in progress'),open:()=>chooseGame(g.id,g.status==='completed'?'stats':'live')})),...summary.sessions.map(s=>({id:s.id,date:s.date,updated:s.updatedAt,title:s.name,meta:s.player+' · '+(s.type==='camp'?'Camp':'Training')+' · '+trainingDuration(s.minutes),open:()=>{trainingUI.player=s.player;trainingUI.week=null;navigate('training');[...$('trainingContent').querySelectorAll('[data-session-id]')].find(n=>n.dataset.sessionId===s.id)?.scrollIntoView({block:'center'})}}))].sort((a,b)=>b.date.localeCompare(a.date)||b.updated.localeCompare(a.updated)||a.id.localeCompare(b.id));
 if(!activity.length)recent.append(el('p',{class:'training-help'},'Your games and completed sessions will appear here.'));
 for(const a of activity.slice(0,4))recent.append(courtActivityRow(a.title,a.meta+' · '+friendlyDate(a.date),a.open,{'data-court-activity':a.id}));root.append(recent);
 const wall=courtSection('Worth recognizing','Wall','trophies','wall'),awards=[...T.trophies(db.trainingSessions,db.goals,courtUI.player),...customFamilyAwards(courtUI.player)].sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id)),latest=awards[0];
 if(latest)wall.append(courtActivityRow(latest.name,latest.player+' · '+friendlyDate(latest.date)+' · '+latest.reason,()=>{trophyUI.player=latest.player;trophyUI.category='all';navigate('trophies')},{'data-court-award':latest.id}));
 else wall.append(el('p',{class:'training-help'},'Effort, little breakthroughs and milestones all belong on your Wall. Keep putting in the work.'));
 root.append(wall);
 const explore=el('nav',{class:'court-explore','aria-label':'Explore GameTrace'});
 for(const[title,icon,target]of HOME_SECTIONS.slice(1)){const b=button('',()=>courtOpen(target),'court-explore-link',{'data-court-destination':target});b.append(menuIcon(icon),el('span',{},title),el('span',{'aria-hidden':'true'},'›'));explore.append(b)}root.append(explore);
}
