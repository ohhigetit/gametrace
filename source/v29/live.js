/* Compact Live Game: existing transactions, timing and camera retained. */
const renderLiveBeforeCompact=renderLive;
renderLive=function(g){
 const secondaryTools=$('liveView').querySelector('.live-game-tools');if(secondaryTools)$('liveView').querySelector('.live-info').append(secondaryTools);
 renderLiveBeforeCompact(g);const info=$('liveView').querySelector('.live-info'),stage=$('liveView').querySelector('.controller-stage');$('journeyLive').hidden=true;info.querySelector('.score').hidden=true;
 let scoreboard=$('liveScoreboard');if(!scoreboard){scoreboard=el('section',{id:'liveScoreboard',class:'live-compact-scoreboard','aria-label':'Tap a score to update'});info.querySelector('.player').after(scoreboard)}scoreboard.replaceChildren();$('liveSecondary').append(info.querySelector('.live-game-tools')||$('liveSecondary').querySelector('.live-game-tools'));
 const score=g.scoreTracking?C.scoreAt(g):g.finalScore,isReady=g.pendingStart,paused=C.paused(g),complete=g.status==='completed';
 for(const side of ['team','opponent']){const b=button('',()=>openQuickScore(side),'live-compact-score-tile',{'aria-label':side==='team'?'Update '+(g.team||'Team')+' score':'Update '+g.opponent+' score'});b.disabled=blockedLive(g);b.append(el('span',{class:'live-compact-side'},side==='team'?(g.team||'Team'):g.opponent),el('strong',{},score?score[side]:'—'),el('small',{},isReady?'Starts with game':'Tap to add points'));scoreboard.append(b)}
 const help=el('div',{class:'live-compact-score-help'},el('span',{},g.player+'’s baskets count automatically.'),button('Correct score',()=>openScoreCorrection(g),'live-compact-text-button'));scoreboard.append(help);
 let rail=$('liveGameRail');if(!rail){rail=el('aside',{id:'liveGameRail',class:'live-compact-game-rail','aria-label':'Game controls'});stage.prepend(rail)}rail.replaceChildren();
 help.querySelector('button').disabled=isReady||complete;
 const period=g.settings.current,label=C.label(g.settings.format,period),count=C.count(g.settings.format),active=C.periodActive(g),last=period===count-1;
 const progress=el('div',{class:'live-compact-progress'},el('span',{class:'live-compact-rail-caption'},'GAME PROGRESS'),el('strong',{},isReady?'Not started':complete?'Final':label));const pips=el('span',{class:'live-compact-period-pips','aria-label':isReady?'Not started':label+' of '+count});for(let i=0;i<count;i++)pips.append(el('i',{class:!isReady&&i<=period?'filled':''}));progress.append(pips,el('small',{},isReady?'Tap start below':complete?'Game finished':paused?'Timeout':active?'In progress':'Period break'));rail.append(progress);
 if(isReady){const start=liveRailButton('play','Start','Game',manuallyStart,true);start.dataset.startGame='';rail.append(start);}else if(!complete){rail.append(liveRailButton(paused?'play':'pause',paused?'Resume':'Time',paused?'Game':'out',toggleTimeout,paused));rail.lastElementChild.disabled=!active;const title=active||last?'End':'Start',sub=active?(last?'Game':label):(last?'Game':C.label(g.settings.format,period+1)),action=()=>{if(active&&last){endGame(g.id);return}if(active){choices('End '+label+'?',[['End '+label,()=>periodAction('end'),true],['Cancel',closeDialog,false]])}else if(last)endGame(g.id);else periodAction('next')};const advance=liveRailButton(active&&last?'flag':'next',title,sub,action);advance.disabled=paused;rail.append(advance)}

 $('courtStatus').textContent=isReady?'READY · START WHEN PLAY BEGINS':paused?'TIMEOUT · PLAYING TIME PAUSED':complete?'GAME COMPLETED':!C.periodActive(g)?'PERIOD BREAK · START THE NEXT PERIOD':C.onCourt(g)?'ON COURT':'ON BENCH · TAP CENTER TO ENTER';
 let status=$('liveGameStatus');if(!status){status=el('div',{id:'liveGameStatus',class:'live-compact-live-status',role:'status'});$('courtStatus').parentElement.prepend(status)}status.textContent=isReady?'NOT STARTED':paused?'TIMEOUT':complete?'COMPLETED':active?'LIVE · '+label:'BREAK · '+label+' COMPLETE';status.dataset.paused=paused;
};
function liveRailButton(icon,a,b,action,primary=false){const icons={pause:'<path d="M8 5v14M16 5v14"/>',play:'<path d="m9 5 10 7-10 7Z"/>',next:'<path d="m8 5 8 7-8 7M19 5v14"/>',flag:'<path d="M5 21V3m0 1c5-4 9 4 14 0v10c-5 4-9-4-14 0"/>'};const btn=button('',action,'live-compact-rail-button'+(primary?' is-primary':''));btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[icon]+'</svg>';btn.append(el('span',{},a),el('strong',{},b));btn.setAttribute('aria-label',a==='Time'?'Timeout':a+' '+b);return btn}

function openQuickScore(side){
 const g=game();if(blockedLive(g))return announce(g?.pendingStart?'Start the game first.':'Resume play before adding points.');
 const name=side==='team'?(g.team||'Team'):g.opponent;
 openDialog('Add points · '+name,box=>{
  box.classList.add('live-compact-score-sheet');box.append(el('p',{class:'live-compact-sheet-help'},side==='team'?'Other players’ points only. '+g.player+'’s baskets are already counted.':'Choose the basket value.'));
  const grid=el('div',{class:'live-compact-score-choices'});
  for(const n of [1,2,3])grid.append(button('+'+n,()=>{try{const current=game();if(!current||current.id!==g.id||blockedLive(current))throw Error('Game changed. Reopen scoring when play resumes.');transaction(g.id,target=>{target.scoreTracking=true;if(!g.scoreTracking&&g.finalScore)C.appendEvent(target,'score_set',{scoreTeam:g.finalScore.team,scoreOpponent:g.finalScore.opponent});C.appendEvent(target,side+'_'+n)});closeDialog();render();announce(name+' +'+n);sound();nudge()}catch(e){announce(e.message)}},'live-compact-point-button',{'aria-label':(side==='team'?'Team':'Opponent')+' plus '+n}));
  box.append(grid,button('Cancel',closeDialog,'cancel-choice'));
 });
}
