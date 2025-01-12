import CustomButton from '@components/CustomButton';
import InputLabel from '@components/InputLabel';
import InputMultipleSelect from '@components/InputMultipleSelect';
import {
  DEVICE_TIMEZONE,
  MEDICATION_END_TYPE_DOSES_FINISHED,
  MEDICATION_END_TYPE_PRESCRIPTION_REPEATS,
  MEDICATION_END_TYPE_SPECIFIC_DATE,
  MEDICATION_END_TYPES,
} from '@utils/Constants';
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
import {Image, StyleSheet, Text, TextStyle, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {AddMedicationContext} from './AddMedicationContainer';
import {
  MethodScheduleType,
  MyMedicationsDocument,
  RecurringScheduleType,
  useAddMedicationScheduleMutation,
} from '@graphql/generated';
import {parseIntOrNull} from '@utils/Helpers';
import {ToastType, useGlobalStore} from '@store';
import dayjs from '@utils/Dayjs';

const SelectTimePeriod = () => {
  const context = useContext(AddMedicationContext);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [medicationEndTypeIndex, setMedicationEndTypeIndex] = useState(-1);
  const [pickingDateType, setPickingDateType] = useState<
    'startDate' | 'endDate'
  >('startDate');
  const [refillsAmount, setRefillsAmount] = useState<string | null>(null);
  const [dosesRemaining, setDosesRemaining] = useState<string | null>(null);
  const {showToast} = useGlobalStore();

  const [addMedicationScheduleMutation, {loading, error, data}] =
    useAddMedicationScheduleMutation();

  const onPressContinue = useCallback(async () => {
    let methodType: MethodScheduleType = MethodScheduleType.WhenNeeded;
    let recurringType: RecurringScheduleType = RecurringScheduleType.WhenNeeded;

    if (!context?.takenWhenNeeded) {
      if (context?.scheduledDays && context.scheduledDays.length > 0) {
        methodType = MethodScheduleType.Days;
      }

      if (context?.daysInterval) {
        methodType = MethodScheduleType.Intervals;
      }

      if (context?.useForDays && context?.pauseForDays) {
        methodType = MethodScheduleType.Periods;
      }

      if (context?.timeSlots && context.timeSlots.length > 0) {
        recurringType = RecurringScheduleType.Time;
      }

      if (context?.hoursInterval) {
        recurringType = RecurringScheduleType.Intervals;
      }

      if (context?.useForHours && context?.pauseForHours) {
        recurringType = RecurringScheduleType.Periods;
      }
    }

    console.log(dayjs(context?.timeSlots[0]).tz(DEVICE_TIMEZONE).toISOString());

    await addMedicationScheduleMutation({
      variables: {
        input: {
          medicationId: context?.selectedMedication?.id,
          myMedicationId: context?.myMedicationId,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          refillsRemaining: parseIntOrNull(context?.refillsRemaining),
          dosesRemaining: parseIntOrNull(context?.dosesRemaining),
          intervalsDays: parseIntOrNull(context?.daysInterval),
          intervalsHours: parseIntOrNull(context?.hoursInterval),
          useForDays: parseIntOrNull(context?.useForDays),
          pauseForDays: parseIntOrNull(context?.pauseForDays),
          useForHours: parseIntOrNull(context?.useForHours),
          pauseForHours: parseIntOrNull(context?.pauseForHours),
          timeSlots:
            recurringType === RecurringScheduleType.Time
              ? context?.timeSlots?.map(slot =>
                  dayjs(slot).tz(DEVICE_TIMEZONE, true).toISOString(),
                )
              : [],
          daysOfWeek: context?.scheduledDays,
          methodType,
          recurringType,
        },
      },
      refetchQueries: [
        {
          query: MyMedicationsDocument,
        },
      ],
    });
  }, [context]);

  useEffect(() => {
    if (error?.message) {
      showToast('An error occurred.', error?.message, ToastType.ERROR);
    }
  }, [error]);

  useEffect(() => {
    if (data?.createMedicationSchedule) {
      context?.onFlowComplete();
    }
  }, [data]);

  useEffect(() => {
    context?.setStartDate(startDate);
    context?.setEndDate(endDate);
    context?.setRefillsRemaining(refillsAmount);
    context?.setDosesRemaining(dosesRemaining);
  }, [startDate, endDate, refillsAmount, dosesRemaining]);

  return (
    <View style={styles.container}>
      <DatePicker
        mode="date"
        modal
        open={datePickerOpen}
        date={
          pickingDateType === 'startDate'
            ? startDate || new Date()
            : endDate || new Date()
        }
        onCancel={() => setDatePickerOpen(false)}
        onConfirm={date => {
          if (pickingDateType === 'startDate') {
            setStartDate(date);
          } else {
            setEndDate(date);
          }

          setDatePickerOpen(false);
        }}
      />
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
            iconLeft={<Image source={require('@assets/icons/calendar.png')} />}
            placeholder="DD/MM/YY"
            onPress={() => {
              setDatePickerOpen(true);
              setPickingDateType('startDate');
            }}
            value={startDate ? dayjs(startDate).format('DD/MM/YY') : ''}
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
          {MEDICATION_END_TYPES[medicationEndTypeIndex]?.value ===
            MEDICATION_END_TYPE_PRESCRIPTION_REPEATS && (
            <InputLabel
              placeholder="Type a number"
              label="No. of refills"
              inputProps={{keyboardType: 'number-pad'}}
              onChangeText={text => setRefillsAmount(text)}
              value={refillsAmount}
            />
          )}
          {MEDICATION_END_TYPES[medicationEndTypeIndex]?.value ===
            MEDICATION_END_TYPE_DOSES_FINISHED && (
            <InputLabel
              placeholder="Type a number"
              label="No. of doses or units"
              inputProps={{keyboardType: 'number-pad'}}
              onChangeText={text => setDosesRemaining(text)}
              value={dosesRemaining}
            />
          )}
          {MEDICATION_END_TYPES[medicationEndTypeIndex]?.value ===
            MEDICATION_END_TYPE_SPECIFIC_DATE && (
            <InputLabel
              label="End date"
              iconLeft={
                <Image source={require('@assets/icons/calendar.png')} />
              }
              placeholder="DD/MM/YY"
              onPress={() => {
                setDatePickerOpen(true);
                setPickingDateType('endDate');
              }}
              value={endDate ? dayjs(endDate).format('DD/MM/YY') : ''}
            />
          )}
        </View>
      </KeyboardAwareScrollView>
      <View style={styles.footerContainer}>
        <CustomButton
          title="Save medication"
          onPress={onPressContinue}
          loading={loading}
        />
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
