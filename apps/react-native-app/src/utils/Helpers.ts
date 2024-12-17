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

export const triggerLightHaptic = () => {
  const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: true,
  };

  ReactNativeHapticFeedback.trigger('impactLight', options);
};


export const requestPushNotificationPermissions = async () => {
  await messaging().requestPermission();

  if (Platform.OS === 'android') {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }
};

/**
 * Rounds down numbers in a string that are followed by "mg".
 * @param {string} str - The string containing numbers to round down.
 * @returns {string} - The string with numbers rounded down.
 */
export const roundNumbersDown = (str: string): string => {
  return str.replace(/(\d+(\.\d+)?)(\s*mg)/g, (match, p1, p2, p3) => {
    const roundedNumber = Math.floor(parseFloat(p1));
    return `${roundedNumber}${p3}`;
  });
};

/**
 * Parses a string to an integer or returns null if the string is empty.
 * @param {string | null | undefined} value - The string to parse.
 * @returns {number | null} - The parsed integer or null.
*/
export const parseIntOrNull = (
  value: string | null | undefined,
): number | null => {
  if (value) {
    return parseInt(value);
  }

  return null;
};