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
  },

  // ── Movement (requires mobility) ─────────────────────────────────────
  {
    id: 'task-walk-10',
    title: '10-minute walk outside',
    category: 'Movement',
    points: 45,
    feelings: ['depression', 'restlessness', 'stress'],
    requiresMobility: true,
    location: 'general',
    reminder_enabled: true,
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
  },

  // ── Rotterdam-specific tasks ──────────────────────────────────────────
  {
    id: 'task-rdam-erasmus',
    title: 'Walk along the Erasmusbrug',
    category: 'Movement',
    points: 50,
    feelings: ['depression', 'restlessness', 'stress'],
    requiresMobility: true,
    location: 'rotterdam',
    reminder_enabled: false,
  },
  {
    id: 'task-rdam-kralingse',
    title: 'Visit Kralingse Bos for a 15-min stroll',
    category: 'Nature',
    points: 50,
    feelings: ['depression', 'stress', 'anxiety'],
    requiresMobility: true,
    location: 'rotterdam',
    reminder_enabled: false,
  },
  {
    id: 'task-rdam-hetpark',
    title: 'Stroll through Het Park near the Euromast',
    category: 'Nature',
    points: 45,
    feelings: ['stress', 'restlessness', 'depression'],
    requiresMobility: true,
    location: 'rotterdam',
    reminder_enabled: false,
  },
  {
    id: 'task-rdam-maas',
    title: 'Sit by the Maas river and breathe for 5 minutes',
    category: 'Grounding',
    points: 30,
    feelings: ['anxiety', 'spiralling', 'stress'],
    requiresMobility: false,
    location: 'rotterdam',
    reminder_enabled: false,
  },
  {
    id: 'task-rdam-markthal',
    title: 'Walk through the Markthal and enjoy the atmosphere',
    category: 'Exploration',
    points: 40,
    feelings: ['depression', 'restlessness'],
    requiresMobility: true,
    location: 'rotterdam',
    reminder_enabled: false,
  },
  {
    id: 'task-rdam-museumpark',
    title: 'Visit Museumpark for some fresh air',
    category: 'Nature',
    points: 40,
    feelings: ['stress', 'depression', 'anxiety'],
    requiresMobility: true,
    location: 'rotterdam',
    reminder_enabled: false,
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
    completed: false,
    reminderEnabled: task.reminder_enabled,
    dueDate: null,
    completedAt: null,
    lastNotifiedAt: null,
  }));
};

export { ALL_TASKS, DAILY_TASK_COUNT };
