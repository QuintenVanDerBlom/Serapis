-- Task catalog table (master list of all available tasks)
create table if not exists public.task_catalog (
  id text primary key,
  title text not null,
  category text not null,
  points integer not null default 20,
  feelings text[] not null default '{}',
  requires_mobility boolean not null default false,
  location text not null default 'general',
  reminder_enabled boolean not null default false,
  instructions text,
  links jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User's personalized daily tasks (instance of task_catalog for the user)
create table if not exists public.user_daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id text not null references public.task_catalog(id) on delete cascade,
  assigned_date date not null default current_date,
  completed boolean not null default false,
  completed_at timestamptz,
  reminder_enabled boolean not null default false,
  reminder_time timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, task_id, assigned_date)
);

-- Enable RLS
alter table public.task_catalog enable row level security;
alter table public.user_daily_tasks enable row level security;

-- Policies for task_catalog (read-only for users)
create policy if not exists "Anyone can read task catalog"
  on public.task_catalog for select using (true);

-- Policies for user_daily_tasks
create policy if not exists "Users can read own daily tasks"
  on public.user_daily_tasks for select using (true);

create policy if not exists "Users can insert own daily tasks"
  on public.user_daily_tasks for insert with check (true);

create policy if not exists "Users can update own daily tasks"
  on public.user_daily_tasks for update using (true) with check (true);

create policy if not exists "Users can delete own daily tasks"
  on public.user_daily_tasks for delete using (true);

-- Seed the task catalog with default tasks
insert into public.task_catalog (
  id, title, category, points, feelings, requires_mobility, location, 
  reminder_enabled, instructions, links
) values
  ('task-deep-breaths', 'Take 6 deep breaths', 'Breathing', 20, 
   array['anxiety', 'stress', 'spiralling'], false, 'general', true,
   'Find a comfortable position. Breathe in slowly through your nose for 4 seconds, feeling your belly expand. Hold for 1 second, then exhale through your mouth for 6 seconds. Repeat 6 times.',
   '[{"label": "Follow along: Deep breathing guide", "url": "https://www.youtube.com/watch?v=tEmt1Znux58", "icon": "logo-youtube"}]'),

  ('task-box-breathing', 'Box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s (3 rounds)', 'Breathing', 25,
   array['anxiety', 'stress', 'spiralling'], false, 'general', true,
   'Sit upright with feet flat on the floor. Inhale through your nose for 4 seconds. Hold your breath for 4 seconds. Exhale slowly through your mouth for 4 seconds. Hold empty for 4 seconds.',
   '[{"label": "Follow along: Box breathing tutorial", "url": "https://www.youtube.com/watch?v=FJJazKtH_9I", "icon": "logo-youtube"}]'),

  ('task-grounding-5', 'Name 5 things you can see right now', 'Grounding', 15,
   array['spiralling', 'anxiety'], false, 'general', false,
   'Look around you and notice 5 things you can see. Say them out loud or in your mind. Then notice 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.',
   '[{"label": "Watch: 5-4-3-2-1 grounding technique explained", "url": "https://www.youtube.com/watch?v=30VMIEmA114", "icon": "logo-youtube"}]'),

  ('task-cold-water', 'Run cold water on your wrists for 30 seconds', 'Grounding', 20,
   array['spiralling', 'anxiety', 'restlessness'], false, 'general', false,
   'Go to a sink and turn on cold water. Hold both wrists under the stream for at least 30 seconds. Focus on the temperature sensation on your skin.',
   '[{"label": "Learn: How cold water calms anxiety", "url": "https://www.youtube.com/watch?v=dsMFmonKDD4", "icon": "logo-youtube"}]'),

  ('task-journal', '5-minute journaling session', 'Mindfulness', 30,
   array['anxiety', 'depression', 'spiralling'], false, 'general', true,
   'Grab a notebook or open a notes app. Set a 5-minute timer. Write freely about how you are feeling right now, no editing, no judgement.',
   '[{"label": "Watch: How to start journaling for mental health", "url": "https://www.youtube.com/watch?v=dArgOrm98Bk", "icon": "logo-youtube"}]'),

  ('task-gratitude', 'Write down 3 things you are grateful for', 'Mindfulness', 25,
   array['depression', 'stress'], false, 'general', true,
   'Think about your day so far. Write down 3 specific things you feel grateful for, they can be small or big. For each one, briefly note why it matters to you.',
   '[{"label": "Watch: The science of gratitude", "url": "https://www.youtube.com/watch?v=WPPPFqR-uT4", "icon": "logo-youtube"}]'),

  ('task-body-scan', '5-minute body scan meditation', 'Mindfulness', 30,
   array['anxiety', 'stress', 'restlessness'], false, 'general', false,
   'Lie down or sit comfortably. Close your eyes. Starting from the top of your head, slowly move your attention down through your body. Notice any tension without trying to fix it.',
   '[{"label": "Follow along: 5-minute body scan meditation", "url": "https://www.youtube.com/watch?v=ihwcw_ofuME", "icon": "logo-youtube"}]'),

  ('task-worry-log', 'Write down your current worries and let them go', 'Mindfulness', 25,
   array['anxiety', 'spiralling'], false, 'general', false,
   'Take a piece of paper or open your notes. List every worry on your mind right now, one per line. Do not try to solve them, just get them out of your head.',
   '[{"label": "Watch: How to stop overthinking", "url": "https://www.youtube.com/watch?v=ey3ixMrSi7U", "icon": "logo-youtube"}]'),

  ('task-thought-challenge', 'Challenge one negative thought with evidence', 'Mindfulness', 30,
   array['spiralling', 'depression', 'anxiety'], false, 'general', false,
   'Pick one negative thought you had today. Write it down. Then ask: What evidence supports this? What evidence contradicts it? What would I tell a friend who said this?',
   '[{"label": "Watch: CBT thought challenging technique", "url": "https://www.youtube.com/watch?v=m783z5M-gXo", "icon": "logo-youtube"}]'),

  ('task-water', 'Drink a full glass of water', 'Hydration', 15,
   array['anxiety', 'depression', 'stress', 'restlessness', 'spiralling'], false, 'general', true,
   'Fill a full glass (about 250 ml) with water. Drink it slowly over 1-2 minutes rather than gulping it down. Pay attention to the sensation of swallowing.',
   '[]'),

  ('task-healthy-snack', 'Eat a healthy snack or meal', 'Self-care', 20,
   array['depression', 'stress'], false, 'general', true,
   'Choose something nourishing, a piece of fruit, some nuts, yoghurt, or a proper meal if you have not eaten. Eat it without screens if possible. Chew slowly and notice the flavours.',
   '[{"label": "Watch: Quick healthy snack ideas for energy", "url": "https://www.youtube.com/watch?v=sn45_KpfKHs", "icon": "logo-youtube"}]'),

  ('task-screen-break', 'Take a 5-minute screen break', 'Self-care', 15,
   array['stress', 'anxiety', 'restlessness'], false, 'general', true,
   'Put your phone face-down and step away from any computer. Set a 5-minute timer. Look at something far away (out a window is ideal) to rest your eyes.',
   '[{"label": "Watch: Eye exercises for screen fatigue", "url": "https://www.youtube.com/watch?v=W10j2fL0hy0", "icon": "logo-youtube"}]'),

  ('task-walk-10', 'Walk around your neighbourhood for 10 minutes', 'Movement', 45,
   array['depression', 'restlessness', 'stress'], true, 'general', true,
   'Put on comfortable shoes and step outside. Walk at a relaxed pace around your street or neighbourhood, no destination needed.',
   '[{"label": "Open Google Maps to explore your area", "url": "https://www.google.com/maps", "icon": "map-outline"},{"label": "Watch: Benefits of walking for mental health", "url": "https://www.youtube.com/watch?v=DsVzKCk066g", "icon": "logo-youtube"}]'),

  ('task-stretch', '3-minute stretch break', 'Mobility', 30,
   array['stress', 'restlessness'], true, 'general', true,
   'Stand up and reach both arms overhead for 15 seconds. Then gently tilt to each side. Roll your shoulders forward and backward 5 times.',
   '[{"label": "Follow along: 3-minute full body stretch", "url": "https://www.youtube.com/watch?v=3TDC-bTurTc", "icon": "logo-youtube"}]'),

  ('task-stand-up', 'Stand up and move for 2 minutes', 'Posture', 20,
   array['stress', 'restlessness', 'depression'], true, 'general', true,
   'Stand up from wherever you are sitting. Walk to another room and back, do a few gentle squats, or simply march in place. Shake out your arms and legs.',
   '[{"label": "Follow along: 2-minute desk break exercises", "url": "https://www.youtube.com/watch?v=M-8FvC3GR6o", "icon": "logo-youtube"}]'),

  ('task-daylight', 'Step outside for 5 minutes of daylight', 'Recovery', 30,
   array['depression', 'stress'], true, 'general', false,
   'Go outside your front door, balcony, or garden. Stand or sit in natural daylight for at least 5 minutes, even on cloudy days the light intensity helps.',
   '[{"label": "Watch: How sunlight affects your mood", "url": "https://www.youtube.com/watch?v=UF0nqolsNZc", "icon": "logo-youtube"}]'),

  ('task-calming-music', 'Listen to calming music for 5 minutes', 'Relaxation', 20,
   array['anxiety', 'stress', 'restlessness'], false, 'general', false,
   'Put on headphones or play music softly. Choose something instrumental, ambient, or slow-tempo that you find soothing. Close your eyes if possible.',
   '[{"label": "Listen: 5 minutes of calming ambient music", "url": "https://www.youtube.com/watch?v=lFcSrYw-ARY", "icon": "logo-youtube"}]'),

  ('task-pmr', 'Progressive muscle relaxation (5 min)', 'Relaxation', 30,
   array['restlessness', 'anxiety', 'stress'], false, 'general', false,
   'Sit or lie down comfortably. Tense the muscles in your feet for 5 seconds, then release. Move up through calves, thighs, abdomen, hands, arms, shoulders, face.',
   '[{"label": "Follow along: Progressive muscle relaxation", "url": "https://www.youtube.com/watch?v=1nZEdqcGVzo", "icon": "logo-youtube"}]'),

  ('task-kind-message', 'Send a kind message to someone you care about', 'Social', 25,
   array['depression'], false, 'general', false,
   'Think of one person, a friend, family member, or colleague. Send them a short message: it could be a compliment, a memory you appreciate, or just "thinking of you".',
   '[]'),

  ('task-tidy', 'Tidy one small area near you', 'Focus', 20,
   array['restlessness', 'depression'], false, 'general', false,
   'Pick one small surface, your desk, a shelf, or a bedside table. Spend 2-3 minutes putting things in their place, throwing away rubbish, or wiping it down.',
   '[{"label": "Watch: Quick decluttering tips for motivation", "url": "https://www.youtube.com/watch?v=As30Nt8HHPQ", "icon": "logo-youtube"}]'),

  ('task-single-task', 'Focus on one task for 10 minutes without switching', 'Focus', 25,
   array['restlessness', 'anxiety', 'stress'], false, 'general', false,
   'Choose one thing you need to do. Set a 10-minute timer. Close other tabs, put your phone on silent, and commit to only this task until the timer ends.',
   '[{"label": "Watch: The Pomodoro technique explained", "url": "https://www.youtube.com/watch?v=mNBmG24djoY", "icon": "logo-youtube"}]'),

  ('task-walk-neighbourhood', 'Walk around your neighbourhood', 'Movement', 50,
   array['depression', 'restlessness', 'stress'], true, 'general', false,
   'Step outside and walk a loop around your block or nearby streets. Take a route you know well so you can focus on your surroundings.',
   '[{"label": "Open Google Maps to explore your neighbourhood", "url": "https://www.google.com/maps", "icon": "map-outline"},{"label": "Watch: How walking boosts your creativity", "url": "https://www.youtube.com/watch?v=DsVzKCk066g", "icon": "logo-youtube"}]'),

  ('task-walk-park', 'Take a short walk to a nearby park or green space', 'Nature', 50,
   array['depression', 'stress', 'anxiety'], true, 'general', false,
   'Head to the nearest park, garden, or green area. Once there, slow your pace. Look at the trees, listen for birds, and feel the ground under your feet.',
   '[{"label": "Find parks near you on Google Maps", "url": "https://www.google.com/maps/search/park+near+me", "icon": "map-outline"},{"label": "Watch: Why nature is good for mental health", "url": "https://www.youtube.com/watch?v=TGtWWb9emYI", "icon": "logo-youtube"}]'),

  ('task-walk-errand', 'Walk to do a small errand nearby', 'Movement', 45,
   array['depression', 'restlessness'], true, 'general', false,
   'Think of one small errand you can do on foot. Walk there and back instead of driving or postponing it.',
   '[{"label": "Find nearby shops on Google Maps", "url": "https://www.google.com/maps/search/shops+near+me", "icon": "map-outline"}]'),

  ('task-walk-mindful', 'Go for a mindful 5-minute walk', 'Mindfulness', 35,
   array['anxiety', 'spiralling', 'stress'], true, 'general', false,
   'Step outside and walk slowly, slower than your normal pace. Pay attention to each footstep: the heel touching down, the roll to your toes.',
   '[{"label": "Follow along: Guided mindful walking meditation", "url": "https://www.youtube.com/watch?v=sasqfm7MuOk", "icon": "logo-youtube"}]'),

  ('task-walk-explore', 'Explore a street you have never walked before', 'Exploration', 40,
   array['depression', 'restlessness'], true, 'general', false,
   'Pick a street or alley near your home that you have never walked down. Stroll through it with curiosity, look at the buildings, gardens, and any details that catch your eye.',
   '[{"label": "Open Google Maps to find new streets nearby", "url": "https://www.google.com/maps", "icon": "map-outline"}]'),

  ('task-walk-fresh-air', 'Step out for some fresh air', 'Recovery', 30,
   array['stress', 'depression', 'anxiety'], true, 'general', false,
   'Open your door and step outside. Stand still or walk a few metres. Take 5 deep breaths of fresh air, letting your lungs fill completely.',
   '[{"label": "Watch: Quick outdoor breathing exercise", "url": "https://www.youtube.com/watch?v=tEmt1Znux58", "icon": "logo-youtube"}]')

on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  points = excluded.points,
  feelings = excluded.feelings,
  requires_mobility = excluded.requires_mobility,
  location = excluded.location,
  reminder_enabled = excluded.reminder_enabled,
  instructions = excluded.instructions,
  links = excluded.links,
  is_active = excluded.is_active,
  updated_at = now();
