-- GameTrace Family workflow v2. Run in Supabase SQL Editor after schema.sql.
-- Transactional, repeatable and non-destructive. Stops if legacy accounts belong
-- to several families: resolve those memberships deliberately before retrying.
begin;
do $$begin
 if exists(select 1 from public.gt_members group by user_id having count(*)>1) then
  raise exception 'Some accounts belong to multiple families. Choose one membership per account before applying this migration. No data changed.';
 end if;
 if exists(select 1 from public.gt_families f where not exists(select 1 from public.gt_members m where m.family_id=f.id and m.user_id=f.created_by)) then
  raise exception 'A family creator is missing from its membership. Restore that membership before retrying. No data changed.';
 end if;
end$$;
alter table public.gt_members add column if not exists role text not null default 'member';
alter table public.gt_members add column if not exists joined_at timestamptz not null default now();
alter table public.gt_families add column if not exists invite_expires_at timestamptz;
-- Expire every legacy invitation on first upgrade. Creators issue new codes.
update public.gt_families set invite_expires_at=now() where invite_expires_at is null;
do $$begin
 if not exists(select 1 from pg_constraint where conname='gt_members_role_check' and conrelid='public.gt_members'::regclass) then
  alter table public.gt_members add constraint gt_members_role_check check(role in ('owner','admin','member'));
  update public.gt_members m set role='owner' from public.gt_families f where m.family_id=f.id and m.user_id=f.created_by;
 end if;
 if not exists(select 1 from pg_constraint where conname='gt_members_one_family' and conrelid='public.gt_members'::regclass) then
  alter table public.gt_members add constraint gt_members_one_family unique(user_id);
 end if;
end$$;
create unique index if not exists gt_one_owner on public.gt_members(family_id) where role='owner';
create table if not exists public.gt_profiles(user_id uuid primary key references auth.users(id),display_name text not null check(length(trim(display_name)) between 1 and 80));
alter table public.gt_profiles enable row level security;
revoke all on public.gt_profiles from public,anon,authenticated;

-- No role is trusted from auth user_metadata. It is stored only in gt_members.
create or replace function public.gt_require_manager(fid uuid) returns void language plpgsql security definer set search_path='' as $$begin
 if not exists(select 1 from public.gt_members where family_id=fid and user_id=auth.uid() and role in ('owner','admin')) then raise exception 'Owner or Admin access required';end if;
end$$;
create or replace function public.gt_family_context() returns jsonb language plpgsql security definer set search_path='' as $$declare f public.gt_families;r text;people jsonb;n text;begin
 if auth.uid() is null then raise exception 'Sign in first';end if;
 select display_name into n from public.gt_profiles where user_id=auth.uid();
 select x.* into f from public.gt_families x join public.gt_members m on m.family_id=x.id where m.user_id=auth.uid();
 select role into r from public.gt_members where family_id=f.id and user_id=auth.uid();
 if f.id is null then return jsonb_build_object('version',2,'display_name',n,'family',null,'members','[]'::jsonb);end if;
 select coalesce(jsonb_agg(jsonb_build_object('user_id',m.user_id,'display_name',coalesce(p.display_name,nullif(trim(u.raw_user_meta_data->>'display_name'),''),'Family member'),'role',m.role) order by case m.role when 'owner' then 0 when 'admin' then 1 else 2 end,m.joined_at),'[]'::jsonb) into people from public.gt_members m left join public.gt_profiles p on p.user_id=m.user_id left join auth.users u on u.id=m.user_id where m.family_id=f.id;
 return jsonb_build_object('version',2,'display_name',n,'family',jsonb_build_object('id',f.id,'name',f.name,'role',r,'invite_expires_at',f.invite_expires_at),'members',people);
end$$;
create or replace function public.gt_set_display_name(member_name text) returns void language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null then raise exception 'Sign in first';end if;
 if member_name is null or length(trim(member_name)) not between 1 and 80 then raise exception 'Enter a display name (1–80 characters)';end if;
 insert into public.gt_profiles values(auth.uid(),trim(member_name)) on conflict(user_id) do update set display_name=excluded.display_name;
end$$;
create or replace function public.gt_create_family(family_name text) returns jsonb language plpgsql security definer set search_path='' as $$declare fid uuid;code text;begin
 if auth.uid() is null then raise exception 'Sign in first';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,1));
 if exists(select 1 from public.gt_members where user_id=auth.uid()) then raise exception 'You already belong to a family';end if;
 if family_name is null or length(trim(family_name)) not between 1 and 100 then raise exception 'Enter a family name';end if;
 code=encode(extensions.gen_random_bytes(24),'hex');
 insert into public.gt_families(name,invite_hash,created_by,invite_expires_at) values(trim(family_name),encode(extensions.digest(code,'sha256'),'hex'),auth.uid(),now()+interval '7 days') returning id into fid;
 insert into public.gt_members(family_id,user_id,role) values(fid,auth.uid(),'owner');
 return jsonb_build_object('family_id',fid,'invite_code',code,'expires_at',now()+interval '7 days');
end$$;
create or replace function public.gt_preview_invite(invite_code text) returns jsonb language plpgsql security definer set search_path='' as $$declare f public.gt_families;begin
 if auth.uid() is null then raise exception 'Sign in first';end if;
 if exists(select 1 from public.gt_members where user_id=auth.uid()) then raise exception 'You already belong to a family';end if;
 select * into f from public.gt_families where invite_hash=encode(extensions.digest(trim(invite_code),'sha256'),'hex') and invite_expires_at>now();
 if f.id is null then raise exception 'Invalid or expired invitation code';end if;
 return jsonb_build_object('id',f.id,'name',f.name);
end$$;
create or replace function public.gt_join_family(invite_code text) returns uuid language plpgsql security definer set search_path='' as $$declare fid uuid;begin
 if auth.uid() is null then raise exception 'Sign in first';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,1));
 if exists(select 1 from public.gt_members where user_id=auth.uid()) then raise exception 'You already belong to a family';end if;
 -- Lock the invitation row so code rotation and expiry cannot race the join.
 select id into fid from public.gt_families where invite_hash=encode(extensions.digest(trim(invite_code),'sha256'),'hex') and invite_expires_at>now() for update;
 if fid is null then raise exception 'Invalid or expired invitation code';end if;
 insert into public.gt_members(family_id,user_id,role) values(fid,auth.uid(),'member');return fid;
end$$;
create or replace function public.gt_rotate_invite(fid uuid) returns text language plpgsql security definer set search_path='' as $$declare code text;begin
 perform 1 from public.gt_families where id=fid for update;
 perform public.gt_require_manager(fid);
 code=encode(extensions.gen_random_bytes(24),'hex');update public.gt_families set invite_hash=encode(extensions.digest(code,'sha256'),'hex'),invite_expires_at=now()+interval '7 days' where id=fid;return code;
end$$;
-- Serialize management changes per family. Re-check authority after taking lock.
create or replace function public.gt_manage_member(fid uuid,member_id uuid,member_action text) returns void language plpgsql security definer set search_path='' as $$declare actor text;target text;begin
 perform 1 from public.gt_families where id=fid for update;
 select role into actor from public.gt_members where family_id=fid and user_id=auth.uid();
 select role into target from public.gt_members where family_id=fid and user_id=member_id;
 if actor is null or target is null then raise exception 'Family access required';end if;
 if member_action='leave' then
  if member_id<>auth.uid() then raise exception 'You can only leave for yourself';end if;
  if actor='owner' then raise exception 'Transfer ownership before leaving';end if;
  delete from public.gt_members where family_id=fid and user_id=auth.uid();return;
 end if;
 if actor not in ('owner','admin') then raise exception 'Owner or Admin access required';end if;
 if member_id=auth.uid() then raise exception 'Use Leave family for your own membership';end if;
 if member_action='transfer' then
  if actor<>'owner' then raise exception 'Only the Owner can transfer ownership';end if;
  update public.gt_members set role='admin' where family_id=fid and user_id=auth.uid();
  update public.gt_members set role='owner' where family_id=fid and user_id=member_id;
  update public.gt_families set created_by=member_id where id=fid;return;
 end if;
 if target='owner' then raise exception 'The Owner cannot be removed or demoted';end if;
 if actor='admin' and target<>'member' then raise exception 'Only the Owner can manage Admins';end if;
 if member_action in ('admin','member') then
  if actor<>'owner' then raise exception 'Only the Owner can change roles';end if;
  update public.gt_members set role=member_action where family_id=fid and user_id=member_id;
 elsif member_action='remove' then
  delete from public.gt_members where family_id=fid and user_id=member_id;
  -- Also invalidate any still-circulating code when removing access.
  update public.gt_families set invite_expires_at=now() where id=fid;
 else raise exception 'Unknown membership action';end if;
end$$;
revoke all on function public.gt_require_manager(uuid),public.gt_family_context(),public.gt_set_display_name(text),public.gt_preview_invite(text),public.gt_manage_member(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.gt_family_context(),public.gt_set_display_name(text),public.gt_preview_invite(text),public.gt_manage_member(uuid,uuid,text) to authenticated;
-- Existing function signatures retain their prior authenticated grants.
commit;
