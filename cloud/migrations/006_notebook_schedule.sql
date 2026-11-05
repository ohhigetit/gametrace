-- V37 Notebook/Schedule. Apply after 005. No reset or deletion.
-- GameTrace V31. Apply after 002. Includes 003/004. Installs reset support; does not reset any data.
begin;
alter table public.gt_records drop constraint if exists gt_records_kind_check;
alter table public.gt_records add constraint gt_records_kind_check
 check(kind in ('game','session','clip','goal','goal_order','trophy_definition','family_award','journey_reset','personal'));
create or replace function public.gt_save_record(fid uuid,record_kind text,rid text,body jsonb,expected_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$declare r public.gt_records;d public.gt_records;actor_name text;reset_time timestamptz;begin
if not public.gt_is_member(fid) then raise exception 'Family access required';end if;
if record_kind not in ('game','session','clip','goal','goal_order','trophy_definition','family_award','personal') or rid is null or length(rid) not between 1 and 120 or body is null or jsonb_typeof(body) <> 'object' or body->>'id' is distinct from rid then raise exception 'Invalid record';end if;
if record_kind='personal' and (coalesce(body->>'type','') not in ('prayer','commitment','schedule') or length(trim(coalesce(body->>'player',''))) not between 1 and 100 or length(coalesce(body->>'body',''))>6000) then raise exception 'Invalid Notebook/Schedule record';end if;
if record_kind in ('trophy_definition','family_award') then perform public.gt_require_manager(fid);end if;
perform pg_advisory_xact_lock(hashtextextended('gt-family-write:'||fid::text,0));
perform pg_advisory_xact_lock(hashtextextended(fid::text||record_kind||rid,0));
select * into r from public.gt_records where family_id=fid and kind=record_kind and record_id=rid for update;
if coalesce(r.version,0)<>expected_version then return jsonb_build_object('conflict',true,'record',to_jsonb(r));end if;
if record_kind='session' then
 select max((payload->>'cutoff')::timestamptz) into reset_time from public.gt_records where family_id=fid and kind='journey_reset';
 if reset_time is not null and (body->>'createdAt')::timestamptz<=reset_time then body:=body||jsonb_build_object('deletedAt',reset_time,'updatedAt',reset_time);end if;
end if;
if record_kind in ('trophy_definition','family_award') then
 perform public.gt_require_manager(fid);
 select coalesce(nullif(trim(display_name),''),'Family admin') into actor_name from public.gt_profiles where user_id=auth.uid();
 actor_name:=coalesce(actor_name,'Family admin');
 if record_kind='trophy_definition' then
  if length(trim(coalesce(body->>'name',''))) not between 1 and 100 or length(coalesce(body->>'description',''))>500 then raise exception 'Invalid trophy definition';end if;
  body:=jsonb_build_object('id',rid,'familyId',fid,'name',trim(body->>'name'),'description',coalesce(body->>'description',''),'createdBy',coalesce(r.payload->>'createdBy',auth.uid()::text),'createdByName',coalesce(r.payload->>'createdByName',actor_name),'createdAt',coalesce(r.payload->>'createdAt',now()::text),'updatedAt',now(),'deletedAt',case when body->>'deletedAt' is null then null else now() end);
 else
  if r.version is null then
   select * into d from public.gt_records where family_id=fid and kind='trophy_definition' and record_id=body->>'definitionId';
   if d.version is null or d.payload->>'deletedAt' is not null then raise exception 'Trophy definition unavailable';end if;
   if length(trim(coalesce(body->>'player',''))) not between 1 and 100 or length(trim(coalesce(body->>'reason',''))) not between 1 and 1000 then raise exception 'Player and award reason required';end if;
   body:=jsonb_build_object('id',rid,'familyId',fid,'definitionId',d.record_id,'name',d.payload->>'name','player',trim(body->>'player'),'reason',trim(body->>'reason'),'awardedBy',auth.uid(),'awardedByName',actor_name,'awardedAt',now(),'revokedAt',null,'revokedBy',null);
  else
   if body->>'revokedAt' is null or r.payload->>'revokedAt' is not null then raise exception 'An issued award can only be revoked once';end if;
   body:=r.payload||jsonb_build_object('revokedAt',now(),'revokedBy',auth.uid());
  end if;
 end if;
end if;
if r.version is not null then insert into public.gt_history(family_id,kind,record_id,payload,version,updated_by,updated_at) values(r.family_id,r.kind,r.record_id,r.payload,r.version,r.updated_by,r.updated_at);end if;
insert into public.gt_records values(fid,record_kind,rid,body,coalesce(r.version,0)+1,auth.uid(),now()) on conflict(family_id,kind,record_id) do update set payload=excluded.payload,version=excluded.version,updated_by=excluded.updated_by,updated_at=excluded.updated_at returning * into r;
return jsonb_build_object('conflict',false,'record',to_jsonb(r));end$$;
create or replace function public.gt_cloud_features() returns jsonb language sql stable security definer set search_path='' as $$select jsonb_build_object('version',6)$$;
revoke all on function public.gt_cloud_features() from public,anon;
grant execute on function public.gt_cloud_features() to authenticated;

create or replace function public.gt_reset_training_journey(fid uuid,request_id text) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.gt_records;marker public.gt_records;stamp timestamptz;ns integer:=0;na integer:=0;rows jsonb:='[]'::jsonb;next_body jsonb;
begin
 perform public.gt_require_manager(fid);
 if request_id is null or length(request_id) not between 1 and 120 then raise exception 'Invalid reset request';end if;
 perform pg_advisory_xact_lock(hashtextextended('gt-family-write:'||fid::text,0));
 select * into marker from public.gt_records where family_id=fid and kind='journey_reset' and record_id=request_id;
 if marker.version is not null then return jsonb_build_object('records',jsonb_build_array(to_jsonb(marker)),'already_applied',true);end if;
 stamp:=clock_timestamp();
 for r in select * from public.gt_records where family_id=fid and ((kind='session' and payload->>'deletedAt' is null) or (kind='family_award' and payload->>'revokedAt' is null)) for update loop
  insert into public.gt_history(family_id,kind,record_id,payload,version,updated_by,updated_at) values(r.family_id,r.kind,r.record_id,r.payload,r.version,r.updated_by,r.updated_at);
  if r.kind='session' then next_body:=r.payload||jsonb_build_object('deletedAt',stamp,'updatedAt',stamp);ns:=ns+1;
  else next_body:=r.payload||jsonb_build_object('revokedAt',stamp,'revokedBy',auth.uid());na:=na+1;end if;
  update public.gt_records set payload=next_body,version=version+1,updated_by=auth.uid(),updated_at=stamp where family_id=fid and kind=r.kind and record_id=r.record_id returning * into r;
  rows:=rows||jsonb_build_array(to_jsonb(r));
 end loop;
 insert into public.gt_records(family_id,kind,record_id,payload,version,updated_by,updated_at) values(fid,'journey_reset',request_id,jsonb_build_object('id',request_id,'familyId',fid,'cutoff',stamp,'createdBy',auth.uid(),'trainingCount',ns,'awardCount',na),1,auth.uid(),stamp) returning * into marker;
 return jsonb_build_object('records',rows||jsonb_build_array(to_jsonb(marker)),'already_applied',false);
end$$;
revoke all on function public.gt_reset_training_journey(uuid,text) from public,anon;
grant execute on function public.gt_reset_training_journey(uuid,text) to authenticated;
commit;
