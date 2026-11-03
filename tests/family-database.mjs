// Run with NODE_PATH pointing at a directory containing @electric-sql/pglite.
// Uses real PostgreSQL/PLpgSQL via PGlite, with Supabase auth/storage scaffolding.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),root=process.env.GAMETRACE_TEST_MODULES||'/tmp/gametrace-db-test/node_modules';
const {PGlite}=require(root+'/@electric-sql/pglite'),{pgcrypto}=await import(root+'/@electric-sql/pglite/dist/contrib/pgcrypto.js');
const db=new PGlite({extensions:{pgcrypto}});
await db.exec(`create schema auth;create schema extensions;create schema storage;create role anon;create role authenticated;
create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}'::jsonb);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
grant usage on schema public,auth to authenticated,anon;grant execute on function auth.uid() to public;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema storage to authenticated;grant select,insert,update on storage.objects to authenticated;`);
await db.exec(fs.readFileSync('cloud/schema.sql','utf8'));
const ids=Array.from({length:5},(_,i)=>`00000000-0000-0000-0000-00000000000${i+1}`),[owner,member,admin,outsider,extra]=ids;
for(const id of ids)await db.query('insert into auth.users(id) values($1)',[id]);
async function as(id,sql,args=[]){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);await db.exec('set role '+(id?'authenticated':'anon'));return db.query(sql,args)}
async function superSQL(sql,args=[]){await db.exec('reset role');return args.length?db.query(sql,args):db.exec(sql)}
async function fail(id,sql,pattern,args=[]){await assert.rejects(()=>as(id,sql,args),pattern)}
let checks=0;async function test(name,fn){await fn();checks++;console.log('PASS',name)}
const old=(await as(owner,"select gt_create_family('Legacy family') as result")).rows[0].result,fid=old.family_id;
await as(member,'select gt_join_family($1)',[old.invite_code]);
await as(owner,"select gt_save_record($1,'session','s1','{\"id\":\"s1\",\"name\":\"Existing\"}',0)",[fid]);
await superSQL(fs.readFileSync('cloud/migrations/002_family_workflow.sql','utf8'));
await test('Migration preserves family, records and creator ownership',async()=>{const c=(await as(owner,'select gt_family_context() as c')).rows[0].c;assert.equal(c.family.role,'owner');assert.equal(c.members.length,2);assert.equal((await as(owner,'select * from gt_records')).rows.length,1)});
await test('Migration is repeatable without demoting transferred owners',async()=>{await superSQL(fs.readFileSync('cloud/migrations/002_family_workflow.sql','utf8'));assert.equal((await as(owner,'select gt_family_context() as c')).rows[0].c.family.role,'owner')});
await test('Legacy invitation expires on upgrade',()=>fail(outsider,'select gt_join_family($1)',/Invalid or expired/,[old.invite_code]));
await test('One family enforced for create and join',async()=>{await fail(owner,"select gt_create_family('Duplicate')",/already belong/);await fail(member,'select gt_join_family($1)',/already belong/,[old.invite_code])});
await test('Member cannot rotate invites or appoint Admins',async()=>{await fail(member,'select gt_rotate_invite($1)',/Owner or Admin/,[fid]);await fail(member,"select gt_manage_member($1,$2,'admin')",/Owner or Admin/,[fid,owner])});
const code=(await as(owner,'select gt_rotate_invite($1) as c',[fid])).rows[0].c;
await test('Invitation preview reveals family before joining',async()=>{const p=(await as(admin,'select gt_preview_invite($1) as p',[code])).rows[0].p;assert.equal(p.name,'Legacy family');assert.equal((await as(admin,'select * from gt_records')).rows.length,0)});
await as(admin,'select gt_join_family($1)',[code]);
await as(owner,"select gt_manage_member($1,$2,'admin')",[fid,admin]);
await test('Admin can rotate invitations but cannot change roles',async()=>{await as(admin,'select gt_rotate_invite($1)',[fid]);await fail(admin,"select gt_manage_member($1,$2,'admin')",/Only the Owner/,[fid,member])});
await test('Replacing invitation invalidates prior code',()=>fail(outsider,'select gt_join_family($1)',/Invalid or expired/,[code]));
const fresh=(await as(owner,'select gt_rotate_invite($1) as c',[fid])).rows[0].c;
await test('Expiry enforced server-side',async()=>{await superSQL("update gt_families set invite_expires_at=now()-interval '1 minute' where id=$1",[fid]);await fail(outsider,'select gt_join_family($1)',/Invalid or expired/,[fresh])});
await test('Owner must transfer before leaving; Admin cannot remove Owner',async()=>{await fail(owner,"select gt_manage_member($1,$2,'leave')",/Transfer ownership/,[fid,owner]);await fail(admin,"select gt_manage_member($1,$2,'remove')",/Owner cannot/,[fid,owner])});
await test('Membership roles cannot be assigned through direct writes',()=>fail(member,"update gt_members set role='owner' where user_id=$1",/permission denied/,[member]));
await test('Profile names visible to family; forged metadata roles ignored',async()=>{await as(member,"select gt_set_display_name('Lei')");const c=(await as(owner,'select gt_family_context() as c')).rows[0].c;assert.equal(c.members.find(x=>x.user_id===member).display_name,'Lei');await superSQL("update auth.users set raw_user_meta_data='{\"role\":\"owner\"}' where id=$1",[member]);await fail(member,'select gt_rotate_invite($1)',/Owner or Admin/,[fid])});
await test('Unrelated and anonymous accounts cannot access private records/RPCs',async()=>{assert.equal((await as(outsider,'select * from gt_records')).rows.length,0);await fail(outsider,"select gt_save_record($1,'session','s1','{\"id\":\"s1\"}',1)",/Family access/,[fid]);await fail(null,'select gt_family_context()',/permission denied/)});
await test('All members retain record editing and history',async()=>{await as(member,"select gt_save_record($1,'session','s1','{\"id\":\"s1\",\"name\":\"Edited\"}',1)",[fid]);assert.equal((await as(member,'select * from gt_history')).rows.length,1)});
await test('Admin removes Member; records stay; access and invitations end',async()=>{await as(admin,"select gt_manage_member($1,$2,'remove')",[fid,member]);assert.equal((await as(member,'select * from gt_records')).rows.length,0);await fail(member,"select gt_save_record($1,'session','s1','{\"id\":\"s1\"}',2)",/Family access/,[fid]);assert.equal((await as(owner,'select * from gt_records')).rows.length,1)});
await test('Ownership transfer is atomic and prevents two owners',async()=>{await as(owner,"select gt_manage_member($1,$2,'transfer')",[fid,admin]);const c=(await as(admin,'select gt_family_context() as c')).rows[0].c;assert.equal(c.family.role,'owner');assert.equal(c.members.filter(m=>m.role==='owner').length,1);assert.equal(c.members.find(m=>m.user_id===owner).role,'admin');await superSQL(fs.readFileSync('cloud/migrations/002_family_workflow.sql','utf8'));assert.equal((await as(admin,'select gt_family_context() as c')).rows[0].c.family.role,'owner')});
await test('Previous Owner can leave after transfer; data retained',async()=>{await as(owner,"select gt_manage_member($1,$2,'leave')",[fid,owner]);assert.equal((await as(owner,'select * from gt_records')).rows.length,0);assert.equal((await as(admin,'select * from gt_records')).rows.length,1)});
await test('Removed members lose private storage access',async()=>{assert.equal((await as(member,"select gt_clip_access($1) as ok",[fid+'/clip.mp4'])).rows[0].ok,false);assert.equal((await as(admin,"select gt_clip_access($1) as ok",[fid+'/clip.mp4'])).rows[0].ok,true)});
await test('New families assign Owner and 7-day invitation',async()=>{const f=(await as(extra,"select gt_create_family('New family') as c")).rows[0].c;assert.ok(Date.parse(f.expires_at)>Date.now()+6*86400000);assert.equal((await as(extra,'select gt_family_context() as c')).rows[0].c.family.role,'owner')});
await test('Goals migration preserves existing records and roles',async()=>{const before=(await as(admin,'select gt_family_context() as c')).rows[0].c;await superSQL(fs.readFileSync('cloud/migrations/003_goals.sql','utf8'));const after=(await as(admin,'select gt_family_context() as c')).rows[0].c;assert.equal(after.family.role,before.family.role);assert.equal((await as(admin,'select * from gt_records')).rows.length,1)});
await test('Goals feature discovery is authenticated',async()=>{assert.equal((await as(admin,'select gt_cloud_features() as c')).rows[0].c.version,3);await fail(null,'select gt_cloud_features()',/permission denied/)});
await test('Goals and order support expected-version writes and family isolation',async()=>{await as(admin,"select gt_save_record($1,'goal','goal1','{\"id\":\"goal1\",\"title\":\"Work\"}',0)",[fid]);const result=(await as(admin,"select gt_save_record($1,'goal','goal1','{\"id\":\"goal1\"}',0) as c",[fid])).rows[0].c;assert.equal(result.conflict,true);await as(admin,"select gt_save_record($1,'goal_order','priority1','{\"id\":\"priority1\",\"ids\":[\"goal1\"]}',0)",[fid]);assert.equal((await as(member,"select * from gt_records where kind='goal'")).rows.length,0);await fail(member,"select gt_save_record($1,'goal','goal1','{\"id\":\"goal1\"}',1)",/Family access/,[fid])});
await test('Goals migration reruns without changing current rows',async()=>{await superSQL(fs.readFileSync('cloud/migrations/003_goals.sql','utf8'));assert.equal((await as(admin,"select * from gt_records where kind in ('goal','goal_order')")).rows.length,2)});
console.log('TOTAL',checks);await db.close();
