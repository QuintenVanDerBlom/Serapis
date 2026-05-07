import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { authService } from '../services/authService';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import WellnessScreen from '../screens/WellnessScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProgressScreen from '../screens/ProgressScreen';
import TasksScreen from '../screens/TasksScreen';
import MilestonesScreen from '../screens/MilestonesScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const { data } = await authService.getSession();
        const currentUser = data?.session?.user;
        if (isMounted) {
          setInitialRoute(currentUser ? 'Home' : 'Login');
        }
      } catch (error) {
        if (isMounted) {
          setInitialRoute('Login');
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!initialRoute) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d67ff" />
        <Text style={styles.loadingText}>Checking your session...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Login' }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: 'Register' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
        <Stack.Screen
          name="Wellness"
          component={WellnessScreen}
          options={{ title: 'Wellness' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
        <Stack.Screen
          name="Progress"
          component={ProgressScreen}
          options={{ title: 'Progress' }}
        />
        <Stack.Screen
          name="Tasks"
          component={TasksScreen}
          options={{ title: 'Tasks' }}
        />
        <Stack.Screen
          name="Milestones"
          component={MilestonesScreen}
          options={{ title: 'Milestones' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fbff',
  },
  loadingText: {
    fontSize: 14,
    color: '#334155',
  },
});

export default AppNavigator;
