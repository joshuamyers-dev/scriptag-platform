import {
  Colour100,
  ColourPurple10,
  ColourPurple100,
  fontLabelL,
} from '@utils/tokens';
import {StyleSheet, Text, TextStyle, View} from 'react-native';
import SearchMedicationContainer from './SearchMedicationContainer';
import SpecifyMedicationContainer from './SpecifyMedicationContainer';
import React, {createContext, useCallback, useEffect, useState} from 'react';
import ProgressBar from 'react-native-animated-progress';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import BackButton from '@navigators/components/BackButton';
import ScheduleContainer from './ScheduleContainer';
import {Medication} from '@graphql/generated';
import SelectTimePeriod from './SelectTimePeriod';

const Add_MEDICATION_STEPS = [
  {
    step: 1,
    title: 'Search',
    component: SearchMedicationContainer,
  },
  {
    step: 2,
    title: 'Specify',
    component: SpecifyMedicationContainer,
  },
  {
    step: 3,
    title: 'Schedule',
    component: ScheduleContainer,
  },
  {
    step: 4,
    title: 'Schedule',
    component: SelectTimePeriod,
  },
];

interface AddMedicationContextProps {
  currentStep: number;
  selectedMedication: Medication | null;
  setSelectedMedication: (medication: Medication) => void;
  handleStepChange: (newStepIndex: number, direction: number) => void;
}

export const AddMedicationContext = createContext<
  AddMedicationContextProps | undefined
>(undefined);

const AddMedicationContainer = ({navigation}) => {
  const [currentStep, setStep] = useState<number>(0);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);

  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{translateX: translateX.value}],
    };
  });

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <BackButton
          isColoured
          onPress={() => {
            if (currentStep > 0 && currentStep !== 2) {
              handleStepChange(currentStep - 1, -1);
            } else if (currentStep === 2) {
              handleStepChange(currentStep - 2, -1);
            } else {
              navigation.goBack();
            }
          }}
        />
      ),
    });
  }, [currentStep]);

  const handleStepChange = useCallback(
    (newStepIndex: number, direction: number) => {
      opacity.value = withTiming(0, {duration: 250});
      translateX.value = withSpring(direction * -100, {
        damping: 100,
        stiffness: 80,
      });

      setTimeout(() => {
        setStep(newStepIndex);
        translateX.value = withSpring(direction * 100, {
          damping: 100,
          stiffness: 80,
        });
        opacity.value = withTiming(1, {duration: 250});
        translateX.value = withSpring(0, {damping: 100, stiffness: 80});
      }, 250);
    },
    [currentStep],
  );

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        paddingTop: 16,
        paddingHorizontal: 16,
      }}>
      <Animated.Text style={[styles.headerTitle, animatedStyle]}>
        {Add_MEDICATION_STEPS[currentStep].title}
      </Animated.Text>

      <View style={{paddingVertical: 16, width: '100%'}}>
        <ProgressBar
          progress={((currentStep + 1) / Add_MEDICATION_STEPS.length) * 100}
          height={4}
          animated
          trackColor={ColourPurple10}
          backgroundColor={ColourPurple100}
        />
      </View>

      <AddMedicationContext.Provider
        value={{
          currentStep,
          handleStepChange,
          selectedMedication,
          setSelectedMedication,
        }}>
        <Animated.View style={[animatedStyle, {width: '100%', flex: 1}]}>
          {currentStep === 0 && <SearchMedicationContainer />}
          {currentStep === 1 && <SpecifyMedicationContainer />}
          {currentStep === 2 && <ScheduleContainer />}
          {currentStep === 3 && <SelectTimePeriod />}
        </Animated.View>
      </AddMedicationContext.Provider>
    </View>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: fontLabelL.fontFamily,
    fontSize: fontLabelL.fontSize,
    fontWeight: fontLabelL.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
});

export default AddMedicationContainer;
