import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasSupabaseConfig, supabase } from './supabaseClient';

const toMonthKey = date => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
};

const DEFAULT_TASKS = [
  { title: '10-minute walk', category: 'Movement', points: 45, reminder_enabled: true },
  { title: 'Drink a glass of water', category: 'Hydration', points: 30, reminder_enabled: true },
  { title: '3-minute stretch break', category: 'Mobility', points: 35, reminder_enabled: true },
  { title: 'Stand up for 2 minutes', category: 'Posture', points: 25, reminder_enabled: true },
  { title: 'Take 6 deep breaths', category: 'Mindfulness', points: 20, reminder_enabled: false },
  { title: 'Step outside for daylight', category: 'Recovery', points: 30, reminder_enabled: false },
];

const DEFAULT_MILESTONES = [
  { title: 'Starter Momentum', description: 'Reach 300 total points', target_points: 300 },
  { title: 'Consistency Builder', description: 'Reach 700 total points', target_points: 700 },
  { title: 'Wellness Champion', description: 'Reach 1200 total points', target_points: 1200 },
];

const fallbackProgress = {
  monthKey: toMonthKey(new Date()),
  completedTasks: 0,
  earnedPoints: 0,
  activeDays: 0,
};

const fallbackTasks = DEFAULT_TASKS.map((task, index) => ({
  id: `seed-task-${index + 1}`,
  title: task.title,
  category: task.category,
  points: task.points,
  completed: false,
  reminderEnabled: task.reminder_enabled,
  dueDate: null,
  completedAt: null,
  lastNotifiedAt: null,
}));

const fallbackMilestones = DEFAULT_MILESTONES.map((m, index) => ({
  id: `seed-milestone-${index + 1}`,
  title: m.title,
  description: m.description,
  targetPoints: m.target_points,
  achieved: false,
  achievedAt: null,
}));

const LOCAL_TASKS_KEY_PREFIX = '@serapis_tasks_';
const normalizeUserId = userId => userId || 'guest';
const isSeedTaskId = taskId => typeof taskId === 'string' && taskId.startsWith('seed-task-');

const buildLocalTasksKey = userId => `${LOCAL_TASKS_KEY_PREFIX}${normalizeUserId(userId)}`;

const mergeWithFallbackTasks = storedTasks => {
  const byId = new Map((storedTasks || []).map(task => [task.id, task]));

  return fallbackTasks.map(task => {
    const saved = byId.get(task.id);
    if (!saved) return { ...task };

    return {
      ...task,
      completed: Boolean(saved.completed),
      reminderEnabled: typeof saved.reminderEnabled === 'boolean' ? saved.reminderEnabled : task.reminderEnabled,
      completedAt: saved.completedAt || null,
      lastNotifiedAt: saved.lastNotifiedAt || null,
    };
  });
};

const loadLocalTasks = async userId => {
  try {
    const raw = await AsyncStorage.getItem(buildLocalTasksKey(userId));
    if (!raw) return mergeWithFallbackTasks([]);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return mergeWithFallbackTasks([]);
    return mergeWithFallbackTasks(parsed);
  } catch {
    return mergeWithFallbackTasks([]);
  }
};

const saveLocalTasks = async (userId, tasks) => {
  const serializable = (tasks || []).map(task => ({
    id: task.id,
    completed: Boolean(task.completed),
    reminderEnabled: Boolean(task.reminderEnabled),
    completedAt: task.completedAt || null,
    lastNotifiedAt: task.lastNotifiedAt || null,
  }));

  try {
    await AsyncStorage.setItem(buildLocalTasksKey(userId), JSON.stringify(serializable));
  } catch {
    // ignore persistence errors
  }
};

const buildProgressFromTasks = (tasks, monthKey = toMonthKey(new Date())) => {
  const monthCompleted = (tasks || []).filter(task => {
    if (!task.completed || !task.completedAt) return false;
    return String(task.completedAt).startsWith(monthKey);
  });

  const activeDaysSet = new Set(
    monthCompleted
      .map(task => String(task.completedAt).slice(0, 10))
      .filter(Boolean),
  );

  return {
    monthKey,
    completedTasks: monthCompleted.length,
    earnedPoints: monthCompleted.reduce((sum, task) => sum + (task.points || 0), 0),
    activeDays: activeDaysSet.size,
  };
};

const buildMilestonesFromPoints = points =>
  fallbackMilestones.map(milestone => ({
    ...milestone,
    achieved: points >= milestone.targetPoints,
  }));

const mapTask = row => ({
  id: row.id,
  title: row.title,
  category: row.category,
  points: row.points,
  completed: row.completed,
  reminderEnabled: row.reminder_enabled,
  dueDate: row.due_date,
  completedAt: row.completed_at,
  lastNotifiedAt: row.last_notified_at,
});

const mapMilestone = row => ({
  id: row.id,
  title: row.title,
  description: row.description,
  targetPoints: row.target_points,
  achieved: row.achieved,
  achievedAt: row.achieved_at,
});

const mapProgress = row => ({
  monthKey: row.month_key,
  completedTasks: row.completed_tasks,
  earnedPoints: row.earned_points,
  activeDays: row.active_days,
});

export const journeyService = {
  async ensureJourneySeed(userId) {
    if (!hasSupabaseConfig || !supabase || !userId) return;

    const { data: existingTasks } = await supabase
      .from('user_tasks')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (!existingTasks || existingTasks.length === 0) {
      const seedTasks = DEFAULT_TASKS.map(task => ({ ...task, user_id: userId }));
      await supabase.from('user_tasks').insert(seedTasks);
    }

    const { data: existingMilestones } = await supabase
      .from('user_milestones')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (!existingMilestones || existingMilestones.length === 0) {
      const seedMilestones = DEFAULT_MILESTONES.map(m => ({ ...m, user_id: userId }));
      await supabase.from('user_milestones').insert(seedMilestones);
    }

    const monthKey = toMonthKey(new Date());
    await supabase
      .from('user_monthly_progress')
      .upsert({ user_id: userId, month_key: monthKey }, { onConflict: 'user_id,month_key' });
  },

  async getTasks(userId) {
    if (!hasSupabaseConfig || !supabase || !userId) {
      const localTasks = await loadLocalTasks(userId);
      return { data: localTasks, error: null };
    }

    await this.ensureJourneySeed(userId);

    const { data, error } = await supabase
      .from('user_tasks')
      .select('id, title, category, points, completed, reminder_enabled, due_date, completed_at, last_notified_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      const localTasks = await loadLocalTasks(userId);
      return { data: localTasks, error };
    }

    const rows = (data || []).map(mapTask);
    if (rows.length === 0) {
      const localTasks = await loadLocalTasks(userId);
      return { data: localTasks, error: null };
    }

    return { data: rows, error: null };
  },

  async updateTaskReminder(taskId, reminderEnabled, userId) {
    if (!taskId) {
      return { error: null };
    }

    if (!hasSupabaseConfig || !supabase || !userId || isSeedTaskId(taskId)) {
      const localTasks = await loadLocalTasks(userId);
      const nextTasks = localTasks.map(task =>
        task.id === taskId
          ? { ...task, reminderEnabled, lastNotifiedAt: new Date().toISOString() }
          : task,
      );
      await saveLocalTasks(userId, nextTasks);
      return { error: null };
    }

    const { error } = await supabase
      .from('user_tasks')
      .update({ reminder_enabled: reminderEnabled, updated_at: new Date().toISOString() })
      .eq('id', taskId);

    return { error };
  },

  async markTaskDone(userId, task) {
    if (!task?.id) {
      return { error: null };
    }

    if (!hasSupabaseConfig || !supabase || !userId || isSeedTaskId(task.id)) {
      const nowIso = new Date().toISOString();
      const localTasks = await loadLocalTasks(userId);
      const nextTasks = localTasks.map(item =>
        item.id === task.id
          ? { ...item, completed: true, completedAt: nowIso }
          : item,
      );
      await saveLocalTasks(userId, nextTasks);
      return { error: null };
    }

    const nowIso = new Date().toISOString();

    const { error: taskError } = await supabase
      .from('user_tasks')
      .update({ completed: true, completed_at: nowIso, updated_at: nowIso })
      .eq('id', task.id);

    if (taskError) return { error: taskError };

    const monthKey = toMonthKey(new Date());
    const progress = await this.getMonthlyProgress(userId);
    const next = {
      user_id: userId,
      month_key: monthKey,
      completed_tasks: (progress.data?.completedTasks || 0) + 1,
      earned_points: (progress.data?.earnedPoints || 0) + (task.points || 0),
      active_days: Math.max(progress.data?.activeDays || 0, 1),
      updated_at: nowIso,
    };

    const { error: upsertError } = await supabase
      .from('user_monthly_progress')
      .upsert(next, { onConflict: 'user_id,month_key' });

    if (upsertError) return { error: upsertError };

    await this.updateMilestonesByPoints(userId, next.earned_points);

    return { error: null };
  },

  async getMonthlyProgress(userId, monthKey = toMonthKey(new Date())) {
    if (!hasSupabaseConfig || !supabase || !userId) {
      const localTasks = await loadLocalTasks(userId);
      return { data: buildProgressFromTasks(localTasks, monthKey), error: null };
    }

    await this.ensureJourneySeed(userId);

    const { data, error } = await supabase
      .from('user_monthly_progress')
      .select('month_key, completed_tasks, earned_points, active_days')
      .eq('user_id', userId)
      .eq('month_key', monthKey)
      .maybeSingle();

    if (error) {
      const localTasks = await loadLocalTasks(userId);
      return { data: buildProgressFromTasks(localTasks, monthKey), error };
    }
    if (!data) {
      const { data: tasks } = await this.getTasks(userId);
      return { data: buildProgressFromTasks(tasks, monthKey), error: null };
    }

    return { data: mapProgress(data), error: null };
  },

  async getLastMonthsProgress(userId, limit = 4) {
    if (!hasSupabaseConfig || !supabase || !userId) {
      const localTasks = await loadLocalTasks(userId);
      return { data: [buildProgressFromTasks(localTasks)], error: null };
    }

    const { data, error } = await supabase
      .from('user_monthly_progress')
      .select('month_key, completed_tasks, earned_points, active_days')
      .eq('user_id', userId)
      .order('month_key', { ascending: false })
      .limit(limit);

    if (error) {
      const localTasks = await loadLocalTasks(userId);
      return { data: [buildProgressFromTasks(localTasks)], error };
    }

    const rows = (data || []).map(mapProgress);
    if (rows.length === 0) {
      const { data: tasks } = await this.getTasks(userId);
      return { data: [buildProgressFromTasks(tasks)], error: null };
    }

    return { data: rows.slice(0, limit), error: null };
  },

  async getMilestones(userId) {
    if (!hasSupabaseConfig || !supabase || !userId) {
      const progress = await this.getMonthlyProgress(userId);
      return { data: buildMilestonesFromPoints(progress.data?.earnedPoints || 0), error: null };
    }

    await this.ensureJourneySeed(userId);

    const { data, error } = await supabase
      .from('user_milestones')
      .select('id, title, description, target_points, achieved, achieved_at')
      .eq('user_id', userId)
      .order('target_points', { ascending: true });

    if (error) {
      const progress = await this.getMonthlyProgress(userId);
      return { data: buildMilestonesFromPoints(progress.data?.earnedPoints || 0), error };
    }

    const rows = (data || []).map(mapMilestone);
    if (rows.length === 0) {
      const progress = await this.getMonthlyProgress(userId);
      return { data: buildMilestonesFromPoints(progress.data?.earnedPoints || 0), error: null };
    }

    return { data: rows, error: null };
  },

  async updateMilestonesByPoints(userId, currentPoints) {
    if (!hasSupabaseConfig || !supabase || !userId) return;

    const { data } = await supabase
      .from('user_milestones')
      .select('id, target_points, achieved')
      .eq('user_id', userId);

    if (!data?.length) return;

    const toAchieve = data.filter(m => !m.achieved && currentPoints >= m.target_points);
    for (const m of toAchieve) {
      await supabase
        .from('user_milestones')
        .update({ achieved: true, achieved_at: new Date().toISOString() })
        .eq('id', m.id);
    }
  },
};
