create table if not exists public.user_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null default 'Wellness',
  points integer not null default 40,
  due_date date,
  reminder_enabled boolean not null default true,
  completed boolean not null default false,
  completed_at timestamptz,
  last_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_monthly_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  month_key text not null,
  completed_tasks integer not null default 0,
  earned_points integer not null default 0,
  active_days integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, month_key)
);

create table if not exists public.user_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  target_points integer not null,
  achieved boolean not null default false,
  achieved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.user_tasks enable row level security;
alter table public.user_monthly_progress enable row level security;
alter table public.user_milestones enable row level security;

create policy if not exists "Anyone can read tasks"
on public.user_tasks
for select
using (true);

create policy if not exists "Anyone can insert tasks"
on public.user_tasks
for insert
with check (true);

create policy if not exists "Anyone can update tasks"
on public.user_tasks
for update
using (true)
with check (true);

create policy if not exists "Anyone can read monthly progress"
on public.user_monthly_progress
for select
using (true);

create policy if not exists "Anyone can insert monthly progress"
on public.user_monthly_progress
for insert
with check (true);

create policy if not exists "Anyone can update monthly progress"
on public.user_monthly_progress
for update
using (true)
with check (true);

create policy if not exists "Anyone can read milestones"
on public.user_milestones
for select
using (true);

create policy if not exists "Anyone can insert milestones"
on public.user_milestones
for insert
with check (true);

create policy if not exists "Anyone can update milestones"
on public.user_milestones
for update
using (true)
with check (true);

insert into public.user_tasks (user_id, title, category, points, reminder_enabled, completed)
select p.id, seeded.title, seeded.category, seeded.points, seeded.reminder_enabled, false
from public.profiles p
cross join (
  values
    ('10-minute walk', 'Movement', 45, true),
    ('Drink a glass of water', 'Hydration', 30, true),
    ('3-minute stretch break', 'Mobility', 35, true),
    ('Stand up for 2 minutes', 'Posture', 25, true),
    ('Take 6 deep breaths', 'Mindfulness', 20, false),
    ('Step outside for daylight', 'Recovery', 30, false)
) as seeded(title, category, points, reminder_enabled)
where not exists (
  select 1
  from public.user_tasks t
  where t.user_id = p.id
    and t.title = seeded.title
);
