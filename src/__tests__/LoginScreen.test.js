import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';
import { authService } from '../services/authService';

jest.mock('../services/authService', () => ({
  authService: {
    loginWithUsername: jest.fn(),
    getCurrentUser: jest.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
  },
}));

jest.mock('../services/onboardingService', () => ({
  onboardingService: {
    isOnboarded: jest.fn().mockResolvedValue(true),
  },
}));

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
    authService.loginWithUsername.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
    });

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

  it('navigates to home after successful login', async () => {
    const navigation = createNavigation();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    authService.loginWithUsername.mockResolvedValueOnce({ error: null });

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={navigation} />
    );

    fireEvent.changeText(getByPlaceholderText('guest_user'), 'alice');
    fireEvent.changeText(getByPlaceholderText('Enter password'), 'secret123!');
    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Success',
        'Login successful!',
        expect.any(Array)
      );
    });

    const successButtons = alertSpy.mock.calls.find(call => call[0] === 'Success')?.[2] || [];
    successButtons[0].onPress();

    expect(navigation.navigate).toHaveBeenCalledWith('Home');  
  });

  it('renders a password visibility toggle button', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<LoginScreen navigation={navigation} />);

    expect(getByLabelText('Toggle password visibility')).toBeOnTheScreen();
  });

  it('navigates to register when sign-up link is pressed', () => {
    const navigation = createNavigation();
    const { getByText } = render(<LoginScreen navigation={navigation} />);

    fireEvent.press(getByText(/Sign up for free\./i));

    expect(navigation.navigate).toHaveBeenCalledWith('Register');
  });
});
