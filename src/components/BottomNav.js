import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ITEMS = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'Home' },
  { key: 'progress', label: 'Progress', icon: 'stats-chart-outline', activeIcon: 'stats-chart', route: 'Progress' },
  { key: 'tasks', label: 'Tasks', icon: 'checkbox-outline', activeIcon: 'checkbox', route: 'Tasks' },
  { key: 'milestones', label: 'Milestones', icon: 'ribbon-outline', activeIcon: 'ribbon', route: 'Milestones' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'Profile' },
];

const BottomNav = ({ navigation, activeKey }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.bottomNav, { backgroundColor: colors.navBg, borderTopColor: colors.border }]}>
      {ITEMS.map(item => {
        const active = item.key === activeKey;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel={`Go to ${item.key} tab`}
            onPress={() => navigation?.navigate(item.route)}
          >
            <Ionicons name={active ? item.activeIcon : item.icon} size={20} color={active ? colors.accent : colors.navIcon} />
            <Text style={[styles.navLabel, { color: active ? colors.accent : colors.navIcon }]}>{item.label}</Text>
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
    paddingTop: 8,
    paddingBottom: 10,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 58,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default BottomNav;
