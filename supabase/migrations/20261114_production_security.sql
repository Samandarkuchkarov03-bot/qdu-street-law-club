-- QDU Street Law Club
-- Run once in the Supabase SQL Editor.
-- Safe to run again. Does not drop tables, columns, or existing rows.
-- Does not grant anonymous uploads or anonymous reads of correct quiz answers.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.grade_published_test(p_test_id uuid, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_question uuid;
  v_option uuid;
  v_answer jsonb;
  v_score integer := 0;
  v_total integer := 0;
  v_picks jsonb := '{}'::jsonb;
  v_correct jsonb := '[]'::jsonb;
begin
  if p_test_id is null or jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) > 100 then
    return jsonb_build_object('ok', false, 'error', 'Test javoblari noto''g''ri yuborildi.');
  end if;

  if not exists (
    select 1 from public.tests
    where id = p_test_id and is_published is true
  ) then
    return jsonb_build_object('ok', false, 'error', 'Test topilmadi yoki nashr qilinmagan.');
  end if;

  select count(*) into v_total
  from public.test_questions
  where test_id = p_test_id;

  if v_total = 0 then
    return jsonb_build_object('ok', false, 'error', 'Bu testda savol yo''q.');
  end if;

  for v_answer in select value from jsonb_array_elements(p_answers)
  loop
    begin
      v_question := (v_answer ->> 'questionId')::uuid;
      v_option := (v_answer ->> 'optionId')::uuid;
    exception when others then
      return jsonb_build_object('ok', false, 'error', 'Javob identifikatori noto''g''ri.');
    end;

    if not exists (
      select 1 from public.test_questions
      where id = v_question and test_id = p_test_id
    ) then
      return jsonb_build_object('ok', false, 'error', 'Savol bu testga tegishli emas.');
    end if;

    v_picks := v_picks || jsonb_build_object(v_question::text, v_option::text);
  end loop;

  if (select count(*) from jsonb_object_keys(v_picks)) <> v_total then
    return jsonb_build_object('ok', false, 'error', 'Barcha savollarga javob bering.');
  end if;

  for v_question, v_option in
    select key::uuid, value::uuid
    from jsonb_each_text(v_picks)
  loop
    if not exists (
      select 1 from public.test_options
      where id = v_option and question_id = v_question
    ) then
      return jsonb_build_object('ok', false, 'error', 'Tanlangan variant topilmadi.');
    end if;

    if exists (
      select 1 from public.test_options
      where id = v_option and question_id = v_question and is_correct is true
    ) then
      v_score := v_score + 1;
    end if;
  end loop;

  select coalesce(jsonb_agg(id), '[]'::jsonb)
  into v_correct
  from public.test_options
  where question_id in (select id from public.test_questions where test_id = p_test_id)
    and is_correct is true;

  return jsonb_build_object(
    'ok', true,
    'score', v_score,
    'total', v_total,
    'correctOptionIds', v_correct
  );
end;
$$;

revoke all on function public.grade_published_test(uuid, jsonb) from public;
grant execute on function public.grade_published_test(uuid, jsonb) to anon, authenticated;

revoke select (is_correct) on table public.test_options from anon;

drop policy if exists "authenticated quiz answers require admin" on public.test_options;
create policy "authenticated quiz answers require admin"
on public.test_options
as restrictive
for select
to authenticated
using (public.is_admin());

drop policy if exists "no public read of applications" on public.membership_applications;
create policy "no public read of applications"
on public.membership_applications
as restrictive
for select
to anon
using (false);

drop policy if exists "public can submit pending applications" on public.membership_applications;
create policy "public can submit pending applications"
on public.membership_applications
for insert
to anon, authenticated
with check (
  status = 'pending'
  and char_length(btrim(full_name)) between 2 and 140
  and char_length(btrim(email)) between 5 and 160
  and position('@' in email) > 1
  and course between 1 and 5
  and char_length(btrim(coalesce(phone, ''))) between 9 and 20
  and char_length(btrim(coalesce(faculty, ''))) between 2 and 120
  and char_length(btrim(motivation)) between 20 and 2000
);

create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  email text,
  telegram text,
  phone text,
  address text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id, address)
values (1, 'Nukus, Qoraqalpog''iston Respublikasi')
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "public read site settings" on public.site_settings;
create policy "public read site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "admins insert site settings" on public.site_settings;
create policy "admins insert site settings"
on public.site_settings
for insert
to authenticated
with check (public.is_admin() and id = 1);

drop policy if exists "admins update site settings" on public.site_settings;
create policy "admins update site settings"
on public.site_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin() and id = 1);

grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'admins insert street law media'
  ) then
    create policy "admins insert street law media"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'street-law-media' and public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'admins update street law media'
  ) then
    create policy "admins update street law media"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'street-law-media' and public.is_admin())
    with check (bucket_id = 'street-law-media' and public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'admins delete street law media'
  ) then
    create policy "admins delete street law media"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'street-law-media' and public.is_admin());
  end if;
end $$;
