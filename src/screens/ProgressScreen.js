import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { journeyService } from '../services/journeyService';
import BottomNav from '../components/BottomNav';

const ProgressScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [monthlyRows, setMonthlyRows] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: userData } = await authService.getCurrentUser();
      const userId = userData?.user?.id || 'guest';

      const { data } = await journeyService.getLastMonthsProgress(userId, 6);
      if (mounted) {
        setMonthlyRows(data || []);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

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
        <Text style={[styles.headerTitle, { color: colors.heading }]}>Progress</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.heroBg }]}>
          <Text style={[styles.cardEyebrow, { color: colors.heroEyebrow }]}>Monthly Overview</Text>
          <Text style={[styles.cardTitle, { color: colors.heroText }]}>Track your momentum over time</Text>
          <Text style={[styles.cardBody, { color: colors.heroDesc }]}>You can monitor completed tasks, earned points, and active days for each month.</Text>
        </View>

        {monthlyRows.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No monthly progress yet</Text>
            <Text style={[styles.emptyBody, { color: colors.secondary }]}>Complete tasks from the Tasks page and your monthly stats will appear here.</Text>
          </View>
        ) : (
          monthlyRows.map(row => (
            <View key={row.monthKey} style={[styles.rowCard, { backgroundColor: colors.surfaceAlt }]}> 
              <Text style={[styles.month, { color: colors.text }]}>{row.monthKey}</Text>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.secondary }]}>Completed tasks</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{row.completedTasks}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.secondary }]}>Points earned</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{row.earnedPoints}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.secondary }]}>Active days</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{row.activeDays}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <BottomNav navigation={navigation} activeKey="progress" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSpacer: { width: 22 },
  content: { padding: 16, paddingBottom: 28 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12 },
  cardEyebrow: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  cardTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  cardBody: { fontSize: 13, lineHeight: 19 },
  emptyCard: { borderWidth: 1, borderRadius: 14, padding: 14 },
  emptyTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  emptyBody: { fontSize: 13, lineHeight: 18 },
  rowCard: { borderRadius: 14, padding: 14, marginBottom: 10 },
  month: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  statLabel: { fontSize: 13 },
  statValue: { fontSize: 13, fontWeight: '700' },
});

export default ProgressScreen;
