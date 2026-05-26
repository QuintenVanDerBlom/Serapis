import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const onboardingService = {
  async saveProfile(userId, profile) {
    const data = {
      feelings: profile.feelings || [],
      disabilities: profile.disabilities || {},
      completedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(buildKey(userId), JSON.stringify(data));
  },

  async getProfile(userId) {
    try {
      const raw = await AsyncStorage.getItem(buildKey(userId));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async isOnboarded(userId) {
    const profile = await this.getProfile(userId);
    return Boolean(profile?.completedAt);
  },

  async clearProfile(userId) {
    await AsyncStorage.removeItem(buildKey(userId));
  },
};
