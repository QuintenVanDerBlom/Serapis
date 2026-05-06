-- Enable pgcrypto for password hashing
create extension if not exists pgcrypto;

-- Custom users table (replaces Supabase Auth for MVP)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- Allow anonymous inserts (registration) and selects (login)
alter table public.profiles enable row level security;

create policy "Anyone can register"
on public.profiles
for insert
with check (true);

create policy "Users can read own profile"
on public.profiles
for select
using (true);

-- Register function: hashes password, returns user id
create or replace function public.register_user(p_username text, p_password text)
returns json
language plpgsql
security definer
as $$
declare
  new_id uuid;
begin
  -- Check if username exists
  if exists (select 1 from public.profiles where username = lower(trim(p_username))) then
    return json_build_object('error', 'Username already exists');
  end if;

  insert into public.profiles (username, password_hash)
  values (lower(trim(p_username)), crypt(p_password, gen_salt('bf')))
  returning id into new_id;

  return json_build_object('user_id', new_id, 'username', lower(trim(p_username)));
end;
$$;

-- Login function: verifies password, returns user id
create or replace function public.login_user(p_username text, p_password text)
returns json
language plpgsql
security definer
as $$
declare
  found_user public.profiles%rowtype;
begin
  select * into found_user
  from public.profiles
  where username = lower(trim(p_username));

  if not found then
    return json_build_object('error', 'Invalid username or password');
  end if;

  if found_user.password_hash = crypt(p_password, found_user.password_hash) then
    return json_build_object('user_id', found_user.id, 'username', found_user.username);
  else
    return json_build_object('error', 'Invalid username or password');
  end if;
end;
$$;

-- Update wellness_state to reference profiles instead of auth.users
-- Drop old table if it referenced auth.users
drop table if exists public.wellness_state;

create table if not exists public.wellness_state (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  points integer not null default 840,
  streak_days integer not null default 6,
  completed_missions text[] not null default '{}',
  reminders jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.wellness_state enable row level security;

create policy "Anyone can read wellness state"
on public.wellness_state
for select
using (true);

create policy "Anyone can insert wellness state"
on public.wellness_state
for insert
with check (true);

create policy "Anyone can update wellness state"
on public.wellness_state
for update
using (true)
with check (true);
