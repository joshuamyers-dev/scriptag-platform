import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  HOME_SCREEN,
  ONBOARDING_SCREEN,
  SCAN_TAG_SCREEN,
  SELECT_TIME_SCREEN,
} from './ScreenConstants';
import ScanTagContainer from '@features/addMedication/containers/ScanTagContainer';
import AddMedicationNameContainer from '@features/addMedication/containers/AddMedicationNameContainer';
import SelectTimeContainer from '@features/addMedication/containers/SelectTimeContainer';
import OnboardingContainer from '@features/onboarding/containers/OnboardingContainer';
import {Colour0} from '@utils/tokens';

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
    </NativeStack.Navigator>
  );
};

export default MainStack;
