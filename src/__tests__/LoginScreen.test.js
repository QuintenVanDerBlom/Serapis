import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../screens/LoginScreen';

describe('LoginScreen', () => {
  const createNavigation = () => ({
    navigate: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login form', () => {
    const navigation = createNavigation();
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen navigation={navigation} />
    );

    expect(getByText('Welcome back!')).toBeOnTheScreen();
    expect(getByPlaceholderText('guest_user')).toBeOnTheScreen();
    expect(getByPlaceholderText('Enter password')).toBeOnTheScreen();
  });

  it('shows an error when credentials are invalid', async () => {
    const navigation = createNavigation();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    AsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify([{ username: 'alice', password: 'secret123!' }])
    );

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={navigation} />
    );

    fireEvent.changeText(getByPlaceholderText('guest_user'), 'bob');
    fireEvent.changeText(getByPlaceholderText('Enter password'), 'wrongpass1!');
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid username or password');
    });
  });

  it('navigates to register when sign-up link is pressed', () => {
    const navigation = createNavigation();
    const { getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.press(getByText(/Sign up for free\./i));

    expect(navigation.navigate).toHaveBeenCalledWith('Register');
  });
});
