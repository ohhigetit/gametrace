'use strict';
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const puppeteer=require('puppeteer-core');
(async()=>{
 const html=fs.readFileSync('index.html');
 const server=http.createServer((req,res)=>{
  const path=req.url.split('?')[0];
  if(path==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);return}
  if(fs.existsSync('.'+path)&&fs.statSync('.'+path).isFile()){res.writeHead(200,{'Content-Type':path.endsWith('.webmanifest')?'application/manifest+json':'text/plain'});res.end(fs.readFileSync('.'+path));return}
  res.writeHead(404);res.end('Not found');
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await puppeteer.launch({headless:true,executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 try {
  await page.setViewport({width:390,height:844,deviceScaleFactor:2});
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.click('#gt-cover-skip');
  await page.click('#settingsButton');
  const found=await page.evaluate(()=>{const b=document.querySelector('#menuContent [data-nav="notebook"]');if(b){b.click();return true}return false});
  assert(found,'Notebook link not in menu');
  const summary=await page.evaluate(()=>{
   const root=document.getElementById('notebookContent'),page=root.querySelector('[data-component="NotebookV1"]');
   return {page:!!page,views:[...root.querySelectorAll('[data-dna-view]')].map(x=>x.dataset.dnaView),review:!!root.querySelector('[data-component="ReflectionReviewV1"]'),header:root.querySelector('h1')?.textContent,filter:!!root.querySelector('[data-component="FilterTrigger"]'),text:root.innerText?.slice(0,500)};
  });
  console.log('NOTEBOOK:',JSON.stringify(summary));
  assert(summary.page,'NotebookV1 did not render');
  assert.deepEqual(summary.views,['review','reflections','dna']);
  assert(summary.review,'To Review panel absent');
  await page.click('[data-dna-view="dna"]');
  const dna=await page.evaluate(()=>({exists:!!document.querySelector('[data-component="MyDNAV1"]'),labels:[...document.querySelectorAll('.gtdna-group-title')].map(x=>x.textContent),text:document.querySelector('[data-component="MyDNAV1"]')?.innerText?.slice(0,550)}));
  console.log('MY DNA:',JSON.stringify(dna));
  assert(dna.exists,'My DNA panel absent');
  await page.click('[data-dna-view="reflections"]');
  assert(await page.$('[data-component="OriginalNotebook"]'),'Existing Notebook list absent');
  console.log('REFLECTIONS BUTTONS:',JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('#notebookContent button')].map(b=>({label:b.textContent.trim(),aria:b.getAttribute('aria-label')})).slice(0,35))));
  await page.evaluate(()=>[...document.querySelectorAll('#notebookContent button')].find(b=>b.textContent.trim()==='Add Notes')?.click());
  console.log('NOTE FORM:',JSON.stringify(await page.evaluate(()=>({open:document.getElementById('sheet')?.open,title:document.getElementById('sheetTitle')?.textContent,fields:[...document.querySelectorAll('#sheet input,#sheet textarea,#sheet select')].map(x=>({tag:x.tagName,aria:x.getAttribute('aria-label'),label:x.closest('label')?.textContent?.slice(0,100),value:x.value})),buttons:[...document.querySelectorAll('#sheet button')].map(x=>x.textContent.trim())}))));
  console.log('BROWSER ERRORS:',JSON.stringify(errors));
  assert.equal(errors.length,0,'Browser generated uncaught JS errors');
  console.log('PASS: Notebook menu navigation, three views, My DNA categories, legacy Notebook, no JS errors');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(error=>{console.error('FAIL:',error.stack||error);process.exitCode=1});