import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasSupabaseConfig, supabase } from './supabaseClient';

const ONBOARDING_KEY_PREFIX = '@serapis_onboarding_';
const buildKey = userId => `${ONBOARDING_KEY_PREFIX}${userId || 'guest'}`;

export const FEELING_OPTIONS = [
  { key: 'anxiety', label: 'Anxiety', icon: 'pulse-outline', description: 'Worry, nervousness, racing thoughts' },
  { key: 'depression', label: 'Depression', icon: 'cloudy-outline', description: 'Low mood, lack of motivation, sadness' },
  { key: 'stress', label: 'Stress', icon: 'flash-outline', description: 'Overwhelm, tension, pressure' },
  { key: 'restlessness', label: 'Restlessness', icon: 'swap-horizontal-outline', description: 'Can\'t sit still, fidgety, agitated' },
  { key: 'spiralling', label: 'Spiralling', icon: 'sync-outline', description: 'Looping thoughts, catastrophizing' },
];

export const DISABILITY_OPTIONS = [
  { key: 'mobility', label: 'Mobility impairment', description: 'Difficulty walking, standing, or moving around' },
  { key: 'visual', label: 'Visual impairment', description: 'Difficulty seeing or reading without assistive tools' },
  { key: 'chronicPain', label: 'Chronic pain or fatigue', description: 'Persistent pain or low energy levels' },
];

// Local backup helpers
const saveLocalProfile = async (userId, profile) => {
  const data = {
    feelings: profile.feelings || [],
    disabilities: profile.disabilities || {},
    completedAt: profile.completedAt || new Date().toISOString(),
  };
  try {
    await AsyncStorage.setItem(buildKey(userId), JSON.stringify(data));
  } catch {
    // ignore backup errors
  }
};

const loadLocalProfile = async (userId) => {
  try {
    const raw = await AsyncStorage.getItem(buildKey(userId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const clearLocalProfile = async (userId) => {
  try {
    await AsyncStorage.removeItem(buildKey(userId));
  } catch {
    // ignore
  }
};

export const onboardingService = {
  async saveProfile(userId, profile) {
    const data = {
      feelings: profile.feelings || [],
      disabilities: profile.disabilities || {},
      completedAt: new Date().toISOString(),
    };

    // Always save to local storage as backup
    await saveLocalProfile(userId, data);

    // Save to Supabase as primary (if available)
    if (hasSupabaseConfig && supabase && userId) {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: userId,
            feelings: data.feelings,
            disabilities: data.disabilities,
            completed_at: data.completedAt,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (error) {
          console.warn('Failed to save profile to Supabase:', error.message);
        }
      } catch (e) {
        console.warn('Supabase profile save error:', e.message);
      }
    }
  },

  async getProfile(userId) {
    // Try Supabase first (primary)
    if (hasSupabaseConfig && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('feelings, disabilities, completed_at')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          const profile = {
            feelings: data.feelings || [],
            disabilities: data.disabilities || {},
            completedAt: data.completed_at,
          };
          // Sync to local storage as backup
          await saveLocalProfile(userId, profile);
          return profile;
        }
      } catch (e) {
        console.warn('Supabase profile fetch error:', e.message);
      }
    }

    // Fallback to local storage
    return loadLocalProfile(userId);
  },

  async isOnboarded(userId) {
    const profile = await this.getProfile(userId);
    return Boolean(profile?.completedAt);
  },

  async clearProfile(userId) {
    // Clear local storage
    await clearLocalProfile(userId);

    // Clear from Supabase (if available)
    if (hasSupabaseConfig && supabase && userId) {
      try {
        await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', userId);
      } catch (e) {
        console.warn('Supabase profile clear error:', e.message);
      }
    }
  },

  // Sync local data to Supabase when coming back online
  async syncToSupabase(userId) {
    if (!hasSupabaseConfig || !supabase || !userId) return;

    const localProfile = await loadLocalProfile(userId);
    if (!localProfile) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          feelings: localProfile.feelings || [],
          disabilities: localProfile.disabilities || {},
          completed_at: localProfile.completedAt,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) {
        console.warn('Profile sync to Supabase failed:', error.message);
      }
    } catch (e) {
      console.warn('Profile sync error:', e.message);
    }
  },
};
