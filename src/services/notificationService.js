import { Vibration } from 'react-native';
import { pushNotificationService } from './pushNotificationService';

export const REMINDER_CONFIG = {
  hourly: {
    title: '🏃 Time to move!',
    body: "You've been sitting for a while. Stand up, stretch, and walk around for a few minutes.",
    intervalMs: 60 * 60 * 1000,
  },
  water: {
    title: '💧 Hydration check',
    body: 'Grab a glass of water. Staying hydrated keeps your energy and focus up.',
    intervalMs: 90 * 60 * 1000,
  },
  posture: {
    title: '🪑 Posture reset',
    body: 'Sit up straight, roll your shoulders back, and take a deep breath.',
    intervalMs: 45 * 60 * 1000,
  },
};

let _listener = null;
const _timers = {};

const getConfig = reminder => {
  if (!reminder) return null;

  if (typeof reminder === 'string') {
    return REMINDER_CONFIG[reminder]
      ? { key: reminder, ...REMINDER_CONFIG[reminder] }
      : null;
  }

  if (typeof reminder === 'object' && reminder.key && reminder.intervalMs) {
    return {
      key: reminder.key,
      title: reminder.title || 'Reminder',
      body: reminder.body || 'Time to take care of yourself.',
      intervalMs: reminder.intervalMs,
    };
  }

  return null;
};

export const notificationService = {
  setListener(fn) {
    _listener = fn;
  },

  removeListener() {
    _listener = null;
  },

  _fire(reminder) {
    const config = getConfig(reminder);
    if (!config || !_listener) return;
    Vibration.vibrate([0, 300, 100, 300]);
    _listener({ key: config.key, title: config.title, body: config.body });
  },

  sendTestNotification() {
    if (!_listener) return;
    Vibration.vibrate([0, 300, 100, 300]);
    _listener({
      key: '_test',
      title: '✅ Notifications work!',
      body: 'You will receive wellness reminders when they are enabled.',
    });
  },

  scheduleReminder(reminder) {
    const config = getConfig(reminder);
    if (!config) return;
    this.cancelReminder(config.key);
    _timers[config.key] = setInterval(() => this._fire(config), config.intervalMs);
  },

  cancelReminder(reminderKey) {
    if (_timers[reminderKey]) {
      clearInterval(_timers[reminderKey]);
      delete _timers[reminderKey];
    }
  },

  syncReminders(reminders) {
    for (const r of reminders) {
      if (!r?.key) continue;
      if (r.enabled) {
        this.scheduleReminder(r);
      } else {
        this.cancelReminder(r.key);
      }
    }
  },

  cancelAllReminders() {
    Object.keys(_timers).forEach(key => this.cancelReminder(key));
  },

  async scheduleDailyTaskPush(tasks) {
    await pushNotificationService.scheduleDailyTaskReminders(tasks);
  },
};
