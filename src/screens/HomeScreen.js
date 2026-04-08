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

const MENU_ITEMS = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'walks', label: 'Walks', icon: 'walk-outline' },
  { key: 'music', label: 'Music', icon: 'musical-notes-outline' },
  { key: 'wellness', label: 'Wellness', icon: 'leaf-outline' },
  { key: 'faq', label: 'FAQ', icon: 'help-circle-outline' },
];

const TABS = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'add', label: 'Add', icon: 'add-circle-outline', activeIcon: 'add-circle' },
  { key: 'bookmarks', label: 'Saved', icon: 'bookmark-outline', activeIcon: 'bookmark' },
  { key: 'trends', label: 'Trends', icon: 'analytics-outline', activeIcon: 'analytics' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
];

const TAB_CONTENT = {
  home: {
    eyebrow: 'Daily Flow',
    title: 'Welcome back',
    description:
      "Keep momentum today with calming walks, focused playlists, and simple wellness rituals.",
  },
  add: {
    eyebrow: 'Create',
    title: 'Add a mindful moment',
    description:
      'Capture a mood note, save a route, or pin a playlist so your routine keeps getting easier.',
  },
  bookmarks: {
    eyebrow: 'Saved',
    title: 'Your favorites are ready',
    description:
      'Jump back into routes and music you loved before without searching through everything again.',
  },
  trends: {
    eyebrow: 'Insights',
    title: 'You are building consistency',
    description:
      'Your activity trend is improving this month. Small daily actions are stacking up in a good way.',
  },
  profile: {
    eyebrow: 'Account',
    title: 'Your personal space',
    description:
      'Manage your preferences, check your progress history, and keep Serapis aligned to your goals.',
  },
};

const HomeScreen = ({ navigation }) => {
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

  const closeMenu = nextTabKey => {
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      if (nextTabKey === 'walks') {
        navigation?.navigate('WalkingRoutes');
      } else if (nextTabKey === 'music') {
        navigation?.navigate('Music');
      } else if (nextTabKey && TAB_CONTENT[nextTabKey]) {
        setActiveTab(nextTabKey);
      }
      setMenuVisible(false);
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.appFrame}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Serapis</Text>
            <Text style={styles.headerSub}>Mental wellness companion</Text>
          </View>
          <TouchableOpacity
            onPress={openMenu}
            accessibilityRole="button"
            accessibilityLabel="Open navigation menu"
            style={styles.menuButton}
          >
            <Ionicons name="menu-outline" size={24} color="#2d6a4f" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>{content.eyebrow}</Text>
            <Text style={styles.heading}>{content.title}</Text>
            <Text style={styles.description}>{content.description}</Text>

            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.primaryButton}
                accessibilityRole="button"
                accessibilityLabel="Open walking routes"
                onPress={() => navigation?.navigate('WalkingRoutes')}
              >
                <Ionicons name="walk-outline" size={16} color="#fff" />
                <Text style={styles.primaryButtonText}>Walking Routes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                accessibilityRole="button"
                accessibilityLabel="Open music playlists"
                onPress={() => navigation?.navigate('Music')}
              >
                <Ionicons name="musical-notes-outline" size={16} color="#2d6a4f" />
                <Text style={styles.secondaryButtonText}>Music Playlists</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>11</Text>
              <Text style={styles.metricLabel}>Walks this month</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>7h 20m</Text>
              <Text style={styles.metricLabel}>Calm listening</Text>
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Progression March ‘26</Text>
              <Ionicons name="trending-up" size={18} color="#2f7d32" />
            </View>
            <Text style={styles.progressText}>
              You have been consistent this month. Keep going with short routines and daily check-ins.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={styles.navButton}
              accessibilityRole="button"
              accessibilityLabel={`Go to ${tab.key} tab`}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={activeTab === tab.key ? tab.activeIcon : tab.icon}
                size={20}
                color={activeTab === tab.key ? '#2d6a4f' : '#74c69d'}
              />
              <Text style={[styles.navLabel, activeTab === tab.key && styles.navLabelActive]}>{tab.label}</Text>
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
          <Pressable style={styles.menuBackdrop} onPress={() => closeMenu()} />
          <Animated.View
            style={[
              styles.menuPanel,
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
              <Text style={styles.menuTitle}>Serapis</Text>
              <TouchableOpacity
                onPress={() => closeMenu()}
                accessibilityRole="button"
                accessibilityLabel="Close navigation menu"
              >
                <Ionicons name="close" size={24} color="#2d6a4f" />
              </TouchableOpacity>
            </View>
            <Text style={styles.menuSubtitle}>Navigate your app</Text>

            {MENU_ITEMS.map(item => (
              <TouchableOpacity
                key={item.key}
                onPress={() => closeMenu(item.key)}
                style={styles.menuItem}
                accessibilityRole="button"
              >
                <Ionicons name={item.icon} size={20} color="#40916c" />
                <Text style={[styles.menuItemText, activeTab === item.key && styles.menuItemActive]}>
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
