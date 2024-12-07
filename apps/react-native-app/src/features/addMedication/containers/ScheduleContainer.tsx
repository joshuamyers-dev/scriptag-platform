import CustomButton from '@components/CustomButton';
import InputLabel from '@components/InputLabel';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {Portal} from '@gorhom/portal';
import {useAddMyMedicationMutation} from '@graphql/generated';
import {UNIT_MEASUREMENTS} from '@utils/Constants';
import {
  Colour10,
  Colour100,
  Colour80,
  ColourPurple10,
  ColourPurple50,
  fontBodyS,
  fontLabelM,
  fontLabelS,
  Spacing16,
} from '@utils/tokens';
import {
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Keyboard,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
import {WheelPicker} from 'react-native-infinite-wheel-picker';
import IntervalSelector from '../components/IntervalSelector';
import {triggerLightHaptic} from '@utils/Helpers';
import CheckboxLabel from '@components/CheckboxLabel';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {AddMedicationContext} from './AddMedicationContainer';

const ScheduleContainer = () => {
  const context = useContext(AddMedicationContext);
  const [medicationTakenWhenNeeded, setMedicationTakenWhenNeeded] =
    useState(false);

  const onPressContinue = useCallback(() => {
    context?.handleStepChange(context.currentStep + 1, 1);
  }, []);

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={50}
        contentContainerStyle={{paddingBottom: 150}}
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}>
        <Text style={styles.titleText}>
          Choose how you’ll take your medication
        </Text>
        <Text style={styles.subTitleText}>
          First, tap a box to specify how you will take your medication.
        </Text>

        <View style={styles.firstContainer}>
          <IntervalSelector />
          <CheckboxLabel
            label="I take this medication only when needed."
            checked={medicationTakenWhenNeeded}
            onPress={() => {
              triggerLightHaptic();
              setMedicationTakenWhenNeeded(!medicationTakenWhenNeeded);
            }}
            containerStyle={{marginTop: 16}}
          />
        </View>

        <View style={styles.secondContainer}>
          <Text style={styles.titleText}>And how often?</Text>
          <Text style={styles.subTitleText}>
            Indicate how you’ll take your medication on the days or periods of
            time you selected.
          </Text>

          <View style={{marginTop: 8}}>
            <IntervalSelector shouldUseTimeSelector />
          </View>
        </View>
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
