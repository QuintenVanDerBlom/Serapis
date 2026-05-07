import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: userData } = await authService.getCurrentUser();
      const userId = userData?.user?.id || 'guest';

      const [{ data: milestoneRows }, { data: progress }] = await Promise.all([
        journeyService.getMilestones(userId),
        journeyService.getMonthlyProgress(userId),
      ]);

      if (!mounted) return;

      setMilestones(milestoneRows || []);
      setPoints(progress?.earnedPoints || 0);
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

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
                <Text style={[styles.milestoneTitle, { color: colors.text }]}>{item.title}</Text>
                <Ionicons
                  name={item.achieved ? 'ribbon' : 'ribbon-outline'}
                  size={20}
                  color={item.achieved ? colors.success : colors.secondary}
                />
              </View>
              <Text style={[styles.milestoneBody, { color: colors.secondary }]}>{item.description}</Text>
              <Text style={[styles.milestoneTarget, { color: colors.text }]}>{points}/{item.targetPoints} pts ({progressPct}%)</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSpacer: { width: 22 },
  content: { padding: 16, paddingBottom: 28 },
  summaryCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  summaryEyebrow: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  summaryValue: { fontSize: 32, fontWeight: '800', marginVertical: 4 },
  summaryBody: { fontSize: 13, lineHeight: 19 },
  milestoneCard: { borderRadius: 12, padding: 12, marginBottom: 8 },
  milestoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  milestoneTitle: { fontSize: 14, fontWeight: '700' },
  milestoneBody: { fontSize: 12, marginVertical: 5 },
  milestoneTarget: { fontSize: 12, fontWeight: '700' },
});

export default MilestonesScreen;
