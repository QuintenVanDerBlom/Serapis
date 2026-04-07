import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders home content and bottom navigation', () => {
    const { getByText, getByLabelText } = render(<HomeScreen />);

    expect(getByText('Serapis')).toBeOnTheScreen();
    expect(getByText('Welcome back')).toBeOnTheScreen();
    expect(getByText('Walking Routes')).toBeOnTheScreen();
    expect(getByLabelText('Go to home tab')).toBeOnTheScreen();
    expect(getByLabelText('Go to profile tab')).toBeOnTheScreen();
  });

  it('changes hero content when a bottom tab is pressed', () => {
    const { getByLabelText, getByText } = render(<HomeScreen />);

    fireEvent.press(getByLabelText('Go to trends tab'));

    expect(getByText('You are building consistency')).toBeOnTheScreen();
  });

  it('opens and closes the hamburger menu', () => {
    const { getByLabelText, getByText, queryByText } = render(<HomeScreen />);

    expect(queryByText('Walks')).not.toBeOnTheScreen();

    fireEvent.press(getByLabelText('Open navigation menu'));

    expect(getByText('Walks')).toBeOnTheScreen();
    expect(getByText('Music')).toBeOnTheScreen();

    fireEvent.press(getByLabelText('Close navigation menu'));

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(queryByText('Walks')).not.toBeOnTheScreen();
  });
});
