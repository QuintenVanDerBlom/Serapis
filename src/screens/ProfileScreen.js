import React from 'react';
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

const PROFILE_STATS = [
  { label: 'Move Points', value: '4,260' },
  { label: 'Missions Done', value: '98' },
  { label: 'Reminders Kept', value: '211' },
  { label: 'Best Streak', value: '12 days' },
];

const SETTINGS_ITEMS = [
  { key: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
  { key: 'privacy', label: 'Privacy', icon: 'lock-closed-outline' },
  { key: 'about', label: 'About Serapis', icon: 'information-circle-outline' },
];

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();

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
          <Text style={[styles.userName, { color: colors.text }]}>Serapis User</Text>
          <Text style={[styles.userEmail, { color: colors.secondary }]}>user@serapis.app</Text>
        </View>

        <View style={styles.statsRow}>
          {PROFILE_STATS.map(stat => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.secondary }]}>{stat.label}</Text>
            </View>
          ))}
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
  avatarSection: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d8f3dc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1b4332',
  },
  userEmail: {
    fontSize: 13,
    color: '#40916c',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d8f3dc',
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b4332',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#40916c',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b4332',
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#edf7f0',
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1b4332',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: '#fff5f3',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fdddd6',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e76f51',
  },
});

export default ProfileScreen;
