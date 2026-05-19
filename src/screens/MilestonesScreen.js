import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { journeyService } from '../services/journeyService';
import BottomNav from '../components/BottomNav';

const MilestonesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [milestones, setMilestones] = useState([]);
  const [points, setPoints] = useState(0);

  const loadData = useCallback(async () => {
    const { data: userData } = await authService.getCurrentUser();
    const userId = userData?.user?.id || 'guest';

    const [{ data: milestoneRows }, { data: progress }] = await Promise.all([
      journeyService.getMilestones(userId),
      journeyService.getMonthlyProgress(userId),
    ]);

    setMilestones(milestoneRows || []);
    setPoints(progress?.earnedPoints || 0);
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
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to home" onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.heading} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.heading }]}>Milestones</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.summaryCard, { backgroundColor: colors.heroBg }]}>
          <Text style={[styles.summaryEyebrow, { color: colors.heroEyebrow }]}>Current points</Text>
          <Text style={[styles.summaryValue, { color: colors.heroText }]}>{points}</Text>
          <Text style={[styles.summaryBody, { color: colors.heroDesc }]}>Complete tasks to unlock milestones and keep your streak of achievements growing.</Text>
        </View>

        {milestones.map(item => {
          const progressPct = Math.min(100, Math.round((points / item.targetPoints) * 100));
          return (
            <View key={item.id} style={[styles.milestoneCard, { backgroundColor: colors.surfaceAlt }]}>
              <View style={styles.milestoneHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.milestoneTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.milestoneBody, { color: colors.secondary }]}>{item.description}</Text>
                </View>
                <View style={[styles.milestoneBadge, { backgroundColor: item.achieved ? colors.success : colors.border }]}>
                  <Ionicons
                    name={item.achieved ? 'ribbon' : 'ribbon-outline'}
                    size={18}
                    color={item.achieved ? '#fff' : colors.secondary}
                  />
                </View>
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
                <View style={[styles.progressBarFill, { width: `${progressPct}%`, backgroundColor: item.achieved ? colors.success : colors.accent }]} />
              </View>
              <View style={styles.milestoneFooter}>
                <Text style={[styles.milestoneTarget, { color: colors.secondary }]}>{points}/{item.targetPoints} pts</Text>
                <Text style={[styles.milestonePct, { color: item.achieved ? colors.success : colors.accent }]}>{progressPct}%</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <BottomNav navigation={navigation} activeKey="milestones" />
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
  summaryCard: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  summaryEyebrow: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2 },
  summaryValue: { fontSize: 36, fontWeight: '800', marginVertical: 6, letterSpacing: -1 },
  summaryBody: { fontSize: 14, lineHeight: 22 },
  milestoneCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  milestoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  milestoneBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  milestoneTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  milestoneBody: { fontSize: 12, fontWeight: '500', lineHeight: 17 },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  milestoneFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  milestoneTarget: { fontSize: 12, fontWeight: '600' },
  milestonePct: { fontSize: 13, fontWeight: '800' },
});

export default MilestonesScreen;
