-- QDU Street Law Club production security.
-- Safe to run more than once. Does not drop tables, columns, or rows.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.user_roles
      where id = auth.uid()
        and role = 'admin'
    );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.user_roles enable row level security;

drop policy if exists "users read own role" on public.user_roles;
create policy "users read own role"
on public.user_roles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "role reads stay personal" on public.user_roles;
create policy "role reads stay personal"
on public.user_roles
as restrictive
for select
to anon, authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "role inserts require admin" on public.user_roles;
create policy "role inserts require admin"
on public.user_roles
as restrictive
for insert
to anon, authenticated
with check (public.is_admin());

drop policy if exists "role updates require admin" on public.user_roles;
create policy "role updates require admin"
on public.user_roles
as restrictive
for update
to anon, authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "role deletes require admin" on public.user_roles;
create policy "role deletes require admin"
on public.user_roles
as restrictive
for delete
to anon, authenticated
using (public.is_admin());

create or replace function public.grade_published_test(p_test_id uuid, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_key text;
  v_question uuid;
  v_option uuid;
  v_seen_questions uuid[] := '{}';
  v_seen_options uuid[] := '{}';
  v_score integer := 0;
  v_total integer := 0;
  v_results jsonb := '[]'::jsonb;
  v_correct boolean;
begin
  if p_test_id is null
     or p_answers is null
     or jsonb_typeof(p_answers) <> 'array'
     or jsonb_array_length(p_answers) > 100 then
    return jsonb_build_object('ok', false, 'error', 'Test javoblari noto''g''ri yuborildi.');
  end if;

  if not exists (
    select 1
    from public.tests
    where id = p_test_id
      and is_published is true
  ) then
    return jsonb_build_object('ok', false, 'error', 'Test topilmadi yoki nashr qilinmagan.');
  end if;

  select count(*) into v_total
  from public.test_questions
  where test_id = p_test_id;

  if v_total = 0 then
    return jsonb_build_object('ok', false, 'error', 'Bu testda savol yo''q.');
  end if;

  if jsonb_array_length(p_answers) <> v_total then
    return jsonb_build_object('ok', false, 'error', 'Barcha savollarga javob bering.');
  end if;

  for v_item in select value from jsonb_array_elements(p_answers)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      return jsonb_build_object('ok', false, 'error', 'Javob formati noto''g''ri.');
    end if;

    if (select count(*) from jsonb_object_keys(v_item)) <> 2 then
      return jsonb_build_object('ok', false, 'error', 'Javob formati noto''g''ri.');
    end if;

    for v_key in select jsonb_object_keys(v_item)
    loop
      if v_key not in ('questionId', 'optionId') then
        return jsonb_build_object('ok', false, 'error', 'Javob formati noto''g''ri.');
      end if;
    end loop;

    if jsonb_typeof(v_item -> 'questionId') <> 'string'
       or jsonb_typeof(v_item -> 'optionId') <> 'string' then
      return jsonb_build_object('ok', false, 'error', 'Javob identifikatori noto''g''ri.');
    end if;

    begin
      v_question := (v_item ->> 'questionId')::uuid;
      v_option := (v_item ->> 'optionId')::uuid;
    exception
      when invalid_text_representation then
        return jsonb_build_object('ok', false, 'error', 'Javob identifikatori noto''g''ri.');
    end;

    if v_question is null or v_option is null then
      return jsonb_build_object('ok', false, 'error', 'Javob identifikatori noto''g''ri.');
    end if;

    if v_question = any (v_seen_questions) then
      return jsonb_build_object('ok', false, 'error', 'Bir savolga faqat bitta javob yuboring.');
    end if;

    if v_option = any (v_seen_options) then
      return jsonb_build_object('ok', false, 'error', 'Bir variantni qayta yuborib bo''lmaydi.');
    end if;

    v_seen_questions := v_seen_questions || v_question;
    v_seen_options := v_seen_options || v_option;

    if not exists (
      select 1
      from public.test_questions
      where id = v_question
        and test_id = p_test_id
    ) then
      return jsonb_build_object('ok', false, 'error', 'Savol bu testga tegishli emas.');
    end if;

    if not exists (
      select 1
      from public.test_options
      where id = v_option
        and question_id = v_question
    ) then
      return jsonb_build_object('ok', false, 'error', 'Tanlangan variant topilmadi.');
    end if;

    select is_correct is true
    into v_correct
    from public.test_options
    where id = v_option
      and question_id = v_question;

    if v_correct then
      v_score := v_score + 1;
    end if;

    v_results := v_results || jsonb_build_array(
      jsonb_build_object('questionId', v_question, 'correct', coalesce(v_correct, false))
    );
  end loop;

  if coalesce(array_length(v_seen_questions, 1), 0) <> v_total then
    return jsonb_build_object('ok', false, 'error', 'Barcha savollarga javob bering.');
  end if;

  return jsonb_build_object(
    'ok', true,
    'score', v_score,
    'total', v_total,
    'results', v_results
  );
end;
$$;

revoke all on function public.grade_published_test(uuid, jsonb) from public;
grant execute on function public.grade_published_test(uuid, jsonb) to anon, authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.is_admin() to service_role;
    grant execute on function public.grade_published_test(uuid, jsonb) to service_role;
  end if;
end $$;

revoke select on table public.test_options from public, anon, authenticated;
grant select (id, question_id, option_text) on table public.test_options to anon, authenticated;
grant select (is_correct) on table public.test_options to authenticated;

drop policy if exists "admins read test options" on public.test_options;
create policy "admins read test options"
on public.test_options
for select
to authenticated
using (public.is_admin());

drop policy if exists "authenticated quiz answers require admin" on public.test_options;
create policy "authenticated quiz answers require admin"
on public.test_options
as restrictive
for select
to authenticated
using (public.is_admin());

drop policy if exists "quiz option inserts require admin" on public.test_options;
create policy "quiz option inserts require admin"
on public.test_options
as restrictive
for insert
to anon, authenticated
with check (public.is_admin());

drop policy if exists "quiz option updates require admin" on public.test_options;
create policy "quiz option updates require admin"
on public.test_options
as restrictive
for update
to anon, authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "quiz option deletes require admin" on public.test_options;
create policy "quiz option deletes require admin"
on public.test_options
as restrictive
for delete
to anon, authenticated
using (public.is_admin());

alter table public.test_questions enable row level security;
alter table public.test_options enable row level security;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'test_questions'
      and upper(permissive::text) in ('RESTRICTIVE', 'FALSE')
      and upper(cmd) in ('SELECT', 'ALL')
  loop
    execute format('drop policy %I on public.test_questions', policy_row.policyname);
  end loop;

  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'test_options'
      and upper(permissive::text) in ('RESTRICTIVE', 'FALSE')
      and upper(cmd) in ('SELECT', 'ALL')
      and (
        roles::text ilike '%anon%'
        or roles::text ilike '%public%'
      )
  loop
    execute format('drop policy %I on public.test_options', policy_row.policyname);
  end loop;
end $$;

grant select on table public.test_questions to anon, authenticated;

drop policy if exists "public read published questions" on public.test_questions;
create policy "public read published questions"
on public.test_questions
for select
to anon, authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.tests
    where id = test_questions.test_id
      and is_published is true
  )
);

drop policy if exists "question inserts require admin" on public.test_questions;
create policy "question inserts require admin"
on public.test_questions
as restrictive
for insert
to anon, authenticated
with check (public.is_admin());

drop policy if exists "question updates require admin" on public.test_questions;
create policy "question updates require admin"
on public.test_questions
as restrictive
for update
to anon, authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "question deletes require admin" on public.test_questions;
create policy "question deletes require admin"
on public.test_questions
as restrictive
for delete
to anon, authenticated
using (public.is_admin());

drop policy if exists "public read published options" on public.test_options;
create policy "public read published options"
on public.test_options
for select
to anon
using (
  exists (
    select 1
    from public.test_questions
    join public.tests on tests.id = test_questions.test_id
    where test_questions.id = test_options.question_id
      and tests.is_published is true
  )
);

create or replace function public.published_quizzes()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(quiz order by created_at desc), '[]'::jsonb)
  from (
    select
      t.created_at,
      jsonb_build_object(
        'id', t.id,
        'title', t.title,
        'description', t.description,
        'category', t.category,
        'created_at', t.created_at,
        'questions', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'id', q.id,
              'question', q.question,
              'created_at', q.created_at,
              'options', coalesce((
                select jsonb_agg(
                  jsonb_build_object('id', o.id, 'option_text', o.option_text)
                  order by o.id
                )
                from public.test_options o
                where o.question_id = q.id
              ), '[]'::jsonb)
            )
            order by q.created_at, q.id
          )
          from public.test_questions q
          where q.test_id = t.id
        ), '[]'::jsonb)
      ) as quiz
    from public.tests t
    where t.is_published is true
  ) published;
$$;

revoke all on function public.published_quizzes() from public;
grant execute on function public.published_quizzes() to anon, authenticated;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.published_quizzes() to service_role;
  end if;
end $$;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'membership_applications'
      and upper(permissive::text) in ('RESTRICTIVE', 'FALSE')
      and upper(cmd) in ('INSERT', 'ALL')
  loop
    execute format('drop policy %I on public.membership_applications', policy_row.policyname);
  end loop;
end $$;

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

drop policy if exists "applications must stay pending" on public.membership_applications;
create policy "applications must stay pending"
on public.membership_applications
as restrictive
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

drop policy if exists "no public read of applications" on public.membership_applications;
create policy "no public read of applications"
on public.membership_applications
as restrictive
for select
to anon
using (false);

drop policy if exists "anon cannot update applications" on public.membership_applications;
create policy "anon cannot update applications"
on public.membership_applications
as restrictive
for update
to anon
using (false);

drop policy if exists "anon cannot delete applications" on public.membership_applications;
create policy "anon cannot delete applications"
on public.membership_applications
as restrictive
for delete
to anon
using (false);

drop policy if exists "application reads require admin" on public.membership_applications;
create policy "application reads require admin"
on public.membership_applications
as restrictive
for select
to authenticated
using (public.is_admin());

drop policy if exists "application updates require admin" on public.membership_applications;
create policy "application updates require admin"
on public.membership_applications
as restrictive
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "application deletes require admin" on public.membership_applications;
create policy "application deletes require admin"
on public.membership_applications
as restrictive
for delete
to authenticated
using (public.is_admin());

grant insert on public.membership_applications to anon, authenticated;

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

drop policy if exists "public read street law media" on storage.objects;
create policy "public read street law media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'street-law-media');

drop policy if exists "admins insert street law media" on storage.objects;
create policy "admins insert street law media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'street-law-media' and public.is_admin());

drop policy if exists "admins update street law media" on storage.objects;
create policy "admins update street law media"
on storage.objects
for update
to authenticated
using (bucket_id = 'street-law-media' and public.is_admin())
with check (bucket_id = 'street-law-media' and public.is_admin());

drop policy if exists "admins delete street law media" on storage.objects;
create policy "admins delete street law media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'street-law-media' and public.is_admin());

drop policy if exists "street law media inserts require admin" on storage.objects;
create policy "street law media inserts require admin"
on storage.objects
as restrictive
for insert
to public
with check (bucket_id is distinct from 'street-law-media' or public.is_admin());

drop policy if exists "street law media updates require admin" on storage.objects;
create policy "street law media updates require admin"
on storage.objects
as restrictive
for update
to public
using (bucket_id is distinct from 'street-law-media' or public.is_admin())
with check (bucket_id is distinct from 'street-law-media' or public.is_admin());

drop policy if exists "street law media deletes require admin" on storage.objects;
create policy "street law media deletes require admin"
on storage.objects
as restrictive
for delete
to public
using (bucket_id is distinct from 'street-law-media' or public.is_admin());

notify pgrst, 'reload schema';
