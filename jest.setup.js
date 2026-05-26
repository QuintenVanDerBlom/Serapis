import '@testing-library/jest-native/extend-expect';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('@expo/vector-icons', () => ({
  Ionicons: props => {
    const React = require('react');
    return React.createElement('Ionicons', props, props.children);
  },
}));

jest.mock('./src/context/ThemeContext', () => {
  const actual = jest.requireActual('./src/context/ThemeContext');
  return {
    ...actual,
    useTheme: () => ({
      colors: actual.lightColors,
      isDark: false,
      toggleTheme: jest.fn(),
    }),
    ThemeProvider: ({ children }) => children,
  };
});

jest.mock('./src/services/notificationService', () => ({
  notificationService: {
    setListener: jest.fn(),
    removeListener: jest.fn(),
    sendTestNotification: jest.fn(),
    scheduleReminder: jest.fn(),
    cancelReminder: jest.fn(),
    syncReminders: jest.fn(),
    cancelAllReminders: jest.fn(),
    scheduleDailyTaskPush: jest.fn(),
    _fire: jest.fn(),
  },
  REMINDER_CONFIG: {},
}));

jest.mock('./src/services/pushNotificationService', () => ({
  pushNotificationService: {
    registerForPushNotifications: jest.fn().mockResolvedValue(null),
    scheduleDailyTaskReminders: jest.fn().mockResolvedValue(undefined),
    scheduleScreenTimeBreak: jest.fn().mockResolvedValue(undefined),
    cancelScreenTimeBreak: jest.fn().mockResolvedValue(undefined),
    cancelAllScheduled: jest.fn().mockResolvedValue(undefined),
    addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
    addNotificationResponseListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('./src/services/screenTimeService', () => ({
  screenTimeService: {
    init: jest.fn(),
    destroy: jest.fn(),
    getSessionDurationMinutes: jest.fn(() => 0),
    setThreshold: jest.fn(),
    DEFAULT_THRESHOLD_MINUTES: 90,
  },
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'mock-token' }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidImportance: { HIGH: 4 },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn().mockResolvedValue(false),
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { appOwnership: 'standalone' },
}));

jest.mock('expo-application', () => ({
  applicationName: 'Serapis',
  nativeApplicationVersion: '1.0.0',
}));

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');

  const WebView = props => React.createElement(View, { ...props, children: props.children });

  return {
    __esModule: true,
    WebView,
  };
});
