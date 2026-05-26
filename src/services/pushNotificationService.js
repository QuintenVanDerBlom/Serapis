import { Platform } from 'react-native';

const TASK_REMINDER_CATEGORY = 'task-reminder';
const SCREEN_TIME_CATEGORY = 'screen-time-break';
const DAILY_TASK_IDENTIFIER_PREFIX = 'daily-task-';
const SCREEN_TIME_IDENTIFIER = 'screen-time-break-reminder';

const _noop = { remove: () => {} };

let _isAvailable = false;
let Notifications = null;

function _init() {
  if (Notifications !== null) return;

  try {
    const Constants = require('expo-constants').default;
    console.log('[Push] appOwnership:', Constants.appOwnership);
    if (Constants.appOwnership === 'expo') {
      Notifications = null;
      _isAvailable = false;
      console.log('[Push] Expo Go detected — notifications disabled');
      return;
    }
  } catch (e) {
    console.log('[Push] expo-constants check skipped:', e.message);
  }

  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    _isAvailable = true;
    console.log('[Push] Notifications module loaded successfully');
  } catch (e) {
    Notifications = null;
    _isAvailable = false;
    console.log('[Push] Failed to load notifications:', e.message);
  }
}

_init();

async function registerForPushNotifications() {
  if (!_isAvailable) return null;

  try {
    const Device = require('expo-device');
    if (!Device.isDevice) {
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('serapis-reminders', {
        name: 'Serapis Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2b7a55',
      });

      await Notifications.setNotificationChannelAsync('serapis-screen-time', {
        name: 'Screen Time Breaks',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 100, 200],
        lightColor: '#2e86b0',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '21143784-1eaf-4ac5-a157-4a6a2de2c7d4',
    });

    return tokenData?.data || null;
  } catch (e) {
    _isAvailable = false;
    console.log('[Push] Registration error:', e.message);
    return null;
  }
}

async function scheduleDailyTaskReminders(tasks) {
  if (!_isAvailable) return;

  try {
    const existing = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of existing) {
      if (notif.identifier.startsWith(DAILY_TASK_IDENTIFIER_PREFIX)) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    const pendingTasks = tasks.filter(t => t.reminderEnabled && !t.completed);
    if (pendingTasks.length === 0) return;

    const taskTitles = pendingTasks.map(t => t.title).join(', ');
    const body =
      pendingTasks.length === 1
        ? `Don't forget: ${pendingTasks[0].title}`
        : `You have ${pendingTasks.length} tasks waiting: ${taskTitles}`;

    await Notifications.scheduleNotificationAsync({
      identifier: `${DAILY_TASK_IDENTIFIER_PREFIX}batch`,
      content: {
        title: '📋 Daily Task Reminder',
        body,
        data: { type: TASK_REMINDER_CATEGORY, taskIds: pendingTasks.map(t => t.id) },
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: 'serapis-reminders' }),
      },
      trigger: {
        type: 'daily',
        hour: 12,
        minute: 0,
      },
    });
  } catch {
    // silent
  }
}

async function scheduleScreenTimeBreak(minutesThreshold = 90) {
  if (!_isAvailable) return;

  try {
    await cancelScreenTimeBreak();
    const seconds = minutesThreshold * 60;

    await Notifications.scheduleNotificationAsync({
      identifier: SCREEN_TIME_IDENTIFIER,
      content: {
        title: '🧘 Time for a break',
        body: `You've been on your phone for a while. Open Serapis for a quick wellness exercise to rest your eyes and body.`,
        data: { type: SCREEN_TIME_CATEGORY },
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId: 'serapis-screen-time' }),
      },
      trigger: {
        type: 'timeInterval',
        seconds,
        repeats: false,
      },
    });
  } catch {
    // silent
  }
}

async function cancelScreenTimeBreak() {
  if (!_isAvailable) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(SCREEN_TIME_IDENTIFIER);
  } catch {
    // silent
  }
}

async function cancelAllScheduled() {
  if (!_isAvailable) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // silent
  }
}

function addNotificationReceivedListener(callback) {
  if (!_isAvailable) return _noop;
  try {
    return Notifications.addNotificationReceivedListener(callback);
  } catch {
    return _noop;
  }
}

function addNotificationResponseListener(callback) {
  if (!_isAvailable) return _noop;
  try {
    return Notifications.addNotificationResponseReceivedListener(callback);
  } catch {
    return _noop;
  }
}

export const pushNotificationService = {
  registerForPushNotifications,
  scheduleDailyTaskReminders,
  scheduleScreenTimeBreak,
  cancelScreenTimeBreak,
  cancelAllScheduled,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  SCREEN_TIME_IDENTIFIER,
  TASK_REMINDER_CATEGORY,
  SCREEN_TIME_CATEGORY,
};
