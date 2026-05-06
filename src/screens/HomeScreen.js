import React, { useMemo, useRef, useState } from 'react';
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

const MENU_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'plan', label: 'Move Plan', icon: 'footsteps-outline' },
  { key: 'challenges', label: 'Challenges', icon: 'trophy-outline' },
  { key: 'wellness', label: 'Wellness', icon: 'leaf-outline' },
  { key: 'profile', label: 'Profile', icon: 'person-outline' },
];

const TABS = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'plan', label: 'Plan', icon: 'calendar-outline', activeIcon: 'calendar' },
  { key: 'reminders', label: 'Reminders', icon: 'notifications-outline', activeIcon: 'notifications' },
  { key: 'rewards', label: 'Rewards', icon: 'trophy-outline', activeIcon: 'trophy' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

const TAB_CONTENT = {
  home: {
    eyebrow: 'Daily Momentum',
    title: 'Welcome back',
    description:
      'Build healthy movement in small bursts with reminders, streaks, and daily missions.',
  },
  plan: {
    eyebrow: 'Move Plan',
    title: 'Plan your active breaks',
    description:
      'Set quick movement blocks for your day: stretch, stand, walk indoors, and breathe.',
  },
  reminders: {
    eyebrow: 'Nudges',
    title: 'Stay consistent all day',
    description:
      'Gentle reminders help you move every hour and avoid long inactive sessions.',
  },
  rewards: {
    eyebrow: 'Gamified Progress',
    title: 'Unlock rewards by moving',
    description:
      'Earn points, keep your streak alive, and complete missions to level up your wellness journey.',
  },
  profile: {
    eyebrow: 'Account',
    title: 'Your personal space',
    description:
      'Manage your preferences, check your progress history, and keep Serapis aligned to your goals.',
  },
};

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const menuAnim = useRef(new Animated.Value(0)).current;

  const content = useMemo(() => TAB_CONTENT[activeTab] || TAB_CONTENT.home, [activeTab]);

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
    if (tabKey === 'plan' || tabKey === 'reminders' || tabKey === 'rewards') {
      navigation?.navigate('Wellness');
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
      if (nextTabKey === 'wellness' || nextTabKey === 'challenges' || nextTabKey === 'plan') {
        navigation?.navigate('Wellness');
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
                onPress={() => navigation?.navigate('Wellness')}
              >
                <Ionicons name="footsteps-outline" size={16} color="#fff" />
                <Text style={styles.primaryButtonText}>Movement Plan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, { backgroundColor: colors.heroSecBg }]}
                accessibilityRole="button"
                accessibilityLabel="Open daily challenges"
                onPress={() => navigation?.navigate('Wellness')}
              >
                <Ionicons name="trophy-outline" size={16} color={colors.heroSecText} />
                <Text style={[styles.secondaryButtonText, { color: colors.heroSecText }]}>Daily Challenges</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { backgroundColor: colors.bg, borderColor: colors.border }]}> 
              <Text style={[styles.metricValue, { color: colors.text }]}>840</Text>
              <Text style={[styles.metricLabel, { color: colors.secondary }]}>Move points this week</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.bg, borderColor: colors.border }]}> 
              <Text style={[styles.metricValue, { color: colors.text }]}>6 days</Text>
              <Text style={[styles.metricLabel, { color: colors.secondary }]}>Current reminder streak</Text>
            </View>
          </View>

          <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressTitle, { color: colors.text }]}>Mission Progress Today</Text>
              <Ionicons name="trending-up" size={18} color={colors.success} />
            </View>
            <Text style={[styles.progressText, { color: colors.accent }]}> 
              3/5 missions complete. Next: 3-minute stretch break in 20 minutes.
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
    backgroundColor: '#edf7f0',
  },
  appFrame: {
    flex: 1,
    backgroundColor: '#f8faf9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#d8f3dc',
  },
  brand: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1b5e3f',
  },
  headerSub: {
    marginTop: 2,
    fontSize: 12,
    color: '#52b788',
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d8f3dc',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: '#2d6a4f',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b7e4c7',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: '#f1fff5',
    marginBottom: 14,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#52b788',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f1fff5',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#1b5e3f',
    fontSize: 13,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f8faf9',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d8f3dc',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b4332',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#40916c',
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d8f3dc',
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
    color: '#1b4332',
  },
  progressText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#2d6a4f',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#d8f3dc',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 58,
  },
  navLabel: {
    fontSize: 11,
    color: '#74c69d',
    fontWeight: '600',
  },
  navLabelActive: {
    color: '#2d6a4f',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(9, 21, 16, 0.3)',
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 16, 10, 0.4)',
  },
  menuPanel: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8faf9',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 28,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1b5e3f',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#52b788',
    marginBottom: 28,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: '#edf7f0',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d6a4f',
  },
  menuItemActive: {
    color: '#1b5e3f',
  },
});

export default HomeScreen;
