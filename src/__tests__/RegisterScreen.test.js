import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import RegisterScreen from '../screens/RegisterScreen';
import { authService } from '../services/authService';

jest.mock('../services/authService', () => ({
  authService: {
    registerWithUsername: jest.fn().mockResolvedValue({
      data: { session: { user: { id: 'u1' } } },
      error: null,
    }),
  },
}));

describe('RegisterScreen', () => {
  const createNavigation = () => ({
    navigate: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    authService.registerWithUsername.mockResolvedValue({
      data: { session: { user: { id: 'u1' } } },
      error: null,
    });
  });

  it('renders the registration form', () => {
    const navigation = createNavigation();
    const { getByText, getByPlaceholderText } = render(
      <RegisterScreen navigation={navigation} />
    );

    expect(getByText('Sign up')).toBeOnTheScreen();
    expect(getByPlaceholderText('guest_user')).toBeOnTheScreen();
    expect(getByPlaceholderText('Enter password')).toBeOnTheScreen();
    expect(getByPlaceholderText('Confirm password')).toBeOnTheScreen();
  });

  it('shows a password validation error for weak passwords', () => {
    const navigation = createNavigation();
    const { getByPlaceholderText, getByText } = render(
      <RegisterScreen navigation={navigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Enter password'), 'abc');

    expect(getByText(/password must contain at least 1 number/i)).toBeOnTheScreen();
  });

  it('renders password visibility toggle controls', () => {
    const navigation = createNavigation();
    const { getAllByLabelText } = render(<RegisterScreen navigation={navigation} />);

    expect(getAllByLabelText('Toggle password visibility')).toHaveLength(2);
  });

  it('navigates to login when login link is pressed', () => {
    const navigation = createNavigation();
    const { getByText } = render(<RegisterScreen navigation={navigation} />);

    fireEvent.press(getByText(/Log in here/i));

    expect(navigation.navigate).toHaveBeenCalledWith('Login');
  });
});
