import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasSupabaseConfig, supabase } from './supabaseClient';
import { onboardingService } from './onboardingService';
import { locationService } from './locationService';
import { taskCatalogService } from './taskCatalogService';

const toMonthKey = date => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
};

const toDateKey = dateLike => {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const DEFAULT_TASKS = [
  { title: '10-minute walk', category: 'Movement', points: 45, reminder_enabled: true },
  { title: 'Drink a glass of water', category: 'Hydration', points: 30, reminder_enabled: true },
  { title: '3-minute stretch break', category: 'Mobility', points: 35, reminder_enabled: true },
  { title: 'Stand up for 2 minutes', category: 'Posture', points: 25, reminder_enabled: true },
  { title: 'Take 6 deep breaths', category: 'Mindfulness', points: 20, reminder_enabled: false },
  { title: 'Step outside for daylight', category: 'Recovery', points: 30, reminder_enabled: false },
];

const getPersonalizedTemplates = async userId => {
  try {
    const profile = await onboardingService.getProfile(userId);
    if (!profile || !profile.feelings || profile.feelings.length === 0) {
      return null;
    }
    const isInRotterdam = await locationService.isInRotterdam();
    const { data: tasks } = await taskCatalogService.buildDailyTasks(userId, profile, isInRotterdam);
    return tasks;
  } catch {
    return null;
  }
};

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
const LOCAL_PROGRESS_KEY_PREFIX = '@serapis_progress_';
const normalizeUserId = userId => userId || 'guest';
const isLocalTaskId = taskId => typeof taskId === 'string' && (taskId.startsWith('seed-task-') || taskId.startsWith('task-'));

const buildLocalTasksKey = userId => `${LOCAL_TASKS_KEY_PREFIX}${normalizeUserId(userId)}`;
const buildLocalProgressKey = (userId, monthKey) =>
  `${LOCAL_PROGRESS_KEY_PREFIX}${normalizeUserId(userId)}_${monthKey}`;

const isCompletedToday = task => {
  if (!task?.completed) return false;
  const completedDay = toDateKey(task.completedAt);
  if (!completedDay) return false;
  return completedDay === toDateKey(new Date());
};

const normalizeTasksForToday = tasks =>
  (tasks || []).map(task => {
    if (!task?.completed) return task;
    if (isCompletedToday(task)) return task;
    return { ...task, completed: false };
  });

const hasCompletionStateChanges = (prevTasks, nextTasks) => {
  const prevById = new Map((prevTasks || []).map(task => [task.id, Boolean(task.completed)]));
  return (nextTasks || []).some(task => prevById.get(task.id) !== Boolean(task.completed));
};

const mergeWithFallbackTasks = (storedTasks, templates) => {
  const taskTemplates = templates || fallbackTasks;
  const byId = new Map((storedTasks || []).map(task => [task.id, task]));

  return taskTemplates.map(task => {
    const saved = byId.get(task.id);
    if (!saved) return { ...task };

    return {
      ...task,
      instructions: task.instructions || '',
      links: task.links || [],
      completed: Boolean(saved.completed),
      reminderEnabled: typeof saved.reminderEnabled === 'boolean' ? saved.reminderEnabled : task.reminderEnabled,
      completedAt: saved.completedAt || null,
      lastNotifiedAt: saved.lastNotifiedAt || null,
    };
  });
};

const loadLocalTasks = async userId => {
  try {
    const templates = await getPersonalizedTemplates(userId);
    const raw = await AsyncStorage.getItem(buildLocalTasksKey(userId));
    if (!raw) return mergeWithFallbackTasks([], templates);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return mergeWithFallbackTasks([], templates);
    return mergeWithFallbackTasks(parsed, templates);
  } catch {
    return mergeWithFallbackTasks([]);
  }
};

const loadLocalTasksWithDailyReset = async userId => {
  const localTasks = await loadLocalTasks(userId);
  const nextTasks = normalizeTasksForToday(localTasks);

  if (hasCompletionStateChanges(localTasks, nextTasks)) {
    await saveLocalTasks(userId, nextTasks);
  }

  return nextTasks;
};

const loadLocalProgress = async (userId, monthKey = toMonthKey(new Date())) => {
  try {
    const raw = await AsyncStorage.getItem(buildLocalProgressKey(userId, monthKey));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const dayCounts = parsed?.dayCounts && typeof parsed.dayCounts === 'object' ? parsed.dayCounts : {};

    return {
      monthKey,
      completedTasks: Number(parsed?.completedTasks || 0),
      earnedPoints: Number(parsed?.earnedPoints || 0),
      dayCounts,
    };
  } catch {
    return null;
  }
};

const saveLocalProgress = async (userId, progress) => {
  if (!progress?.monthKey) return;

  const serializable = {
    monthKey: progress.monthKey,
    completedTasks: Math.max(0, Number(progress.completedTasks || 0)),
    earnedPoints: Math.max(0, Number(progress.earnedPoints || 0)),
    dayCounts: progress.dayCounts && typeof progress.dayCounts === 'object' ? progress.dayCounts : {},
  };

  try {
    await AsyncStorage.setItem(
      buildLocalProgressKey(userId, progress.monthKey),
      JSON.stringify(serializable),
    );
  } catch {
    // ignore persistence errors
  }
};

const mapLocalProgress = progress => ({
  monthKey: progress?.monthKey || toMonthKey(new Date()),
  completedTasks: Number(progress?.completedTasks || 0),
  earnedPoints: Number(progress?.earnedPoints || 0),
  activeDays: Object.keys(progress?.dayCounts || {}).length,
});

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
    if (!task.completedAt) return false;
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
      const localTasks = await loadLocalTasksWithDailyReset(userId);
      return { data: localTasks, error: null };
    }

    await this.ensureJourneySeed(userId);

    const { data, error } = await supabase
      .from('user_tasks')
      .select('id, title, category, points, completed, reminder_enabled, due_date, completed_at, last_notified_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      const localTasks = await loadLocalTasksWithDailyReset(userId);
      return { data: localTasks, error };
    }

    const rows = (data || []).map(mapTask);
    const normalizedRows = normalizeTasksForToday(rows);
    const staleTaskIds = rows.filter(task => task.completed && !isCompletedToday(task)).map(task => task.id);

    if (staleTaskIds.length > 0) {
      await supabase
        .from('user_tasks')
        .update({ completed: false, updated_at: new Date().toISOString() })
        .in('id', staleTaskIds);
    }

    if (rows.length === 0) {
      const localTasks = await loadLocalTasksWithDailyReset(userId);
      return { data: localTasks, error: null };
    }

    return { data: normalizedRows, error: null };
  },

  async updateTaskReminder(taskId, reminderEnabled, userId) {
    if (!taskId) {
      return { error: null };
    }

    if (!hasSupabaseConfig || !supabase || !userId || isLocalTaskId(taskId)) {
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

    // Also save to local storage as backup
    if (!error) {
      const localTasks = await loadLocalTasks(userId);
      const nextTasks = localTasks.map(task =>
        task.id === taskId
          ? { ...task, reminderEnabled, lastNotifiedAt: new Date().toISOString() }
          : task,
      );
      await saveLocalTasks(userId, nextTasks);
    }

    return { error };
  },

  async markTaskDone(userId, task) {
    return this.setTaskCompletion(userId, task, true);
  },

  async setTaskCompletion(userId, task, completed) {
    if (!task?.id) {
      return { error: null };
    }

    if (Boolean(task.completed) === Boolean(completed)) {
      return { error: null };
    }

    if (!hasSupabaseConfig || !supabase || !userId || isLocalTaskId(task.id)) {
      const nowIso = new Date().toISOString();
      const monthKey = toMonthKey(new Date());
      const todayKey = toDateKey(nowIso);
      const localTasks = await loadLocalTasks(userId);
      const nextTasks = localTasks.map(item =>
        item.id === task.id
          ? { ...item, completed: Boolean(completed), completedAt: completed ? nowIso : null }
          : item,
      );
      await saveLocalTasks(userId, nextTasks);

      const existingProgress = await loadLocalProgress(userId, monthKey);
      const dayCounts = { ...(existingProgress?.dayCounts || {}) };
      const nextCountForToday = Math.max(0, (dayCounts[todayKey] || 0) + (completed ? 1 : -1));
      if (nextCountForToday > 0) {
        dayCounts[todayKey] = nextCountForToday;
      } else {
        delete dayCounts[todayKey];
      }

      const nextProgress = {
        monthKey,
        completedTasks: Math.max(0, (existingProgress?.completedTasks || 0) + (completed ? 1 : -1)),
        earnedPoints: Math.max(0, (existingProgress?.earnedPoints || 0) + (completed ? (task.points || 0) : -(task.points || 0))),
        dayCounts,
      };

      await saveLocalProgress(userId, nextProgress);
      return { error: null };
    }

    const nowIso = new Date().toISOString();

    const { error: taskError } = await supabase
      .from('user_tasks')
      .update({ completed: Boolean(completed), completed_at: completed ? nowIso : null, updated_at: nowIso })
      .eq('id', task.id);

    if (taskError) return { error: taskError };

    const monthKey = toMonthKey(new Date());
    const progress = await this.getMonthlyProgress(userId);
    const taskPoints = task.points || 0;
    const next = {
      user_id: userId,
      month_key: monthKey,
      completed_tasks: Math.max(0, (progress.data?.completedTasks || 0) + (completed ? 1 : -1)),
      earned_points: Math.max(0, (progress.data?.earnedPoints || 0) + (completed ? taskPoints : -taskPoints)),
      active_days: Math.max(progress.data?.activeDays || 0, 1),
      updated_at: nowIso,
    };

    const { error: upsertError } = await supabase
      .from('user_monthly_progress')
      .upsert(next, { onConflict: 'user_id,month_key' });

    if (upsertError) return { error: upsertError };

    // Save to local storage as backup
    const localTasks = await loadLocalTasks(userId);
    const nextLocalTasks = localTasks.map(item =>
      item.id === task.id
        ? { ...item, completed: Boolean(completed), completedAt: completed ? nowIso : null }
        : item,
    );
    await saveLocalTasks(userId, nextLocalTasks);

    // Also save progress locally as backup
    const existingLocalProgress = await loadLocalProgress(userId, monthKey);
    const todayKey = toDateKey(nowIso);
    const dayCounts = { ...(existingLocalProgress?.dayCounts || {}) };
    const nextCountForToday = Math.max(0, (dayCounts[todayKey] || 0) + (completed ? 1 : -1));
    if (nextCountForToday > 0) {
      dayCounts[todayKey] = nextCountForToday;
    } else {
      delete dayCounts[todayKey];
    }
    await saveLocalProgress(userId, {
      monthKey,
      completedTasks: next.completed_tasks,
      earnedPoints: next.earned_points,
      dayCounts,
    });

    await this.updateMilestonesByPoints(userId, next.earned_points);

    return { error: null };
  },

  async getMonthlyProgress(userId, monthKey = toMonthKey(new Date())) {
    if (!hasSupabaseConfig || !supabase || !userId) {
      const localProgress = await loadLocalProgress(userId, monthKey);
      if (localProgress) {
        return { data: mapLocalProgress(localProgress), error: null };
      }

      const localTasks = await loadLocalTasksWithDailyReset(userId);
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
      const localProgress = await loadLocalProgress(userId, monthKey);
      if (localProgress) {
        return { data: mapLocalProgress(localProgress), error };
      }

      const localTasks = await loadLocalTasksWithDailyReset(userId);
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
      const monthKey = toMonthKey(new Date());
      const localProgress = await loadLocalProgress(userId, monthKey);
      if (localProgress) {
        return { data: [mapLocalProgress(localProgress)], error: null };
      }

      const localTasks = await loadLocalTasksWithDailyReset(userId);
      return { data: [buildProgressFromTasks(localTasks)], error: null };
    }

    const { data, error } = await supabase
      .from('user_monthly_progress')
      .select('month_key, completed_tasks, earned_points, active_days')
      .eq('user_id', userId)
      .order('month_key', { ascending: false })
      .limit(limit);

    if (error) {
      const monthKey = toMonthKey(new Date());
      const localProgress = await loadLocalProgress(userId, monthKey);
      if (localProgress) {
        return { data: [mapLocalProgress(localProgress)], error };
      }

      const localTasks = await loadLocalTasksWithDailyReset(userId);
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

  // Sync all local data to Supabase (call when coming back online)
  async syncLocalToSupabase(userId) {
    if (!hasSupabaseConfig || !supabase || !userId) return;

    try {
      // Sync tasks
      const localTasks = await loadLocalTasks(userId);
      if (localTasks.length > 0) {
        const supabaseTasks = localTasks
          .filter(task => !isLocalTaskId(task.id))
          .map(task => ({
            id: task.id,
            user_id: userId,
            title: task.title,
            category: task.category,
            points: task.points,
            completed: task.completed,
            reminder_enabled: task.reminderEnabled,
            completed_at: task.completedAt,
            last_notified_at: task.lastNotifiedAt,
            updated_at: new Date().toISOString(),
          }));

        if (supabaseTasks.length > 0) {
          for (const task of supabaseTasks) {
            await supabase.from('user_tasks').upsert(task, { onConflict: 'id' });
          }
        }
      }

      // Sync progress
      const monthKey = toMonthKey(new Date());
      const localProgress = await loadLocalProgress(userId, monthKey);
      if (localProgress) {
        await supabase.from('user_monthly_progress').upsert({
          user_id: userId,
          month_key: monthKey,
          completed_tasks: localProgress.completedTasks,
          earned_points: localProgress.earnedPoints,
          active_days: Object.keys(localProgress.dayCounts || {}).length,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,month_key' });
      }
    } catch (e) {
      console.warn('Sync to Supabase failed:', e.message);
    }
  },
};
