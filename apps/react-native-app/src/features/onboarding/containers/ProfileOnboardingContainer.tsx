import {
  Colour10,
  Colour100,
  ColourPurple10,
  ColourPurple50,
  fontLabelL,
  Spacing16,
} from '@utils/tokens';
import {createContext, useCallback, useEffect, useState} from 'react';
import {StyleSheet, Text, TextStyle, View} from 'react-native';
import SetPassword from '../components/SetPassword';

import CustomButton from '@components/CustomButton';
import {
  useAddFcmTokenMutation,
  useCreateAccountMutation,
} from '@graphql/generated';
import BackButton from '@navigators/components/BackButton';
import {ToastType, useGlobalStore} from '@store';
import {
  isPasswordStrong,
  requestPushNotificationPermissions,
} from '@utils/Helpers';
import ProgressBar from 'react-native-animated-progress';
import messaging from '@react-native-firebase/messaging';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import EnablePushNotifications from '../components/EnablePushNotifications';
import {updateClientHeaders} from '../../../../ApolloClient';
import {PROFILE_ONBOARDING_SUCCESS_SCREEN} from '@navigators/ScreenConstants';

const ONBOARDING_STEPS = [
  {
    title: 'Password',
    component: SetPassword,
  },
  {
    title: 'Notifications',
    component: EnablePushNotifications,
  },
];

interface OnboardingContextProps {
  password: string | null;
  setPassword: (password: string) => void;
  isContinueEnabled: boolean;
  setContinueEnabled: (enabled: boolean) => void;
}

export const OnboardingContext = createContext<
  OnboardingContextProps | undefined
>(undefined);

const ProfileOnboardingContainer = ({navigation, route}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [password, setPassword] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [isContinueEnabled, setContinueEnabled] = useState(false);

  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  const {showToast, setAuthToken} = useGlobalStore(state => state);

  const [
    createAccountMutation,
    {loading: isCreatingAccount, error: createAccountError},
  ] = useCreateAccountMutation();
  const [addFcmTokenMutation, {loading: isAddingToken}] =
    useAddFcmTokenMutation();

  const {
    params: {email},
  } = route;

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <BackButton
          isColoured
          onPress={() => {
            if (stepIndex > 0) {
              handleStepChange(stepIndex - 1, -1);
            } else {
              navigation.goBack();
            }
          }}
        />
      ),
    });
  }, [stepIndex]);

  const handleStepChange = useCallback(
    (newStepIndex: number, direction: number) => {
      opacity.value = withTiming(0, {duration: 250});
      translateX.value = withSpring(direction * -100, {damping: 30});

      setTimeout(() => {
        setStepIndex(newStepIndex);
        translateX.value = withSpring(direction * 100, {damping: 30});
        opacity.value = withTiming(1, {duration: 250});
        translateX.value = withSpring(0, {damping: 30});
      }, 250);
    },
    [stepIndex],
  );

  const onPressContinue = useCallback(async () => {
    if (stepIndex === 0) {
      if (password && !isPasswordStrong(password)) {
        showToast(
          'Oops, you forgot to type in a complete password.',
          'Please try again.',
        );
        return;
      } else if (password && isPasswordStrong(password)) {
        const sessionResult = await createAccountMutation({
          variables: {
            input: {
              email,
              password,
            },
          },
        });

        if (
          sessionResult.data?.createAccount &&
          sessionResult.data.createAccount.token
        ) {
          updateClientHeaders(sessionResult.data.createAccount.token);
          setAuthToken(sessionResult.data.createAccount.token);
        }
      }
    } else if (stepIndex === 1) {
      setLoading(true);
      await requestPushNotificationPermissions();
      const fcmToken = await messaging().getToken();

      await addFcmTokenMutation({
        variables: {
          token: fcmToken,
        },
      });

      setLoading(false);
    }

    if (stepIndex === ONBOARDING_STEPS.length - 1) {
      navigation.navigate(PROFILE_ONBOARDING_SUCCESS_SCREEN);
    } else {
      handleStepChange(stepIndex + 1, 1);
    }
  }, [stepIndex, password]);

  useEffect(() => {
    if (createAccountError?.message) {
      showToast('Oops.', createAccountError.message, ToastType.ERROR);
    }
  }, [createAccountError]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{translateY: translateX.value}],
    };
  });

  const renderComponent = useCallback(() => {
    switch (stepIndex) {
      case 0:
        return <SetPassword />;
      case 1:
        return <EnablePushNotifications />;
    }
  }, [stepIndex]);

  return (
    <OnboardingContext.Provider
      value={{
        isContinueEnabled,
        setContinueEnabled,
        setPassword,
        password,
      }}>
      <View style={styles.container}>
        <Animated.View style={animatedStyle}>
          <Text style={styles.sectionTitle}>
            {ONBOARDING_STEPS[stepIndex].title}
          </Text>
        </Animated.View>

        <View style={{paddingBottom: 16}}>
          <ProgressBar
            progress={((stepIndex + 1) / ONBOARDING_STEPS.length) * 100}
            height={16}
            animated
            trackColor={ColourPurple10}
            backgroundColor={ColourPurple50}
          />
        </View>

        <Animated.View style={animatedStyle}>{renderComponent()}</Animated.View>

        <View style={styles.footerContainer}>
          <CustomButton
            title="Continue"
            disabled={!isContinueEnabled}
            onPress={onPressContinue}
            loading={isCreatingAccount || isAddingToken || isLoading}
          />
        </View>
      </View>
    </OnboardingContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: Spacing16.original,
  },
  sectionTitle: {
    fontFamily: fontLabelL.fontFamily,
    fontSize: fontLabelL.fontSize,
    fontWeight: fontLabelL.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
    textAlign: 'center',
    paddingVertical: Spacing16.original,
  },
  footerContainer: {
    borderTopColor: Colour10,
    borderTopWidth: 2,
    padding: Spacing16.original,
    position: 'absolute',
    bottom: 25,
    left: -16,
    right: -16,
  },
});

export default ProfileOnboardingContainer;
