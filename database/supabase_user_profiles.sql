-- User profiles table for onboarding data (feelings, disabilities, preferences)
create table if not exists public.user_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  feelings text[] not null default '{}',
  disabilities jsonb not null default '{}',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notification preferences
create table if not exists public.user_notification_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  daily_reminders boolean not null default true,
  streak_alerts boolean not null default true,
  achievement_alerts boolean not null default true,
  updated_at timestamptz not null default now()
);

-- User preferences (theme, language)
create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  dark_mode boolean not null default false,
  language text not null default 'en',
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.user_profiles enable row level security;
alter table public.user_notification_settings enable row level security;
alter table public.user_preferences enable row level security;

-- RLS Policies for user_profiles
create policy "Anyone can read user_profiles"
  on public.user_profiles for select using (true);

create policy "Anyone can insert user_profiles"
  on public.user_profiles for insert with check (true);

create policy "Anyone can update user_profiles"
  on public.user_profiles for update using (true) with check (true);

-- RLS Policies for user_notification_settings
create policy "Anyone can read notification settings"
  on public.user_notification_settings for select using (true);

create policy "Anyone can insert notification settings"
  on public.user_notification_settings for insert with check (true);

create policy "Anyone can update notification settings"
  on public.user_notification_settings for update using (true) with check (true);

-- RLS Policies for user_preferences
create policy "Anyone can read preferences"
  on public.user_preferences for select using (true);

create policy "Anyone can insert preferences"
  on public.user_preferences for insert with check (true);

create policy "Anyone can update preferences"
  on public.user_preferences for update using (true) with check (true);
