const ALL_TASKS = [
  // ── Breathing & Grounding ─────────────────────────────────────────────
  {
    id: 'task-deep-breaths',
    title: 'Take 6 deep breaths',
    category: 'Breathing',
    points: 20,
    feelings: ['anxiety', 'stress', 'spiralling'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: true,
    instructions: 'Find a comfortable position. Breathe in slowly through your nose for 4 seconds, feeling your belly expand. Hold for 1 second, then exhale through your mouth for 6 seconds. Repeat 6 times. Focus only on the sensation of air moving in and out.',
    links: [
      { label: 'Follow along: Deep breathing guide', url: 'https://www.youtube.com/watch?v=tEmt1Znux58', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-box-breathing',
    title: 'Box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s (3 rounds)',
    category: 'Breathing',
    points: 25,
    feelings: ['anxiety', 'stress', 'spiralling'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: true,
    instructions: 'Sit upright with feet flat on the floor. Inhale through your nose for 4 seconds. Hold your breath for 4 seconds. Exhale slowly through your mouth for 4 seconds. Hold empty for 4 seconds. That is one round, complete 3 full rounds. If you feel dizzy, return to normal breathing.',
    links: [
      { label: 'Follow along: Box breathing tutorial', url: 'https://www.youtube.com/watch?v=FJJazKtH_9I', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-grounding-5',
    title: 'Name 5 things you can see right now',
    category: 'Grounding',
    points: 15,
    feelings: ['spiralling', 'anxiety'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Look around you and notice 5 things you can see. Say them out loud or in your mind. Then notice 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This brings you back to the present moment.',
    links: [
      { label: 'Watch: 5-4-3-2-1 grounding technique explained', url: 'https://www.youtube.com/watch?v=30VMIEmA114', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-cold-water',
    title: 'Run cold water on your wrists for 30 seconds',
    category: 'Grounding',
    points: 20,
    feelings: ['spiralling', 'anxiety', 'restlessness'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Go to a sink and turn on cold water. Hold both wrists under the stream for at least 30 seconds. Focus on the temperature sensation on your skin. This activates your dive reflex and helps calm your nervous system quickly.',
    links: [
      { label: 'Learn: How cold water calms anxiety', url: 'https://www.youtube.com/watch?v=dsMFmonKDD4', icon: 'logo-youtube' },
    ],
  },

  // ── Mindfulness & Journaling ──────────────────────────────────────────
  {
    id: 'task-journal',
    title: '5-minute journaling session',
    category: 'Mindfulness',
    points: 30,
    feelings: ['anxiety', 'depression', 'spiralling'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: true,
    instructions: 'Grab a notebook or open a notes app. Set a 5-minute timer. Write freely about how you are feeling right now, no editing, no judgement. If you get stuck, write about what you see around you or repeat your last sentence until new thoughts come.',
    links: [
      { label: 'Watch: How to start journaling for mental health', url: 'https://www.youtube.com/watch?v=dArgOrm98Bk', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-gratitude',
    title: 'Write down 3 things you are grateful for',
    category: 'Mindfulness',
    points: 25,
    feelings: ['depression', 'stress'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: true,
    instructions: 'Think about your day so far. Write down 3 specific things you feel grateful for, they can be small (a warm drink, a kind text) or big. For each one, briefly note why it matters to you. This trains your brain to notice positives.',
    links: [
      { label: 'Watch: The science of gratitude', url: 'https://www.youtube.com/watch?v=WPPPFqR-uT4', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-body-scan',
    title: '5-minute body scan meditation',
    category: 'Mindfulness',
    points: 30,
    feelings: ['anxiety', 'stress', 'restlessness'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Lie down or sit comfortably. Close your eyes. Starting from the top of your head, slowly move your attention down through your body, forehead, jaw, neck, shoulders, arms, chest, belly, hips, legs, feet. Notice any tension without trying to fix it. Spend about 30 seconds on each area.',
    links: [
      { label: 'Follow along: 5-minute body scan meditation', url: 'https://www.youtube.com/watch?v=ihwcw_ofuME', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-worry-log',
    title: 'Write down your current worries and let them go',
    category: 'Mindfulness',
    points: 25,
    feelings: ['anxiety', 'spiralling'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Take a piece of paper or open your notes. List every worry on your mind right now, one per line. Do not try to solve them, just get them out of your head. When done, read the list once, then close it or put it away. You have acknowledged them, now give yourself permission to move on.',
    links: [
      { label: 'Watch: How to stop overthinking', url: 'https://www.youtube.com/watch?v=ey3ixMrSi7U', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-thought-challenge',
    title: 'Challenge one negative thought with evidence',
    category: 'Mindfulness',
    points: 30,
    feelings: ['spiralling', 'depression', 'anxiety'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Pick one negative thought you had today (e.g. "I always fail"). Write it down. Then ask: What evidence supports this? What evidence contradicts it? What would I tell a friend who said this? Write a more balanced alternative thought beside it.',
    links: [
      { label: 'Watch: CBT thought challenging technique', url: 'https://www.youtube.com/watch?v=m783z5M-gXo', icon: 'logo-youtube' },
    ],
  },

  // ── Hydration & Self-care ─────────────────────────────────────────────
  {
    id: 'task-water',
    title: 'Drink a full glass of water',
    category: 'Hydration',
    points: 15,
    feelings: ['anxiety', 'depression', 'stress', 'restlessness', 'spiralling'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: true,
    instructions: 'Fill a full glass (about 250 ml) with water. Drink it slowly over 1-2 minutes rather than gulping it down. Pay attention to the sensation of swallowing. Mild dehydration can worsen anxiety and fatigue, so this small act makes a real difference.',
    links: [],
  },
  {
    id: 'task-healthy-snack',
    title: 'Eat a healthy snack or meal',
    category: 'Self-care',
    points: 20,
    feelings: ['depression', 'stress'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: true,
    instructions: 'Choose something nourishing, a piece of fruit, some nuts, yoghurt, or a proper meal if you have not eaten. Eat it without screens if possible. Chew slowly and notice the flavours. Stable blood sugar helps your mood stay balanced.',
    links: [
      { label: 'Watch: Quick healthy snack ideas for energy', url: 'https://www.youtube.com/watch?v=sn45_KpfKHs', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-screen-break',
    title: 'Take a 5-minute screen break',
    category: 'Self-care',
    points: 15,
    feelings: ['stress', 'anxiety', 'restlessness'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: true,
    instructions: 'Put your phone face-down and step away from any computer. Set a 5-minute timer. Look at something far away (out a window is ideal) to rest your eyes. Stretch your hands and roll your shoulders. Return to your screen only after the timer ends.',
    links: [
      { label: 'Watch: Eye exercises for screen fatigue', url: 'https://www.youtube.com/watch?v=W10j2fL0hy0', icon: 'logo-youtube' },
    ],
  },

  // ── Movement (requires mobility) ─────────────────────────────────────
  {
    id: 'task-walk-10',
    title: 'Walk around your neighbourhood for 10 minutes',
    category: 'Movement',
    points: 45,
    feelings: ['depression', 'restlessness', 'stress'],
    requiresMobility: true,
    location: 'general',
    reminder_enabled: true,
    instructions: 'Put on comfortable shoes and step outside. Walk at a relaxed pace around your street or neighbourhood, no destination needed. Notice houses, trees, and sounds around you. If 10 minutes feels too long, start with 5 and extend when ready. The goal is gentle movement, not exercise.',
    links: [
      { label: 'Open Google Maps to explore your area', url: 'https://www.google.com/maps', icon: 'map-outline' },
      { label: 'Watch: Benefits of walking for mental health', url: 'https://www.youtube.com/watch?v=DsVzKCk066g', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-stretch',
    title: '3-minute stretch break',
    category: 'Mobility',
    points: 30,
    feelings: ['stress', 'restlessness'],
    requiresMobility: true,
    location: 'general',
    reminder_enabled: true,
    instructions: 'Stand up and reach both arms overhead for 15 seconds. Then gently tilt to each side. Roll your shoulders forward and backward 5 times. Touch your toes (or as far as comfortable) and hold for 15 seconds. Finish by rolling your neck slowly in each direction.',
    links: [
      { label: 'Follow along: 3-minute full body stretch', url: 'https://www.youtube.com/watch?v=3TDC-bTurTc', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-stand-up',
    title: 'Stand up and move for 2 minutes',
    category: 'Posture',
    points: 20,
    feelings: ['stress', 'restlessness', 'depression'],
    requiresMobility: true,
    location: 'general',
    reminder_enabled: true,
    instructions: 'Stand up from wherever you are sitting. Walk to another room and back, do a few gentle squats, or simply march in place. Shake out your arms and legs. Two minutes of movement is enough to boost circulation and reset your focus.',
    links: [
      { label: 'Follow along: 2-minute desk break exercises', url: 'https://www.youtube.com/watch?v=M-8FvC3GR6o', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-daylight',
    title: 'Step outside for 5 minutes of daylight',
    category: 'Recovery',
    points: 30,
    feelings: ['depression', 'stress'],
    requiresMobility: true,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Go outside your front door, balcony, or garden. Stand or sit in natural daylight for at least 5 minutes, even on cloudy days the light intensity helps. Look at the sky and take a few deep breaths. Morning light is especially beneficial for your circadian rhythm.',
    links: [
      { label: 'Watch: How sunlight affects your mood', url: 'https://www.youtube.com/watch?v=UF0nqolsNZc', icon: 'logo-youtube' },
    ],
  },

  // ── Relaxation ────────────────────────────────────────────────────────
  {
    id: 'task-calming-music',
    title: 'Listen to calming music for 5 minutes',
    category: 'Relaxation',
    points: 20,
    feelings: ['anxiety', 'stress', 'restlessness'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Put on headphones or play music softly. Choose something instrumental, ambient, or slow-tempo that you find soothing. Close your eyes if possible. Focus on individual instruments or layers in the music rather than letting your thoughts wander. Let the 5 minutes be just for listening.',
    links: [
      { label: 'Listen: 5 minutes of calming ambient music', url: 'https://www.youtube.com/watch?v=lFcSrYw-ARY', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-pmr',
    title: 'Progressive muscle relaxation (5 min)',
    category: 'Relaxation',
    points: 30,
    feelings: ['restlessness', 'anxiety', 'stress'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Sit or lie down comfortably. Tense the muscles in your feet for 5 seconds, then release. Move up: calves, thighs, abdomen, hands, arms, shoulders, face, tensing each for 5 seconds and releasing. Notice the contrast between tension and relaxation. Breathe normally throughout.',
    links: [
      { label: 'Follow along: Progressive muscle relaxation', url: 'https://www.youtube.com/watch?v=1nZEdqcGVzo', icon: 'logo-youtube' },
    ],
  },

  // ── Social ────────────────────────────────────────────────────────────
  {
    id: 'task-kind-message',
    title: 'Send a kind message to someone you care about',
    category: 'Social',
    points: 25,
    feelings: ['depression'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Think of one person, a friend, family member, or colleague. Send them a short message: it could be a compliment, a memory you appreciate, or just "thinking of you". Keep it genuine and brief. Social connection, even small, can lift your mood.',
    links: [],
  },

  // ── Focus ─────────────────────────────────────────────────────────────
  {
    id: 'task-tidy',
    title: 'Tidy one small area near you',
    category: 'Focus',
    points: 20,
    feelings: ['restlessness', 'depression'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Pick one small surface, your desk, a shelf, or a bedside table. Spend 2-3 minutes putting things in their place, throwing away rubbish, or wiping it down. A tidy space reduces mental clutter. Do not try to clean the whole room, just this one spot.',
    links: [
      { label: 'Watch: Quick decluttering tips for motivation', url: 'https://www.youtube.com/watch?v=As30Nt8HHPQ', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-single-task',
    title: 'Focus on one task for 10 minutes without switching',
    category: 'Focus',
    points: 25,
    feelings: ['restlessness', 'anxiety', 'stress'],
    requiresMobility: false,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Choose one thing you need to do (reading, writing, a chore). Set a 10-minute timer. Close other tabs, put your phone on silent, and commit to only this task until the timer ends. If your mind wanders, gently bring it back. After 10 minutes, you can decide whether to continue or switch.',
    links: [
      { label: 'Watch: The Pomodoro technique explained', url: 'https://www.youtube.com/watch?v=mNBmG24djoY', icon: 'logo-youtube' },
    ],
  },

  // ── Neighbourhood walks ──────────────────────────────────────────────
  {
    id: 'task-walk-neighbourhood',
    title: 'Walk around your neighbourhood',
    category: 'Movement',
    points: 50,
    feelings: ['depression', 'restlessness', 'stress'],
    requiresMobility: true,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Step outside and walk a loop around your block or nearby streets. Take a route you know well so you can focus on your surroundings rather than navigation. Notice what has changed since you last walked here, new plants, parked cars, open shops. Aim for 10-15 minutes at a comfortable pace.',
    links: [
      { label: 'Open Google Maps to explore your neighbourhood', url: 'https://www.google.com/maps', icon: 'map-outline' },
      { label: 'Watch: How walking boosts your creativity', url: 'https://www.youtube.com/watch?v=DsVzKCk066g', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-walk-park',
    title: 'Take a short walk to a nearby park or green space',
    category: 'Nature',
    points: 50,
    feelings: ['depression', 'stress', 'anxiety'],
    requiresMobility: true,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Head to the nearest park, garden, or green area, even a small patch of grass counts. Once there, slow your pace. Look at the trees, listen for birds, and feel the ground under your feet. Spend at least 5 minutes in the green space before heading back. Nature exposure reduces cortisol levels.',
    links: [
      { label: 'Find parks near you on Google Maps', url: 'https://www.google.com/maps/search/park+near+me', icon: 'map-outline' },
      { label: 'Watch: Why nature is good for mental health', url: 'https://www.youtube.com/watch?v=TGtWWb9emYI', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-walk-errand',
    title: 'Walk to do a small errand nearby',
    category: 'Movement',
    points: 45,
    feelings: ['depression', 'restlessness'],
    requiresMobility: true,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Think of one small errand you can do on foot, posting a letter, buying something from a nearby shop, or returning something. Walk there and back instead of driving or postponing it. Combining movement with a sense of accomplishment gives a double mood boost.',
    links: [
      { label: 'Find nearby shops on Google Maps', url: 'https://www.google.com/maps/search/shops+near+me', icon: 'map-outline' },
    ],
  },
  {
    id: 'task-walk-mindful',
    title: 'Go for a mindful 5-minute walk',
    category: 'Mindfulness',
    points: 35,
    feelings: ['anxiety', 'spiralling', 'stress'],
    requiresMobility: true,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Step outside and walk slowly, slower than your normal pace. Pay attention to each footstep: the heel touching down, the roll to your toes. Notice sounds, smells, and the temperature of the air. If thoughts intrude, acknowledge them and return focus to the physical act of walking. Even 5 minutes of mindful walking can calm a racing mind.',
    links: [
      { label: 'Follow along: Guided mindful walking meditation', url: 'https://www.youtube.com/watch?v=sasqfm7MuOk', icon: 'logo-youtube' },
    ],
  },
  {
    id: 'task-walk-explore',
    title: 'Explore a street you have never walked before',
    category: 'Exploration',
    points: 40,
    feelings: ['depression', 'restlessness'],
    requiresMobility: true,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Pick a street or alley near your home that you have never walked down. Stroll through it with curiosity, look at the buildings, gardens, and any details that catch your eye. Novelty stimulates dopamine, so even a small detour from your usual route can feel refreshing.',
    links: [
      { label: 'Open Google Maps to find new streets nearby', url: 'https://www.google.com/maps', icon: 'map-outline' },
    ],
  },
  {
    id: 'task-walk-fresh-air',
    title: 'Step out for some fresh air',
    category: 'Recovery',
    points: 30,
    feelings: ['stress', 'depression', 'anxiety'],
    requiresMobility: true,
    location: 'general',
    reminder_enabled: false,
    instructions: 'Open your door and step outside. Stand still or walk a few metres. Take 5 deep breaths of fresh air, letting your lungs fill completely. Feel the temperature change on your skin. Stay for at least 2 minutes. Even brief outdoor exposure resets your mental state.',
    links: [
      { label: 'Watch: Quick outdoor breathing exercise', url: 'https://www.youtube.com/watch?v=tEmt1Znux58', icon: 'logo-youtube' },
    ],
  },
];

const DAILY_TASK_COUNT = 6;

export const buildDailyTasks = (profile, isInRotterdam = false) => {
  const feelings = profile?.feelings || [];
  const hasMobilityImpairment = profile?.disabilities?.mobility === true;
  const hasChronicPain = profile?.disabilities?.chronicPain === true;
  const excludeMobility = hasMobilityImpairment || hasChronicPain;

  let candidates = ALL_TASKS.filter(task => {
    if (excludeMobility && task.requiresMobility) return false;
    if (task.location === 'rotterdam' && !isInRotterdam) return false;
    return true;
  });

  const scored = candidates.map(task => {
    const matchCount = task.feelings.filter(f => feelings.includes(f)).length;
    return { ...task, score: matchCount };
  });

  scored.sort((a, b) => b.score - a.score || b.points - a.points);

  const selected = [];
  const usedCategories = new Set();

  for (const task of scored) {
    if (selected.length >= DAILY_TASK_COUNT) break;
    if (task.score === 0) continue;
    if (!usedCategories.has(task.category)) {
      selected.push(task);
      usedCategories.add(task.category);
    }
  }

  for (const task of scored) {
    if (selected.length >= DAILY_TASK_COUNT) break;
    if (task.score === 0) continue;
    if (!selected.find(s => s.id === task.id)) {
      selected.push(task);
    }
  }

  for (const task of scored) {
    if (selected.length >= DAILY_TASK_COUNT) break;
    if (!selected.find(s => s.id === task.id)) {
      selected.push(task);
    }
  }

  return selected.slice(0, DAILY_TASK_COUNT).map(task => ({
    id: task.id,
    title: task.title,
    category: task.category,
    points: task.points,
    instructions: task.instructions || '',
    links: task.links || [],
    completed: false,
    reminderEnabled: task.reminder_enabled,
    dueDate: null,
    completedAt: null,
    lastNotifiedAt: null,
  }));
};

export { ALL_TASKS, DAILY_TASK_COUNT };
