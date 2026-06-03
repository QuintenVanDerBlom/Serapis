import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import WellnessScreen from '../screens/WellnessScreen';

jest.mock('../services/authService', () => ({
  authService: {
    getCurrentUser: jest.fn().mockResolvedValue({ data: { user: null } }),
  },
}));

jest.mock('../services/wellnessService', () => ({
  DEFAULT_WELLNESS_STATE: {
    points: 840,
    streakDays: 6,
    completedMissions: [],
    reminders: [
      { key: 'hourly', label: 'Hourly wellness reminder', enabled: true },
      { key: 'water', label: 'Hydration reminder', enabled: true },
      { key: 'posture', label: 'Posture check reminder', enabled: false },
    ],
  },
  wellnessService: {
    getWellnessState: jest.fn(),
    saveWellnessState: jest.fn(),
  },
}));

describe('WellnessScreen', () => {
  const createNavigation = () => ({
    goBack: jest.fn(),
  });

  it('renders daily actions and reminders sections', () => {
    const navigation = createNavigation();
    const { getByText, getByLabelText } = render(
      <WellnessScreen navigation={navigation} />
    );

    expect(getByText('Daily Actions')).toBeOnTheScreen();
    expect(getByText('Reminder Settings')).toBeOnTheScreen();
    expect(getByLabelText('Toggle action 3-minute stretch')).toBeOnTheScreen();
    expect(getByLabelText('Toggle Hourly wellness reminder')).toBeOnTheScreen();
  });

  it('updates mission progress when mission is toggled', () => {
    const navigation = createNavigation();
    const { getByLabelText, getByText } = render(
      <WellnessScreen navigation={navigation} />
    );

    fireEvent.press(getByLabelText('Toggle action 3-minute stretch'));

    expect(getByText('1/4 actions done')).toBeOnTheScreen();
    expect(getByText('25%')).toBeOnTheScreen();
  });

  it('increases streak when complete day button is pressed', () => {
    const navigation = createNavigation();
    const { getByLabelText, getByText } = render(
      <WellnessScreen navigation={navigation} />
    );

    fireEvent.press(getByLabelText('Complete day and extend streak'));

    expect(getByText('7 days')).toBeOnTheScreen();
  });

  it('navigates back when back button is pressed', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(
      <WellnessScreen navigation={navigation} />
    );

    fireEvent.press(getByLabelText('Back to home'));

    expect(navigation.goBack).toHaveBeenCalled();
  });
});
