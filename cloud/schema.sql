-- Run once in a Supabase project's SQL editor. No service-role key belongs in the app.
create extension if not exists pgcrypto with schema extensions;
create table public.gt_families(id uuid primary key default gen_random_uuid(),name text not null,invite_hash text not null,created_by uuid not null references auth.users(id),created_at timestamptz not null default now());
create table public.gt_members(family_id uuid references public.gt_families(id),user_id uuid references auth.users(id),primary key(family_id,user_id));
create table public.gt_records(family_id uuid references public.gt_families(id),kind text check(kind in ('game','session','clip')),record_id text check(length(record_id) between 1 and 120),payload jsonb not null,version bigint not null default 1,updated_by uuid references auth.users(id),updated_at timestamptz not null default now(),primary key(family_id,kind,record_id),check(octet_length(payload::text)<20000000));
create table public.gt_history(id bigint generated always as identity primary key,family_id uuid not null,kind text not null,record_id text not null,payload jsonb not null,version bigint not null,updated_by uuid,updated_at timestamptz,archived_at timestamptz not null default now());
create or replace function public.gt_is_member(fid uuid) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.gt_members where family_id=fid and user_id=auth.uid())$$;
create or replace function public.gt_create_family(family_name text) returns jsonb language plpgsql security definer set search_path='' as $$declare fid uuid;code text;begin
if auth.uid() is null then raise exception 'Sign in first';end if;
if length(trim(family_name)) not between 1 and 100 then raise exception 'Enter a family name';end if;
code=encode(extensions.gen_random_bytes(24),'hex');
insert into public.gt_families(name,invite_hash,created_by) values(trim(family_name),encode(extensions.digest(code,'sha256'),'hex'),auth.uid()) returning id into fid;
insert into public.gt_members values(fid,auth.uid());return jsonb_build_object('family_id',fid,'invite_code',code);end$$;
create or replace function public.gt_join_family(invite_code text) returns uuid language plpgsql security definer set search_path='' as $$declare fid uuid;begin
if auth.uid() is null then raise exception 'Sign in first';end if;
select id into fid from public.gt_families where invite_hash=encode(extensions.digest(trim(invite_code),'sha256'),'hex');
if fid is null then raise exception 'Invalid invitation code';end if;
insert into public.gt_members values(fid,auth.uid()) on conflict do nothing;return fid;end$$;
create or replace function public.gt_rotate_invite(fid uuid) returns text language plpgsql security definer set search_path='' as $$declare code text;begin
if not public.gt_is_member(fid) then raise exception 'Family access required';end if;
code=encode(extensions.gen_random_bytes(24),'hex');update public.gt_families set invite_hash=encode(extensions.digest(code,'sha256'),'hex') where id=fid;return code;end$$;
create or replace function public.gt_save_record(fid uuid,record_kind text,rid text,body jsonb,expected_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$declare r public.gt_records;begin
if not public.gt_is_member(fid) then raise exception 'Family access required';end if;
if record_kind not in ('game','session','clip') or rid is null or length(rid) not between 1 and 120 or body is null or jsonb_typeof(body) <> 'object' or body->>'id' is distinct from rid then raise exception 'Invalid record';end if;
-- Serialize the read/check/write, including the first insertion of a record.
perform pg_advisory_xact_lock(hashtextextended(fid::text||record_kind||rid,0));
select * into r from public.gt_records where family_id=fid and kind=record_kind and record_id=rid for update;
if coalesce(r.version,0)<>expected_version then return jsonb_build_object('conflict',true,'record',to_jsonb(r));end if;
if r.version is not null then insert into public.gt_history(family_id,kind,record_id,payload,version,updated_by,updated_at) values(r.family_id,r.kind,r.record_id,r.payload,r.version,r.updated_by,r.updated_at);end if;
insert into public.gt_records values(fid,record_kind,rid,body,coalesce(r.version,0)+1,auth.uid(),now()) on conflict(family_id,kind,record_id) do update set payload=excluded.payload,version=excluded.version,updated_by=excluded.updated_by,updated_at=excluded.updated_at returning * into r;
return jsonb_build_object('conflict',false,'record',to_jsonb(r));end$$;
alter table public.gt_families enable row level security;
alter table public.gt_members enable row level security;
alter table public.gt_records enable row level security;
alter table public.gt_history enable row level security;
create policy family_read on public.gt_families for select to authenticated using(public.gt_is_member(id));
create policy members_read on public.gt_members for select to authenticated using(public.gt_is_member(family_id));
create policy records_read on public.gt_records for select to authenticated using(public.gt_is_member(family_id));
create policy history_read on public.gt_history for select to authenticated using(public.gt_is_member(family_id));
revoke all on public.gt_families,public.gt_members,public.gt_records,public.gt_history from anon,authenticated;
grant select on public.gt_families,public.gt_members,public.gt_records,public.gt_history to authenticated;
revoke all on function public.gt_is_member(uuid),public.gt_create_family(text),public.gt_join_family(text),public.gt_rotate_invite(uuid),public.gt_save_record(uuid,text,text,jsonb,bigint) from public,anon;
grant execute on function public.gt_is_member(uuid),public.gt_create_family(text),public.gt_join_family(text),public.gt_rotate_invite(uuid),public.gt_save_record(uuid,text,text,jsonb,bigint) to authenticated;
-- Private video bucket. Project-level storage limits may impose a smaller maximum.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('gametrace-clips','gametrace-clips',false,52428800,array['video/mp4','video/webm','video/quicktime']) on conflict(id) do nothing;
create or replace function public.gt_clip_access(object_name text) returns boolean language plpgsql stable security definer set search_path='' as $$begin
return public.gt_is_member(split_part(object_name,'/',1)::uuid);exception when invalid_text_representation then return false;end$$;
revoke all on function public.gt_clip_access(text) from public,anon;
grant execute on function public.gt_clip_access(text) to authenticated;
create policy gt_clips_read on storage.objects for select to authenticated using(bucket_id='gametrace-clips' and public.gt_clip_access(name));
create policy gt_clips_insert on storage.objects for insert to authenticated with check(bucket_id='gametrace-clips' and public.gt_clip_access(name));
create policy gt_clips_update on storage.objects for update to authenticated using(bucket_id='gametrace-clips' and public.gt_clip_access(name)) with check(bucket_id='gametrace-clips' and public.gt_clip_access(name));
-- Keep originals for recovery; app deletion is a recoverable metadata flag.
