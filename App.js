import { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import ReminderBanner from './src/components/ReminderBanner';
import { pushNotificationService } from './src/services/pushNotificationService';
import { screenTimeService } from './src/services/screenTimeService';

function AppContent() {
  const { isDark } = useTheme();
  const notifListeners = useRef({ received: null, response: null });

  useEffect(() => {
    pushNotificationService.registerForPushNotifications().then(token => {
      if (token) console.log('ExpoPushToken:', token);
    });

    screenTimeService.init(90);

    notifListeners.current.received =
      pushNotificationService.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification.request.content.title);
      });

    notifListeners.current.response =
      pushNotificationService.addNotificationResponseListener(response => {
        const data = response.notification.request.content.data;
        console.log('Notification tapped:', data);
      });

    return () => {
      if (notifListeners.current.received) {
        notifListeners.current.received.remove();
      }
      if (notifListeners.current.response) {
        notifListeners.current.response.remove();
      }
      screenTimeService.destroy();
    };
  }, []);

  return (
    <View style={styles.root}>
      <AppNavigator />
      <ReminderBanner />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
