'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {createSkyDataService}=require('./sky-data-service-v1.js');
const backup=JSON.parse(fs.readFileSync(process.argv[2]||'/mnt/data/GameTrace_backup_2026-11-10.json','utf8'));
const unchanged=JSON.stringify(backup),svc=createSkyDataService({getSnapshot:()=>backup,authorizePlayer:name=>name==='Georgina'});
let cases=0;function check(name,fn){fn();cases++;console.log('PASS',name)}
check('Refuses absent authorization',()=>assert.throws(()=>svc.search({player:'Another'}),/Not authorized/));
check('Private prayer/commitment excluded',()=>{const r=svc.search({player:'Georgina',query:'',limit:50});assert(!r.items.some(x=>/prayer|commitment/i.test(x.category)))});
check('Deleted goals excluded',()=>assert.equal(svc.search({player:'Georgina',kinds:['playbook']}).total,0));
check('10 sessions x 3 reflection answers available',()=>{const x=svc.search({player:'Georgina',kinds:['training'],limit:50});assert.equal(x.items.filter(i=>['I See','I Am','I Will Become'].includes(i.category)).length,30)});
check('Related attack notes retrieved',()=>{const x=svc.search({player:'Georgina',kinds:['training'],query:'defender driving contact',limit:50});assert(x.total>=3)});
check('Selected references first and source provenance preserved',()=>{const r=svc.search({player:'Georgina',kinds:['training'],query:'defender',limit:10});const ref=r.items[0].key;const ctx=svc.context({player:'Georgina',selectedKeys:[ref],query:'attack',maxItems:4});assert.equal(ctx.records[0].key,ref);assert(ctx.records[0].source.kind==='training')});
check('Context limits enforced',()=>{const x=svc.context({player:'Georgina',query:'the',maxItems:3,maxChars:350});assert(x.records.length<=3);assert(x.characters<=350)});
check('Only proposals, no writes',()=>{const r=svc.search({player:'Georgina',kinds:['training'],query:'defender'}).items[0];const p=svc.prepareProposal({player:'Georgina',category:'I SEE',statement:'A defender changes the decisions required during a drill.',sourceKeys:[r.key]});assert.equal(p.status,'PROPOSED_NOT_SAVED');assert.equal(p.requiresPlayerApproval,true);assert.equal(p.sourceRefs[0].id,r.recordId);assert.equal(JSON.stringify(backup),unchanged)});
check('Unknown reference rejected',()=>assert.throws(()=>svc.prepareProposal({player:'Georgina',category:'I AM',statement:'I am more focused.',sourceKeys:['fake-id']}),/unavailable/));
check('No private original record in output',()=>{const r=svc.search({player:'Georgina'});assert(r.items.every(x=>!('feedback' in x||'events' in x||'body' in x)))});
console.log(`\n${cases} tests passed. Dataset: 2026-11-10 backup, ${backup.trainingSessions.length} sessions, ${backup.games.length} games.`);
