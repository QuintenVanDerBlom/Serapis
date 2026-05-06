import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasSupabaseConfig, supabase } from './supabaseClient';

const SESSION_KEY = '@serapis_session';

export const authService = {
  async registerWithUsername({ username, password }) {
    if (!hasSupabaseConfig || !supabase) {
      return { data: null, error: { message: 'Supabase is not configured' } };
    }

    const { data, error } = await supabase.rpc('register_user', {
      p_username: username.trim().toLowerCase(),
      p_password: password,
    });

    if (error) {
      return { data: null, error };
    }

    if (data?.error) {
      return { data: null, error: { message: data.error } };
    }

    const session = { user: { id: data.user_id, username: data.username } };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return { data: { session }, error: null };
  },

  async loginWithUsername({ username, password }) {
    if (!hasSupabaseConfig || !supabase) {
      return { data: null, error: { message: 'Supabase is not configured' } };
    }

    const { data, error } = await supabase.rpc('login_user', {
      p_username: username.trim().toLowerCase(),
      p_password: password,
    });

    if (error) {
      return { data: null, error };
    }

    if (data?.error) {
      return { data: null, error: { message: data.error } };
    }

    const session = { user: { id: data.user_id, username: data.username } };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return { data: { session }, error: null };
  },

  async getSession() {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw) {
        return { data: { session: JSON.parse(raw) }, error: null };
      }
      return { data: { session: null }, error: null };
    } catch {
      return { data: { session: null }, error: null };
    }
  },

  async getCurrentUser() {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        return { data: { user: session.user }, error: null };
      }
      return { data: { user: null }, error: null };
    } catch {
      return { data: { user: null }, error: null };
    }
  },

  async logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    return { error: null };
  },
};
