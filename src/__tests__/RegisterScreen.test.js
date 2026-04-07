import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import RegisterScreen from '../screens/RegisterScreen';

describe('RegisterScreen', () => {
  const createNavigation = () => ({
    navigate: jest.fn(),
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

  it('navigates to login when login link is pressed', () => {
    const navigation = createNavigation();
    const { getByText } = render(<RegisterScreen navigation={navigation} />);

    fireEvent.press(getByText(/Log in here/i));

    expect(navigation.navigate).toHaveBeenCalledWith('Login');
  });
});
