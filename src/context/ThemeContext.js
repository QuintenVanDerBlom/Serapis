import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@serapis_dark_mode';

export const lightColors = {
  mode: 'light',
  // Backgrounds
  bg: '#f4f7f5',
  surface: '#ffffff',
  surfaceAlt: '#eaf2ed',
  inputBg: '#fafcfb',
  mapBg: '#e0eddf',
  // Borders
  border: '#d9e5dd',
  borderStrong: '#a8cdb5',
  inputBorder: '#c4d9cc',
  // Text
  text: '#1a3529',
  heading: '#1b4d3e',
  secondary: '#5c8a73',
  muted: '#7aad92',
  placeholder: '#a0b5a8',
  // Accent / Brand
  accent: '#2b7a55',
  accentLight: '#4da97d',
  accentBg: '#e1f0e7',
  // Hero
  heroBg: '#235c46',
  heroText: '#ffffff',
  heroEyebrow: '#a4d1b8',
  heroDesc: '#d2ecdd',
  heroSecBg: '#e8f3ec',
  heroSecText: '#1b4d3e',
  // Navigation
  navBg: '#fafcfb',
  navIcon: '#94bba4',
  // Buttons
  buttonDisabled: '#d9e5dd',
  buttonLoading: '#3d8a66',
  // Status
  error: '#e06449',
  errorBg: '#fef5f3',
  errorBorder: '#fad8d2',
  errorInput: '#d94545',
  errorInputBg: '#fef5f5',
  link: '#2e86b0',
  success: '#2f8a42',
  // Overlays
  overlayCard: 'rgba(244, 247, 245, 0.97)',
  overlayMusic: 'rgba(255, 255, 255, 0.97)',
  backdrop: 'rgba(10, 25, 18, 0.35)',
  // Music Player
  playerText: '#1f2937',
  playerSecondary: '#4b5563',
  playerTrack: '#d1d5db',
  playerFill: '#1f2937',
  playerAlbumBg: '#e5e7eb',
  playerAlbumBorder: '#d1d5db',
  playerAlbumIcon: '#9ca3af',
  playerAlbumText: '#6b7280',
  playerPlayBg: '#1f2937',
  playerPlayIcon: '#f8fafc',
  playerLike: '#1db954',
  walkCardBg: '#eaf2ed',
  walkCardBorder: '#c4d9cc',
  // Logout
  logoutBg: '#fef5f3',
  logoutBorder: '#fad8d2',
};

export const darkColors = {
  mode: 'dark',
  // Backgrounds
  bg: '#0d1b12',
  surface: '#142019',
  surfaceAlt: '#1a2b21',
  inputBg: '#142019',
  mapBg: '#1a2b21',
  // Borders
  border: '#243830',
  borderStrong: '#2d5240',
  inputBorder: '#243830',
  // Text
  text: '#e2ede6',
  heading: '#b7e4c7',
  secondary: '#7aac92',
  muted: '#5d9478',
  placeholder: '#5d7a6a',
  // Accent / Brand
  accent: '#52b788',
  accentLight: '#40916c',
  accentBg: '#1a2b21',
  // Hero
  heroBg: '#1a3327',
  heroText: '#e2ede6',
  heroEyebrow: '#5d9478',
  heroDesc: '#a3c9b4',
  heroSecBg: '#1a2b21',
  heroSecText: '#b7e4c7',
  // Navigation
  navBg: '#111e16',
  navIcon: '#3d7a5a',
  // Buttons
  buttonDisabled: '#1a2b21',
  buttonLoading: '#2d6a4f',
  // Status
  error: '#e76f51',
  errorBg: '#2d1a15',
  errorBorder: '#5c3028',
  errorInput: '#e76f51',
  errorInputBg: '#2d1a15',
  link: '#5dade2',
  success: '#52b788',
  // Overlays
  overlayCard: 'rgba(20, 32, 25, 0.95)',
  overlayMusic: 'rgba(20, 32, 25, 0.95)',
  backdrop: 'rgba(0, 0, 0, 0.6)',
  // Music Player
  playerText: '#e2ede6',
  playerSecondary: '#7aac92',
  playerTrack: '#243830',
  playerFill: '#52b788',
  playerAlbumBg: '#1a2b21',
  playerAlbumBorder: '#243830',
  playerAlbumIcon: '#5d9478',
  playerAlbumText: '#7aac92',
  playerPlayBg: '#52b788',
  playerPlayIcon: '#0d1b12',
  playerLike: '#1db954',
  walkCardBg: '#1a2b21',
  walkCardBorder: '#243830',
  // Logout
  logoutBg: '#2d1a15',
  logoutBorder: '#5c3028',
};

const ThemeContext = createContext({
  colors: lightColors,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(val => {
        if (val === 'true') setIsDark(true);
      })
      .catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, String(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = {
    colors: isDark ? darkColors : lightColors,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
