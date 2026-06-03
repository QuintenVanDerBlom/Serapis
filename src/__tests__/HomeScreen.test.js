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
    expect(getByText('Open Tasks')).toBeOnTheScreen();
    expect(getByLabelText('Go to home tab')).toBeOnTheScreen();
    expect(getByLabelText('Go to profile tab')).toBeOnTheScreen();
  });

  it('navigates to Milestones when milestones tab is pressed', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Go to milestones tab'));

    expect(navigation.navigate).toHaveBeenCalledWith('Milestones');
  });

  it('navigates to Progress when progress tab is pressed', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Go to progress tab'));

    expect(navigation.navigate).toHaveBeenCalledWith('Progress');
  });

  it('navigates to Tasks when tasks tab is pressed', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Go to tasks tab'));

    expect(navigation.navigate).toHaveBeenCalledWith('Tasks');
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

  it('navigates to tasks from movement plan CTA', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Open Tasks'));

    expect(navigation.navigate).toHaveBeenCalledWith('Tasks');
  });

  it('navigates to milestones from daily challenges CTA', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Open daily challenges'));

    expect(navigation.navigate).toHaveBeenCalledWith('Milestones');
  });

  it('navigates to tasks from menu item', () => {
    const navigation = createNavigation();
    const { getByLabelText, getAllByText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Open navigation menu'));
    const taskItems = getAllByText('Tasks');
    fireEvent.press(taskItems[taskItems.length - 1]);

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(navigation.navigate).toHaveBeenCalledWith('Tasks');
  });
});
