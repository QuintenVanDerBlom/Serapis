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
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/authService';
import { DEFAULT_WELLNESS_STATE, wellnessService } from '../services/wellnessService';
import { notificationService } from '../services/notificationService';
import BottomNav from '../components/BottomNav';

const MISSIONS = [
  { key: 'stretch', titleKey: 'wellness.stretch', xp: 60, icon: 'body-outline' },
  { key: 'steps', titleKey: 'wellness.steps', xp: 120, icon: 'footsteps-outline' },
  { key: 'water', titleKey: 'wellness.water', xp: 40, icon: 'water-outline' },
  { key: 'posture', titleKey: 'wellness.posture', xp: 50, icon: 'accessibility-outline' },
];

const WellnessScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
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

  const getReminderLabel = reminder => {
    if (reminder.key === 'hourly') return t('wellness.hourlyReminder');
    if (reminder.key === 'water') return t('wellness.hydrationReminder');
    if (reminder.key === 'posture') return t('wellness.postureReminder');
    return reminder.label;
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
        <Text style={[styles.headerTitle, { color: colors.heading }]}>{t('wellness.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: colors.heroBg }]}> 
          <Text style={[styles.heroEyebrow, { color: colors.heroEyebrow }]}>{t('wellness.eyebrow')}</Text>
          <Text style={[styles.heroTitle, { color: colors.heroText }]}>{t('wellness.heroTitle')}</Text>
          <Text style={[styles.heroSubtitle, { color: colors.heroDesc }]}> 
            {t('wellness.heroSubtitle')}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.statValue, { color: colors.text }]}>{points}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>{t('wellness.movePoints')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.statValue, { color: colors.text }]}>{streakDays} {t('common.days')}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>{t('wellness.activeStreak')}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('wellness.dailyMissions')}</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.secondary }]}> 
          {t('wellness.missionsSubtitle')}
        </Text>

        <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.progressRow}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>{t('wellness.todaysCompletion')}</Text>
            <Text style={[styles.progressValue, { color: colors.accent }]}>{progressPct}%</Text>
          </View>
          <Text style={[styles.progressSub, { color: colors.secondary }]}>
            {missionsDone}/{missionsTotal} {t('wellness.missionsDone')}
          </Text>
        </View>

        {MISSIONS.map(mission => {
          const done = completedMissions.includes(mission.key);
          const missionTitle = t(mission.titleKey);
          return (
            <TouchableOpacity
              key={mission.key}
              style={[styles.missionRow, { backgroundColor: colors.surfaceAlt }]}
              accessibilityRole="button"
              accessibilityLabel={`Toggle action ${missionTitle}`}
              onPress={() => toggleMission(mission)}
            >
              <View style={styles.missionLeft}>
                <Ionicons name={mission.icon} size={20} color={done ? colors.success : colors.accent} />
                <Text style={[styles.missionTitle, { color: colors.text }]}>{missionTitle}</Text>
              </View>
              <View style={styles.missionRight}>
                <Text style={[styles.missionXp, { color: colors.secondary }]}>+{mission.xp} XP</Text>
                <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={done ? colors.success : colors.secondary} />
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('wellness.reminderSettings')}</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.secondary }]}>{t('wellness.reminderSubtitle')}</Text>

        {reminders.map(reminder => (
          <View key={reminder.key} style={[styles.reminderRow, { backgroundColor: colors.surfaceAlt }]}> 
            <Text style={[styles.reminderLabel, { color: colors.text }]}>{getReminderLabel(reminder)}</Text>
            <Switch
              value={reminder.enabled}
              onValueChange={() => toggleReminder(reminder.key)}
              trackColor={{ false: colors.border, true: colors.accentLight }}
              thumbColor={colors.surface}
              accessibilityLabel={`Toggle ${getReminderLabel(reminder)}`}
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
          <Text style={styles.testButtonText}>{t('wellness.sendTest')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.streakButton, { backgroundColor: colors.accentLight }]}
          accessibilityRole="button"
          accessibilityLabel="Complete day and extend streak"
          onPress={completeDay}
        >
          <Ionicons name="flame-outline" size={16} color="#fff" />
          <Text style={styles.streakButtonText}>{t('wellness.markDayComplete')}</Text>
        </TouchableOpacity>

        <View style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.tipTitle, { color: colors.text }]}>{t('wellness.coachTip')}</Text>
          <Text style={[styles.tipText, { color: colors.secondary }]}> 
            {t('wellness.coachTipText')}
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
  heroCard: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 14,
  },
  progressCard: {
    borderWidth: 0,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    fontSize: 15,
    fontWeight: '800',
  },
  progressSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  missionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  missionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  reminderLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  streakButton: {
    marginTop: 10,
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  streakButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  tipCard: {
    borderWidth: 0,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
  },
  testButton: {
    marginTop: 6,
    marginBottom: 12,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  testButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});

export default WellnessScreen;
