import EmptyState from '@components/EmptyState';
import {
  MedicationLogEntryStatus,
  useMedicationLogHistoryLazyQuery,
} from '@graphql/generated';
import {usePickerLayout} from '@rn-elementary/menu';
import {DEVICE_TIMEZONE} from '@utils/Constants';
import {getMonthName, triggerLightHaptic} from '@utils/Helpers';
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
import {useGlobalStore} from '@store';
import dayjs from '@utils/Dayjs';
import {Calendar} from '../components/Calendar';
import {LogEntry} from '../components/LogEntry';

const LogContainer = () => {
  const daysFlatListRef = useRef<FlatList>(null);
  const [selectedDay, setSelectedDay] = useState<number>(dayjs().date());
  const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month());
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());

  const [fetchLogQuery, {data: logHistoryData, loading}] =
    useMedicationLogHistoryLazyQuery();

  const fetchData = useCallback(async () => {
    await fetchLogQuery({
      variables: {
        date: dayjs()
          .year(selectedYear)
          .month(selectedMonth)
          .date(selectedDay)
          .startOf('day')
          .utc(true)
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

  const logEntries = logHistoryData?.medicationLogEntries || [];

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

      <Calendar
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onDaySelect={date => {
          setSelectedDay(date.date());
        }}
      />

      <GestureDetector gesture={gesture}>
        <ScrollView
          style={styles.historyContainer}
          contentContainerStyle={{paddingBottom: 150}}>
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

            {logEntries.map((entry, index) => (
              <LogEntry key={entry.id} entry={entry} index={index} />
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
  historyContainer: {
    borderTopWidth: 2,
    borderTopColor: Colour10,
    paddingVertical: Spacing16.original,
    paddingHorizontal: Spacing16.original,
  },
});

export default LogContainer;
