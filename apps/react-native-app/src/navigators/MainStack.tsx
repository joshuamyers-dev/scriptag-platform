import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  HOME_SCREEN,
  ONBOARDING_SCREEN,
  PROFILE_ONBOARDING_SCREEN,
  PROFILE_ONBOARDING_STACK,
  SCAN_TAG_SCREEN,
  SELECT_TIME_SCREEN,
  SIGN_UP_SCREEN,
  SIGN_UP_STACK,
} from './ScreenConstants';
import ScanTagContainer from '@features/addMedication/containers/ScanTagContainer';
import AddMedicationNameContainer from '@features/addMedication/containers/AddMedicationNameContainer';
import SelectTimeContainer from '@features/addMedication/containers/SelectTimeContainer';
import OnboardingContainer from '@features/onboarding/containers/OnboardingContainer';
import {
  Colour0,
  ColourNeutral100,
  ColourNeutral80,
  ColourPurple50,
  fontBodyS,
} from '@utils/tokens';
import SignUpContainer from '@features/accountCreation/containers/SignUpContainer';
import BackButton from './components/BackButton';
import ProfileOnboardingContainer from '@features/onboarding/containers/ProfileOnboardingContainer';
import {TextStyle} from 'react-native';

const NativeStack = createNativeStackNavigator();

const AddMedicationStack = () => {
  return (
    <NativeStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        presentation: 'card',
      }}>
      <NativeStack.Screen
        name={HOME_SCREEN}
        component={AddMedicationNameContainer}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Add Medication',
        })}
      />
      <NativeStack.Screen
        name={SELECT_TIME_SCREEN}
        component={SelectTimeContainer}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Add Medication',
        })}
      />
      <NativeStack.Screen
        name={SCAN_TAG_SCREEN}
        component={ScanTagContainer}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Add Medication',
        })}
      />
    </NativeStack.Navigator>
  );
};

const SignUpStack = () => {
  return (
    <NativeStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        presentation: 'card',
      }}>
      <NativeStack.Screen
        name={SIGN_UP_SCREEN}
        component={SignUpContainer}
        options={({navigation}) => ({
          headerShown: false,
          headerTitle: '',
          contentStyle: {
            backgroundColor: Colour0,
          },
        })}
      />
    </NativeStack.Navigator>
  );
};

const ProfileOnboardingStack = () => {
  return (
    <NativeStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        presentation: 'card',
      }}>
      <NativeStack.Screen
        name={PROFILE_ONBOARDING_SCREEN}
        component={ProfileOnboardingContainer}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Sign up',
          contentStyle: {
            backgroundColor: Colour0,
          },
          headerTitleStyle: {
            fontFamily: fontBodyS.fontFamily,
            fontSize: fontBodyS.fontSize,
            fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
            color: ColourNeutral100,
          },
          headerLeft: () => (
            <BackButton onPress={() => navigation.goBack()} isColoured />
          ),
        })}
      />
    </NativeStack.Navigator>
  );
};

const MainStack = () => {
  return (
    <NativeStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        presentation: 'card',
      }}>
      <NativeStack.Screen
        name={ONBOARDING_SCREEN}
        component={OnboardingContainer}
        options={({navigation}) => ({
          headerShown: false,
          contentStyle: {
            backgroundColor: Colour0,
          },
        })}
      />
      <NativeStack.Screen
        name={SIGN_UP_STACK}
        component={SignUpStack}
        options={({navigation}) => ({
          headerShown: true,
          contentStyle: {
            backgroundColor: Colour0,
          },
          headerStyle: {
            backgroundColor: ColourPurple50,
          },
          headerTitle: '',
          headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
        })}
      />
      <NativeStack.Screen
        name={PROFILE_ONBOARDING_STACK}
        component={ProfileOnboardingStack}
        options={({navigation}) => ({
          headerShown: false,
          contentStyle: {
            backgroundColor: Colour0,
          },
        })}
      />
    </NativeStack.Navigator>
  );
};

export default MainStack;
