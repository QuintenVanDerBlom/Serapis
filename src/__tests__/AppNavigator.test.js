import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AppNavigator from '../navigation/AppNavigator';
import { authService } from '../services/authService';
import { onboardingService } from '../services/onboardingService';

jest.mock('../services/authService', () => ({
  authService: {
    getSession: jest.fn(),
  },
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => <>{children}</>,
}));

jest.mock('@react-navigation/stack', () => {
  const React = require('react');
  const { Text, View } = require('react-native');

  const Screen = () => null;

  const Navigator = ({ initialRouteName, children }) => {
    const screens = React.Children.toArray(children);
    const activeScreen = screens.find(screen => screen.props.name === initialRouteName) || screens[0];
    const ActiveComponent = activeScreen.props.component;

    return (
      <View>
        <Text testID="initial-route">{initialRouteName}</Text>
        <ActiveComponent />
      </View>
    );
  };

  return {
    createStackNavigator: () => ({
      Navigator,
      Screen,
    }),
  };
});

jest.mock('../screens/LoginScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Login Screen');
});

jest.mock('../screens/RegisterScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Register Screen');
});

jest.mock('../screens/HomeScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Home Screen');
});

jest.mock('../screens/WellnessScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Wellness Screen');
});

jest.mock('../screens/ProfileScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Profile Screen');
});

jest.mock('../screens/ProgressScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Progress Screen');
});

jest.mock('../screens/TasksScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Tasks Screen');
});

jest.mock('../screens/MilestonesScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Milestones Screen');
});

jest.mock('../screens/OnboardingScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Onboarding Screen');
});

jest.mock('../screens/TaskDetailScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Task Detail Screen');
});

describe('AppNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts at Home when currentUser exists and is onboarded', async () => {
    authService.getSession.mockResolvedValue({
      data: { session: { user: { id: 'u1' } } },
    });
    onboardingService.isOnboarded.mockResolvedValue(true);

    const { getByTestId, getByText } = render(<AppNavigator />);

    await waitFor(() => {
      expect(getByTestId('initial-route').props.children).toBe('Home');
    });

    expect(getByText('Home Screen')).toBeOnTheScreen();
  });

  it('starts at Onboarding when currentUser exists but not onboarded', async () => {
    authService.getSession.mockResolvedValue({
      data: { session: { user: { id: 'u2' } } },
    });
    onboardingService.isOnboarded.mockResolvedValue(false);

    const { getByTestId, getByText } = render(<AppNavigator />);

    await waitFor(() => {
      expect(getByTestId('initial-route').props.children).toBe('Onboarding');
    });

    expect(getByText('Onboarding Screen')).toBeOnTheScreen();
  });

  it('starts at Login when currentUser is missing', async () => {
    authService.getSession.mockResolvedValue({ data: { session: null } });

    const { getByTestId, getByText } = render(<AppNavigator />);

    await waitFor(() => {
      expect(getByTestId('initial-route').props.children).toBe('Login');
    });

    expect(getByText('Login Screen')).toBeOnTheScreen();
  });
});
