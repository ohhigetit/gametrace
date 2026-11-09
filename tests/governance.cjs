#!/usr/bin/env node
'use strict';
/** GameTrace Governance V1: dependency-free structural regression gate.
 * A passing result is NOT a substitute for visual QA or user approval.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const registry=JSON.parse(read('standards/component-registry.json'));
const html=read('index.html');
let count=0;
function check(value,why){assert.ok(value,why);count++}
function cssBlock(id){
 const start=html.indexOf('<style id="'+id+'">');
 check(start>=0,'Missing canonical style '+id);
 const end=html.indexOf('</style>',start);
 check(end>start,'Unterminated canonical style '+id);
 return html.slice(start,end);
}
check(registry.schemaVersion===1,'Wrong registry schema');
check(registry.baseline.branch==='development','Baseline should point to DEV');
check(registry.baseline.application==='index.html','Wrong app path');
check(registry.entries.length>=6,'Registry unexpectedly sparse');
const seen=new Set();
for(const entry of registry.entries){
 check(!seen.has(entry.id),'Duplicate component registry ID: '+entry.id);seen.add(entry.id);
 check(/^approved-/.test(entry.status),'Unreviewed status on '+entry.id);
 check(entry.canonical.path==='index.html','Canonical component source unsupported: '+entry.id);
 check(html.includes(entry.canonical.anchor),'Missing component source anchor: '+entry.id+' '+entry.canonical.anchor);
 if(entry.canonical.style)cssBlock(entry.canonical.style);
 if(entry.implementations)for(const impl of entry.implementations){
  check(html.includes(impl.anchor),'Missing '+entry.id+' '+impl.page+' implementation');
  cssBlock(impl.style);
 }
}
const required=[
 ['home-court','#courtContent','up1-home-court-css','function up1ComposeHomeCourt()'],
 ['games','#homeContent','gt-games-rebuild-universal-v1','function gtGamesBuildUniversalV1()'],
 ['game-details','#statsContent','up1-game-details-css','function gtGameDetailsUniversalV1()']
];
for(const [name,scope,style,anchor] of required){
 check(html.includes(anchor),'Missing '+name+' page');
 const css=cssBlock(style);
 for(const selector of ['.up1-page','.up1-header','.up1-heading','.up1-back','.up1-title','.up1-subtitle-v1','.up1-content','.up1-footer']){
  check(css.includes(scope+' ' +selector)||css.includes(scope+'>'+selector),'Missing '+name+' scoped '+selector+' CSS; classes alone are insufficient');
 }
}
for(const [label,anchor] of [
 ['session editor','function trainingForm('],
 ['family synchronization','window.GameTraceFamily'],
 ['Game Details','function gtGameDetailsUniversalV1()'],
 ['Game Records','function gtGameRecordV1Mount('],
 ['Player Notes','function playerNotesSectionV1('],
 ['Games','function gtGamesBuildUniversalV1()']
])check(html.includes(anchor),'Missing preserved system: '+label);
const hasTrainingsShell=html.includes('function gtTrainingsStep1UniversalPageV1()') ||
 html.includes('function gtTrainingStep1Shell()') ||
 /data\.page\s*=\s*['"]trainings['"]/.test(html);
if(hasTrainingsShell){
 check(html.includes('data.page=\'trainings\'')||html.includes('data.page="trainings"')||html.includes("dataset.page='trainings'")||html.includes('dataset.page="trainings"'),'Trainings shell missing data-page contract');
 // Any new Trainings UniversalPage shell must include all page-scoped CSS.
 const styles=[...html.matchAll(/<style\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/style>/g)]
  .filter(m=>/training/i.test(m[1]) && /#trainingContent[^\n]*up1-page/.test(m[2]));
 check(styles.length>0,'Trainings UniversalPage has no matching page-scoped CSS');
 const combined=styles.map(m=>m[2]).join('\n');
 for(const selector of ['.up1-page','.up1-header','.up1-heading','.up1-back','.up1-title','.up1-subtitle-v1','.up1-actions','.up1-action','.up1-content','.up1-footer']){
  check(combined.includes(selector),'Trainings UniversalPage missing '+selector+' scoped style');
 }
}
console.log('PASS Governance V1: '+count+' structural assertions. Visual QA and approval are separate gates.');
