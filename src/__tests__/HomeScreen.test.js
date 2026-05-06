import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';

describe('HomeScreen', () => {
  const createNavigation = () => ({
    navigate: jest.fn(),
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders home content and bottom navigation', () => {
    const navigation = createNavigation();
    const { getByText, getByLabelText } = render(<HomeScreen navigation={navigation} />);

    expect(getByText('Serapis')).toBeOnTheScreen();
    expect(getByText('Welcome back')).toBeOnTheScreen();
    expect(getByText('Movement Plan')).toBeOnTheScreen();
    expect(getByLabelText('Go to home tab')).toBeOnTheScreen();
    expect(getByLabelText('Go to profile tab')).toBeOnTheScreen();
  });

  it('navigates to Wellness when rewards tab is pressed', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Go to rewards tab'));

    expect(navigation.navigate).toHaveBeenCalledWith('Wellness');
  });

  it('navigates to Wellness when plan tab is pressed', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Go to plan tab'));

    expect(navigation.navigate).toHaveBeenCalledWith('Wellness');
  });

  it('navigates to Wellness when reminders tab is pressed', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Go to reminders tab'));

    expect(navigation.navigate).toHaveBeenCalledWith('Wellness');
  });

  it('navigates to Profile when profile tab is pressed', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Go to profile tab'));

    expect(navigation.navigate).toHaveBeenCalledWith('Profile');
  });

  it('opens and closes the hamburger menu', () => {
    const navigation = createNavigation();
    const { getByLabelText, getByText, queryByText } = render(
      <HomeScreen navigation={navigation} />
    );

    expect(queryByText('Navigate your app')).not.toBeOnTheScreen();

    fireEvent.press(getByLabelText('Open navigation menu'));

    expect(getByText('Navigate your app')).toBeOnTheScreen();

    fireEvent.press(getByLabelText('Close navigation menu'));

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(queryByText('Navigate your app')).not.toBeOnTheScreen();
  });

  it('navigates to wellness from movement plan CTA', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Open movement plan'));

    expect(navigation.navigate).toHaveBeenCalledWith('Wellness');
  });

  it('navigates to wellness from daily challenges CTA', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Open daily challenges'));

    expect(navigation.navigate).toHaveBeenCalledWith('Wellness');
  });

  it('navigates to wellness from menu item', () => {
    const navigation = createNavigation();
    const { getByLabelText, getAllByText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Open navigation menu'));
    const movePlanItems = getAllByText('Move Plan');
    fireEvent.press(movePlanItems[movePlanItems.length - 1]);

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(navigation.navigate).toHaveBeenCalledWith('Wellness');
  });
});
