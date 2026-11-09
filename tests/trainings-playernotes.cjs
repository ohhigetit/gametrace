'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const earlier=fs.readFileSync('tests/GameTrace_Trainings_Recent_AllTypes_TEST.html','utf8');
const full=fs.readFileSync('tests/GameTrace_Trainings_Recent_PlayerNotes_TEST.html','utf8');
const start=full.indexOf('/* GT_TRAININGS_PLAYER_NOTES_SECTION_V1');
const end=full.indexOf('/* GT_TRAININGS_STEP1_START',start);
assert(start>0&&end>start,'Training notes adapter missing');
const adapter=full.slice(start,end);
for(const check of ["gtTrainingsPlayerNotesV1","gt-pns-v1","gt-playernotes-v1","gt-pns-content","PlayerNotesSectionV1","PlayerNotesV1","trainingForm(session.id)","openSession(session.id,'training')","db.trainingSessions","s.feedback?.[key]","s.deletedAt"]){
 assert(adapter.includes(check),'Missing '+check);
}
assert(!adapter.includes('transaction(')&&!adapter.includes('db.games'),'Do not use game-only persistence');
const blockIds=['gt-training-gt-playernotes-section-v1-parent-and-unboxed-answers','gt-training-gt-playernotes-v1-notebook-banner-refinement','gt-trainings-playernotes-adapter-v1'];
let cleaned=full;
for(const id of blockIds){
 const pattern=new RegExp('<style id="'+id+'">[\\s\\S]*?<\\/style>\\n?');
 const found=cleaned.match(pattern);
 assert(found,'Missing style '+id);
 assert(found[0].includes('#trainingContent [data-page="trainings"]'),'Style not scoped '+id);
 cleaned=cleaned.replace(pattern,'');
}
cleaned=cleaned.replace(adapter,'').replace('\n body.append(gtTrainingsPlayerNotesV1());','');
// Style insertion was immediately before </head>, and adapter before existing marker.
cleaned=cleaned.replace('\n\n\n/* GT_TRAININGS_STEP1_START','\n\n/* GT_TRAININGS_STEP1_START');
assert.equal(cleaned,earlier,'Unrelated changes in the full app');
console.log('PASS Training Player Notes: approved notebook structure/styles, session-safe navigation, no other app changes');
