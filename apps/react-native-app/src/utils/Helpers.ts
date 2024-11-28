import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';

export const isPasswordStrong = (password: string): boolean => {
  const hasSymbol = /[A-Za-z]/.test(password);
  const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasSymbol && hasSpecialCharacter;
};

export const triggerNotificationErrorHaptic = () => {
  const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: true,
  };

  ReactNativeHapticFeedback.trigger('notificationError', options);
};

export const requestPushNotificationPermissions = async () => {
  await messaging().requestPermission();

  if (Platform.OS === 'android') {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }
};

export const roundNumbersDown = (str: string): string => {
  return str.replace(/(\d+(\.\d+)?)(\s*mg)/g, (match, p1, p2, p3) => {
    const roundedNumber = Math.floor(parseFloat(p1));
    return `${roundedNumber}${p3}`;
  });
};