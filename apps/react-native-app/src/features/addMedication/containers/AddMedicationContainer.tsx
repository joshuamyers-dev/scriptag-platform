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
import {ToastType, useGlobalStore} from '@store';
import {SCREEN_WIDTH} from '@utils/Constants';

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
  myMedicationId: string | null;
  setMyMedicationId: (id: string) => void;
  setSelectedMedication: (medication: Medication) => void;
  handleStepChange: (newStepIndex: number, direction: number) => void;
  daysInterval?: string | null;
  setDaysInterval?: (days: string) => void;
  hoursInterval: string | null;
  setHoursInterval: (hours: string) => void;
  scheduledDays: string[];
  setScheduledDays: (days: string[]) => void;
  useForDays: string | null;
  setUseForDays: (days: string) => void;
  pauseForDays: string | null;
  setPauseForDays: (days: string) => void;
  useForHours: string | null;
  setUseForHours: (hours: string) => void;
  pauseForHours: string | null;
  setPauseForHours: (hours: string) => void;
  timeSlots: Date[];
  setTimeSlots: (timeSlots: Date[]) => void;
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
  dosesRemaining: string | null;
  setDosesRemaining: (doses: string | null) => void;
  refillsRemaining: string | null;
  setRefillsRemaining: (refills: string | null) => void;
  takenWhenNeeded: boolean;
  setTakenWhenNeeded: (value: boolean) => void;
  onFlowComplete: () => void;
}

export const AddMedicationContext = createContext<
  AddMedicationContextProps | undefined
>(undefined);

const AddMedicationContainer = ({navigation}) => {
  const [currentStep, setStep] = useState<number>(0);

  const [myMedicationId, setMyMedicationId] = useState<string | null>(null);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);
  const [daysInterval, setDaysInterval] = useState<string | null>(null);
  const [scheduledDays, setScheduledDays] = useState<string[]>([]);
  const [useForDays, setUseForDays] = useState<string | null>(null);
  const [pauseForDays, setPauseForDays] = useState<string | null>(null);
  const [useForHours, setUseForHours] = useState<string | null>(null);
  const [pauseForHours, setPauseForHours] = useState<string | null>(null);
  const [hoursInterval, setHoursInterval] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dosesRemaining, setDosesRemaining] = useState<string | null>(null);
  const [refillsRemaining, setRefillsRemaining] = useState<string | null>(null);
  const [takenWhenNeeded, setTakenWhenNeeded] = useState<boolean>(false);

  const {showToast} = useGlobalStore();

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
      opacity.value = withTiming(0, {duration: 500});
      translateX.value = withTiming(direction * -SCREEN_WIDTH, {
        duration: 500,
      });

      setTimeout(() => {
        setStep(newStepIndex);

        translateX.value = withSpring(direction * SCREEN_WIDTH, {
          damping: 100,
          stiffness: 80,
        });
        opacity.value = withTiming(1, {duration: 400});
        translateX.value = withTiming(0, {
          duration: 400,
        });
      }, 400);
    },
    [currentStep],
  );

  const onFlowComplete = useCallback(() => {
    navigation.pop();
    showToast(
      'We’ve added your medication.',
      'It will show up on this screen.',
      ToastType.SUCCESS,
    );
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        paddingTop: 16,
        paddingHorizontal: 16,
      }}>
      <Animated.Text style={[styles.headerTitle]}>
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
          setMyMedicationId,
          myMedicationId,
          setHoursInterval,
          setDaysInterval,
          daysInterval,
          setScheduledDays,
          scheduledDays,
          setUseForDays,
          setPauseForDays,
          pauseForDays,
          pauseForHours,
          useForDays,
          useForHours,
          hoursInterval,
          setUseForHours,
          setPauseForHours,
          timeSlots,
          setTimeSlots,
          startDate,
          endDate,
          setStartDate,
          setEndDate,
          dosesRemaining,
          setDosesRemaining,
          refillsRemaining,
          setRefillsRemaining,
          onFlowComplete,
          takenWhenNeeded,
          setTakenWhenNeeded,
        }}>
        <Animated.View
          style={[
            animatedStyle,
            {
              width: '100%',
              flex: 1,
            },
          ]}>
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
