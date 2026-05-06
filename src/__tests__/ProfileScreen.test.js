import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import ProfileScreen from '../screens/ProfileScreen';

describe('ProfileScreen', () => {
  const createNavigation = () => ({
    goBack: jest.fn(),
    reset: jest.fn(),
  });

  it('renders user info and stats', () => {
    const navigation = createNavigation();
    const { getByText } = render(<ProfileScreen navigation={navigation} />);

    expect(getByText('Serapis User')).toBeOnTheScreen();
    expect(getByText('user@serapis.app')).toBeOnTheScreen();
    expect(getByText('4,260')).toBeOnTheScreen();
    expect(getByText('Move Points')).toBeOnTheScreen();
  });

  it('renders settings items', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<ProfileScreen navigation={navigation} />);

    expect(getByLabelText('Notifications')).toBeOnTheScreen();
    expect(getByLabelText('Privacy')).toBeOnTheScreen();
    expect(getByLabelText('Toggle dark mode')).toBeOnTheScreen();
    expect(getByLabelText('About Serapis')).toBeOnTheScreen();
  });

  it('renders log out button', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<ProfileScreen navigation={navigation} />);

    expect(getByLabelText('Log out')).toBeOnTheScreen();
  });

  it('navigates back when back button is pressed', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<ProfileScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Back to home'));

    expect(navigation.goBack).toHaveBeenCalled();
  });
});
