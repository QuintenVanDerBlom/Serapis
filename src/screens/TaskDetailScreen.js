import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const TaskDetailScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { t, tTask } = useLanguage();
  const task = route?.params?.task;

  if (!task) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 40 }}>{t('taskDetail.notFound')}</Text>
      </SafeAreaView>
    );
  }

  const openLink = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.heading} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.heading }]} numberOfLines={1}>
          {t('taskDetail.title')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.titleCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.accentBg }]}>
            <Text style={[styles.categoryText, { color: colors.accent }]}>{task.category}</Text>
          </View>
          <Text style={[styles.taskTitle, { color: colors.heading }]}>{tTask(task, 'title')}</Text>
          <Text style={[styles.pointsText, { color: colors.secondary }]}>{task.points} {t('common.points')}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surfaceAlt }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={18} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('taskDetail.howTo')}</Text>
          </View>
          <Text style={[styles.instructions, { color: colors.text }]}>{tTask(task, 'instructions')}</Text>
        </View>

        {task.links && task.links.length > 0 ? (
          <View style={[styles.section, { backgroundColor: colors.surfaceAlt }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="link-outline" size={18} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('taskDetail.resources')}</Text>
            </View>
            {(tTask(task, 'links') || task.links).map((link, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.linkRow, { borderBottomColor: colors.border }]}
                onPress={() => openLink(link.url)}
                accessibilityRole="link"
                accessibilityLabel={link.label}
              >
                <Ionicons
                  name={link.icon || 'open-outline'}
                  size={20}
                  color={link.icon === 'logo-youtube' ? '#FF0000' : colors.accent}
                />
                <Text style={[styles.linkText, { color: colors.accent }]}>{link.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.secondary} />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <View style={[styles.tipCard, { backgroundColor: colors.accentBg }]}>
          <Ionicons name="bulb-outline" size={18} color={colors.accent} />
          <Text style={[styles.tipText, { color: colors.text }]}>
            {t('taskDetail.tip')}
          </Text>
        </View>
      </ScrollView>
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
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3, flex: 1, marginLeft: 12 },
  headerSpacer: { width: 22 },
  content: { padding: 18, paddingBottom: 40 },
  titleCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  categoryText: { fontSize: 12, fontWeight: '700' },
  taskTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3, marginBottom: 6 },
  pointsText: { fontSize: 14, fontWeight: '600' },
  section: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  instructions: { fontSize: 14, lineHeight: 22 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  linkText: { flex: 1, fontSize: 14, fontWeight: '600' },
  tipCard: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipText: { flex: 1, fontSize: 13, lineHeight: 19 },
});

export default TaskDetailScreen;
