import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/sky-chat.mjs';

const origin='https://sky-review.example.netlify.app';
const envKeys=['SKY_GEMINI_ENABLED','GEMINI_API_KEY','SKY_SUPABASE_URL','SKY_SUPABASE_ANON_KEY','SKY_ALLOWED_USER_IDS'];
const token='eyJhbGciOiJIUzI1NiJ9.test.reviewtoken';
const defaults={
  SKY_GEMINI_ENABLED:'true',
  GEMINI_API_KEY:'fake-server-key',
  SKY_SUPABASE_URL:'https://supabase.example.invalid',
  SKY_SUPABASE_ANON_KEY:'fake-anon-key',
  SKY_ALLOWED_USER_IDS:'approved-user'
};
function req(body={prompt:'What did I learn?',context:[{type:'note',summary:'Saw: open teammate'}]}, options={}){
  return new Request(origin+'/.netlify/functions/sky-chat',{
    method:options.method||'POST',
    headers:{
      'Content-Type':'application/json',
      'Origin':options.origin===undefined?origin:options.origin,
      ...(options.auth===false?{}:{Authorization:'Bearer '+token})
    },
    body:JSON.stringify(body)
  });
}
function setEnv(overrides={}){Object.assign(process.env,defaults,overrides);}
function restore(original){for(const key of envKeys){if(original[key]===undefined)delete process.env[key];else process.env[key]=original[key];}}
test('Sky proxy gates, authentication, and Gemini contract',async()=>{
  const original=Object.fromEntries(envKeys.map(k=>[k,process.env[k]]));
  const originalFetch=globalThis.fetch;
  try{
    setEnv({SKY_GEMINI_ENABLED:'false'});
    let response=await handler(req());
    assert.equal(response.status,503);
    setEnv();
    response=await handler(req({}, {origin:'https://evil.example'}));
    assert.equal(response.status,403);
    response=await handler(req({}, {auth:false}));
    assert.equal(response.status,401);
    let upstreamCalls=0;
    globalThis.fetch=async (url,opts)=>{
      upstreamCalls++;
      if(String(url).includes('/auth/v1/user'))return Response.json({id:'stranger'});
      throw new Error('Gemini must not be called for non-allowlisted user');
    };
    response=await handler(req());
    assert.equal(response.status,403);
    assert.equal(upstreamCalls,1);
    globalThis.fetch=async (url,opts)=>{
      if(String(url).includes('/auth/v1/user'))return Response.json({id:'approved-user'});
      assert.ok(String(url).includes('generativelanguage.googleapis.com'));
      assert.equal(opts.headers['x-goog-api-key'],'fake-server-key');
      const outbound=JSON.parse(opts.body);
      assert.match(JSON.stringify(outbound),/open teammate/);
      return Response.json({candidates:[{content:{parts:[{text:'Look for the open teammate before driving.'}]}}]});
    };
    response=await handler(req());
    assert.equal(response.status,200);
    assert.deepEqual(await response.json(),{
      answer:'Look for the open teammate before driving.',mode:'gemini',recordsProvided:1
    });
    response=await handler(req({prompt:'hello',context:[{type:'credential',summary:'secret'}]}));
    assert.equal(response.status,400);
  }finally{globalThis.fetch=originalFetch;restore(original);}
});
