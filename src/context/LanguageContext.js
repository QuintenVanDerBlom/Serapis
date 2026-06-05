import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userPreferencesService } from '../services/userPreferencesService';
import en from '../i18n/en';
import nl from '../i18n/nl';

const STORAGE_KEY = '@serapis_language';

const translations = { en, nl };

const resolve = (obj, path) => {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  tTask: (task, field) => task?.[field] || '',
});

export const LanguageProvider = ({ children, userId }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    // Load from local storage first for immediate UI
    AsyncStorage.getItem(STORAGE_KEY)
      .then(val => {
        if (val === 'nl') setLanguageState('nl');
      })
      .catch(() => {});

    // Then try to sync from Supabase if userId is available
    if (userId) {
      userPreferencesService.getLanguage(userId)
        .then(lang => {
          setLanguageState(lang);
        })
        .catch(() => {});
    }
  }, [userId]);

  const setLanguage = useCallback((lang) => {
    const next = lang === 'nl' ? 'nl' : 'en';
    setLanguageState(next);
    // Save to both local and Supabase (if userId available)
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
    if (userId) {
      userPreferencesService.saveLanguage(userId, next).catch(() => {});
    }
  }, [userId]);

  const t = useCallback((key) => {
    const dict = translations[language] || translations.en;
    const value = resolve(dict, key);
    if (value !== undefined) return value;
    const fallback = resolve(translations.en, key);
    if (fallback !== undefined) return fallback;
    return key;
  }, [language]);

  const tTask = useCallback((task, field) => {
    if (!task) return '';
    if (language === 'en') return task[field] || '';

    const nlTask = translations.nl?.taskContent?.[task.id];
    if (nlTask && nlTask[field] !== undefined) {
      if (field === 'links' && Array.isArray(nlTask.links) && Array.isArray(task.links)) {
        return task.links.map((link, i) => ({
          ...link,
          label: nlTask.links[i] || link.label,
        }));
      }
      return nlTask[field];
    }
    return task[field] || '';
  }, [language]);

  const value = { language, setLanguage, t, tTask };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
