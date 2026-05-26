import { AppState } from 'react-native';
import { pushNotificationService } from './pushNotificationService';

const DEFAULT_THRESHOLD_MINUTES = 90;

let _appStateSubscription = null;
let _sessionStartTime = null;
let _thresholdMinutes = DEFAULT_THRESHOLD_MINUTES;
let _isInitialized = false;

function handleAppStateChange(nextAppState) {
  if (nextAppState === 'active') {
    _sessionStartTime = Date.now();
    pushNotificationService.cancelScreenTimeBreak();
  } else if (nextAppState === 'background' || nextAppState === 'inactive') {
    pushNotificationService.scheduleScreenTimeBreak(_thresholdMinutes);
  }
}

function init(thresholdMinutes = DEFAULT_THRESHOLD_MINUTES) {
  if (_isInitialized) return;

  _thresholdMinutes = thresholdMinutes;
  _sessionStartTime = Date.now();
  _isInitialized = true;

  _appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
}

function destroy() {
  if (_appStateSubscription) {
    _appStateSubscription.remove();
    _appStateSubscription = null;
  }
  _isInitialized = false;
  _sessionStartTime = null;
}

function getSessionDurationMinutes() {
  if (!_sessionStartTime) return 0;
  return Math.round((Date.now() - _sessionStartTime) / 60000);
}

function setThreshold(minutes) {
  _thresholdMinutes = minutes;
}

export const screenTimeService = {
  init,
  destroy,
  getSessionDurationMinutes,
  setThreshold,
  DEFAULT_THRESHOLD_MINUTES,
};
