import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AppNavigator from '../navigation/AppNavigator';
import { authService } from '../services/authService';

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

describe('AppNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts at Home when currentUser exists', async () => {
    authService.getSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'u1' } } },
    });

    const { getByTestId, getByText } = render(<AppNavigator />);

    await waitFor(() => {
      expect(getByTestId('initial-route').props.children).toBe('Home');
    });

    expect(getByText('Home Screen')).toBeOnTheScreen();
  });

  it('starts at Login when currentUser is missing', async () => {
    authService.getSession.mockResolvedValueOnce({ data: { session: null } });

    const { getByTestId, getByText } = render(<AppNavigator />);

    await waitFor(() => {
      expect(getByTestId('initial-route').props.children).toBe('Login');
    });

    expect(getByText('Login Screen')).toBeOnTheScreen();
  });
});
