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
    expect(getByText('Walking Routes')).toBeOnTheScreen();
    expect(getByLabelText('Go to home tab')).toBeOnTheScreen();
    expect(getByLabelText('Go to profile tab')).toBeOnTheScreen();
  });

  it('navigates to Wellness when trends tab is pressed', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Go to trends tab'));

    expect(navigation.navigate).toHaveBeenCalledWith('Wellness');
  });

  it('navigates to WalkingRoutes when add tab is pressed', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Go to add tab'));

    expect(navigation.navigate).toHaveBeenCalledWith('WalkingRoutes');
  });

  it('navigates to Music when bookmarks tab is pressed', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Go to bookmarks tab'));

    expect(navigation.navigate).toHaveBeenCalledWith('Music');
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

  it('navigates to walking routes from hero CTA', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Open walking routes'));

    expect(navigation.navigate).toHaveBeenCalledWith('WalkingRoutes');
  });

  it('navigates to music from hero CTA', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Open music playlists'));

    expect(navigation.navigate).toHaveBeenCalledWith('Music');
  });

  it('navigates to music from menu item', () => {
    const navigation = createNavigation();
    const { getByLabelText, getByText, getAllByText } = render(<HomeScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Open navigation menu'));
    const musicItems = getAllByText('Music');
    fireEvent.press(musicItems[musicItems.length - 1]);

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(navigation.navigate).toHaveBeenCalledWith('Music');
  });
});
