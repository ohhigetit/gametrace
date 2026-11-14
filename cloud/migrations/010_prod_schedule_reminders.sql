-- The production notification sender accepts requests signed by this job only.
begin;
create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists public.gt_prod_reminder_devices (
 device_id uuid primary key,
 user_id uuid not null,
 family_id uuid not null references public.gt_families(id),
 subscription jsonb not null
);
create table if not exists public.gt_prod_reminder_deliveries (
 device_id uuid not null references public.gt_prod_reminder_devices(device_id) on delete cascade,
 event_id text not null,
 starts_at timestamptz not null,
 minutes integer not null,
 primary key(device_id,event_id,starts_at,minutes)
);
alter table public.gt_prod_reminder_devices enable row level security;
alter table public.gt_prod_reminder_deliveries enable row level security;
revoke all on public.gt_prod_reminder_devices, public.gt_prod_reminder_deliveries from public, anon, authenticated;

create or replace function public.gt_prod_set_reminders(device uuid, family uuid, push jsonb)
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in to Family Cloud.'; end if;
 if push is null then
   delete from public.gt_prod_reminder_devices where device_id=device and user_id=auth.uid();
   return;
 end if;
 if not public.gt_is_member(family) or family is null then raise exception 'Family access required.'; end if;
 if length(push::text)>2048 or coalesce(push->>'endpoint','') !~ '^https://([a-z0-9-]+\.)*push\.apple\.com/' then
   raise exception 'Invalid iPhone subscription.';
 end if;
 insert into public.gt_prod_reminder_devices values(device,auth.uid(),family,push)
 on conflict(device_id) do update set family_id=excluded.family_id,subscription=excluded.subscription
 where gt_prod_reminder_devices.user_id=auth.uid();
 if not found then raise exception 'Device belongs to another account.'; end if;
end;
$$;
revoke all on function public.gt_prod_set_reminders(uuid,uuid,jsonb) from public,anon;
grant execute on function public.gt_prod_set_reminders(uuid,uuid,jsonb) to authenticated;

create or replace function public.gt_prod_dispatch_reminders()
returns void language plpgsql security definer set search_path='' as $$
declare
 secret text;
 due record;
begin
 select decrypted_secret into secret from vault.decrypted_secrets where name='gametrace_prod_reminder_job' limit 1;
 if secret is null then return; end if;
 delete from public.gt_prod_reminder_deliveries where starts_at < now()-interval '7 days';
 for due in
   select d.device_id,d.subscription,r.record_id,r.payload, moment.starts_at, offsets.minutes
   from public.gt_prod_reminder_devices d
   join public.gt_members m on m.family_id=d.family_id and m.user_id=d.user_id
   join public.gt_records r on r.family_id=d.family_id and r.kind='personal'
   cross join lateral (select case when pg_input_is_valid(r.payload->>'start','timestamp with time zone')
     then (r.payload->>'start')::timestamptz end as starts_at) moment
   cross join (values (45),(30),(15)) offsets(minutes)
   where r.payload->>'type'='schedule' and r.payload->>'deletedAt' is null
     and r.payload->>'cancelledAt' is null and coalesce(r.payload->>'allDay','false') <> 'true'
     and coalesce(r.payload->>'status','') not in ('cancelled','canceled')
     and moment.starts_at-make_interval(mins=>offsets.minutes)<=now()
     and moment.starts_at-make_interval(mins=>offsets.minutes)>now()-interval '75 seconds'
 loop
   insert into public.gt_prod_reminder_deliveries values(due.device_id,due.record_id,due.starts_at,due.minutes)
   on conflict do nothing;
   if found then
     perform net.http_post(
       url:='https://game-trace.netlify.app/.netlify/functions/schedule-reminder',
       headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||secret),
       body:=jsonb_build_object('subscription',due.subscription,'id',due.record_id,'minutes',due.minutes,
         'title',left(due.payload->>'title',120),'startsAt',due.starts_at,'venue',left(due.payload->>'location',100)),
       timeout_milliseconds:=10000);
   end if;
 end loop;
end;
$$;
revoke all on function public.gt_prod_dispatch_reminders() from public,anon,authenticated;
-- Activate after verifying the production sender has both credentials.
-- select cron.schedule('gametrace-prod-schedule-reminders','* * * * *','select public.gt_prod_dispatch_reminders()');
commit;
