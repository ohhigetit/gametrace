'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const base=fs.readFileSync('index.html','utf8');
const test=fs.readFileSync('tests/GameTrace_Trainings_Step1_Governed_TEST.html','utf8');
const styleStart='<!-- GT_TRAININGS_STEP1_STYLE_START -->\n';
const styleEnd='<!-- GT_TRAININGS_STEP1_STYLE_END -->\n';
const codeStart='/* GT_TRAININGS_STEP1_START';
const codeEnd='/* GT_TRAININGS_STEP1_END */\n';
const a=test.indexOf(styleStart),b=test.indexOf(styleEnd,a);
assert(a>=0&&b>a,'Missing scoped style markers');
const c=test.indexOf(codeStart),d=test.indexOf(codeEnd,c);
assert(c>=0&&d>c,'Missing implementation markers');
const style=test.slice(a+styleStart.length,b);
const code=test.slice(c,d+codeEnd.length);
const reconstructed=test.replace(styleStart+style+styleEnd,'').replace('\n'+code+'\n','');
assert.equal(reconstructed,base,'Candidate differs from DEV baseline outside Step 1 additions');
for(const key of ['.up1-page','.up1-header','.up1-heading','.up1-back','.up1-title','.up1-subtitle-v1','.up1-actions','.up1-action','.up1-content','.up1-footer']){
 assert(style.includes('#trainingContent '+key)||style.includes('#trainingContent>'+key),'Missing scoped style '+key);
}
for(const key of ['up1Icon(\'session\')','dataset.component=\'UniversalPage\'','dataset.component=\'PageHeader\'','dataset.component=\'PrimaryContent\'','dataset.component=\'PageFooter\'','()=>trainingForm()','trainingUI.editing'])assert(code.includes(key),'Missing approved component or behavior '+key);
assert(!code.includes('localStorage')&&!code.includes('fetch('),'Unapproved data or cloud modification');
console.log('PASS Trainings Step 1: baseline bytes preserved, approved shell/style contract present.');
