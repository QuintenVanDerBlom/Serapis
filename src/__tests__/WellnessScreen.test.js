import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import WellnessScreen from '../screens/WellnessScreen';

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: props => React.createElement(View, props, props.children),
    Svg: props => React.createElement(View, props, props.children),
    Path: props => React.createElement(View, props, props.children),
    G: props => React.createElement(View, props, props.children),
  };
});

describe('WellnessScreen', () => {
  const createNavigation = () => ({
    goBack: jest.fn(),
  });

  it('renders mood buttons and chart section', () => {
    const navigation = createNavigation();
    const { getByText, getByLabelText } = render(
      <WellnessScreen navigation={navigation} />
    );

    expect(getByText('How are you feeling?')).toBeOnTheScreen();
    expect(getByText('Mood Insight')).toBeOnTheScreen();
    expect(getByLabelText('Log mood Happy')).toBeOnTheScreen();
    expect(getByLabelText('Log mood Calm')).toBeOnTheScreen();
    expect(getByLabelText('Log mood Stressed')).toBeOnTheScreen();
  });

  it('logs a mood entry when a mood button is pressed', () => {
    const navigation = createNavigation();
    const { getByLabelText, getByText } = render(
      <WellnessScreen navigation={navigation} />
    );

    fireEvent.press(getByLabelText('Log mood Happy'));

    expect(getByText(/11 logged entries/)).toBeOnTheScreen();
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
