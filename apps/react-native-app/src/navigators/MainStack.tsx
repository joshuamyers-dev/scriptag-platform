import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  HOME_SCREEN,
  SCAN_TAG_SCREEN,
  SELECT_TIME_SCREEN,
} from './ScreenConstants';
import ScanTagContainer from '@features/addMedication/containers/ScanTagContainer';
import AddMedicationNameContainer from '@features/addMedication/containers/AddMedicationNameContainer';
import SelectTimeContainer from '@features/addMedication/containers/SelectTimeContainer';

const NativeStack = createNativeStackNavigator();

const MainStack = () => {
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

export default MainStack;
