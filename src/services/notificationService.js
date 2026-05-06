import { Vibration } from 'react-native';

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

export const notificationService = {
  setListener(fn) {
    _listener = fn;
  },

  removeListener() {
    _listener = null;
  },

  _fire(reminderKey) {
    const config = REMINDER_CONFIG[reminderKey];
    if (!config || !_listener) return;
    Vibration.vibrate([0, 300, 100, 300]);
    _listener({ key: reminderKey, title: config.title, body: config.body });
  },

  sendTestNotification() {
    if (!_listener) return;
    Vibration.vibrate([0, 300, 100, 300]);
    _listener({
      key: '_test',
      title: '✅ Notifications work!',
      body: 'You will receive movement reminders when they are enabled.',
    });
  },

  scheduleReminder(reminderKey) {
    const config = REMINDER_CONFIG[reminderKey];
    if (!config) return;
    this.cancelReminder(reminderKey);
    _timers[reminderKey] = setInterval(() => this._fire(reminderKey), config.intervalMs);
  },

  cancelReminder(reminderKey) {
    if (_timers[reminderKey]) {
      clearInterval(_timers[reminderKey]);
      delete _timers[reminderKey];
    }
  },

  syncReminders(reminders) {
    for (const r of reminders) {
      if (r.enabled) {
        this.scheduleReminder(r.key);
      } else {
        this.cancelReminder(r.key);
      }
    }
  },

  cancelAllReminders() {
    Object.keys(_timers).forEach(key => this.cancelReminder(key));
  },
};
