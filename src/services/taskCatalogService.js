import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasSupabaseConfig, supabase } from './supabaseClient';

const CATALOG_CACHE_KEY = '@serapis_task_catalog';
const DAILY_TASK_COUNT = 6;

// Local cache helpers
const saveCatalogCache = async (tasks) => {
  try {
    await AsyncStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({
      tasks,
      cachedAt: new Date().toISOString(),
    }));
  } catch {
    // ignore
  }
};

const loadCatalogCache = async () => {
  try {
    const raw = await AsyncStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.tasks || null;
  } catch {
    return null;
  }
};

// Map Supabase row to task object
const mapTaskRow = (row) => ({
  id: row.id,
  title: row.title,
  category: row.category,
  points: row.points,
  feelings: row.feelings || [],
  requiresMobility: row.requires_mobility,
  location: row.location,
  reminderEnabled: row.reminder_enabled,
  instructions: row.instructions || '',
  links: row.links || [],
});

// Map task to user_daily_tasks format
const mapToUserDailyTask = (task, userId, assignedDate) => ({
  user_id: userId,
  task_id: task.id,
  assigned_date: assignedDate,
  completed: false,
  reminder_enabled: task.reminderEnabled,
});

export const taskCatalogService = {
  // Fetch all active tasks from Supabase (or cache)
  async getAllTasks() {
    // Try Supabase first
    if (hasSupabaseConfig && supabase) {
      try {
        const { data, error } = await supabase
          .from('task_catalog')
          .select('*')
          .eq('is_active', true)
          .order('category');

        if (!error && data) {
          const tasks = data.map(mapTaskRow);
          // Save to cache for offline use
          await saveCatalogCache(tasks);
          return { data: tasks, error: null, fromCache: false };
        }
      } catch (e) {
        console.warn('Supabase task catalog fetch error:', e.message);
      }
    }

    // Fallback to cache
    const cached = await loadCatalogCache();
    if (cached) {
      return { data: cached, error: null, fromCache: true };
    }

    return { data: [], error: new Error('No tasks available'), fromCache: false };
  },

  // Get a single task by ID
  async getTaskById(taskId) {
    if (hasSupabaseConfig && supabase) {
      try {
        const { data, error } = await supabase
          .from('task_catalog')
          .select('*')
          .eq('id', taskId)
          .eq('is_active', true)
          .maybeSingle();

        if (!error && data) {
          return { data: mapTaskRow(data), error: null };
        }
      } catch (e) {
        console.warn('Supabase task fetch error:', e.message);
      }
    }

    // Fallback to cache
    const cached = await loadCatalogCache();
    if (cached) {
      const task = cached.find(t => t.id === taskId);
      if (task) return { data: task, error: null };
    }

    return { data: null, error: new Error('Task not found') };
  },

  // Build personalized daily tasks for a user
  async buildDailyTasks(userId, profile, isInRotterdam = false) {
    const { data: allTasks, error } = await this.getAllTasks();
    if (error || !allTasks || allTasks.length === 0) {
      return { data: [], error };
    }

    const feelings = profile?.feelings || [];
    const hasMobilityImpairment = profile?.disabilities?.mobility === true;
    const hasChronicPain = profile?.disabilities?.chronicPain === true;
    const excludeMobility = hasMobilityImpairment || hasChronicPain;

    // Filter by mobility and location
    let candidates = allTasks.filter(task => {
      if (excludeMobility && task.requiresMobility) return false;
      if (task.location === 'rotterdam' && !isInRotterdam) return false;
      return true;
    });

    // Score by feeling matches
    const scored = candidates.map(task => {
      const matchCount = task.feelings.filter(f => feelings.includes(f)).length;
      return { ...task, score: matchCount };
    });

    // Sort by score (higher = better match), then by points
    scored.sort((a, b) => b.score - a.score || b.points - a.points);

    // Select diverse tasks (max 1 per category first)
    const selected = [];
    const usedCategories = new Set();

    for (const task of scored) {
      if (selected.length >= DAILY_TASK_COUNT) break;
      if (task.score === 0) continue; // Skip tasks with no feeling match
      if (!usedCategories.has(task.category)) {
        selected.push(task);
        usedCategories.add(task.category);
      }
    }

    // Fill remaining slots with other matching tasks
    for (const task of scored) {
      if (selected.length >= DAILY_TASK_COUNT) break;
      if (task.score === 0) continue;
      if (!selected.find(s => s.id === task.id)) {
        selected.push(task);
      }
    }

    // If still not enough, fill with any remaining tasks
    for (const task of scored) {
      if (selected.length >= DAILY_TASK_COUNT) break;
      if (!selected.find(s => s.id === task.id)) {
        selected.push(task);
      }
    }

    // Format for user consumption
    const dailyTasks = selected.slice(0, DAILY_TASK_COUNT).map(task => ({
      id: task.id,
      title: task.title,
      category: task.category,
      points: task.points,
      instructions: task.instructions,
      links: task.links,
      completed: false,
      reminderEnabled: task.reminderEnabled,
      dueDate: null,
      completedAt: null,
      lastNotifiedAt: null,
    }));

    // Try to save to user_daily_tasks in Supabase
    if (hasSupabaseConfig && supabase && userId) {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const userDailyTasks = dailyTasks.map(task => ({
          user_id: userId,
          task_id: task.id,
          assigned_date: today,
          completed: false,
          reminder_enabled: task.reminderEnabled,
        }));

        // Upsert each task (ignore conflicts)
        for (const userTask of userDailyTasks) {
          await supabase
            .from('user_daily_tasks')
            .upsert(userTask, { onConflict: 'user_id,task_id,assigned_date' });
        }
      } catch (e) {
        console.warn('Failed to save daily tasks to Supabase:', e.message);
      }
    }

    return { data: dailyTasks, error: null };
  },

  // Get user's daily tasks for today from Supabase
  async getUserDailyTasks(userId) {
    if (!hasSupabaseConfig || !supabase || !userId) {
      return { data: null, error: new Error('Supabase not available') };
    }

    const today = new Date().toISOString().slice(0, 10);

    try {
      const { data, error } = await supabase
        .from('user_daily_tasks')
        .select(`
          id,
          task_id,
          assigned_date,
          completed,
          completed_at,
          reminder_enabled,
          task_catalog:task_id (id, title, category, points, instructions, links)
        `)
        .eq('user_id', userId)
        .eq('assigned_date', today);

      if (error) return { data: null, error };

      const tasks = (data || []).map(row => ({
        id: row.task_id,
        title: row.task_catalog?.title || row.task_id,
        category: row.task_catalog?.category || 'Wellness',
        points: row.task_catalog?.points || 20,
        instructions: row.task_catalog?.instructions || '',
        links: row.task_catalog?.links || [],
        completed: row.completed,
        reminderEnabled: row.reminder_enabled,
        completedAt: row.completed_at,
      }));

      return { data: tasks, error: null };
    } catch (e) {
      return { data: null, error: e };
    }
  },

  // Sync local task completion to Supabase
  async syncCompletionToSupabase(userId, taskId, completed, completedAt) {
    if (!hasSupabaseConfig || !supabase || !userId) return;

    const today = new Date().toISOString().slice(0, 10);

    try {
      await supabase
        .from('user_daily_tasks')
        .update({
          completed,
          completed_at: completed ? (completedAt || new Date().toISOString()) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .eq('assigned_date', today);
    } catch (e) {
      console.warn('Failed to sync completion to Supabase:', e.message);
    }
  },

  // Clear cached catalog (useful for admin refresh)
  async clearCache() {
    try {
      await AsyncStorage.removeItem(CATALOG_CACHE_KEY);
    } catch {
      // ignore
    }
  },
};
