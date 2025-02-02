import EmptyState from '@components/EmptyState';
import {
  MedicationLogEntryStatus,
  useMedicationLogHistoryLazyQuery,
} from '@graphql/generated';
import {usePickerLayout} from '@rn-elementary/menu';
import {DEVICE_TIMEZONE} from '@utils/Constants';
import {triggerLightHaptic} from '@utils/Helpers';
import {
  Colour10,
  Colour100,
  Colour50,
  Colour80,
  ColourBlue50,
  ColourGreen50,
  ColourPurple10,
  ColourPurple50,
  fontBodyM,
  fontBodyS,
  fontBodyXs,
  fontLabelM,
  fontLabelS,
  Spacing16,
} from '@utils/tokens';
import dayjs from 'dayjs';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import {MaterialIndicator} from 'react-native-indicators';
import {MenuView, MenuComponentRef, MenuAction} from '@react-native-menu/menu';
import Animated, {
  FadeIn,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {run} from 'jest';
import {useFocusEffect} from '@react-navigation/native';

const DAY_ITEM_WIDTH = 53;

interface DayOfMonth {
  dayOfWeek: string;
  dayOfMonth: number;
}

const LogContainer = () => {
  const daysFlatListRef = useRef<FlatList>(null);
  const [selectedDay, setSelectedDay] = useState<number>(
    dayjs().tz(DEVICE_TIMEZONE, true).date(),
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    dayjs().tz(DEVICE_TIMEZONE, true).month(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    dayjs().tz(DEVICE_TIMEZONE, true).year(),
  );

  const [fetchLogQuery, {data: logHistoryData, loading}] =
    useMedicationLogHistoryLazyQuery();

  const getMonthName = useCallback((monthIndex: number): string => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return monthNames[monthIndex];
  }, []);

  const daysOfMonth = useMemo(() => {
    const daysInMonth = dayjs()
      .year(selectedYear)
      .month(selectedMonth)
      .daysInMonth();
    const daysArray: DayOfMonth[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = dayjs()
        .tz(DEVICE_TIMEZONE, true)
        .year(selectedYear)
        .month(selectedMonth)
        .date(day);

      daysArray.push({
        dayOfWeek: date.format('ddd'),
        dayOfMonth: day,
      });
    }
    return daysArray;
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (daysOfMonth?.length > 0) {
      setTimeout(() => {
        daysFlatListRef.current?.scrollToIndex({
          index: selectedDay - 1,
          animated: true,
          viewPosition: 0.5,
        });
      }, 500);
    }
  }, [daysOfMonth, selectedDay]);

  const fetchData = useCallback(async () => {
    await fetchLogQuery({
      variables: {
        date: dayjs()
          .tz(DEVICE_TIMEZONE, true)
          .year(selectedYear)
          .month(selectedMonth)
          .date(selectedDay)
          .toISOString(),
      },
      fetchPolicy: 'cache-and-network',
    });
  }, [selectedDay, selectedMonth, selectedYear]);

  useFocusEffect(
    useCallback(() => {
      const fetchDataAsync = async () => {
        await fetchData();
      };

      fetchDataAsync();
    }, [selectedDay, selectedMonth, selectedYear]),
  );

  useEffect(() => {
    triggerLightHaptic();
    daysFlatListRef.current?.scrollToIndex({
      index: selectedDay - 1,
      animated: true,
      viewPosition: 0.5,
    });
  }, [selectedDay]);

  const onPressDate = useCallback((date: DayOfMonth) => {
    setSelectedDay(date.dayOfMonth);
  }, []);

  const logEntries = logHistoryData?.medicationLogEntries || [];
  const monthsMenuActions = useMemo<MenuAction[]>(() => {
    return Array.from({length: 12}, (_, i) => ({
      id: `${i}`,
      title: getMonthName(i),
      onPressAction: () => {
        setSelectedMonth(i);
      },
      state: selectedMonth === i ? 'on' : 'off',
    }));
  }, [selectedMonth]);
  const yearsMenuActions = useMemo<MenuAction[]>(() => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 3;
    const endYear = currentYear + 3;

    return Array.from({length: endYear - startYear + 1}, (_, i) => {
      const year = startYear + i;
      return {
        id: `${year}`,
        title: `${year}`,
        onPressAction: () => {
          setSelectedYear(year);
        },
        state: selectedYear === year ? 'on' : 'off',
      };
    });
  }, [selectedYear]);

  const translateX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      translateX.value = 0;
    })
    .onUpdate(event => {
      translateX.value = event.translationX;
    })
    .onEnd(event => {
      translateX.value = event.translationX;

      if (event.translationX > 50) {
        runOnJS(setSelectedDay)(Math.max(selectedDay - 1, 1));
      } else if (event.translationX < -50) {
        runOnJS(setSelectedDay)(Math.min(selectedDay + 1, 31));
      }
      translateX.value = withTiming(0);
    });

  return (
    <View>
      <View style={styles.topHeader}>
        <View style={[styles.rowContainer, {flex: 1}]}>
          <MenuView
            onOpenMenu={() => triggerLightHaptic()}
            onCloseMenu={() => triggerLightHaptic()}
            title="Select a Month"
            onPressAction={({nativeEvent}) => {
              setSelectedMonth(Number(nativeEvent.event));
            }}
            actions={monthsMenuActions}>
            <View
              style={{flexDirection: 'row', alignItems: 'center', gap: 4}}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.monthText}>
                {getMonthName(selectedMonth)}
              </Text>
              <Image
                source={require('@assets/icons/chevron-up.png')}
                style={styles.chevronIcon}
              />
            </View>
          </MenuView>
        </View>

        <View style={styles.rowContainer}>
          <MenuView
            onOpenMenu={() => triggerLightHaptic()}
            onCloseMenu={() => triggerLightHaptic()}
            title="Select a Year"
            onPressAction={({nativeEvent}) => {
              setSelectedYear(Number(nativeEvent.event));
            }}
            actions={yearsMenuActions}>
            <View
              style={{flexDirection: 'row', alignItems: 'center', gap: 4}}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.yearText}>{selectedYear}</Text>
              <Image
                source={require('@assets/icons/chevron-up.png')}
                style={styles.chevronIcon}
              />
            </View>
          </MenuView>
        </View>
      </View>

      <FlatList
        ref={daysFlatListRef}
        data={daysOfMonth}
        style={styles.dateSelectionContainer}
        extraData={daysOfMonth || selectedDay}
        horizontal
        getItemLayout={(data, index) => ({
          length: DAY_ITEM_WIDTH,
          offset: DAY_ITEM_WIDTH * index,
          index,
        })}
        onScrollBeginDrag={() => triggerLightHaptic()}
        onScrollEndDrag={() => triggerLightHaptic()}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.dateSelection}
            onPress={() => onPressDate(item)}>
            <Text
              style={[
                styles.weekDayText,
                item.dayOfMonth === selectedDay && {color: Colour100},
              ]}>
              {item.dayOfWeek.toUpperCase()}
            </Text>

            {item.dayOfMonth === selectedDay ? (
              <View style={styles.dateTodayContainer}>
                <Text style={styles.monthDayTextToday}>{item.dayOfMonth}</Text>
              </View>
            ) : (
              <Text style={styles.monthDayText}>{item.dayOfMonth}</Text>
            )}
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />

      <GestureDetector gesture={gesture}>
        <ScrollView style={styles.historyContainer}>
          <Animated.View
            style={useAnimatedStyle(() => ({
              transform: [{translateX: translateX.value}],
            }))}>
            {loading && logEntries.length === 0 && (
              <MaterialIndicator
                size={25}
                color={ColourPurple50}
                style={{marginTop: 24}}
              />
            )}

            {!loading && logEntries.length === 0 && (
              <Animated.View style={{marginTop: 40}} entering={FadeIn}>
                <EmptyState
                  header="No log entries"
                  description="There are no log entries for this day. Check back later."
                  image={
                    <Image source={require('@assets/images/tags-empty.png')} />
                  }
                />
              </Animated.View>
            )}

            {logHistoryData?.medicationLogEntries?.map(entry => (
              <Animated.View
                key={entry.id}
                style={styles.timeGroupContainer}
                entering={FadeIn}>
                <Text style={styles.timeTitle}>
                  {dayjs(entry.dueTime)
                    .tz(DEVICE_TIMEZONE, true)
                    .format('h:mm a')}
                </Text>

                <View style={styles.medicationRowContainer}>
                  <View style={{width: 200}}>
                    <Text style={styles.medicationNameText}>
                      {entry.myMedication.brandName}{' '}
                      {entry.myMedication.activeIngredient}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                    {entry.status === MedicationLogEntryStatus.Taken && (
                      <>
                        <Image
                          source={require('@assets/icons/green-tick.png')}
                        />
                        <Text style={styles.takenText}>Taken</Text>
                      </>
                    )}

                    {entry.status === MedicationLogEntryStatus.Upcoming && (
                      <>
                        <Image
                          source={require('@assets/icons/info-blue.png')}
                        />
                        <Text style={styles.upcomingText}>To be taken</Text>
                      </>
                    )}
                  </View>
                </View>
              </Animated.View>
            ))}
          </Animated.View>
        </ScrollView>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing16.original,
    paddingVertical: Spacing16.original,
  },
  dateSelectionContainer: {
    paddingBottom: 16,
  },
  monthText: {
    fontFamily: fontLabelM.fontFamily,
    fontSize: fontLabelM.fontSize,
    fontWeight: fontLabelM.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  yearText: {
    fontFamily: fontBodyM.fontFamily,
    fontSize: fontBodyM.fontSize,
    fontWeight: fontBodyM.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  chevronIcon: {
    transform: [{rotate: '180deg'}],
  },
  dateSelection: {
    width: DAY_ITEM_WIDTH,
    alignItems: 'center',
  },
  dateTodayContainer: {
    backgroundColor: ColourPurple10,
    padding: 10,
    minWidth: 37,
    borderRadius: 37 / 2,
    marginTop: 4,
    alignItems: 'center',
  },
  weekDayText: {
    fontFamily: fontBodyXs.fontFamily,
    fontSize: fontBodyXs.fontSize,
    fontWeight: fontBodyXs.fontWeight as TextStyle['fontWeight'],
    color: Colour80,
  },
  monthDayText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour80,
    paddingTop: 14,
  },
  monthDayTextToday: {
    fontFamily: fontLabelS.fontFamily,
    fontSize: fontLabelS.fontSize,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    color: ColourPurple50,
  },
  historyContainer: {
    borderTopWidth: 2,
    borderTopColor: Colour10,
    paddingVertical: Spacing16.original,
    paddingHorizontal: Spacing16.original,
  },
  timeTitle: {
    fontFamily: fontBodyM.fontFamily,
    fontSize: fontBodyM.fontSize,
    fontWeight: fontBodyM.fontWeight as TextStyle['fontWeight'],
    color: Colour50,
    paddingBottom: Spacing16.original,
  },
  timeGroupContainer: {
    paddingBottom: Spacing16.original,
  },
  medicationRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  medicationNameText: {
    fontFamily: fontLabelS.fontFamily,
    fontSize: fontLabelS.fontSize,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  unitText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour80,
  },
  takenText: {
    fontFamily: fontLabelS.fontFamily,
    fontSize: fontLabelS.fontSize,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    color: ColourGreen50,
  },
  upcomingText: {
    fontFamily: fontLabelS.fontFamily,
    fontSize: fontLabelS.fontSize,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    color: ColourBlue50,
  },
});

export default LogContainer;
