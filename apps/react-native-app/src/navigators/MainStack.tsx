import SignUpContainer from '@features/accountCreation/containers/SignUpContainer';
import AddMedicationNameContainer from '@features/addMedication/containers/AddMedicationNameContainer';
import ScanTagContainer from '@features/addMedication/containers/ScanTagContainer';
import SelectTimeContainer from '@features/addMedication/containers/SelectTimeContainer';
import OnboardingContainer from '@features/onboarding/containers/OnboardingContainer';
import ProfileOnboardingContainer from '@features/onboarding/containers/ProfileOnboardingContainer';
import ProfileOnboardingSuccessContainer from '@features/onboarding/containers/ProfileOnboardingSuccessContainer';
import StockContainer from '@features/stock/containers/StockContainer';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  Colour0,
  Colour10,
  ColourNeutral80,
  ColourPurple50,
  fontBodyXs,
} from '@utils/tokens';
import {Image, TextStyle} from 'react-native';
import SplashScreen from '../Splash';
import BackButton from './components/BackButton';
import {
  defaultHeaderTitleStyle,
  largeHeaderTitleStyle,
} from './NavigationStyles';
import {
  ADD_MEDICATION_STACK,
  HOME_SCREEN,
  ONBOARDING_SCREEN,
  PROFILE_ONBOARDING_SCREEN,
  PROFILE_ONBOARDING_STACK,
  PROFILE_ONBOARDING_SUCCESS_SCREEN,
  SCAN_TAG_SCREEN,
  SELECT_TIME_SCREEN,
  SIGN_UP_SCREEN,
  SIGN_UP_STACK,
  SPLASH_SCREEN,
  TAB_NAVIGATOR,
} from './ScreenConstants';

const NativeStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
          headerTitle: 'Add New Medication',
          headerTitleStyle: defaultHeaderTitleStyle,
          contentStyle: {
            backgroundColor: Colour0,
          },
          headerLeft: () => (
            <BackButton isColoured onPress={() => navigation.goBack()} />
          ),
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
          headerTitleStyle: defaultHeaderTitleStyle,
          headerLeft: () => (
            <BackButton onPress={() => navigation.goBack()} isColoured />
          ),
        })}
      />
      <NativeStack.Screen
        name={PROFILE_ONBOARDING_SUCCESS_SCREEN}
        component={ProfileOnboardingSuccessContainer}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Sign up',
          contentStyle: {
            backgroundColor: Colour0,
          },
          headerTitleStyle: defaultHeaderTitleStyle,
          // headerRight: () => (
          //   <CloseButton onPress={() => navigation.pop()} isColoured />
          // ),
          presentation: 'fullScreenModal',
        })}
      />
    </NativeStack.Navigator>
  );
};

const TabNavigatorStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 100,
          paddingTop: 8,
          borderTopWidth: 2,
          borderTopColor: Colour10,
        },
        tabBarLabelStyle: {
          fontFamily: fontBodyXs.fontFamily,
          fontSize: fontBodyXs.fontSize,
          fontWeight: fontBodyXs.fontWeight as TextStyle['fontWeight'],
          paddingTop: 4,
        },
        sceneStyle: {
          backgroundColor: Colour0,
        },
        headerTitleStyle: largeHeaderTitleStyle,
        headerStyle: {
          height: 130,
          borderBottomWidth: 2,
          borderBottomColor: Colour10,
        },
      }}>
      <Tab.Screen
        name="Stock"
        component={StockContainer}
        options={{
          tabBarLabel: 'Stock',
          tabBarActiveTintColor: ColourPurple50,
          tabBarInactiveTintColor: ColourNeutral80,
          tabBarIcon: ({focused}) => (
            <Image
              source={
                focused
                  ? require('@assets/icons/stock-tab-active.png')
                  : require('@assets/icons/stock-tab-inactive.png')
              }
            />
          ),
        }}
      />
      <Tab.Screen
        name="Log"
        component={StockContainer}
        options={{
          tabBarLabel: 'Log',
          tabBarActiveTintColor: ColourPurple50,
          tabBarInactiveTintColor: ColourNeutral80,
          tabBarIcon: ({focused}) => (
            <Image
              source={
                focused
                  ? require('@assets/icons/log-tab-active.png')
                  : require('@assets/icons/log-tab-inactive.png')
              }
            />
          ),
        }}
      />
      <Tab.Screen
        name="Help"
        component={StockContainer}
        options={{
          tabBarLabel: 'Help',
          tabBarActiveTintColor: ColourPurple50,
          tabBarInactiveTintColor: ColourNeutral80,
          tabBarIcon: ({focused}) => (
            <Image
              source={
                focused
                  ? require('@assets/icons/help-tab-active.png')
                  : require('@assets/icons/help-tab-inactive.png')
              }
            />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={StockContainer}
        options={{
          tabBarLabel: 'Account',
          tabBarActiveTintColor: ColourPurple50,
          tabBarInactiveTintColor: ColourNeutral80,
          tabBarIcon: ({focused}) => (
            <Image
              source={
                focused
                  ? require('@assets/icons/account-tab-active.png')
                  : require('@assets/icons/account-tab-inactive.png')
              }
            />
          ),
        }}
      />
    </Tab.Navigator>
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
        name={SPLASH_SCREEN}
        component={SplashScreen}
        options={({navigation}) => ({
          headerShown: false,
          contentStyle: {
            backgroundColor: Colour0,
          },
        })}
      />
      <NativeStack.Screen
        name={ONBOARDING_SCREEN}
        component={OnboardingContainer}
        options={({navigation}) => ({
          headerShown: false,
          contentStyle: {
            backgroundColor: Colour0,
          },
          animation: 'fade',
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
      <NativeStack.Screen
        name={TAB_NAVIGATOR}
        component={TabNavigatorStack}
        options={({navigation}) => ({
          headerShown: false,
          contentStyle: {
            backgroundColor: Colour0,
          },
          animation: 'fade',
        })}
      />
      <NativeStack.Screen
        name={ADD_MEDICATION_STACK}
        component={AddMedicationStack}
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
