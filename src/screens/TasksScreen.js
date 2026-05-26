import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
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
import { journeyService } from '../services/journeyService';
import { notificationService } from '../services/notificationService';
import BottomNav from '../components/BottomNav';

const TasksScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [tasks, setTasks] = useState([]);
  const userIdRef = useRef(null);

  const reload = async (userId) => {
    const { data } = await journeyService.getTasks(userId);
    setTasks(data || []);

    const reminders = (data || []).filter(t => t.reminderEnabled && !t.completed).map(task => ({
      key: task.id,
      enabled: true,
      title: task.title,
      body: `Time for: ${task.title}`,
      intervalMs: 45 * 60 * 1000,
    }));
    notificationService.syncReminders(reminders);

    notificationService.scheduleDailyTaskPush(data || []);
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: userData } = await authService.getCurrentUser();
      const userId = userData?.user?.id || 'guest';
      if (!mounted) return;
      userIdRef.current = userId;
      await reload(userId);
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', async () => {
      const userId = userIdRef.current;
      if (!userId) return;
      await reload(userId);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigation]);

  const toggleTaskDone = async (task) => {
    const userId = userIdRef.current;
    const { error } = await journeyService.setTaskCompletion(userId, task, !task.completed);
    if (error) {
      Alert.alert('Error', 'Could not update task');
      return;
    }

    await reload(userId);
  };

  const toggleReminder = async (task) => {
    const userId = userIdRef.current;

    const { error } = await journeyService.updateTaskReminder(task.id, !task.reminderEnabled, userId);
    if (error) {
      Alert.alert('Error', 'Could not update reminder');
      return;
    }

    await reload(userId);
  };

  const sendTestNotification = () => {
    notificationService.sendTestNotification();
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}> 
      <View style={[styles.header, { borderBottomColor: colors.border }]}> 
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to home" onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.heading} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.heading }]}>Tasks</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Text style={[styles.infoTitle, { color: colors.text }]}>Daily tasks are curated for you</Text>
          <Text style={[styles.infoBody, { color: colors.secondary }]}>You get a fixed set of low-commitment, high-impact tasks like walking, hydration, and brief mobility breaks.</Text>
        </View>

        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: colors.accentLight }]}
          onPress={sendTestNotification}
          accessibilityRole="button"
          accessibilityLabel="Send test notification"
        >
          <Ionicons name="notifications-outline" size={16} color="#fff" />
          <Text style={styles.testButtonText}>Send test notification</Text>
        </TouchableOpacity>

        {tasks.map(task => (
          <View key={task.id} style={[styles.taskCard, { backgroundColor: colors.surfaceAlt }]}>
            <View style={styles.taskMainRow}>
              <View style={styles.taskTextCol}>
                <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
                <Text style={[styles.taskMeta, { color: colors.secondary }]}>{task.category} • {task.points} pts</Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleTaskDone(task)}
                accessibilityRole="button"
                accessibilityLabel={`Mark ${task.title} as done`}
              >
                <Ionicons
                  name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={task.completed ? colors.success : colors.secondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.reminderRow}>
              <Text style={[styles.reminderLabel, { color: colors.secondary }]}>Reminder</Text>
              <Switch
                value={task.reminderEnabled}
                onValueChange={() => toggleReminder(task)}
                trackColor={{ false: colors.border, true: colors.accentLight }}
                thumbColor={colors.surface}
                accessibilityLabel={`Toggle reminder for ${task.title}`}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      <BottomNav navigation={navigation} activeKey="tasks" />
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
  infoCard: {
    borderWidth: 0,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  infoBody: { fontSize: 13, lineHeight: 20 },
  testButton: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    marginBottom: 14,
  },
  testButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  taskCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#1a3529',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  taskMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskTextCol: { flex: 1, paddingRight: 12 },
  taskTitle: { fontSize: 15, fontWeight: '700' },
  taskMeta: { marginTop: 3, fontSize: 12, fontWeight: '500' },
  reminderRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reminderLabel: { fontSize: 12, fontWeight: '600' },
});

export default TasksScreen;
