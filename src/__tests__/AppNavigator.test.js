import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from '../navigation/AppNavigator';

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

jest.mock('../screens/MusicScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Music Screen');
});

jest.mock('../screens/MusicPlayerScreen', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Music Player Screen');
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

describe('AppNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts at Home when currentUser exists', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ username: 'alice' }));

    const { getByTestId, getByText } = render(<AppNavigator />);

    await waitFor(() => {
      expect(getByTestId('initial-route').props.children).toBe('Home');
    });

    expect(getByText('Home Screen')).toBeOnTheScreen();
  });

  it('starts at Login when currentUser is missing', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);

    const { getByTestId, getByText } = render(<AppNavigator />);

    await waitFor(() => {
      expect(getByTestId('initial-route').props.children).toBe('Login');
    });

    expect(getByText('Login Screen')).toBeOnTheScreen();
  });
});
