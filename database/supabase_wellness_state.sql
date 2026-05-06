create table if not exists public.wellness_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  points integer not null default 840,
  streak_days integer not null default 6,
  completed_missions text[] not null default '{}',
  reminders jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.wellness_state enable row level security;

create policy if not exists "Users can read own wellness state"
on public.wellness_state
for select
using (auth.uid() = user_id);

create policy if not exists "Users can insert own wellness state"
on public.wellness_state
for insert
with check (auth.uid() = user_id);

create policy if not exists "Users can update own wellness state"
on public.wellness_state
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
