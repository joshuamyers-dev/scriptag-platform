import {triggerNotificationErrorHaptic} from '@utils/Helpers';
import {
  ColourRed10,
  ColourRed100,
  fontBodyS,
  fontLabelS,
  Spacing16,
} from '@utils/tokens';
import React, {useCallback, useEffect, useRef} from 'react';
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
  runOnUI,
  SlideInUp,
  SlideOutUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {useGlobalStore} from '@store';

const ToastMessage: React.FC = () => {
  const translateY = useSharedValue(-500);
  const timeout = useSharedValue<NodeJS.Timeout | null>(null);

  const {toastMessage, toastTitle, toastVisible, hideToast} = useGlobalStore(
    state => state,
  );

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
      <Animated.View style={[styles.toastContainer, animatedStyle]}>
        <View style={styles.iconContainer}>
          <Image source={require('@assets/icons/info.png')} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.toastTitle}>{toastTitle}</Text>
          <Text style={styles.toastMessage}>{toastMessage}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Image source={require('@assets/icons/x-close.png')} />
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
    borderColor: '#E50000',
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
    color: ColourRed100,
  },
  toastMessage: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: ColourRed100,
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
