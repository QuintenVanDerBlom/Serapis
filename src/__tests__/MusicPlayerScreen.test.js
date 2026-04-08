import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import MusicPlayerScreen from '../screens/MusicPlayerScreen';

describe('MusicPlayerScreen', () => {
  const createNavigation = () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    canGoBack: jest.fn(() => true),
  });

  it('renders selected playlist in player', () => {
    const navigation = createNavigation();
    const route = { params: { playlistId: 'p2' } };
    const { getByText } = render(<MusicPlayerScreen navigation={navigation} route={route} />);

    expect(getByText('Music Player')).toBeOnTheScreen();
    expect(getByText('Urban Flow Walk')).toBeOnTheScreen();
    expect(getByText('Stride One')).toBeOnTheScreen();
  });

  it('shows walking return widget during walking session', () => {
    const navigation = createNavigation();
    const route = { params: { playlistId: 'p2', isWalkingSession: true } };
    const { getByLabelText } = render(<MusicPlayerScreen navigation={navigation} route={route} />);

    fireEvent.press(getByLabelText('Back to active walking route'));

    expect(navigation.goBack).toHaveBeenCalled();
  });
});
