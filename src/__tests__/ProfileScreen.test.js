import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../screens/ProfileScreen';

jest.mock('../services/authService', () => ({
  authService: {
    getCurrentUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'u1', username: 'alex', email: 'alex@serapis.app' } },
    }),
    logout: jest.fn().mockResolvedValue({ error: null }),
  },
}));

jest.mock('../services/journeyService', () => ({
  journeyService: {
    getTasks: jest.fn().mockResolvedValue({
      data: [
        { id: 't1', completed: true, completedAt: new Date().toISOString(), points: 45, reminderEnabled: true },
        { id: 't2', completed: true, completedAt: new Date().toISOString(), points: 30, reminderEnabled: false },
      ],
      error: null,
    }),
    getMonthlyProgress: jest.fn().mockResolvedValue({
      data: { earnedPoints: 75 },
      error: null,
    }),
  },
}));

describe('ProfileScreen', () => {
  const createNavigation = () => ({
    goBack: jest.fn(),
    reset: jest.fn(),
  });

  it('renders user info and stats', async () => {
    const navigation = createNavigation();
    const { getByText } = render(<ProfileScreen navigation={navigation} />);

    await waitFor(() => {
      expect(getByText('alex')).toBeOnTheScreen();
    });

    expect(getByText('75')).toBeOnTheScreen();
    expect(getByText('Wellness Points')).toBeOnTheScreen();
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
