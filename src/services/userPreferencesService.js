import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasSupabaseConfig, supabase } from './supabaseClient';

const KEYS = {
  darkMode: '@serapis_dark_mode',
  language: '@serapis_language',
  notifications: '@serapis_notifications',
};

// Local storage helpers
const saveLocal = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

const loadLocal = async (key, defaultValue = null) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
};

export const userPreferencesService = {
  // Theme/Dark Mode
  async saveDarkMode(userId, isDark) {
    await saveLocal(KEYS.darkMode, isDark);

    if (hasSupabaseConfig && supabase && userId) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            dark_mode: isDark,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
        if (error) console.warn('Failed to save dark mode:', error.message);
      } catch (e) {
        console.warn('Dark mode save error:', e.message);
      }
    }
  },

  async getDarkMode(userId, defaultValue = false) {
    if (hasSupabaseConfig && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('dark_mode')
          .eq('user_id', userId)
          .maybeSingle();
        if (!error && data && typeof data.dark_mode === 'boolean') {
          await saveLocal(KEYS.darkMode, data.dark_mode);
          return data.dark_mode;
        }
      } catch (e) {
        console.warn('Dark mode fetch error:', e.message);
      }
    }
    return loadLocal(KEYS.darkMode, defaultValue);
  },

  // Language
  async saveLanguage(userId, language) {
    const value = language === 'nl' ? 'nl' : 'en';
    await saveLocal(KEYS.language, value);

    if (hasSupabaseConfig && supabase && userId) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            language: value,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
        if (error) console.warn('Failed to save language:', error.message);
      } catch (e) {
        console.warn('Language save error:', e.message);
      }
    }
  },

  async getLanguage(userId, defaultValue = 'en') {
    if (hasSupabaseConfig && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('language')
          .eq('user_id', userId)
          .maybeSingle();
        if (!error && data && data.language) {
          const value = data.language === 'nl' ? 'nl' : 'en';
          await saveLocal(KEYS.language, value);
          return value;
        }
      } catch (e) {
        console.warn('Language fetch error:', e.message);
      }
    }
    return loadLocal(KEYS.language, defaultValue);
  },

  // Notification Settings
  async saveNotificationSettings(userId, settings) {
    await saveLocal(KEYS.notifications, settings);

    if (hasSupabaseConfig && supabase && userId) {
      try {
        const { error } = await supabase
          .from('user_notification_settings')
          .upsert({
            user_id: userId,
            daily_reminders: settings.dailyReminders ?? true,
            streak_alerts: settings.streakAlerts ?? true,
            achievement_alerts: settings.achievementAlerts ?? true,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
        if (error) console.warn('Failed to save notifications:', error.message);
      } catch (e) {
        console.warn('Notifications save error:', e.message);
      }
    }
  },

  async getNotificationSettings(userId, defaultValue = {
    dailyReminders: true,
    streakAlerts: true,
    achievementAlerts: true,
  }) {
    if (hasSupabaseConfig && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('user_notification_settings')
          .select('daily_reminders, streak_alerts, achievement_alerts')
          .eq('user_id', userId)
          .maybeSingle();
        if (!error && data) {
          const settings = {
            dailyReminders: data.daily_reminders ?? true,
            streakAlerts: data.streak_alerts ?? true,
            achievementAlerts: data.achievement_alerts ?? true,
          };
          await saveLocal(KEYS.notifications, settings);
          return settings;
        }
      } catch (e) {
        console.warn('Notifications fetch error:', e.message);
      }
    }
    return loadLocal(KEYS.notifications, defaultValue);
  },

  // Sync all preferences from Supabase to local (call on login)
  async syncFromSupabase(userId) {
    if (!hasSupabaseConfig || !supabase || !userId) return;

    try {
      // Fetch all preferences
      const { data: prefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('dark_mode, language')
        .eq('user_id', userId)
        .maybeSingle();

      if (!prefsError && prefs) {
        if (typeof prefs.dark_mode === 'boolean') {
          await saveLocal(KEYS.darkMode, prefs.dark_mode);
        }
        if (prefs.language) {
          await saveLocal(KEYS.language, prefs.language === 'nl' ? 'nl' : 'en');
        }
      }

      // Fetch notification settings
      const { data: notifs, error: notifsError } = await supabase
        .from('user_notification_settings')
        .select('daily_reminders, streak_alerts, achievement_alerts')
        .eq('user_id', userId)
        .maybeSingle();

      if (!notifsError && notifs) {
        await saveLocal(KEYS.notifications, {
          dailyReminders: notifs.daily_reminders ?? true,
          streakAlerts: notifs.streak_alerts ?? true,
          achievementAlerts: notifs.achievement_alerts ?? true,
        });
      }
    } catch (e) {
      console.warn('Sync from Supabase error:', e.message);
    }
  },

  // Sync all local preferences to Supabase (call when coming back online)
  async syncToSupabase(userId) {
    if (!hasSupabaseConfig || !supabase || !userId) return;

    try {
      const darkMode = await loadLocal(KEYS.darkMode, false);
      const language = await loadLocal(KEYS.language, 'en');
      const notifications = await loadLocal(KEYS.notifications, {
        dailyReminders: true,
        streakAlerts: true,
        achievementAlerts: true,
      });

      await supabase.from('user_preferences').upsert({
        user_id: userId,
        dark_mode: darkMode,
        language,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      await supabase.from('user_notification_settings').upsert({
        user_id: userId,
        daily_reminders: notifications.dailyReminders ?? true,
        streak_alerts: notifications.streakAlerts ?? true,
        achievement_alerts: notifications.achievementAlerts ?? true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    } catch (e) {
      console.warn('Sync to Supabase error:', e.message);
    }
  },
};
