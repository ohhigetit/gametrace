-- GameTrace V28. Apply after 002_family_workflow.sql. Preserves all family records.
begin;
alter table public.gt_records drop constraint if exists gt_records_kind_check;
alter table public.gt_records add constraint gt_records_kind_check
 check(kind in ('game','session','clip','goal','goal_order'));
create or replace function public.gt_save_record(fid uuid,record_kind text,rid text,body jsonb,expected_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$declare r public.gt_records;begin
if not public.gt_is_member(fid) then raise exception 'Family access required';end if;
if record_kind not in ('game','session','clip','goal','goal_order') or rid is null or length(rid) not between 1 and 120 or body is null or jsonb_typeof(body) <> 'object' or body->>'id' is distinct from rid then raise exception 'Invalid record';end if;
perform pg_advisory_xact_lock(hashtextextended(fid::text||record_kind||rid,0));
select * into r from public.gt_records where family_id=fid and kind=record_kind and record_id=rid for update;
if coalesce(r.version,0)<>expected_version then return jsonb_build_object('conflict',true,'record',to_jsonb(r));end if;
if r.version is not null then insert into public.gt_history(family_id,kind,record_id,payload,version,updated_by,updated_at) values(r.family_id,r.kind,r.record_id,r.payload,r.version,r.updated_by,r.updated_at);end if;
insert into public.gt_records values(fid,record_kind,rid,body,coalesce(r.version,0)+1,auth.uid(),now()) on conflict(family_id,kind,record_id) do update set payload=excluded.payload,version=excluded.version,updated_by=excluded.updated_by,updated_at=excluded.updated_at returning * into r;
return jsonb_build_object('conflict',false,'record',to_jsonb(r));end$$;
create or replace function public.gt_cloud_features() returns jsonb language sql stable security definer set search_path='' as $$select jsonb_build_object('version',3)$$;
revoke all on function public.gt_cloud_features() from public,anon;
grant execute on function public.gt_cloud_features() to authenticated;
commit;
