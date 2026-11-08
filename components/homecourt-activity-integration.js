/* GameTrace Home Court — approved ActivityList component integration.
 * Source-only additive module. Uses existing real db records, approved Phosphor
 * icon family, and existing routing; leaves other Home Court sections untouched.
 */
(function () {
'use strict';
const previous = renderHomeCourt;
const officialPhosphor = {
  game:'M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM60,72.17A87.2,87.2,0,0,1,79.63,120H40.37A87.54,87.54,0,0,1,60,72.17ZM136,120V40.37a87.59,87.59,0,0,1,48.68,20.37A103.06,103.06,0,0,0,160.3,120Zm-16,0H95.7A103.06,103.06,0,0,0,71.32,60.74,87.59,87.59,0,0,1,120,40.37ZM79.63,136A87.2,87.2,0,0,1,60,183.83,87.54,87.54,0,0,1,40.37,136Zm16.07,0H120v79.63a87.59,87.59,0,0,1-48.68-20.37A103.09,103.09,0,0,0,95.7,136Zm40.3,0h24.3a103.09,103.09,0,0,0,24.38,59.26A87.59,87.59,0,0,1,136,215.63Zm40.37,0h39.26A87.54,87.54,0,0,1,196,183.83,87.2,87.2,0,0,1,176.37,136Zm0-16A87.2,87.2,0,0,1,196,72.17,87.54,87.54,0,0,1,215.63,120Z',
  training:'M221.87,83.16A104.1,104.1,0,1,1,195.67,49l22.67-22.68a8,8,0,0,1,11.32,11.32l-96,96a8,8,0,0,1-11.32-11.32l27.72-27.72a40,40,0,1,0,17.87,31.09,8,8,0,1,1,16-.9,56,56,0,1,1-22.38-41.65L184.3,60.39a87.88,87.88,0,1,0,23.13,29.67,8,8,0,0,1,14.44-6.9Z',
  performance:'M248,120h-8V88a16,16,0,0,0-16-16H208V64a16,16,0,0,0-16-16H168a16,16,0,0,0-16,16v56H104V64A16,16,0,0,0,88,48H64A16,16,0,0,0,48,64v8H32A16,16,0,0,0,16,88v32H8a8,8,0,0,0,0,16h8v32a16,16,0,0,0,16,16H48v8a16,16,0,0,0,16,16H88a16,16,0,0,0,16-16V136h48v56a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16v-8h16a16,16,0,0,0,16-16V136h8a8,8,0,0,0,0-16ZM32,168V88H48v80Zm56,24H64V64H88V192Zm104,0H168V64h24V175.82c0,.06,0,.12,0,.18s0,.12,0,.18V192Zm32-24H208V88h16Z',
  camp:'M255.31,188.75l-64-144A8,8,0,0,0,184,40H72a8,8,0,0,0-7.27,4.69.21.21,0,0,0,0,.06l0,.12,0,0L.69,188.75A8,8,0,0,0,8,200H248a8,8,0,0,0,7.31-11.25ZM64,184H20.31L64,85.7Zm16,0V85.7L123.69,184Zm61.2,0L84.31,56H178.8l56.89,128Z'
};
function icon(kind) {
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 256 256');
  svg.setAttribute('fill','currentColor');
  svg.setAttribute('data-icon-family','Phosphor');
  svg.setAttribute('data-icon-weight','regular');
  const path=document.createElementNS(svg.namespaceURI,'path');
  path.setAttribute('d',officialPhosphor[kind]||officialPhosphor.training);
  svg.appendChild(path);
  return svg;
}
function cleanDate(value) {
  if(!value)return '';
  const str=String(value).slice(0,10);
  return /^\d{4}-\d\d-\d\d$/.test(str)?str:'';
}
function toGame(g) {
  const score=g.finalScore;
  const a=score?Number(score.team):NaN,b=score?Number(score.opponent):NaN;
  const valid=Number.isFinite(a)&&Number.isFinite(b);
  const result=!valid?'':a>b?'W':a<b?'L':'T';
  const totals=C.totals(C.filtered(g));
  const season=g.type||g.gameType||'Game';
  return {
    id:g.id,type:'game',date:cleanDate(g.date),
    category:'GAME',title:(g.team||'Your Team')+' vs '+(g.opponent||'Opponent'),
    context:season,description:[Math.round(Number(totals.pts)||0)+' PTS',Math.round(Number(totals.reb)||0)+' REB',Math.round(Number(totals.ast)||0)+' AST'].join(' · '),
    value:valid?result+' '+Math.round(a)+'–'+Math.round(b):'',result,
    valueLabel:valid?'Final score':'',iconNode:icon('game'),
    open:()=>chooseGame(g.id,'stats')
  };
}
function toSession(s) {
  const camp=s.type==='camp';
  const performance=!camp&&/performance|strength|conditioning|agility/i.test([s.name,s.type].join(' '));
  const minutes=Number(s.minutes),hasDuration=s.minutes!==null&&s.minutes!==undefined&&s.minutes!==''&&Number.isFinite(minutes)&&minutes>=0;
  const skills=Array.isArray(s.skills)?s.skills.join(' · '):typeof s.skills==='string'?s.skills:typeof s.skillsWorkedOn==='string'?s.skillsWorkedOn:'';
  return {
    id:s.id,type:camp?'camp':'training',category:camp?'CAMP':performance?'PERFORMANCE TRAINING':'SKILLS TRAINING',
    date:cleanDate(s.date),title:s.name||(camp?'Basketball Camp':'Training Session'),
    context:s.coach||s.trainer||s.location||'',description:skills,
    durationMinutes:hasDuration?minutes:null,
    value:hasDuration?trainingDuration(minutes):'',
    valueLabel:hasDuration?'Duration':'',iconNode:icon(camp?'camp':performance?'performance':'training'),
    open:()=>openSession(s.id,'court')
  };
}
function integrate() {
  if(ui.screen!=='court')return;
  const root=document.getElementById('courtContent');
  const Component=window.GameTraceComponents;
  if(!root||!Component||root.querySelector('[data-gtc-home-activity]'))return;
  const gamesOld=root.querySelector('[data-court-section="games"]');
  const sessionsOld=root.querySelector('[data-court-section="recent"],[data-court-section="training"]');
  if(!gamesOld||!sessionsOld)return;
  const player=courtUI.player;
  const samePlayer=r=>!player||T.playerKey(r.player)===T.playerKey(player);
  const games=(db.games||[]).filter(g=>!g.deletedAt&&g.status==='completed'&&samePlayer(g)).map(toGame);
  const sessions=(db.trainingSessions||[]).filter(s=>!s.deletedAt&&samePlayer(s));
  const listed=[...T.summarize(sessions).sessions].map(toSession);
  const items=[...games,...listed].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  const list=Component.ActivityList({items,onOpen:item=>item.open(),emptyText:'No recent activity yet.'});
  const section=Component.Section({title:'Recent Activity',subtitle:'The work behind your journey.',content:list,kind:'gtc-home-activity'});
  section.dataset.gtcHomeActivity='true';
  // Preserve both existing destinations because no unified full-activity screen
  // exists yet. Never send a user to a misleading or dead View All route.
  const actions=document.createElement('div');
  actions.className='gtc-original-actions';
  const allGames=document.createElement('button');allGames.type='button';allGames.textContent='All Games';allGames.addEventListener('click',()=>courtOpen('home'));
  const gym=document.createElement('button');gym.type='button';gym.textContent='Gym';gym.addEventListener('click',()=>courtOpen('training'));
  actions.append(allGames,gym);
  section.querySelector('.gtc-section-header').append(actions);
  gamesOld.before(section);
  gamesOld.remove();sessionsOld.remove();
}
renderHomeCourt=function(...args) {
  const result=previous.apply(this,args);
  try {integrate();}
  catch(error){console.warn('Home Court ActivityList integration was skipped:',error);}
  return result;
};
})();
