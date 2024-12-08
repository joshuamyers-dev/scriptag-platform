import CustomButton from '@components/CustomButton';
import {
  Colour10,
  Colour100,
  Colour80,
  fontBodyS,
  fontLabelM,
  fontLabelS,
  Spacing16,
} from '@utils/tokens';
import {useCallback, useContext, useRef, useState} from 'react';
import {StyleSheet, Text, TextStyle, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {AddMedicationContext} from './AddMedicationContainer';
import InputLabel from '@components/InputLabel';
import DatePicker from 'react-native-date-picker';
import {Portal} from '@gorhom/portal';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {WheelPicker} from 'react-native-infinite-wheel-picker';
import {MEDICATION_END_TYPES} from '@utils/Constants';
import InputMultipleSelect from '@components/InputMultipleSelect';

const SelectTimePeriod = () => {
  const context = useContext(AddMedicationContext);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [medicationEndTypeIndex, setMedicationEndTypeIndex] = useState(-1);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const onPressContinue = useCallback(() => {
    context?.handleStepChange(context.currentStep + 1, 1);
  }, []);

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        enableTouchThrough
      />
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <DatePicker
        mode="datetime"
        modal
        open={datePickerOpen}
        date={startDate}
        onDateChange={setStartDate}
        onCancel={() => setDatePickerOpen(false)}
      />
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          enablePanDownToClose
          backdropComponent={renderBackdrop}>
          <BottomSheetView style={styles.bottomSheetContentContainer}>
            <Text style={styles.modalTitle}>
              When will you stop taking the medication?
            </Text>
            <WheelPicker
              initialSelectedIndex={0}
              infiniteScroll={false}
              data={MEDICATION_END_TYPES.map(item => item.title)}
              restElements={2}
              elementHeight={30}
              onChangeValue={(index, value) => {
                setMedicationEndTypeIndex(index);
              }}
              selectedIndex={
                medicationEndTypeIndex === -1 ? 0 : medicationEndTypeIndex
              }
              containerStyle={styles.containerStyle}
              selectedLayoutStyle={styles.selectedLayoutStyle}
              elementTextStyle={styles.elementTextStyle}
            />
          </BottomSheetView>
        </BottomSheet>
      </Portal>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={50}
        contentContainerStyle={{paddingBottom: 150}}
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}>
        <Text style={styles.titleText}>
          How long do you need to take your medication?
        </Text>
        <Text style={styles.subTitleText}>
          We want to capture all the necessary information to set up accurate
          logging.
        </Text>

        <View style={styles.firstContainer}>
          <InputLabel
            label="When will this start?"
            placeholder="DD/MM/YY"
            onPress={() => setDatePickerOpen(true)}
          />
          <InputMultipleSelect
            label="When will you stop taking the medication?"
            placeholder="Select one"
            items={MEDICATION_END_TYPES}
            value={
              medicationEndTypeIndex === -1
                ? null
                : MEDICATION_END_TYPES[medicationEndTypeIndex].title
            }
            onSelectItem={index => setMedicationEndTypeIndex(index)}
            containerMaxHeight={300}
          />
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
    flexDirection: 'column',
    gap: 24,
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

export default SelectTimePeriod;
