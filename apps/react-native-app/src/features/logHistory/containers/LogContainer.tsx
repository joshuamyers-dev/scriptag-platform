import {useFocusEffect} from '@react-navigation/native';
import {triggerLightHaptic} from '@utils/Helpers';
import {
  Colour100,
  Colour80,
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
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';

const DAY_ITEM_WIDTH = 53;

interface DayOfMonth {
  dayOfWeek: string;
  dayOfMonth: number;
}

const LogContainer = () => {
  const daysFlatListRef = useRef<FlatList>(null);
  const [selectedDay, setSelectedDay] = useState<number>(dayjs().date());
  const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month());
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());

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
      const date = dayjs().year(selectedYear).month(selectedMonth).date(day);

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

  return (
    <View>
      <View style={styles.topHeader}>
        <TouchableOpacity style={[styles.rowContainer, {flex: 1}]}>
          <Text style={styles.monthText}>{getMonthName(selectedMonth)}</Text>
          <Image
            source={require('@assets/icons/chevron-up.png')}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.rowContainer}>
          <Text style={styles.yearText}>{selectedYear}</Text>
          <Image
            source={require('@assets/icons/chevron-up.png')}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={daysFlatListRef}
        data={daysOfMonth}
        extraData={daysOfMonth || selectedDay}
        horizontal
        getItemLayout={(data, index) => ({
          length: DAY_ITEM_WIDTH,
          offset: DAY_ITEM_WIDTH * index,
          index,
        })}
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
});

export default LogContainer;
