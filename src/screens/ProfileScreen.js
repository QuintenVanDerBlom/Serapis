import React, { useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/authService';
import { journeyService } from '../services/journeyService';
import { onboardingService } from '../services/onboardingService';
import { userPreferencesService } from '../services/userPreferencesService';
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
  { key: 'notifications', labelKey: 'profile.notifications', icon: 'notifications-outline' },
  { key: 'privacy', labelKey: 'profile.privacy', icon: 'lock-closed-outline' },
  { key: 'about', labelKey: 'profile.aboutSerapis', icon: 'information-circle-outline' },
];

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const [displayName, setDisplayName] = useState('Serapis User');
  const [stats, setStats] = useState({
    movePoints: 0,
    missionsDone: 0,
    remindersKept: 0,
    bestStreakDays: 0,
  });
  const [showRedoModal, setShowRedoModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    dailyReminders: true,
    streakAlerts: true,
    achievementAlerts: true,
  });

  useEffect(() => {
    let mounted = true;

    const loadProfileData = async () => {
      const { data: userData } = await authService.getCurrentUser();
      const user = userData?.user || {};
      const userId = user.id || 'guest';
      const username = user.username || 'Serapis User';

      const [{ data: tasks }, { data: progress }, notifSettings] = await Promise.all([
        journeyService.getTasks(userId),
        journeyService.getMonthlyProgress(userId),
        userPreferencesService.getNotificationSettings(userId),
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
      setNotificationSettings(notifSettings);
    };

    loadProfileData();

    const unsubscribe = navigation?.addListener?.('focus', loadProfileData);
    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [navigation]);

  const handleRedoOnboarding = () => {
    setShowRedoModal(true);
  };

  const handleSettingPress = (key) => {
    if (key === 'privacy') {
      setShowPrivacyModal(true);
    } else if (key === 'about') {
      setShowAboutModal(true);
    } else if (key === 'notifications') {
      setShowNotificationsModal(true);
    }
  };

  const toggleNotificationSetting = async (key) => {
    const next = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(next);

    // Save to Supabase (with local backup)
    const { data: userData } = await authService.getCurrentUser();
    const userId = userData?.user?.id;
    if (userId) {
      await userPreferencesService.saveNotificationSettings(userId, next);
    }
  };

  const confirmRedoOnboarding = async () => {
    setShowRedoModal(false);
    try {
      const { data: userData } = await authService.getCurrentUser();
      const userId = userData?.user?.id || 'guest';
      await onboardingService.clearProfile(userId);
      navigation?.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    } catch {
      Alert.alert(t('common.error'), t('profile.redoError'));
    }
  };

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
        <Text style={[styles.headerTitle, { color: colors.heading }]}>{t('profile.title')}</Text>
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
            <Text style={[styles.statLabel, { color: colors.secondary }]}>{t('profile.movePoints')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.missionsDone}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>{t('profile.missionsDone')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.remindersKept}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>{t('profile.remindersKept')}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.bestStreakDays} {t('common.days')}</Text>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>{t('profile.bestStreak')}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.settings')}</Text>

        <View style={[styles.settingRow, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="moon-outline" size={20} color={colors.accent} />
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t('profile.darkMode')}</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.accentLight }}
            thumbColor={colors.surface}
            accessibilityLabel="Toggle dark mode"
          />
        </View>

        <View style={[styles.settingRow, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="language-outline" size={20} color={colors.accent} />
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t('profile.language')}</Text>
          <View style={styles.languageToggle}>
            <TouchableOpacity
              style={[styles.langButton, language === 'en' && { backgroundColor: colors.accentLight }]}
              onPress={() => setLanguage('en')}
              accessibilityRole="button"
              accessibilityLabel="Switch to English"
            >
              <Text style={[styles.langButtonText, { color: language === 'en' ? '#fff' : colors.text }]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langButton, language === 'nl' && { backgroundColor: colors.accentLight }]}
              onPress={() => setLanguage('nl')}
              accessibilityRole="button"
              accessibilityLabel="Switch to Dutch"
            >
              <Text style={[styles.langButtonText, { color: language === 'nl' ? '#fff' : colors.text }]}>NL</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.settingRow, { backgroundColor: colors.surfaceAlt }]}
          accessibilityRole="button"
          accessibilityLabel="Redo onboarding"
          onPress={handleRedoOnboarding}
        >
          <Ionicons name="refresh-outline" size={20} color={colors.accent} />
          <Text style={[styles.settingLabel, { color: colors.text }]}>{t('profile.updateGoals')}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.borderStrong} />
        </TouchableOpacity>

        {SETTINGS_ITEMS.map(item => (
          <TouchableOpacity
            key={item.key}
            style={[styles.settingRow, { backgroundColor: colors.surfaceAlt }]}
            accessibilityRole="button"
            accessibilityLabel={t(item.labelKey)}
            onPress={() => handleSettingPress(item.key)}
          >
            <Ionicons name={item.icon} size={20} color={colors.accent} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>{t(item.labelKey)}</Text>
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
          <Text style={[styles.logoutText, { color: colors.error }]}>{t('profile.logOut')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav navigation={navigation} activeKey="profile" />

      <Modal
        visible={showRedoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRedoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Ionicons name="refresh-outline" size={28} color={colors.accent} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('profile.redoOnboardingTitle')}</Text>
            </View>
            <Text style={[styles.modalMessage, { color: colors.secondary }]}>
              {t('profile.redoOnboardingMessage')}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={() => setShowRedoModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: colors.accent }]}
                onPress={confirmRedoOnboarding}
              >
                <Text style={styles.modalButtonTextConfirm}>{t('common.continue')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.privacyModalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.privacyHeader}>
              <Ionicons name="lock-closed-outline" size={28} color={colors.accent} />
              <Text style={[styles.privacyTitle, { color: colors.text }]}>{t('profile.privacyTitle')}</Text>
              <TouchableOpacity
                onPress={() => setShowPrivacyModal(false)}
                accessibilityRole="button"
                accessibilityLabel={t('common.goBack')}
              >
                <Ionicons name="close" size={24} color={colors.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.privacyScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.privacyDate, { color: colors.secondary }]}>{t('profile.privacyLastUpdated')}</Text>
              <Text style={[styles.privacyIntro, { color: colors.text }]}>{t('profile.privacyIntro')}</Text>

              <View style={styles.privacySection}>
                <Text style={[styles.privacySectionTitle, { color: colors.heading }]}>{t('profile.privacyDataCollected')}</Text>
                <Text style={[styles.privacySectionBody, { color: colors.secondary }]}>{t('profile.privacyDataCollectedBody')}</Text>
              </View>

              <View style={styles.privacySection}>
                <Text style={[styles.privacySectionTitle, { color: colors.heading }]}>{t('profile.privacyHowWeUse')}</Text>
                <Text style={[styles.privacySectionBody, { color: colors.secondary }]}>{t('profile.privacyHowWeUseBody')}</Text>
              </View>

              <View style={styles.privacySection}>
                <Text style={[styles.privacySectionTitle, { color: colors.heading }]}>{t('profile.privacyStorage')}</Text>
                <Text style={[styles.privacySectionBody, { color: colors.secondary }]}>{t('profile.privacyStorageBody')}</Text>
              </View>

              <View style={styles.privacySection}>
                <Text style={[styles.privacySectionTitle, { color: colors.heading }]}>{t('profile.privacyContact')}</Text>
                <Text style={[styles.privacySectionBody, { color: colors.secondary }]}>{t('profile.privacyContactBody')}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAboutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.privacyModalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.privacyHeader}>
              <Ionicons name="information-circle-outline" size={28} color={colors.accent} />
              <Text style={[styles.privacyTitle, { color: colors.text }]}>{t('profile.aboutTitle')}</Text>
              <TouchableOpacity
                onPress={() => setShowAboutModal(false)}
                accessibilityRole="button"
                accessibilityLabel={t('common.goBack')}
              >
                <Ionicons name="close" size={24} color={colors.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.privacyScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.privacyDate, { color: colors.secondary }]}>{t('profile.aboutVersion')}</Text>
              <Text style={[styles.privacyIntro, { color: colors.text }]}>{t('profile.aboutMissionBody')}</Text>

              <View style={styles.privacySection}>
                <Text style={[styles.privacySectionTitle, { color: colors.heading }]}>{t('profile.aboutHowItWorks')}</Text>
                <Text style={[styles.privacySectionBody, { color: colors.secondary }]}>{t('profile.aboutHowItWorksBody')}</Text>
              </View>

              <View style={styles.privacySection}>
                <Text style={[styles.privacySectionTitle, { color: colors.heading }]}>{t('profile.aboutTeam')}</Text>
                <Text style={[styles.privacySectionBody, { color: colors.secondary }]}>{t('profile.aboutTeamBody')}</Text>
              </View>

              <View style={styles.privacySection}>
                <Text style={[styles.privacySectionTitle, { color: colors.heading }]}>{t('profile.aboutContact')}</Text>
                <Text style={[styles.privacySectionBody, { color: colors.secondary }]}>{t('profile.aboutContactBody')}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showNotificationsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.privacyModalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.privacyHeader}>
              <Ionicons name="notifications-outline" size={28} color={colors.accent} />
              <Text style={[styles.privacyTitle, { color: colors.text }]}>{t('profile.notificationsTitle')}</Text>
              <TouchableOpacity
                onPress={() => setShowNotificationsModal(false)}
                accessibilityRole="button"
                accessibilityLabel={t('common.goBack')}
              >
                <Ionicons name="close" size={24} color={colors.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.privacyScroll} showsVerticalScrollIndicator={false}>
              <View style={[styles.notificationRow, { backgroundColor: colors.surfaceAlt }]}>
                <View style={styles.notificationTextContainer}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>{t('profile.notificationsDailyReminders')}</Text>
                  <Text style={[styles.notificationSubtitle, { color: colors.secondary }]}>{t('profile.notificationsDailyRemindersBody')}</Text>
                </View>
                <Switch
                  value={notificationSettings.dailyReminders}
                  onValueChange={() => toggleNotificationSetting('dailyReminders')}
                  trackColor={{ false: colors.border, true: colors.accentLight }}
                  thumbColor={colors.surface}
                />
              </View>

              <View style={[styles.notificationRow, { backgroundColor: colors.surfaceAlt }]}>
                <View style={styles.notificationTextContainer}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>{t('profile.notificationsStreakAlerts')}</Text>
                  <Text style={[styles.notificationSubtitle, { color: colors.secondary }]}>{t('profile.notificationsStreakAlertsBody')}</Text>
                </View>
                <Switch
                  value={notificationSettings.streakAlerts}
                  onValueChange={() => toggleNotificationSetting('streakAlerts')}
                  trackColor={{ false: colors.border, true: colors.accentLight }}
                  thumbColor={colors.surface}
                />
              </View>

              <View style={[styles.notificationRow, { backgroundColor: colors.surfaceAlt }]}>
                <View style={styles.notificationTextContainer}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>{t('profile.notificationsAchievementAlerts')}</Text>
                  <Text style={[styles.notificationSubtitle, { color: colors.secondary }]}>{t('profile.notificationsAchievementAlertsBody')}</Text>
                </View>
                <Switch
                  value={notificationSettings.achievementAlerts}
                  onValueChange={() => toggleNotificationSetting('achievementAlerts')}
                  trackColor={{ false: colors.border, true: colors.accentLight }}
                  thumbColor={colors.surface}
                />
              </View>

              <TouchableOpacity
                style={[styles.testNotificationButton, { backgroundColor: colors.accent }]}
                accessibilityRole="button"
                accessibilityLabel={t('profile.notificationsTest')}
              >
                <Text style={styles.testNotificationText}>{t('profile.notificationsTest')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  languageToggle: {
    flexDirection: 'row',
    gap: 6,
  },
  langButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  langButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    flex: 1,
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonConfirm: {
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  privacyModalContent: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  privacyTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    flex: 1,
    marginLeft: 12,
  },
  privacyScroll: {
    paddingBottom: 12,
  },
  privacyDate: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  privacyIntro: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 20,
  },
  privacySection: {
    marginBottom: 18,
  },
  privacySectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  privacySectionBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  notificationTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  testNotificationButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testNotificationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProfileScreen;
