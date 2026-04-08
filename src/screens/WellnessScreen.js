import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G } from 'react-native-svg';

const MOODS = [
  { key: 'happy', label: 'Happy', icon: 'happy-outline', color: '#52b788' },
  { key: 'calm', label: 'Calm', icon: 'leaf-outline', color: '#40916c' },
  { key: 'stressed', label: 'Stressed', icon: 'thunderstorm-outline', color: '#e76f51' },
  { key: 'sad', label: 'Sad', icon: 'rainy-outline', color: '#457b9d' },
  { key: 'energetic', label: 'Energetic', icon: 'flash-outline', color: '#e9c46a' },
];

const INITIAL_ENTRIES = [
  { mood: 'happy', date: '2026-04-07' },
  { mood: 'calm', date: '2026-04-06' },
  { mood: 'happy', date: '2026-04-05' },
  { mood: 'stressed', date: '2026-04-04' },
  { mood: 'calm', date: '2026-04-03' },
  { mood: 'sad', date: '2026-04-02' },
  { mood: 'energetic', date: '2026-04-01' },
  { mood: 'happy', date: '2026-03-31' },
  { mood: 'calm', date: '2026-03-30' },
  { mood: 'energetic', date: '2026-03-29' },
];

const PIE_SIZE = 200;
const PIE_RADIUS = 90;
const PIE_CENTER = PIE_SIZE / 2;

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const buildSlicePath = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
};

const PieChart = ({ entries }) => {
  const counts = {};
  entries.forEach(e => {
    counts[e.mood] = (counts[e.mood] || 0) + 1;
  });

  const total = entries.length;
  if (total === 0) return null;

  const slices = [];
  let currentAngle = 0;

  MOODS.forEach(mood => {
    const count = counts[mood.key] || 0;
    if (count === 0) return;
    const sliceAngle = (count / total) * 360;
    slices.push({
      ...mood,
      count,
      startAngle: currentAngle,
      endAngle: currentAngle + sliceAngle,
    });
    currentAngle += sliceAngle;
  });

  return (
    <Svg width={PIE_SIZE} height={PIE_SIZE} viewBox={`0 0 ${PIE_SIZE} ${PIE_SIZE}`}>
      <G>
        {slices.map(slice => (
          <Path
            key={slice.key}
            d={buildSlicePath(PIE_CENTER, PIE_CENTER, PIE_RADIUS, slice.startAngle, slice.endAngle)}
            fill={slice.color}
          />
        ))}
      </G>
    </Svg>
  );
};

const WellnessScreen = ({ navigation }) => {
  const [entries, setEntries] = useState(INITIAL_ENTRIES);

  const logMood = moodKey => {
    const today = new Date().toISOString().split('T')[0];
    setEntries(prev => [{ mood: moodKey, date: today }, ...prev]);
  };

  const counts = {};
  entries.forEach(e => {
    counts[e.mood] = (counts[e.mood] || 0) + 1;
  });

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#1b5e3f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wellness</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        <Text style={styles.sectionSubtitle}>Tap a mood to log it for today.</Text>

        <View style={styles.moodRow}>
          {MOODS.map(mood => (
            <TouchableOpacity
              key={mood.key}
              style={styles.moodButton}
              accessibilityRole="button"
              accessibilityLabel={`Log mood ${mood.label}`}
              onPress={() => logMood(mood.key)}
            >
              <View style={[styles.moodIconWrap, { backgroundColor: mood.color + '22' }]}>
                <Ionicons name={mood.icon} size={24} color={mood.color} />
              </View>
              <Text style={styles.moodLabel}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Mood Insight</Text>
        <Text style={styles.sectionSubtitle}>
          Based on {entries.length} logged entries.
        </Text>

        <View style={styles.chartCard}>
          <PieChart entries={entries} />
        </View>

        <View style={styles.legendWrap}>
          {MOODS.map(mood => {
            const count = counts[mood.key] || 0;
            if (count === 0) return null;
            const pct = Math.round((count / entries.length) * 100);
            return (
              <View key={mood.key} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: mood.color }]} />
                <Text style={styles.legendLabel}>{mood.label}</Text>
                <Text style={styles.legendValue}>
                  {count} ({pct}%)
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Recent Entries</Text>
        {entries.slice(0, 7).map((entry, idx) => {
          const moodInfo = MOODS.find(m => m.key === entry.mood) || MOODS[0];
          return (
            <View key={`${entry.date}-${idx}`} style={styles.entryRow}>
              <Ionicons name={moodInfo.icon} size={18} color={moodInfo.color} />
              <Text style={styles.entryMood}>{moodInfo.label}</Text>
              <Text style={styles.entryDate}>{entry.date}</Text>
            </View>
          );
        })}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1b4332',
    marginTop: 16,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#40916c',
    marginBottom: 12,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  moodButton: {
    alignItems: 'center',
    gap: 4,
  },
  moodIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1b4332',
  },
  chartCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d8f3dc',
    paddingVertical: 20,
    marginBottom: 12,
  },
  legendWrap: {
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1b4332',
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#40916c',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#edf7f0',
  },
  entryMood: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1b4332',
  },
  entryDate: {
    fontSize: 12,
    color: '#40916c',
  },
});

export default WellnessScreen;
