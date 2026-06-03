import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const ITEMS = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'Home' },
  { key: 'progress', label: 'Progress', icon: 'stats-chart-outline', activeIcon: 'stats-chart', route: 'Progress' },
  { key: 'tasks', label: 'Tasks', icon: 'checkbox-outline', activeIcon: 'checkbox', route: 'Tasks' },
  { key: 'milestones', label: 'Milestones', icon: 'ribbon-outline', activeIcon: 'ribbon', route: 'Milestones' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'Profile' },
];

const BottomNav = ({ navigation, activeKey }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.bottomNav, { backgroundColor: colors.navBg, borderTopColor: colors.border }]}>
      {ITEMS.map(item => {
        const active = item.key === activeKey;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.navButton, active && [styles.navButtonActive, { backgroundColor: colors.accentBg }]]}
            accessibilityRole="button"
            accessibilityLabel={`Go to ${item.key} tab`}
            onPress={() => navigation?.navigate(item.route)}
          >
            <Ionicons name={active ? item.activeIcon : item.icon} size={22} color={active ? colors.accent : colors.navIcon} />
            <Text style={[styles.navLabel, { color: active ? colors.accent : colors.navIcon }]}>{t(`nav.${item.key}`)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
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
  navButtonActive: {
    borderRadius: 16,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default BottomNav;
