// Source-level ActivityList integration regression.
// Run with: node tests/component-activity-integration.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const js=name=>fs.readFileSync(path.join(root,name),'utf8');
let errors=[];
const dom=new JSDOM(`<!doctype html><html><body>
<div id="courtContent">
<section id="recent-games"><h2>Recent Games</h2><div>
<button id="game-row" class="gt-list-row"><span>GAME</span>Game · NOV 3, 2026</button>
</div><button id="games-all">View All Games</button></section>
<section id="recent-trainings"><h2>Recent Trainings</h2><div>
<button id="training-row" class="gt-list-row"><span>TRAINING</span>Training · NOV 5, 2026</button>
</div><button id="train-all">View All Trainings</button></section>
<section id="words"><h2>Words to Remember</h2><p>Keep showing up.</p></section>
</div></body></html>`,{url:'https://example.test/',runScripts:'outside-only'});
const w=dom.window,d=w.document;
w.console.warn=(...args)=>errors.push(args.join(' '));
const game=d.getElementById('game-row'),training=d.getElementById('training-row');
const gamesAll=d.getElementById('games-all'),trainAll=d.getElementById('train-all');
let clicks=0;
game.addEventListener('click',()=>clicks++);
training.addEventListener('click',()=>clicks+=10);
gamesAll.addEventListener('click',()=>clicks+=100);
trainAll.addEventListener('click',()=>clicks+=1000);
w.renderHomeCourt=function(){};
w.eval(js('components/game-trace-components.js'));
w.eval(js('components/homecourt-activity-integration.js'));
w.renderHomeCourt();
const section=d.querySelector('[data-gtc-home-activity]');
assert(section,'unified activity section created');
assert.match(section.textContent,/Recent Activity/);
assert.match(section.textContent,/The work behind your journey/);
assert.equal(d.querySelectorAll('[data-gtc-home-activity]').length,1);
const rows=[...section.querySelectorAll('.gtc-list-row')];
assert.equal(rows.length,2);
assert.strictEqual(rows[0],training,'newest first');
assert.strictEqual(rows[1],game);
assert(d.getElementById('words'),'unrelated sections remain');
assert(!d.getElementById('recent-games'));
assert(!d.getElementById('recent-trainings'));
game.click();training.click();gamesAll.click();trainAll.click();
assert.equal(clicks,1111,'existing row and View All actions are preserved');
assert.strictEqual(d.getElementById('games-all'),gamesAll);
assert.strictEqual(d.getElementById('train-all'),trainAll);
assert.deepEqual(errors,[],'no integration warnings');
w.renderHomeCourt();
assert.equal(d.querySelectorAll('[data-gtc-home-activity]').length,1,'no duplicate sections');
dom.window.close();
console.log('PASS ActivityList consolidates live Home Court rows without losing handlers');
// Fail-closed scenario: changed old page markup must remain intact.
const missing=new JSDOM('<div id="courtContent"><h2>Recent Games</h2></div>',{runScripts:'outside-only'});
missing.window.renderHomeCourt=function(){};
missing.window.eval(js('components/game-trace-components.js'));
missing.window.eval(js('components/homecourt-activity-integration.js'));
missing.window.renderHomeCourt();
assert.equal(missing.window.document.querySelectorAll('[data-gtc-home-activity]').length,0);
assert.equal(missing.window.document.getElementById('courtContent').textContent,'Recent Games');
missing.window.close();
console.log('PASS ActivityList fails closed when source markup differs');
