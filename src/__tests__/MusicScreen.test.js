import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import MusicScreen from '../screens/MusicScreen';

describe('MusicScreen', () => {
  const createNavigation = () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
  });

  it('renders fake playlists list', () => {
    const navigation = createNavigation();
    const { getByText } = render(<MusicScreen navigation={navigation} />);

    expect(getByText('Prototype Playlists')).toBeOnTheScreen();
    expect(getByText('Mindful Morning')).toBeOnTheScreen();
    expect(getByText('Urban Flow Walk')).toBeOnTheScreen();
    expect(getByText('Evening Reset')).toBeOnTheScreen();
  });

  it('opens music player when selecting a playlist', () => {
    const navigation = createNavigation();
    const { getByLabelText } = render(<MusicScreen navigation={navigation} />);

    fireEvent.press(getByLabelText('Select playlist Urban Flow Walk'));

    expect(navigation.navigate).toHaveBeenCalledWith('MusicPlayer', { playlistId: 'p2' });
  });
});
