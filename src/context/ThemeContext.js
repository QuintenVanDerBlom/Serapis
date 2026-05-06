import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@serapis_dark_mode';

export const lightColors = {
  mode: 'light',
  // Backgrounds
  bg: '#f8faf9',
  surface: '#ffffff',
  surfaceAlt: '#edf7f0',
  inputBg: '#ffffff',
  mapBg: '#dff3e6',
  // Borders
  border: '#d8f3dc',
  borderStrong: '#95d5b2',
  inputBorder: '#b7e4c7',
  // Text
  text: '#1b4332',
  heading: '#1b5e3f',
  secondary: '#40916c',
  muted: '#52b788',
  placeholder: '#999',
  // Accent / Brand
  accent: '#2d6a4f',
  accentLight: '#52b788',
  accentBg: '#d8f3dc',
  // Hero
  heroBg: '#2d6a4f',
  heroText: '#ffffff',
  heroEyebrow: '#b7e4c7',
  heroDesc: '#f1fff5',
  heroSecBg: '#f1fff5',
  heroSecText: '#1b5e3f',
  // Navigation
  navBg: '#ffffff',
  navIcon: '#74c69d',
  // Buttons
  buttonDisabled: '#d8f3dc',
  buttonLoading: '#40916c',
  // Status
  error: '#e76f51',
  errorBg: '#fff5f3',
  errorBorder: '#fdddd6',
  errorInput: '#e63946',
  errorInputBg: '#fff5f5',
  link: '#1a759f',
  success: '#2f7d32',
  // Overlays
  overlayCard: 'rgba(248, 250, 249, 0.95)',
  overlayMusic: 'rgba(255, 255, 255, 0.95)',
  backdrop: 'rgba(6, 16, 10, 0.4)',
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
  walkCardBg: '#edf7f0',
  walkCardBorder: '#cce3d5',
  // Logout
  logoutBg: '#fff5f3',
  logoutBorder: '#fdddd6',
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
