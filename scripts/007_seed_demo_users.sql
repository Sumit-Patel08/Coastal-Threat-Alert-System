-- Seed demo users for each role-based dashboard.
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Safe to re-run: existing demo emails are skipped.

-- Ensure new-user profiles use a valid default role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, organization, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', null),
    coalesce(new.raw_user_meta_data ->> 'last_name', null),
    coalesce(new.raw_user_meta_data ->> 'organization', null),
    coalesce(new.raw_user_meta_data ->> 'role', 'fisherfolk')
  )
  on conflict (id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    organization = excluded.organization,
    role = excluded.role;

  return new;
end;
$$;

create extension if not exists pgcrypto;

do $$
declare
  demo_password text := 'demo123';
  demo_users jsonb := '[
    {
      "email": "disaster@demo.com",
      "first_name": "Demo",
      "last_name": "Disaster",
      "organization": "State Disaster Management Authority",
      "role": "disaster_management"
    },
    {
      "email": "government@demo.com",
      "first_name": "Demo",
      "last_name": "Government",
      "organization": "Coastal City Municipal Corporation",
      "role": "coastal_government"
    },
    {
      "email": "ngo@demo.com",
      "first_name": "Demo",
      "last_name": "NGO",
      "organization": "Blue Coast Environmental Trust",
      "role": "environmental_ngo"
    },
    {
      "email": "fisher@demo.com",
      "first_name": "Demo",
      "last_name": "Fisher",
      "organization": "Coastal Fishing Cooperative",
      "role": "fisherfolk"
    },
    {
      "email": "defence@demo.com",
      "first_name": "Demo",
      "last_name": "Defence",
      "organization": "Civil Defence Response Unit",
      "role": "civil_defence"
    }
  ]'::jsonb;
  demo_user jsonb;
  new_user_id uuid;
  encrypted_pw text;
begin
  encrypted_pw := crypt(demo_password, gen_salt('bf'));

  for demo_user in select * from jsonb_array_elements(demo_users)
  loop
    -- Skip if this demo email already exists
    select id into new_user_id
    from auth.users
    where email = demo_user ->> 'email'
    limit 1;

    if new_user_id is null then
      new_user_id := gen_random_uuid();

      insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) values (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        demo_user ->> 'email',
        encrypted_pw,
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object(
          'first_name', demo_user ->> 'first_name',
          'last_name', demo_user ->> 'last_name',
          'organization', demo_user ->> 'organization',
          'role', demo_user ->> 'role'
        ),
        now(),
        now(),
        '',
        '',
        '',
        ''
      );

      insert into auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) values (
        gen_random_uuid(),
        new_user_id,
        jsonb_build_object(
          'sub', new_user_id::text,
          'email', demo_user ->> 'email',
          'email_verified', true,
          'phone_verified', false
        ),
        'email',
        new_user_id::text,
        now(),
        now(),
        now()
      );
    else
      -- Keep password and role in sync for existing demo accounts
      update auth.users
      set
        encrypted_password = encrypted_pw,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_user_meta_data = jsonb_build_object(
          'first_name', demo_user ->> 'first_name',
          'last_name', demo_user ->> 'last_name',
          'organization', demo_user ->> 'organization',
          'role', demo_user ->> 'role'
        ),
        updated_at = now()
      where id = new_user_id;
    end if;

    insert into public.profiles (id, first_name, last_name, organization, role)
    values (
      new_user_id,
      demo_user ->> 'first_name',
      demo_user ->> 'last_name',
      demo_user ->> 'organization',
      demo_user ->> 'role'
    )
    on conflict (id) do update set
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      organization = excluded.organization,
      role = excluded.role;

    new_user_id := null;
  end loop;
end $$;
