'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const cp=require('node:child_process');
const {JSDOM}=require('jsdom');
const lib=fs.readFileSync('components/game-trace-components.js','utf8');
const app=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('components/training-detail-banner-v1.css','utf8');
assert(app.includes(lib),'Full app must embed canonical shared component library unchanged');
assert(app.includes(css),'Full app must embed canonical training detail CSS unchanged');
const w=new JSDOM('<!doctype html><html><body></body></html>',{runScripts:'outside-only'}).window;
w.eval(lib);
const C=w.GameTraceComponents;
for(const name of ['Section','BannerSectionV1','SharedBannerV2','GameBannerSectionV1','TrainingDetailBannerV1','TrainingDetailBannerSectionV1'])
 assert.equal(typeof C[name],'function',name+' not exported');
const session={id:'abc',name:'Shooting & Finishing',date:'2026-11-08',kind:'Skills Training',minutes:90,
 coach:'Skills Coach',location:'Training Gym',skills:['Finishing','Footwork','Shot Creation']};
let opened=false;
const section=C.TrainingDetailBannerSectionV1({session,onAction:()=>{opened=true}});
assert.equal(section.dataset.component,'TrainingDetailBannerSectionV1');
assert.equal(section.dataset.parent,'BannerSectionV1');
assert.equal(section.dataset.foundation,'SectionV1');
assert.equal(section.querySelector('h2').textContent,'Latest Training');
assert.equal(section.querySelector('.section-action').textContent,'View Session');
assert.equal(section.querySelector('.training-banner').dataset.parent,'SharedBannerV2');
assert.equal(section.querySelector('.training-banner').dataset.component,'TrainingDetailBannerV1');
assert.equal(section.querySelector('.primary').dataset.component,'BannerRowV1');
assert.equal(section.querySelectorAll('.primary > .cell').length,2);
assert.equal(section.querySelector('.session-name').textContent,session.name);
assert.equal(section.querySelector('.minutes').textContent,'90');
assert.equal(section.querySelector('.unit').textContent,'MINUTES');
assert.equal(section.querySelectorAll('.tag').length,3);
assert(!/player.?s? notes/i.test(section.textContent),'Player notes must be absent');
section.querySelector('.section-action').click();assert(opened,'View Session action not connected');
const details=section.querySelector('.detail-disclosure');assert.equal(details.open,false);details.open=true;
assert.equal(section.querySelector('.hide').textContent,'Hide Details');
for(const [kind,minutes,count,unit] of [['Performance',60,'60','MINUTES'],['Camp',180,'3','HOURS'],['Custom Session',75,'75','MINUTES']]){
 const s=C.TrainingDetailBannerSectionV1({session:{...session,kind,minutes}});
 assert.equal(s.querySelector('.minutes').textContent,count);
 assert.equal(s.querySelector('.unit').textContent,unit);
 assert.equal(s.querySelector('.inline-chip').textContent,kind);
}
const noSkills=C.TrainingDetailBannerSectionV1({session:{...session,skills:[],coach:'',location:''}});
assert.equal(noSkills.querySelectorAll('.tag').length,0);
assert.equal(noSkills.querySelector('.tag-row').textContent,'No skills recorded.');
const empty=C.TrainingDetailBannerSectionV1();
assert(!empty.querySelector('.training-banner'));
assert(!empty.querySelector('button'));
assert(/No training sessions yet/.test(empty.textContent));
const gameArgs={gameId:'game-1',team:'Knights',opponent:'Rivals',score:['40','35'],contextDate:'NOV 9, 2026',
 badgeText:'WIN',stats:{pts:10,reb:5,ast:2,stl:1}};
const baseline=cp.execFileSync('git',['show','2e4a4e7a86a643aa85f2041a3349c0adc18302d9:components/game-trace-components.js'],{encoding:'utf8'});
const oldW=new JSDOM('<!doctype html><html><body></body></html>',{runScripts:'outside-only'}).window;oldW.eval(baseline);
for(const config of [
 {title:'Latest Game',bannerArgs:gameArgs,actionLabel:'View Game →',withAction:true},
 {title:'Game Summary',bannerArgs:gameArgs,actionLabel:'Open Game →',withAction:false},
 {title:'No game',bannerArgs:null,actionLabel:'View Game →',withAction:false}
]){
 const build=(libObj)=>libObj.GameBannerSectionV1({
  title:config.title,
  banner:config.bannerArgs?libObj.GameBannerV2(config.bannerArgs):undefined,
  actionLabel:config.actionLabel,
  onAction:config.withAction?()=>{}:null
 });
 assert.equal(build(C).outerHTML,build(oldW.GameTraceComponents).outerHTML,'GameBanner approved DOM must remain identical');
}
assert(/\.gt-training-detail-section \.detail-disclosure/.test(css));
assert(/background:transparent/.test(css));
assert(!css.includes('#courtContent'),'Training-specific CSS must not target Home Court');
console.log('PASS: real BannerSection/SharedBanner inheritance, session variants, details, CTA, empty state, no player notes');
console.log('PASS: approved Games and Game Details banner DOM parity against verified DEV baseline');
