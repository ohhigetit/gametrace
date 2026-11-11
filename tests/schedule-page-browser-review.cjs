'use strict';
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const puppeteer=require('puppeteer-core');
(async()=>{
 const html=fs.readFileSync('index.html');
 const server=http.createServer((req,res)=>{
  const path=req.url.split('?')[0];
  if(path==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);return;}
  if(path.startsWith('/icons/')){const file='.'+path;if(fs.existsSync(file)){res.writeHead(200,{'Content-Type':file.endsWith('.png')?'image/png':'image/svg+xml'});res.end(fs.readFileSync(file));return;}}
  if(path.includes('netlify/functions/calendar-feed')){res.writeHead(503);res.end('{}');return;}
  res.writeHead(404);res.end('Not found');
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage();const errors=[];
 page.on('pageerror',err=>errors.push('PAGE: '+err.message));
 page.on('console',msg=>{if(msg.type()==='error')errors.push('CONSOLE: '+msg.text())});
 try{
  await page.setViewport({width:390,height:844,deviceScaleFactor:2});
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded',timeout:30000});
  await new Promise(r=>setTimeout(r,1200));
  const before=await page.evaluate(()=>{
    return {typeofNavigate:typeof navigate, typeofRender:typeof renderSchedule,screen:typeof ui==='undefined'?'unknown':ui.screen,root:!!document.getElementById('scheduleContent')};
  });
  console.log('BOOT:',JSON.stringify(before)); console.log('SCRIPT ERRORS:',JSON.stringify(errors.slice(0,20)));
  assert(before.root,'Schedule DOM mount missing');
  await page.evaluate(()=>document.getElementById('gt-cover-skip')?.click());
  await page.evaluate(()=>document.getElementById('settingsButton')?.click());
  await new Promise(r=>setTimeout(r,350));
  const menu=await page.evaluate(()=>[...document.querySelectorAll('#menuContent button')].map(b=>({text:b.textContent.trim(),nav:b.dataset.nav})).slice(0,35));
  console.log('MENU:',JSON.stringify(menu));
  const found=await page.evaluate(()=>{
    const btn=document.querySelector('#menuContent [data-nav="schedule"]')||[...document.querySelectorAll('#menuContent button')].find(b=>b.textContent.trim()==='Schedule');
    if(btn){btn.click();return true;}return false;
  });
  assert(found,'Schedule menu link missing');
  const actual=await page.evaluate(()=>{
    const root=document.querySelector('#scheduleContent > .up1-page');
    return {root:!!root,html:document.querySelector('#scheduleContent')?.innerHTML?.slice(0,1300),title:root?.querySelector('h1')?.textContent,component:root?.dataset.component,cta:root?.querySelector('.up1-action')?.textContent,filter:!!root?.querySelector('[data-component="FilterTrigger"]'),coming:!!root?.querySelector('.gtsl-section'),footer:!!root?.querySelector('.up1-footer'),error:document.querySelector('[role=alert]')?.textContent};
  }).catch(e=>({exception:String(e)}));
  console.log('SCHEDULE:',JSON.stringify(actual));
  assert(actual.root,'Schedule UniversalPage did not render');
  assert.equal(actual.title,'Schedule');
  assert(actual.filter,'Header filter missing');
  assert(actual.coming,'Coming Up missing');
  assert(actual.cta.includes('New Event'),'CTA missing');
  assert(actual.footer,'Footer missing');
  await page.click('#scheduleContent .up1-action');
  const form=await page.evaluate(()=>({dialogs:document.querySelectorAll('dialog[open],[role=dialog]').length,sheetOpen:document.getElementById('sheet')?.open,sheetTitle:document.getElementById('sheetTitle')?.textContent,choices:document.getElementById('choices')?.textContent?.slice(0,240),active:document.activeElement?.outerHTML?.slice(0,220)}));
  console.log('FORM:',JSON.stringify(form));console.log('AFTER CTA ERRORS:',JSON.stringify(errors.slice(-12)));
  assert(form.dialogs>0,'New Event did not open existing form');
  await page.screenshot({path:'/tmp/schedule-mobile.png',fullPage:true});
  console.log('PASS: Full GameTrace browser Schedule navigation/header/filter/Coming Up/New Event.');
  if(errors.length)console.log('BROWSER ERRORS:',JSON.stringify(errors.slice(0,8)));
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error('FAIL:',e.stack||e);process.exitCode=1});
