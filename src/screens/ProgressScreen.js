import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/authService';
import { journeyService } from '../services/journeyService';
import BottomNav from '../components/BottomNav';

const ProgressScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [monthlyRows, setMonthlyRows] = useState([]);

  const loadData = useCallback(async () => {
    const { data: userData } = await authService.getCurrentUser();
    const userId = userData?.user?.id || 'guest';

    const { data } = await journeyService.getLastMonthsProgress(userId, 6);
    setMonthlyRows(data || []);
  }, []);

  useEffect(() => {
    loadData();

    const unsubscribe = navigation?.addListener?.('focus', loadData);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigation, loadData]);

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
        <Text style={[styles.headerTitle, { color: colors.heading }]}>{t('progressScreen.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.heroBg }]}>
          <Text style={[styles.cardEyebrow, { color: colors.heroEyebrow }]}>{t('progressScreen.eyebrow')}</Text>
          <Text style={[styles.cardTitle, { color: colors.heroText }]}>{t('progressScreen.heading')}</Text>
          <Text style={[styles.cardBody, { color: colors.heroDesc }]}>{t('progressScreen.body')}</Text>
        </View>

        {monthlyRows.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('progressScreen.emptyTitle')}</Text>
            <Text style={[styles.emptyBody, { color: colors.secondary }]}>{t('progressScreen.emptyBody')}</Text>
          </View>
        ) : (
          monthlyRows.map(row => (
            <View key={row.monthKey} style={[styles.rowCard, { backgroundColor: colors.surfaceAlt }]}> 
              <Text style={[styles.month, { color: colors.text }]}>{row.monthKey}</Text>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.secondary }]}>{t('progressScreen.completedTasks')}</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{row.completedTasks}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.secondary }]}>{t('progressScreen.pointsEarned')}</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{row.earnedPoints}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.secondary }]}>{t('progressScreen.activeDays')}</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  headerSpacer: { width: 22 },
  content: { padding: 18, paddingBottom: 32 },
  card: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  cardEyebrow: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 },
  cardTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3, marginBottom: 8 },
  cardBody: { fontSize: 14, lineHeight: 22 },
  emptyCard: {
    borderWidth: 0,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyBody: { fontSize: 13, lineHeight: 20 },
  rowCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  month: { fontSize: 17, fontWeight: '800', letterSpacing: -0.2, marginBottom: 10 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' },
  statLabel: { fontSize: 13, fontWeight: '500' },
  statValue: { fontSize: 14, fontWeight: '700' },
});

export default ProgressScreen;
