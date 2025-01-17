import CheckboxLabel from '@components/CheckboxLabel';
import CustomButton from '@components/CustomButton';
import {triggerLightHaptic} from '@utils/Helpers';
import {
  Colour10,
  Colour100,
  Colour80,
  fontBodyS,
  fontLabelM,
  fontLabelS,
  Spacing16,
} from '@utils/tokens';
import {useCallback, useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, TextStyle, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import IntervalSelector from '../components/IntervalSelector';
import {AddMedicationContext} from './AddMedicationContainer';

const ScheduleContainer = () => {
  const context = useContext(AddMedicationContext);
  const [howOftenSectionVisible, setHowOftenSectionVisible] = useState(false);

  const opacityValue = useSharedValue(1);

  const onPressContinue = useCallback(() => {
    context?.handleStepChange(context.currentStep + 1, 1);
  }, []);

  const animatedOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityValue.value,
    };
  });

  useEffect(() => {
    opacityValue.value = withTiming(context?.takenWhenNeeded ? 0.3 : 1, {
      duration: 600,
    });
  }, [context?.takenWhenNeeded]);

  useEffect(() => {
    if (
      (context?.scheduledDays && context.scheduledDays.length > 0) ||
      context?.daysInterval ||
      (context?.useForDays && context?.pauseForDays)
    ) {
      setHowOftenSectionVisible(true);
    } else {
      setHowOftenSectionVisible(false);
    }
  }, [context]);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={50}
        contentContainerStyle={{paddingBottom: 150}}
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}>
        <Animated.View
          style={animatedOpacityStyle}
          pointerEvents={context?.takenWhenNeeded ? 'none' : 'auto'}>
          <Text style={styles.titleText}>
            Choose how you’ll take your medication
          </Text>
          <Text style={styles.subTitleText}>
            First, tap a box to specify how you will take your medication.
          </Text>

          <View style={styles.firstContainer}>
            <IntervalSelector
              resetOpenState={context?.takenWhenNeeded}
              onSetDaysInterval={context?.setDaysInterval}
              onSetPauseFor={context?.setPauseForDays}
              onSetUseFor={context?.setUseForDays}
              onSetScheduledDays={context?.setScheduledDays}
            />
          </View>
        </Animated.View>

        <CheckboxLabel
          label="I take this medication only when needed."
          checked={context?.takenWhenNeeded ?? false}
          onPress={() => {
            triggerLightHaptic();
            context?.setTakenWhenNeeded(!context.takenWhenNeeded);
          }}
          containerStyle={{marginTop: 16}}
        />

        <Animated.View
          style={[animatedOpacityStyle, {marginTop: 32}]}
          pointerEvents={context?.takenWhenNeeded ? 'none' : 'auto'}>
          <Text style={styles.titleText}>And how often?</Text>
          <Text style={styles.subTitleText}>
            Indicate how you’ll take your medication on the days or periods of
            time you selected.
          </Text>

          <View style={{marginTop: 8}}>
            <IntervalSelector
              shouldUseTimeSelector
              resetOpenState={context?.takenWhenNeeded}
              onSetDaysInterval={context?.setHoursInterval}
              onSetPauseFor={context?.setPauseForHours}
              onSetUseFor={context?.setUseForHours}
              onSetTimeSlots={context?.setTimeSlots}
            />
          </View>
        </Animated.View>
      </KeyboardAwareScrollView>
      <View style={styles.footerContainer}>
        <CustomButton title="Continue" onPress={onPressContinue} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleText: {
    fontFamily: fontLabelM.fontFamily,
    fontSize: fontLabelM.fontSize,
    fontWeight: fontLabelM.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  subTitleText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour80,
    paddingTop: 8,
  },
  firstContainer: {
    marginTop: 16,
  },
  secondContainer: {
    marginTop: 32,
  },
  footerContainer: {
    borderTopColor: Colour10,
    borderTopWidth: 2,
    backgroundColor: 'white',
    zIndex: 10,
    padding: Spacing16.original,
    position: 'absolute',
    bottom: 25,
    left: -16,
    right: -16,
  },
  bottomSheetContentContainer: {
    height: 230,
    alignItems: 'center',
  },
  selectedLayoutStyle: {
    backgroundColor: Colour10,
    borderRadius: 2,
  },
  containerStyle: {
    width: '100%',
  },
  modalTitle: {
    fontFamily: fontLabelS.fontFamily,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    fontSize: fontLabelS.fontSize,
    color: Colour80,
    paddingTop: 16,
  },
  elementTextStyle: {
    fontFamily: fontLabelS.fontFamily,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    fontSize: fontLabelS.fontSize,
    color: Colour100,
  },
});

export default ScheduleContainer;
