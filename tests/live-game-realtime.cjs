const fs=require('fs'),assert=require('node:assert/strict');const {JSDOM,VirtualConsole}=require((process.env.GAMETRACE_TEST_MODULES||'/tmp/gt-check/node_modules')+'/jsdom');const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!/HTMLCanvasElement|HTMLMediaElement|navigation|window.scrollTo/.test(e.message))errors.push(e.message)});const html=fs.readFileSync('index.html','utf8').replace('\nload();\nwindow.GameTraceFamily.boot();','\nwindow.__qa={run:code=>eval(code)};\nload();\nwindow.GameTraceFamily.boot();');const dom=new JSDOM(html,{url:'https://test.example/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({measureText:()=>({width:10}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});w.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});w.ResizeObserver=class{observe(){}disconnect(){}};w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLElement.prototype.setPointerCapture=()=>{};w.HTMLElement.prototype.hasPointerCapture=()=>false;w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};w.confirm=()=>true;w.fetch=async()=>{throw Error('Unexpected network request')};w.CSS={escape:s=>s};}}),w=dom.window,d=w.document,run=c=>w.__qa.run(c),wait=()=>new Promise(r=>setTimeout(r,30));let n=0;const visible=n=>!n.closest('[hidden]')&&!n.closest('dialog:not([open])');async function click(text){const el=[...(d.querySelector('dialog[open]')||d).querySelectorAll('button')].find(n=>(n.textContent.trim()===text||n.getAttribute('aria-label')===text||n.dataset.navigation===text)&&visible(n));assert(el,'Missing button '+text);el.click();await wait()}async function test(name,fn){await fn();n++;console.log('PASS',name)}
(async()=>{await wait();assert(w.__qa,errors.join('\n'));await click('Skip');run(`celebrateTrophies=()=>{};const now=C.now();db=C.blankDB();const g=C.prepareGame({player:'Georgina',team:'Panthers',opponent:'Comets',date:localDate()});C.startGame(g,new Date(Date.now()-600000).toISOString());C.appendEvent(g,'in',{at:new Date(Date.now()-590000).toISOString()});C.appendEvent(g,'2_make',{at:new Date(Date.now()-580000).toISOString()});C.appendEvent(g,'opponent_2',{at:new Date(Date.now()-570000).toISOString()});C.appendEvent(g,'reb_d',{at:new Date(Date.now()-560000).toISOString()});db.games=[g];db.activeGameId=g.id;persist();setPlayerContext('Georgina');navigate('court');`);
await test('Feed requires family authentication and reads remote records without local mutation',async()=>{run(`navigate('liveFeed')`);assert(d.querySelector('#liveFeedContent').textContent.includes('Sign in'));const before=run('JSON.stringify(db)'),cloud=JSON.parse(run('JSON.stringify(game())'));w.__cloud=cloud;run(`familyAuth={access_token:'test-only',refresh_token:'test-only',expires_at:Date.now()+3600000,user:{id:'viewer'}};familyState.familyId='test-family';familyAccess=true;resetFeed42();navigate('liveFeed')`);const requests=[];w.fetch=async(url,options={})=>{requests.push({url,method:options.method});return{ok:true,text:async()=>JSON.stringify([{record_id:cloud.id,payload:cloud,version:1,updated_at:cloud.updatedAt}])}};await run('refreshLiveFeed42()');assert(d.querySelector('.v42-feed-score').textContent.includes('2'));assert(d.querySelector('[data-feed-event]'));assert.equal(run('JSON.stringify(db)'),before);assert(requests.every(r=>r.method==='GET'));assert(requests[0].url.includes('family_id=eq.test-family&kind=eq.game'));assert(!d.querySelector('#liveFeedContent [data-edit-record]'));assert(!d.querySelector('#liveFeedContent [data-drag-id]'))});
await test('Feed polls corrections, retains last read on network failure, clears revoked access',async()=>{const before=run('JSON.stringify(db)'),cloud=JSON.parse(run('JSON.stringify(game())'));cloud.events.find(e=>e.code==='2_make').code='3_make';w.fetch=async()=>({ok:true,text:async()=>JSON.stringify([{payload:cloud,version:2}])});await run('refreshLiveFeed42()');assert.equal(d.querySelector('.v42-feed-stats strong').textContent,'3');w.fetch=async()=>{throw Error('Network failed')};await run('refreshLiveFeed42()');assert(d.querySelector('[data-feed-connection]').textContent.includes('last received'));assert(d.querySelector('[data-feed-event]'));w.fetch=async()=>({ok:false,status:403,text:async()=>JSON.stringify({message:'permission denied'})});await run('refreshLiveFeed42()');assert.equal(d.querySelectorAll('[data-feed-event]').length,0);assert(d.querySelector('#liveFeedContent').textContent.includes('Family access'));assert.equal(run('JSON.stringify(db)'),before);run(`familyAuth=null;familyAccess=false;familyState.familyId=null;resetFeed42()`)});

await test('Feed follows a newly synced live game after initially showing a final',async()=>{
 const live=JSON.parse(run('JSON.stringify(game())'));
 const final={...live,id:'completed-game',status:'completed',finalScore:{team:2,opponent:2}};
 let rows=[{payload:final}];
 run(`familyAuth={access_token:'test-only',expires_at:Date.now()+3600000,user:{id:'viewer'}};
 familyState.familyId='test-family';familyAccess=true;resetFeed42();navigate('liveFeed')`);
 w.fetch=async()=>({ok:true,text:async()=>JSON.stringify(rows)});
 await run('refreshLiveFeed42()');
 assert.equal(d.querySelector('.v42-feed-status strong').textContent,'Final');
 rows.push({payload:live});
 await run('refreshLiveFeed42()');
 const select=d.querySelector('[aria-label="Game to follow"]');
 assert.equal(select.value,live.id);
 assert.equal(d.querySelector('.v42-feed-status strong').textContent,'Live');
 select.value=final.id;
 select.dispatchEvent(new w.Event('change'));
 await run('refreshLiveFeed42()');
 assert.equal(d.querySelector('[aria-label="Game to follow"]').value,final.id);
});

await test('Realtime notifications refresh both scores and plays without viewer writes or duplicate events',async()=>{
 const sockets=[],requests=[];
 w.WebSocket=class {
  constructor(url){this.url=new URL(url);this.messages=[];sockets.push(this)}
  send(data){this.messages.push(JSON.parse(data))}
  close(){this.closed=true}
  notify(){this.onmessage({data:JSON.stringify({event:'postgres_changes',payload:{data:{type:'UPDATE',record:{kind:'game'}}}})})}
 };
 run(`familyAuth={access_token:'test-only',expires_at:Date.now()+3600000,user:{id:'viewer'}};
 familyState.familyId='test-family';familyAccess=true;resetFeed42();navigate('liveFeed')`);
 let cloud=JSON.parse(run('JSON.stringify(game())'));
 let finishRead;
 w.fetch=async(url,options)=>{
  requests.push(options.method);
  const snapshot=cloud;
  if(finishRead===null)await new Promise(resolve=>finishRead=resolve);
  return {ok:true,text:async()=>JSON.stringify([{record_id:snapshot.id,payload:snapshot}])};
 };
 await run('refreshLiveFeed42()');
 assert.equal(sockets.length,1);
 const socket=sockets[0];
 socket.onopen();
 assert.equal(socket.url.protocol,'wss:');
 assert.equal(socket.messages[0].payload.config.postgres_changes[0].filter,'family_id=eq.test-family');
 finishRead=null;
 socket.notify();
 run(`const changed=C.clone(game());C.appendEvent(changed,'team_3');C.appendEvent(changed,'opponent_1');window.__changed=changed`);
 cloud=w.__changed;
 socket.notify();
 finishRead();
 await wait();
 const score=d.querySelectorAll('.v42-feed-score strong');
 assert.deepEqual([...score].map(node=>node.textContent),['5','3']);
 const events=[...d.querySelectorAll('[data-feed-event]')].map(event=>event.dataset.feedEvent);
 assert.equal(events.length,cloud.events.length);
 assert.equal(events.length,new Set(events).size);
 assert(requests.every(method=>method==='GET'));
 run(`familyState.remoteLive={[game().id]:true};navigate('live')`);
 assert.equal(run('ui.screen'),'liveFeed');
 assert.throws(()=>run('transaction(game().id,()=>{})'),/Follow this game/);
 run(`navigate('family')`);
 assert.equal(socket.closed,true);
});
await test('A lost save response and offline plays catch up through the same game record',async()=>{
 run(`familyState.remoteLive={};familyState.baseline={};familyState.liveAttempts={};
 familyState.reviewedFor=familyReviewKey();familyBusy=false;familyConflicts=[];
 verifyFamilyMembership=async()=>true;navigate('live')`);
 const key='game:'+run('game().id');
 let row=null,failResponse=true;
 const writes=[];
 run(`cloudRows=async()=>window.__liveRow?[window.__liveRow]:[]`);
 w.fetch=async(url,options)=>{
  assert(url.endsWith('/rest/v1/rpc/gt_save_live_game'));
  const args=JSON.parse(options.body);
  writes.push(args);
  assert.equal(args.expected_version,row?.version||0);
  row={kind:'game',record_id:args.rid,payload:args.body,version:(row?.version||0)+1};
  w.__liveRow=row;
  if(failResponse){failResponse=false;throw Error('Response lost')}
  return {ok:true,text:async()=>JSON.stringify({conflict:false,record:row})};
 };
 await run('syncFamily()');
 assert.equal(row.version,1);
 Object.defineProperty(w.navigator,'onLine',{configurable:true,value:false});
 run(`transaction(game().id,g=>{C.appendEvent(g,'team_3');C.appendEvent(g,'opponent_1')})`);
 await run('syncFamily()');
 assert.equal(writes.length,1);
 Object.defineProperty(w.navigator,'onLine',{configurable:true,value:true});
 await run('syncFamily()');
 assert.equal(writes.length,2,run('familyStatus'));
 assert.equal(writes[0].controller_key,writes[1].controller_key);
 assert.equal(row.version,2);
 assert.equal(row.payload.events.length,new Set(row.payload.events.map(event=>event.id)).size);
 assert.equal(run(`familyState.baseline['${key}'].version`),2);
 assert.equal(run('familyConflicts.length'),0);
});
assert.deepEqual(errors,[]);console.log('TOTAL',n);w.close();process.exit(0);
})().catch(e=>{console.error(e);console.error('RUNTIME',errors);w.close();process.exit(1)});
