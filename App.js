import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import ReminderBanner from './src/components/ReminderBanner';

function AppContent() {
  const { isDark } = useTheme();
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
