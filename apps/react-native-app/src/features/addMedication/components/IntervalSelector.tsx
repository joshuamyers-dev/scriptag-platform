import CustomButton, {ButtonType} from '@components/CustomButton';
import {triggerLightHaptic} from '@utils/Helpers';
import {
  Colour10,
  Colour100,
  Colour50,
  Colour80,
  ColourPurple10,
  ColourPurple50,
  fontBodyS,
  fontLabelL,
  fontLabelS,
} from '@utils/tokens';
import dayjs from 'dayjs';
import React, {useCallback, useRef, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutLeft,
  FadeOutUp,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';

const SELECTION_ITEMS = ['Days', 'Intervals', 'Periods'];
const SELECTION_ITEMS_TIME = ['Time', 'Intervals', 'Periods'];
const WEEK_DAYS = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];

interface IntervalSelectorProps {
  shouldUseTimeSelector?: boolean;
}

const IntervalSelector: React.FC<IntervalSelectorProps> = ({
  shouldUseTimeSelector = false,
}) => {
  const [selectedItem, setSelectedItem] = useState(-1);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [interval, setInterval] = useState<string>('00');
  const [useFor, setUseFor] = useState<string>('00');
  const [pauseFor, setPauseFor] = useState<string>('00');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timeSlots, setTimeSlots] = useState<Date[]>([new Date(), new Date()]);
  const [settingTimeSlot, setSettingTimeSlot] = useState(-1);

  const intervalsInputRef = useRef<TextInput>(null);
  const pauseForInputRef = useRef<TextInput>(null);
  const useForInputRef = useRef<TextInput>(null);

  const onPressItem = useCallback((index: number) => {
    triggerLightHaptic();
    setSelectedItem(index);
  }, []);

  const onPressDay = useCallback(
    (index: number) => {
      triggerLightHaptic();

      if (selectedDays.includes(index)) {
        setSelectedDays(selectedDays.filter(day => day !== index));
      } else {
        setSelectedDays([...selectedDays, index]);
      }
    },
    [selectedDays],
  );

  const onPressEditInterval = useCallback(() => {
    triggerLightHaptic();
    intervalsInputRef.current?.focus();
  }, []);

  const onPressEditUseFor = useCallback(() => {
    triggerLightHaptic();
    useForInputRef.current?.focus();
  }, []);

  const onPressEditPauseFor = useCallback(() => {
    triggerLightHaptic();
    pauseForInputRef.current?.focus();
  }, []);

  const onPressEditTimeSlot = useCallback((index: number) => {
    triggerLightHaptic();
    setSettingTimeSlot(index);
    setDatePickerOpen(true);
  }, []);

  const onPressAddTimeSlot = useCallback(() => {
    triggerLightHaptic();
    setTimeSlots([...timeSlots, new Date()]);
  }, [timeSlots]);

  const onPressDeleteTimeSlot = useCallback((index: number) => {
    triggerLightHaptic();
    setTimeSlots(prevTimeSlots => prevTimeSlots.filter((_, i) => i !== index));
  }, []);

  const items = shouldUseTimeSelector ? SELECTION_ITEMS_TIME : SELECTION_ITEMS;

  return (
    <>
      <DatePicker
        modal
        mode="time"
        open={datePickerOpen}
        date={timeSlots[settingTimeSlot] || new Date()}
        onConfirm={date => {
          setDatePickerOpen(false);

          if (settingTimeSlot !== -1) {
            setTimeSlots(
              timeSlots.map((time, index) =>
                index === settingTimeSlot ? date : time,
              ),
            );
          }
        }}
        onCancel={() => {
          setDatePickerOpen(false);
        }}
      />
      <View style={styles.container}>
        {items.map((item, index) => (
          <TouchableHighlight
            onPress={() => onPressItem(index)}
            style={[
              styles.boxContainer,
              {
                backgroundColor:
                  selectedItem === index ? ColourPurple10 : 'white',
              },
            ]}
            underlayColor={ColourPurple10}>
            <Text
              style={[
                styles.boxText,
                selectedItem === index && styles.selectedText,
              ]}>
              {item}
            </Text>
          </TouchableHighlight>
        ))}
      </View>

      {selectedItem === 0 && !shouldUseTimeSelector && (
        <Animated.View
          style={styles.subSectionContainer}
          entering={FadeInDown}
          exiting={FadeOutUp}>
          {WEEK_DAYS.map((item, index) => (
            <TouchableHighlight
              onPress={() => onPressDay(index)}
              style={[
                styles.boxContainer,
                {
                  backgroundColor: selectedDays.includes(index)
                    ? ColourPurple10
                    : 'white',
                },
              ]}
              underlayColor={ColourPurple10}>
              <Text
                style={[
                  styles.boxText,
                  selectedDays.includes(index) && styles.selectedText,
                ]}>
                {item}
              </Text>
            </TouchableHighlight>
          ))}
        </Animated.View>
      )}

      {selectedItem === 0 && shouldUseTimeSelector && (
        <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
          <View style={styles.timeBoxContainer}>
            {timeSlots.map((time, index) => {
              const timeSlotParsed = dayjs(time);

              return (
                <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
                  <View key={index} style={styles.timeRowContainer}>
                    <View style={styles.circleContainer}>
                      <Text style={styles.circleText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.subSectionHighlightedText}>
                      {timeSlotParsed.format('hh')}
                    </Text>
                    <Text style={[styles.selectedText, {color: Colour50}]}>
                      :
                    </Text>
                    <Text style={styles.subSectionHighlightedText}>
                      {timeSlotParsed.format('mm')}
                    </Text>
                    <Text style={styles.subSectionHighlightedText}>
                      {timeSlotParsed.format('A')}
                    </Text>

                    <View style={{flexDirection: 'row', gap: 12}}>
                      <TouchableOpacity
                        hitSlop={{left: 10, top: 10, bottom: 10}}
                        onPress={() => onPressEditTimeSlot(index)}>
                        <Image
                          source={require('@assets/icons/pencil-edit.png')}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => onPressDeleteTimeSlot(index)}
                        hitSlop={{left: 10, top: 10, bottom: 10}}>
                        <Image source={require('@assets/icons/trash.png')} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              );
            })}

            <CustomButton
              type={ButtonType.Link}
              title="Add another time slot"
              onPress={onPressAddTimeSlot}
              containerStyle={{marginTop: 8}}
            />
          </View>
        </Animated.View>
      )}

      {selectedItem === 1 && (
        <Animated.View
          style={styles.subSectionContainer}
          entering={FadeInDown}
          exiting={FadeOutUp}>
          <View style={styles.intervalsRow}>
            <Text style={styles.intervalsText}>Every</Text>

            <TouchableOpacity
              style={styles.intervalsEdit}
              onPress={onPressEditInterval}>
              <TextInput
                ref={intervalsInputRef}
                value={interval}
                onChangeText={setInterval}
                onFocus={() => setInterval('')}
                onBlur={() => {
                  if (interval === '') {
                    setInterval('00');
                  }
                }}
                maxLength={3}
                keyboardType="number-pad"
                submitBehavior="blurAndSubmit"
                style={styles.subSectionHighlightedText}></TextInput>
              <Image source={require('@assets/icons/pencil-edit.png')} />
            </TouchableOpacity>

            <Text style={styles.intervalsText}>
              {shouldUseTimeSelector ? 'hours' : 'days'}
            </Text>
          </View>
        </Animated.View>
      )}

      {selectedItem === 2 && (
        <>
          <Animated.View
            style={[
              styles.subSectionContainer,
              {borderBottomLeftRadius: 0, borderBottomRightRadius: 0},
            ]}
            entering={FadeInDown}
            exiting={FadeOutUp}>
            <View
              style={[
                styles.intervalsRow,
                {borderBottomLeftRadius: 0, borderBottomRightRadius: 0},
              ]}>
              <View style={styles.intervalsLabelContainer}>
                <Text style={styles.intervalsText}>Use for</Text>
              </View>

              <TouchableOpacity
                style={styles.intervalsEdit}
                onPress={onPressEditUseFor}>
                <TextInput
                  ref={useForInputRef}
                  value={useFor}
                  onChangeText={setUseFor}
                  onFocus={() => setUseFor('')}
                  onBlur={() => {
                    if (useFor === '') {
                      setUseFor('00');
                    }
                  }}
                  maxLength={3}
                  keyboardType="number-pad"
                  submitBehavior="blurAndSubmit"
                  style={styles.subSectionHighlightedText}></TextInput>
                <Image source={require('@assets/icons/pencil-edit.png')} />
              </TouchableOpacity>

              <View style={styles.intervalsLabelDaysContainer}>
                <Text style={styles.intervalsText}>
                  {shouldUseTimeSelector ? 'hours' : 'days'}
                </Text>
              </View>
            </View>
          </Animated.View>
          <Animated.View
            style={[styles.subSectionContainer, {borderRadius: 0}]}
            entering={FadeInDown}
            exiting={FadeOutUp}>
            <View style={styles.intervalsRow}>
              <View style={styles.intervalsLabelContainer}>
                <Text style={styles.intervalsText}>Pause for</Text>
              </View>

              <TouchableOpacity
                style={styles.intervalsEdit}
                onPress={onPressEditPauseFor}>
                <TextInput
                  ref={pauseForInputRef}
                  value={pauseFor}
                  onChangeText={setPauseFor}
                  onFocus={() => setPauseFor('')}
                  onBlur={() => {
                    if (pauseFor === '') {
                      setPauseFor('00');
                    }
                  }}
                  maxLength={3}
                  keyboardType="number-pad"
                  submitBehavior="blurAndSubmit"
                  style={styles.subSectionHighlightedText}></TextInput>
                <Image source={require('@assets/icons/pencil-edit.png')} />
              </TouchableOpacity>

              <View style={styles.intervalsLabelDaysContainer}>
                <Text style={styles.intervalsText}>
                  {shouldUseTimeSelector ? 'hours' : 'days'}
                </Text>
              </View>
            </View>
          </Animated.View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    borderColor: Colour10,
    borderWidth: 1,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  subSectionContainer: {
    flexDirection: 'row',
    width: '100%',
    borderColor: Colour10,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  boxContainer: {
    paddingVertical: 16,
    borderColor: Colour10,
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
  },
  timeBoxContainer: {
    paddingBottom: 8,
    flex: 1,
    borderColor: Colour10,
    borderWidth: 2,
    borderTopWidth: 1,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  timeRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  boxText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  circleContainer: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderRadius: 32 / 2,
    borderColor: Colour10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour80,
  },
  selectedText: {
    fontFamily: fontLabelS.fontFamily,
    fontSize: fontLabelS.fontSize,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  intervalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colour10,
    borderWidth: 2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    flex: 1,
    gap: 16,
    paddingVertical: 12,
  },
  intervalsLabelContainer: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  intervalsLabelDaysContainer: {
    flex: 1,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  intervalsText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  subSectionHighlightedText: {
    fontFamily: fontLabelL.fontFamily,
    fontSize: fontLabelL.fontSize,
    fontWeight: fontLabelL.fontWeight as TextStyle['fontWeight'],
    color: ColourPurple50,
  },
  intervalsEdit: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 97,
  },
});

export default IntervalSelector;
