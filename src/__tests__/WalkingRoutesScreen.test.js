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
    expect(getByText('Park Breathing Loop')).toBeOnTheScreen();
    expect(getByText('Riverside Slow Walk')).toBeOnTheScreen();
  });

  it('starts gps mode after selecting a route', () => {
    const navigation = createNavigation();
    const { getByText, getAllByText, getByLabelText } = render(
      <WalkingRoutesScreen navigation={navigation} />
    );

    fireEvent.press(getByText('Mindful Reset'));
    fireEvent.press(getAllByText('Start route with GPS')[0]);

    expect(getByText('GPS Navigation Active')).toBeOnTheScreen();
    expect(getByText('Walking to: Kooistee')).toBeOnTheScreen();
    expect(getByLabelText('Prototype route map')).toBeOnTheScreen();
    expect(getByText('Next instruction')).toBeOnTheScreen();
    expect(getByText(/Step 1 of/i)).toBeOnTheScreen();
  });

  it('advances gps waypoint steps', () => {
    const navigation = createNavigation();
    const { getByText, getAllByText } = render(<WalkingRoutesScreen navigation={navigation} />);

    fireEvent.press(getByText('Mindful Reset'));
    fireEvent.press(getAllByText('Start route with GPS')[0]);
    fireEvent.press(getByText('Advance to next waypoint'));

    expect(getByText(/Step 2 of/i)).toBeOnTheScreen();
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
