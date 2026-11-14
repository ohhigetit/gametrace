-- Installs live controller protection and Realtime on the existing Family Cloud table.
begin;

create table if not exists public.gt_live_controllers (
  family_id uuid not null references public.gt_families(id),
  record_id text not null,
  user_id uuid not null,
  device_key uuid not null,
  primary key (family_id, record_id)
);
alter table public.gt_live_controllers enable row level security;
revoke all on public.gt_live_controllers from public, anon, authenticated;

-- The trigger also covers older clients calling the original save RPC.
create or replace function public.gt_guard_live_controller()
returns trigger language plpgsql security definer set search_path='' as $$
declare
  controller public.gt_live_controllers;
  device_key text := nullif(current_setting('gametrace.live_device', true), '');
  was_live boolean := (tg_op = 'UPDATE' and old.payload->>'status' = 'in_progress'
                       and old.payload->>'deletedAt' is null) is true;
  is_live boolean := (new.payload->>'status' = 'in_progress'
                      and new.payload->>'deletedAt' is null) is true;
begin
  if new.kind <> 'game' or not (was_live or is_live) then return new; end if;

  select * into controller from public.gt_live_controllers
    where family_id = new.family_id and record_id = new.record_id;

  if controller.user_id is not null then
    if controller.user_id is distinct from auth.uid()
       or controller.device_key::text is distinct from device_key then
      raise exception 'This live game is controlled by another device' using errcode = '42501';
    end if;
  elsif device_key is not null then
    -- For an already-running legacy game, only its last writer can first claim it.
    if was_live and old.updated_by is distinct from auth.uid() then
      raise exception 'This live game is controlled by another device' using errcode = '42501';
    end if;
    if is_live then
      insert into public.gt_live_controllers(family_id, record_id, user_id, device_key)
        values (new.family_id, new.record_id, auth.uid(), device_key::uuid);
    end if;
  elsif was_live and old.updated_by is distinct from auth.uid() then
    raise exception 'This live game is controlled by another device' using errcode = '42501';
  end if;

  if was_live and not is_live then
    delete from public.gt_live_controllers
      where family_id = new.family_id and record_id = new.record_id;
  end if;
  return new;
end;
$$;

-- An AFTER trigger runs once for INSERT ... ON CONFLICT DO UPDATE.
drop trigger if exists gt_live_controller_guard on public.gt_records;
create trigger gt_live_controller_guard after insert or update on public.gt_records
for each row execute function public.gt_guard_live_controller();

create or replace function public.gt_save_live_game(
  fid uuid, rid text, body jsonb, expected_version bigint, controller_key uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
begin
  if controller_key is null then raise exception 'Live controller key required'; end if;
  perform set_config('gametrace.live_device', controller_key::text, true);
  return public.gt_save_record(fid, 'game', rid, body, expected_version);
end;
$$;
revoke all on function public.gt_guard_live_controller() from public, anon, authenticated;
revoke all on function public.gt_save_live_game(uuid,text,jsonb,bigint,uuid) from public, anon;
grant execute on function public.gt_save_live_game(uuid,text,jsonb,bigint,uuid) to authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'gt_records') then
    alter publication supabase_realtime add table public.gt_records;
  end if;
end;
$$;

commit;
