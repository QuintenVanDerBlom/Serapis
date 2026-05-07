import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
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
import { DEFAULT_WELLNESS_STATE, wellnessService } from '../services/wellnessService';
import { notificationService } from '../services/notificationService';
import BottomNav from '../components/BottomNav';

const MISSIONS = [
  { key: 'stretch', title: '3-minute stretch', xp: 60, icon: 'body-outline' },
  { key: 'steps', title: '800 steps', xp: 120, icon: 'footsteps-outline' },
  { key: 'water', title: 'Hydrate break', xp: 40, icon: 'water-outline' },
  { key: 'posture', title: 'Desk posture reset', xp: 50, icon: 'accessibility-outline' },
];

const WellnessScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [completedMissions, setCompletedMissions] = useState(DEFAULT_WELLNESS_STATE.completedMissions);
  const [streakDays, setStreakDays] = useState(DEFAULT_WELLNESS_STATE.streakDays);
  const [points, setPoints] = useState(DEFAULT_WELLNESS_STATE.points);
  const [reminders, setReminders] = useState(DEFAULT_WELLNESS_STATE.reminders);
  const [hydrated, setHydrated] = useState(true);
  const userIdRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadWellnessState = async () => {
      const { data: userData } = await authService.getCurrentUser();
      const userId = userData?.user?.id;

      if (!userId) {
        return;
      }

      userIdRef.current = userId;

      const { data } = await wellnessService.getWellnessState(userId);

      if (!isMounted || !data) return;

      setPoints(data.points);
      setStreakDays(data.streakDays);
      setCompletedMissions(data.completedMissions);
      setReminders(data.reminders);
      setHydrated(true);
    };

    loadWellnessState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !userIdRef.current) {
      return;
    }

    wellnessService.saveWellnessState(userIdRef.current, {
      points,
      streakDays,
      completedMissions,
      reminders,
    });
  }, [hydrated, points, streakDays, completedMissions, reminders]);

  const toggleMission = mission => {
    setCompletedMissions(prev => {
      const alreadyDone = prev.includes(mission.key);
      if (alreadyDone) {
        setPoints(current => Math.max(0, current - mission.xp));
        return prev.filter(key => key !== mission.key);
      }
      setPoints(current => current + mission.xp);
      return [...prev, mission.key];
    });
  };

  const toggleReminder = reminderKey => {
    const updated = reminders.map(reminder =>
      reminder.key === reminderKey
        ? { ...reminder, enabled: !reminder.enabled }
        : reminder
    );
    setReminders(updated);
    notificationService.syncReminders(updated);
  };

  const handleTestNotification = () => {
    notificationService.sendTestNotification();
  };

  const completeDay = () => {
    setStreakDays(prev => prev + 1);
  };

  const missionsDone = completedMissions.length;
  const missionsTotal = MISSIONS.length;
  const progressPct = Math.round((missionsDone / missionsTotal) * 100);

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
        <Text style={[styles.headerTitle, { color: colors.heading }]}>Wellness</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: colors.heroBg }]}> 
          <Text style={[styles.heroEyebrow, { color: colors.heroEyebrow }]}>Movement Engine</Text>
          <Text style={[styles.heroTitle, { color: colors.heroText }]}>Keep your body in motion</Text>
          <Text style={[styles.heroSubtitle, { color: colors.heroDesc }]}> 
            Smart reminders and missions help you move consistently throughout the day.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.statValue, { color: colors.text }]}>{points}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Move points</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.statValue, { color: colors.text }]}>{streakDays} days</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Active streak</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Missions</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.secondary }]}> 
          Complete small movement tasks to earn points.
        </Text>

        <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.progressRow}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Today's completion</Text>
            <Text style={[styles.progressValue, { color: colors.accent }]}>{progressPct}%</Text>
          </View>
          <Text style={[styles.progressSub, { color: colors.secondary }]}>
            {missionsDone}/{missionsTotal} missions done
          </Text>
        </View>

        {MISSIONS.map(mission => {
          const done = completedMissions.includes(mission.key);
          return (
            <TouchableOpacity
              key={mission.key}
              style={[styles.missionRow, { backgroundColor: colors.surfaceAlt }]}
              accessibilityRole="button"
              accessibilityLabel={`Toggle mission ${mission.title}`}
              onPress={() => toggleMission(mission)}
            >
              <View style={styles.missionLeft}>
                <Ionicons name={mission.icon} size={20} color={done ? colors.success : colors.accent} />
                <Text style={[styles.missionTitle, { color: colors.text }]}>{mission.title}</Text>
              </View>
              <View style={styles.missionRight}>
                <Text style={[styles.missionXp, { color: colors.secondary }]}>+{mission.xp} XP</Text>
                <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={done ? colors.success : colors.secondary} />
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Reminder Settings</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.secondary }]}>Turn reminders on to keep moving during the day.</Text>

        {reminders.map(reminder => (
          <View key={reminder.key} style={[styles.reminderRow, { backgroundColor: colors.surfaceAlt }]}> 
            <Text style={[styles.reminderLabel, { color: colors.text }]}>{reminder.label}</Text>
            <Switch
              value={reminder.enabled}
              onValueChange={() => toggleReminder(reminder.key)}
              trackColor={{ false: colors.border, true: colors.accentLight }}
              thumbColor={colors.surface}
              accessibilityLabel={`Toggle ${reminder.label}`}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: colors.accent }]}
          accessibilityRole="button"
          accessibilityLabel="Send test notification"
          onPress={handleTestNotification}
        >
          <Ionicons name="notifications-outline" size={16} color="#fff" />
          <Text style={styles.testButtonText}>Send test notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.streakButton, { backgroundColor: colors.accentLight }]}
          accessibilityRole="button"
          accessibilityLabel="Complete day and extend streak"
          onPress={completeDay}
        >
          <Ionicons name="flame-outline" size={16} color="#fff" />
          <Text style={styles.streakButtonText}>Mark day complete</Text>
        </TouchableOpacity>

        <View style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.tipTitle, { color: colors.text }]}>Coach Tip</Text>
          <Text style={[styles.tipText, { color: colors.secondary }]}> 
            Pair reminders with existing habits: move each time you finish a meeting or task block.
          </Text>
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} activeKey="tasks" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8faf9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d8f3dc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b5e3f',
  },
  headerSpacer: {
    width: 22,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  progressCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressSub: {
    fontSize: 12,
    marginTop: 4,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  missionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  missionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  missionXp: {
    fontSize: 12,
    fontWeight: '700',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  reminderLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  streakButton: {
    marginTop: 8,
    marginBottom: 14,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  streakButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  tipCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 19,
  },
  testButton: {
    marginTop: 4,
    marginBottom: 10,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  testButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});

export default WellnessScreen;
