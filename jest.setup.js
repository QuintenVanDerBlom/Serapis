import '@testing-library/jest-native/extend-expect';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('@expo/vector-icons', () => ({
  Ionicons: props => {
    const React = require('react');
    return React.createElement('Ionicons', props, props.children);
  },
}));

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');

  const WebView = props => React.createElement(View, { ...props, children: props.children });

  return {
    __esModule: true,
    WebView,
  };
});
