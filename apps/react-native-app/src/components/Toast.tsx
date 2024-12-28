import {ToastType, useGlobalStore} from '@store';
import {triggerNotificationErrorHaptic} from '@utils/Helpers';
import {
  ColourGreen10,
  ColourGreen100,
  ColourGreen50,
  ColourRed10,
  ColourRed100,
  ColourRed50,
  fontBodyS,
  fontLabelS,
  Spacing16,
} from '@utils/tokens';
import React, {useCallback, useEffect} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const ToastMessage: React.FC = () => {
  const translateY = useSharedValue(-500);
  const timeout = useSharedValue<NodeJS.Timeout | null>(null);

  const {toastMessage, toastTitle, toastType, toastVisible, hideToast} =
    useGlobalStore(state => state);

  const gesture = Gesture.Pan()
    .onUpdate(event => {
      translateY.value = event.translationY;
    })
    .onEnd(event => {
      if (event.translationY < -50) {
        translateY.value = withSpring(-500, {});
      } else {
        translateY.value = withSpring(0);
      }
    });

  useEffect(() => {
    if (toastVisible) {
      translateY.value = withSpring(0, {damping: 15});
      triggerNotificationErrorHaptic();
      startTimer();
    }
  }, [toastVisible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });

  const onClose = useCallback(() => {
    translateY.value = withSpring(-500, {}, () => runOnJS(hideToast)());
  }, []);

  const startTimer = () => {
    timeout.value = setTimeout(() => {
      onClose();
    }, 5000);
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.toastContainer,
          animatedStyle,
          toastType === ToastType.ERROR && {borderColor: ColourRed50},
          toastType === ToastType.SUCCESS && {borderColor: ColourGreen50},
        ]}>
        <View
          style={[
            styles.iconContainer,
            toastType === ToastType.ERROR && {backgroundColor: ColourRed10},
            toastType === ToastType.SUCCESS && {backgroundColor: ColourGreen10},
          ]}>
          {toastType === ToastType.ERROR && (
            <Image source={require('@assets/icons/info.png')} />
          )}
          {toastType === ToastType.SUCCESS && (
            <Image source={require('@assets/icons/green-tick.png')} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.toastTitle,
              toastType === ToastType.SUCCESS && {color: ColourGreen100},
              toastType === ToastType.ERROR && {color: ColourRed100},
            ]}>
            {toastTitle}
          </Text>
          <Text
            style={[
              styles.toastMessage,
              toastType === ToastType.SUCCESS && {color: ColourGreen100},
              toastType === ToastType.ERROR && {color: ColourRed100},
            ]}>
            {toastMessage}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          {toastType === ToastType.ERROR && (
            <Image source={require('@assets/icons/x-close.png')} />
          )}
          {toastType === ToastType.SUCCESS && (
            <Image source={require('@assets/icons/x-close-green.png')} />
          )}
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 4,
    margin: Spacing16.original,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    backgroundColor: ColourRed10,
    paddingHorizontal: Spacing16.original,
    paddingTop: Spacing16.original,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: Spacing16.original,
  },
  toastTitle: {
    fontFamily: fontLabelS.fontFamily,
    fontSize: fontLabelS.fontSize,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
  },
  toastMessage: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    marginTop: 5,
  },
  closeButton: {
    marginHorizontal: Spacing16.original,
    marginVertical: Spacing16.original,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#E50000',
  },
});

export default ToastMessage;
