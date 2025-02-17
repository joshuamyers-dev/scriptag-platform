import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {DayItem} from './DayItem';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import dayjs from '@utils/Dayjs';
import {triggerLightHaptic} from '@utils/Helpers';
import {Dayjs} from 'dayjs';

export interface DayOfMonth {
  dayOfWeek: string;
  dayOfMonth: number;
}

interface CalendarProps {
  onDaySelect: (date: Dayjs) => void;
  selectedMonth: number;
  selectedYear: number;
}

export const Calendar: React.FC<CalendarProps> = ({
  onDaySelect,
  selectedMonth,
  selectedYear,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(dayjs().date());
  const flatListRef = useRef<FlatList>(null);
  const translateX = useSharedValue(0);
  const prevMonth = useRef(selectedMonth);
  const prevYear = useRef(selectedYear);

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
    if (
      prevMonth.current !== selectedMonth ||
      prevYear.current !== selectedYear
    ) {
      const daysInNewMonth = dayjs()
        .year(selectedYear)
        .month(selectedMonth)
        .daysInMonth();

      if (selectedDay > daysInNewMonth) {
        setSelectedDay(daysInNewMonth);
      }

      prevMonth.current = selectedMonth;
      prevYear.current = selectedYear;
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (daysOfMonth?.length > 0) {
      setTimeout(() => {
        try {
          flatListRef.current?.scrollToIndex({
            index: Math.min(selectedDay - 1, daysOfMonth.length - 1),
            animated: true,
            viewPosition: 0.5,
          });
        } catch (error) {
          console.warn('Error scrolling to index:', error);
        }
      }, 500);
    }
  }, [daysOfMonth, selectedDay]);

  useEffect(() => {
    triggerLightHaptic();
    try {
      flatListRef.current?.scrollToIndex({
        index: Math.min(selectedDay - 1, daysOfMonth.length - 1),
        animated: true,
        viewPosition: 0.5,
      });
    } catch (error) {
      console.warn('Error scrolling to index:', error);
    }
  }, [selectedDay]);

  const onPressDate = useCallback((dayOfMonth: number) => {
    setSelectedDay(dayOfMonth);
  }, []);

  useEffect(() => {
    onDaySelect(
      dayjs().year(selectedYear).month(selectedMonth).date(selectedDay),
    );
  }, [selectedDay, selectedMonth, selectedYear]);

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
        runOnJS(onPressDate)(Math.max(selectedDay - 1, 1));
      } else if (event.translationX < -50) {
        runOnJS(onPressDate)(
          Math.min(
            selectedDay + 1,
            daysOfMonth[daysOfMonth.length - 1].dayOfMonth,
          ),
        );
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value}],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <FlatList
          ref={flatListRef}
          data={daysOfMonth}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => (
            <DayItem
              day={item}
              isSelected={item.dayOfMonth === selectedDay}
              onPress={day => onPressDate(day.dayOfMonth)}
            />
          )}
          keyExtractor={item => item.dayOfMonth.toString()}
          getItemLayout={(_, index) => ({
            length: 53,
            offset: 53 * index,
            index,
          })}
        />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
});
