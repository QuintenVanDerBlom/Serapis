import '@testing-library/jest-native/extend-expect';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('@expo/vector-icons', () => ({
  Ionicons: props => {
    const React = require('react');
    return React.createElement('Ionicons', props, props.children);
  },
}));
