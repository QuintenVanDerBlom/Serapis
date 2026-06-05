import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import ReminderBanner from './src/components/ReminderBanner';
import { pushNotificationService } from './src/services/pushNotificationService';
import { screenTimeService } from './src/services/screenTimeService';
import { authService } from './src/services/authService';

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

function AppWithUser() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Load current user on mount
    authService.getCurrentUser()
      .then(({ data }) => {
        if (data?.user?.id) {
          setUserId(data.user.id);
        }
      })
      .catch(() => {});

    // Listen for auth changes (login/logout)
    const interval = setInterval(async () => {
      const { data } = await authService.getCurrentUser();
      const newUserId = data?.user?.id || null;
      if (newUserId !== userId) {
        setUserId(newUserId);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <LanguageProvider userId={userId}>
      <ThemeProvider userId={userId}>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default function App() {
  return <AppWithUser />;
}
