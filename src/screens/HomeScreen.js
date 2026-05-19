import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { journeyService } from '../services/journeyService';

const MENU_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'progress', label: 'Progress', icon: 'stats-chart-outline' },
  { key: 'tasks', label: 'Tasks', icon: 'checkbox-outline' },
  { key: 'milestones', label: 'Milestones', icon: 'ribbon-outline' },
  { key: 'profile', label: 'Profile', icon: 'person-outline' },
];

const TABS = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'progress', label: 'Progress', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
  { key: 'tasks', label: 'Tasks', icon: 'checkbox-outline', activeIcon: 'checkbox' },
  { key: 'milestones', label: 'Milestones', icon: 'ribbon-outline', activeIcon: 'ribbon' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

const TAB_CONTENT = {
  home: {
    eyebrow: 'Daily Momentum',
    title: 'Welcome back',
    description:
      'Build healthy movement in small bursts with reminders, streaks, and daily missions.',
  },
  progress: {
    eyebrow: 'Monthly Insights',
    title: 'Understand your momentum',
    description:
      'Review your monthly completed tasks, earned points, and active days in one place.',
  },
  tasks: {
    eyebrow: 'Action Board',
    title: 'Take care of yourself today',
    description:
      'Complete simple wellness tasks and keep reminder nudges active throughout your day.',
  },
  milestones: {
    eyebrow: 'Achievements',
    title: 'Unlock meaningful milestones',
    description:
      'Turn daily self-care into long-term growth with point-based milestone goals.',
  },
  profile: {
    eyebrow: 'Account',
    title: 'Your personal space',
    description:
      'Manage your preferences, check your progress history, and keep Serapis aligned to your goals.',
  },
};

const DAY_MS = 24 * 60 * 60 * 1000;

const toDateKey = dateLike => {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

const computeCurrentStreak = completedDateKeys => {
  const unique = new Set(completedDateKeys.filter(Boolean));
  let streak = 0;

  for (let i = 0; i < 365; i += 1) {
    const day = new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10);
    if (unique.has(day)) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
};

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [pointsThisWeek, setPointsThisWeek] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [dailyProgressText, setDailyProgressText] = useState('0/0 tasks complete today.');
  const menuAnim = useRef(new Animated.Value(0)).current;

  const content = useMemo(() => TAB_CONTENT[activeTab] || TAB_CONTENT.home, [activeTab]);

  const loadHomeMetrics = useCallback(async () => {
    const { data: userData } = await authService.getCurrentUser();
    const userId = userData?.user?.id || 'guest';

    const { data } = await journeyService.getTasks(userId);
    const nextTasks = data || [];

    const now = Date.now();
    const weekAgo = now - 7 * DAY_MS;
    const todayKey = new Date(now).toISOString().slice(0, 10);

    const completionHistory = nextTasks.filter(task => Boolean(task.completedAt));
    const weeklyPoints = completionHistory
      .filter(task => {
        const ts = new Date(task.completedAt).getTime();
        return !Number.isNaN(ts) && ts >= weekAgo;
      })
      .reduce((sum, task) => sum + (task.points || 0), 0);

    const completedDateKeys = completionHistory.map(task => toDateKey(task.completedAt));
    const streak = computeCurrentStreak(completedDateKeys);

    const doneToday = nextTasks.filter(task => task.completed && toDateKey(task.completedAt) === todayKey).length;
    const totalTasks = nextTasks.length;
    const nextTask = nextTasks.find(task => !task.completed);
    const progressText =
      doneToday >= totalTasks && totalTasks > 0
        ? 'All daily tasks complete. Great consistency today.'
        : `${doneToday}/${totalTasks} tasks complete today${nextTask ? `. Next: ${nextTask.title}.` : '.'}`;

    setPointsThisWeek(weeklyPoints);
    setStreakDays(streak);
    setDailyProgressText(progressText);
  }, []);

  useEffect(() => {
    loadHomeMetrics();

    const unsubscribe = navigation?.addListener?.('focus', loadHomeMetrics);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigation, loadHomeMetrics]);

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(menuAnim, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const navigateToTab = tabKey => {
    if (tabKey === 'progress') {
      navigation?.navigate('Progress');
    } else if (tabKey === 'tasks') {
      navigation?.navigate('Tasks');
    } else if (tabKey === 'milestones') {
      navigation?.navigate('Milestones');
    } else if (tabKey === 'profile') {
      navigation?.navigate('Profile');
    } else {
      setActiveTab('home');
    }
  };

  const closeMenu = nextTabKey => {
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      if (nextTabKey === 'progress') {
        navigation?.navigate('Progress');
      } else if (nextTabKey === 'tasks') {
        navigation?.navigate('Tasks');
      } else if (nextTabKey === 'milestones') {
        navigation?.navigate('Milestones');
      } else if (nextTabKey === 'profile') {
        navigation?.navigate('Profile');
      } else if (nextTabKey && TAB_CONTENT[nextTabKey]) {
        setActiveTab(nextTabKey);
      }
      setMenuVisible(false);
    });
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.appFrame, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.brand, { color: colors.heading }]}>Serapis</Text>
            <Text style={[styles.headerSub, { color: colors.muted }]}>Mental wellness companion</Text>
          </View>
          <TouchableOpacity
            onPress={openMenu}
            accessibilityRole="button"
            accessibilityLabel="Open navigation menu"
            style={[styles.menuButton, { backgroundColor: colors.accentBg }]}
          >
            <Ionicons name="menu-outline" size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroCard, { backgroundColor: colors.heroBg }]}> 
            <Text style={[styles.eyebrow, { color: colors.heroEyebrow }]}>{content.eyebrow}</Text>
            <Text style={[styles.heading, { color: colors.heroText }]}>{content.title}</Text>
            <Text style={[styles.description, { color: colors.heroDesc }]}>{content.description}</Text>

            <View style={styles.heroActions}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.accentLight }]}
                accessibilityRole="button"
                accessibilityLabel="Open movement plan"
                onPress={() => navigation?.navigate('Tasks')}
              >
                <Ionicons name="footsteps-outline" size={16} color="#fff" />
                <Text style={styles.primaryButtonText}>Open Tasks</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: colors.heroSecBg }]}
                accessibilityRole="button"
                accessibilityLabel="Open daily challenges"
                onPress={() => navigation?.navigate('Milestones')}
              >
                <Ionicons name="trophy-outline" size={16} color={colors.heroSecText} />
                <Text style={[styles.secondaryButtonText, { color: colors.heroSecText }]}>View Milestones</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { backgroundColor: colors.bg, borderColor: colors.border }]}> 
              <Text style={[styles.metricValue, { color: colors.text }]}>{pointsThisWeek}</Text>
              <Text style={[styles.metricLabel, { color: colors.secondary }]}>Points this week</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.bg, borderColor: colors.border }]}> 
              <Text style={[styles.metricValue, { color: colors.text }]}>{streakDays} days</Text>
              <Text style={[styles.metricLabel, { color: colors.secondary }]}>Current streak</Text>
            </View>
          </View>

          <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <View style={styles.progressHeader}>
              <Text style={[styles.progressTitle, { color: colors.text }]}>Daily Progress</Text>
              <Ionicons name="trending-up" size={18} color={colors.success} />
            </View>
            <Text style={[styles.progressText, { color: colors.accent }]}> 
              {dailyProgressText}
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.bottomNav, { backgroundColor: colors.navBg, borderTopColor: colors.border }]}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={styles.navButton}
              accessibilityRole="button"
              accessibilityLabel={`Go to ${tab.key} tab`}
              onPress={() => navigateToTab(tab.key)}
            >
              <Ionicons
                name={activeTab === tab.key ? tab.activeIcon : tab.icon}
                size={20}
                color={activeTab === tab.key ? colors.accent : colors.navIcon}
              />
              <Text style={[styles.navLabel, { color: colors.navIcon }, activeTab === tab.key && { color: colors.accent }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {menuVisible ? (
        <Animated.View
          style={[
            styles.menuOverlay,
            {
              opacity: menuAnim,
            },
          ]}
        >
          <Pressable style={[styles.menuBackdrop, { backgroundColor: colors.backdrop }]} onPress={() => closeMenu()} />
          <Animated.View
            style={[
              styles.menuPanel,
              { backgroundColor: colors.bg },
              {
                transform: [
                  {
                    translateY: menuAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [36, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: colors.heading }]}>Serapis</Text>
              <TouchableOpacity
                onPress={() => closeMenu()}
                accessibilityRole="button"
                accessibilityLabel="Close navigation menu"
              >
                <Ionicons name="close" size={24} color={colors.accent} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.menuSubtitle, { color: colors.muted }]}>Navigate your app</Text>

            {MENU_ITEMS.map(item => (
              <TouchableOpacity
                key={item.key}
                onPress={() => closeMenu(item.key)}
                style={[styles.menuItem, { backgroundColor: colors.surfaceAlt }]}
                accessibilityRole="button"
              >
                <Ionicons name={item.icon} size={20} color={colors.secondary} />
                <Text style={[styles.menuItemText, { color: colors.accent }, activeTab === item.key && { color: colors.heading }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  appFrame: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  brand: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    paddingBottom: 28,
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
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 0,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 0,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressText: {
    fontSize: 13,
    lineHeight: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    justifyContent: 'space-around',
    paddingTop: 6,
    paddingBottom: 12,
    paddingHorizontal: 4,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 60,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  navLabelActive: {},
  menuOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuPanel: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 32,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  menuSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 6,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuItemActive: {},
});

export default HomeScreen;
