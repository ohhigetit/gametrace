// @replace startGame
function startGame(g,at=now()){if(g.status==='completed'||g.events.some(e=>e.code==='game_start'))fail('This game has already started.');g.pendingStart=false;g.scoreTracking=g.scoreTracking===true;g.timingVersion=1;appendEvent(g,'game_start',{at});appendEvent(g,'period_start',{at});return g}
// @replace endPeriod
function endPeriod(g,key=g.settings.format+':'+g.settings.current,at=now()){if(g.pendingStart)fail('Start the game first.');if(g.events.some(e=>e.code==='period_end'&&periodKey(e.period)===key))fail('This period has already ended.');const start=g.events.find(e=>e.code==='period_start'&&periodKey(e.period)===key);if(start&&Date.parse(at)<Date.parse(occurred(start)))fail('Period End must follow Period Start.');if(paused(g))endTimeout(g,at);return appendEvent(g,'period_end',{period:key,at})}
// @replace elapsed
function elapsed(g,at=now()){
 if(g.pendingStart)return{known:true,courtSeconds:0,periodSeconds:0,share:0,visualShare:0,problems:[]};
 const gs=g.events.find(e=>e.code==='game_start'),ge=g.events.find(e=>e.code==='game_end');let known=!!gs&&!g.autoEnded&&(g.status!=='completed'||!!ge),court=0,total=0,segments=0;const problems=[];
 if(!gs)problems.push('Game Start missing');if(g.autoEnded)problems.push('Automatically ended; verify timing');if(g.status==='completed'&&!ge)problems.push('Game End missing');
 const low=gs?Date.parse(occurred(gs)):-Infinity,high=ge?Date.parse(occurred(ge)):Date.parse(at),events=ordered(g);
 for(const p of periodOptions(g)){
  const start=events.find(e=>e.code==='period_start'&&periodKey(e.period)===p.key),end=events.find(e=>e.code==='period_end'&&periodKey(e.period)===p.key);
  if(!start){if(events.some(e=>!e.code.startsWith('game_')&&periodKey(e.period)===p.key)){known=false;problems.push(p.label+' Start missing')}continue}
  let b=end?Date.parse(occurred(end)):g.status==='in_progress'&&p.key===g.settings.format+':'+g.settings.current?Date.parse(at):null;
  if(b===null){known=false;problems.push(p.label+' End missing');continue}const a=Math.max(low,Date.parse(occurred(start)));b=Math.min(b,high);if(b<a){known=false;problems.push(p.label+' timing invalid');continue}segments++;
  let on=rawOnCourt(g,a-1),pause=false,last=a;
  for(const e of events){const t=Date.parse(occurred(e));if(t<a||t>b)continue;if(periodKey(e.period)!==p.key)continue;if(!pause){total+=(t-last)/1000;if(on)court+=(t-last)/1000}last=t;if(e.code==='in')on=true;if(e.code==='out')on=false;if(e.code==='timeout_start')pause=true;if(e.code==='timeout_end')pause=false}
  if(!pause){total+=(b-last)/1000;if(on)court+=(b-last)/1000}
 }
 if(!segments)known=false;const share=known?(total?Math.min(1,Math.max(0,court/total)):0):null;return{known,courtSeconds:known?court:null,periodSeconds:known?total:null,share,visualShare:known?share:.5,problems:[...new Set(problems)]};
}
// @helpers
function prepareGame(meta,settings=defaults()){const g=newGame(meta,settings);g.pendingStart=true;g.scoreTracking=true;return g}
function scoreAt(g,until=null){let team=0,opponent=0;for(const e of ordered(g)){if(e.code==='score_set'){team=e.scoreTeam;opponent=e.scoreOpponent}else{team+=({'2_make':2,'3_make':3,ft_make:1,team_1:1,team_2:2,team_3:3})[e.code]||0;opponent+=({opponent_1:1,opponent_2:2,opponent_3:3})[e.code]||0}if(e.id===until)break}return{team,opponent}}
function paused(g){const key=g.settings.format+':'+g.settings.current;let active=false;for(const e of ordered(g).filter(e=>periodKey(e.period)===key)){if(e.code==='timeout_start')active=true;if(['timeout_end','period_end','game_end'].includes(e.code))active=false}return active}
function startTimeout(g,at=now()){if(g.pendingStart||g.status==='completed'||!periodActive(g)||paused(g))fail('Timeout requires an active game period.');const e=appendEvent(g,'timeout_start',{at});e.timeoutId=e.id;return e}
function endTimeout(g,at=now()){if(!paused(g))fail('No timeout is active.');const start=ordered(g).filter(e=>e.code==='timeout_start').at(-1);if(Date.parse(at)<Date.parse(occurred(start)))fail('Resume must follow Timeout.');return appendEvent(g,'timeout_end',{at,timeoutId:start.timeoutId||start.id})}
function validateGameFlow(g){let pause=null;for(const e of ordered(g)){if(e.code==='timeout_start'){if(pause)fail('Timeouts cannot overlap.');pause=e}else if(e.code==='timeout_end'){if(!pause||pause.timeoutId!==e.timeoutId||periodKey(pause.period)!==periodKey(e.period))fail('Keep both timeout boundaries together.');pause=null}else if(pause&&!['game_end'].includes(e.code))fail('Resume the game before recording plays or ending a period.')}if(pause&&g.status==='completed')fail('End the timeout before completing the game.');const score=scoreAt(g);if(score.team>9999||score.opponent>9999)fail('Score cannot exceed 9999.');return true}
function reconcileGame(g){validateGameFlow(g);if(g.scoreTracking)g.finalScore=scoreAt(g);return g}
