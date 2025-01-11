import {useAddFcmTokenMutation} from '@graphql/generated';
import {ONBOARDING_SCREEN, TAB_NAVIGATOR} from '@navigators/ScreenConstants';
import {firebase} from '@react-native-firebase/messaging';
import {useGlobalStore} from '@store';
import {useCallback, useEffect, useState} from 'react';
import {Image} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import Animated, {
  interpolateColor,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const SplashScreen = ({navigation}) => {
  const authToken = useGlobalStore(state => state.authToken);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const [animationFinished, setAnimationFinished] = useState(false);

  const {setAppReady} = useGlobalStore(state => state);

  const [updateFcmTokenMutation] = useAddFcmTokenMutation();

  useEffect(() => {
    const redirect = async () => {
      if (animationFinished) {
        if (authToken) {
          navigation.replace(TAB_NAVIGATOR);
        } else {
          navigation.replace(ONBOARDING_SCREEN);
        }

        await BootSplash.hide({fade: true});
        setAppReady(true);
      }
    };

    redirect();
  }, [authToken, animationFinished]);

  useEffect(() => {
    firebase.messaging().onTokenRefresh(async fcmToken => {
      await updateFcmTokenMutation({
        variables: {
          token: fcmToken,
        },
      });
    });
  }, []);

  const {container, logo} = BootSplash.useHideAnimation({
    manifest: require('../assets/bootsplash/manifest.json'),
    logo: require('../assets/bootsplash/logo.png'),
    statusBarTranslucent: true,
    navigationBarTranslucent: false,

    animate: () => {
      translateY.value = withTiming(20, {duration: 500});
      opacity.value = withTiming(
        0,
        {
          duration: 600,
        },
        isFinished => {
          if (isFinished) {
            runOnJS(setAnimationFinished)(true);
          }
        },
      );
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View {...container} style={container.style}>
      <Animated.Image {...logo} style={[logo.style, animatedStyle]} />
    </Animated.View>
  );
};

export default SplashScreen;
