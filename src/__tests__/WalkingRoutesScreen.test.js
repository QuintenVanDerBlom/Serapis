import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import WalkingRoutesScreen from '../screens/WalkingRoutesScreen';

describe('WalkingRoutesScreen', () => {
  const createNavigation = () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
  });

  it('renders route type suggestions first', () => {
    const navigation = createNavigation();
    const { getByText } = render(<WalkingRoutesScreen navigation={navigation} />);

    expect(getByText('Pick your route style')).toBeOnTheScreen();
    expect(getByText('Mindful Reset')).toBeOnTheScreen();
    expect(getByText('Energy Boost')).toBeOnTheScreen();
  });

  it('shows route options after selecting a route type', () => {
    const navigation = createNavigation();
    const { getByText } = render(<WalkingRoutesScreen navigation={navigation} />);

    fireEvent.press(getByText('Mindful Reset'));

    expect(getByText('Suggested routes')).toBeOnTheScreen();
    expect(getByText('Het Park Serenity Loop')).toBeOnTheScreen();
    expect(getByText('Kralingse Plas Waterside')).toBeOnTheScreen();
  });

  it('starts gps mode after selecting a route', () => {
    const navigation = createNavigation();
    const { getByText, getAllByText, getByLabelText } = render(
      <WalkingRoutesScreen navigation={navigation} />
    );

    fireEvent.press(getByText('Mindful Reset'));
    fireEvent.press(getAllByText('Start route with GPS')[0]);

    expect(getByText('GPS Navigation Active')).toBeOnTheScreen();
    expect(getByText('Walking to: Euromast viewpoint')).toBeOnTheScreen();
    expect(getByLabelText('Route map')).toBeOnTheScreen();
    expect(getByText('Route directions')).toBeOnTheScreen();
  });

  it('shows music widget controls during gps mode', () => {
    const navigation = createNavigation();
    const { getByText, getAllByText, getByLabelText } = render(
      <WalkingRoutesScreen navigation={navigation} />
    );

    fireEvent.press(getByText('Mindful Reset'));
    fireEvent.press(getAllByText('Start route with GPS')[0]);

    expect(getByText('Quiet Steps')).toBeOnTheScreen();
    expect(getByText('Serapis Lab')).toBeOnTheScreen();
    fireEvent.press(getByLabelText('Open music player from walking widget'));

    expect(navigation.navigate).toHaveBeenCalledWith('MusicPlayer', {
      playlistId: 'p2',
      isWalkingSession: true,
    });
  });
});
