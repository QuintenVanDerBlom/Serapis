import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../services/notificationService';

const DISPLAY_MS = 6000;

const ReminderBanner = () => {
  const [notification, setNotification] = useState(null);
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const hideTimer = useRef(null);

  const dismiss = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setNotification(null));
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, [slideAnim]);

  const show = useCallback(
    (notif) => {
      setNotification(notif);
      slideAnim.setValue(-120);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();

      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(dismiss, DISPLAY_MS);
    },
    [slideAnim, dismiss],
  );

  useEffect(() => {
    notificationService.setListener(show);
    return () => {
      notificationService.removeListener();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [show]);

  if (!notification) return null;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
      accessibilityRole="alert"
    >
      <View style={styles.inner}>
        <Ionicons name="notifications" size={22} color="#fff" style={styles.icon} />
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>{notification.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{notification.body}</Text>
        </View>
        <TouchableOpacity
          onPress={dismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
        >
          <Ionicons name="close" size={20} color="#ffffffbb" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: 48,
    paddingHorizontal: 12,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d6a4f',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  body: {
    color: '#ffffffcc',
    fontSize: 13,
    lineHeight: 18,
  },
});

export default ReminderBanner;
