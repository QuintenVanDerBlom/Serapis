import { hasSupabaseConfig, supabase } from './supabaseClient';

export const DEFAULT_REMINDERS = [
  { key: 'hourly', label: 'Hourly movement reminder', enabled: true },
  { key: 'water', label: 'Hydration reminder', enabled: true },
  { key: 'posture', label: 'Posture check reminder', enabled: false },
];

export const DEFAULT_WELLNESS_STATE = {
  points: 840,
  streakDays: 6,
  completedMissions: [],
  reminders: DEFAULT_REMINDERS,
};

const mapDbToState = row => {
  if (!row) return DEFAULT_WELLNESS_STATE;

  return {
    points: row.points ?? DEFAULT_WELLNESS_STATE.points,
    streakDays: row.streak_days ?? DEFAULT_WELLNESS_STATE.streakDays,
    completedMissions: row.completed_missions ?? DEFAULT_WELLNESS_STATE.completedMissions,
    reminders: row.reminders ?? DEFAULT_WELLNESS_STATE.reminders,
  };
};

const mapStateToDb = state => ({
  points: state.points,
  streak_days: state.streakDays,
  completed_missions: state.completedMissions,
  reminders: state.reminders,
});

export const wellnessService = {
  async getWellnessState(userId) {
    if (!hasSupabaseConfig || !supabase) {
      return { data: DEFAULT_WELLNESS_STATE, error: null };
    }

    const { data, error } = await supabase
      .from('wellness_state')
      .select('user_id, points, streak_days, completed_missions, reminders')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return { data: DEFAULT_WELLNESS_STATE, error };
    }

    if (!data) {
      const defaultPayload = {
        user_id: userId,
        ...mapStateToDb(DEFAULT_WELLNESS_STATE),
      };

      const { error: insertError } = await supabase
        .from('wellness_state')
        .insert(defaultPayload);

      if (insertError) {
        return { data: DEFAULT_WELLNESS_STATE, error: insertError };
      }
    }

    return { data: mapDbToState(data), error: null };
  },

  async saveWellnessState(userId, state) {
    if (!hasSupabaseConfig || !supabase) {
      return { error: null };
    }

    const payload = {
      user_id: userId,
      ...mapStateToDb(state),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('wellness_state')
      .upsert(payload, { onConflict: 'user_id' });

    return { error };
  },
};
