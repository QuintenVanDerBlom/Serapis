import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { journeyService } from '../services/journeyService';
import BottomNav from '../components/BottomNav';

const DAY_MS = 24 * 60 * 60 * 1000;

const toDateKey = dateLike => {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const computeBestStreak = completedDateKeys => {
  const uniqueSorted = [...new Set(completedDateKeys.filter(Boolean))].sort();
  if (!uniqueSorted.length) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < uniqueSorted.length; i += 1) {
    const prev = new Date(uniqueSorted[i - 1]).getTime();
    const next = new Date(uniqueSorted[i]).getTime();
    if (!Number.isNaN(prev) && !Number.isNaN(next) && next - prev === DAY_MS) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
};

const SETTINGS_ITEMS = [
  { key: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
  { key: 'privacy', label: 'Privacy', icon: 'lock-closed-outline' },
  { key: 'about', label: 'About Serapis', icon: 'information-circle-outline' },
];

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const [displayName, setDisplayName] = useState('Serapis User');
  const [stats, setStats] = useState({
    movePoints: 0,
    missionsDone: 0,
    remindersKept: 0,
    bestStreakDays: 0,
  });

  useEffect(() => {
    let mounted = true;

    const loadProfileData = async () => {
      const { data: userData } = await authService.getCurrentUser();
      const user = userData?.user || {};
      const userId = user.id || 'guest';
      const username = user.username || 'Serapis User';

      const [{ data: tasks }, { data: progress }] = await Promise.all([
        journeyService.getTasks(userId),
        journeyService.getMonthlyProgress(userId),
      ]);

      if (!mounted) return;

      const completedTasks = (tasks || []).filter(task => Boolean(task.completedAt));
      const completedDateKeys = completedTasks.map(task => toDateKey(task.completedAt));

      setDisplayName(username);
      setStats({
        movePoints: progress?.earnedPoints || completedTasks.reduce((sum, task) => sum + (task.points || 0), 0),
        missionsDone: completedTasks.length,
        remindersKept: completedTasks.filter(task => task.reminderEnabled).length,
        bestStreakDays: computeBestStreak(completedDateKeys),
      });
    };

    loadProfileData();

    const unsubscribe = navigation?.addListener?.('focus', loadProfileData);
    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation?.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch {
      // ignore
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.heading} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.heading }]}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.accentBg }]}> 
            <Ionicons name="person" size={40} color={colors.accentLight} />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.movePoints}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Move Points</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.missionsDone}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Missions Done</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.remindersKept}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Reminders Kept</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.bestStreakDays} days</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Best Streak</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

        <View style={[styles.settingRow, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="moon-outline" size={20} color={colors.accent} />
          <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.accentLight }}
            thumbColor={colors.surface}
            accessibilityLabel="Toggle dark mode"
          />
        </View>

        {SETTINGS_ITEMS.map(item => (
          <TouchableOpacity
            key={item.key}
            style={[styles.settingRow, { backgroundColor: colors.surfaceAlt }]}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <Ionicons name={item.icon} size={20} color={colors.accent} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.borderStrong} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.logoutBg, borderColor: colors.logoutBorder }]}
          accessibilityRole="button"
          accessibilityLabel="Log out"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav navigation={navigation} activeKey="profile" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 22,
  },
  content: {
    padding: 18,
    paddingBottom: 36,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 3,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 18,
    borderWidth: 0,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 8,
  },
  settingLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ProfileScreen;
