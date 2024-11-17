import {ONBOARDING_SCREEN, TAB_NAVIGATOR} from '@navigators/ScreenConstants';
import {useGlobalStore} from '@store';
import {useCallback, useEffect} from 'react';
import {Image, View} from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  SlideInUp,
} from 'react-native-reanimated';

const SplashScreen = ({navigation}) => {
  const authToken = useGlobalStore(state => state.authToken);

  const redirect = useCallback(() => {
    setTimeout(() => {
      if (authToken) {
        navigation.replace(TAB_NAVIGATOR);
      } else {
        navigation.replace(ONBOARDING_SCREEN);
      }
    }, 1000);
  }, [authToken]);

  useEffect(() => {
    redirect();
  }, []);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Animated.Image
        source={require('@assets/images/logo.png')}
        entering={FadeIn.duration(600)}
      />
    </View>
  );
};

export default SplashScreen;
