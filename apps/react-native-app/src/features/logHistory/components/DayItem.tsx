import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Colour10,
  Colour100,
  Colour50,
  Colour80,
  ColourPurple10,
  ColourPurple50,
  fontBodyS,
  fontBodyXs,
  fontLabelS,
} from '@utils/tokens';
import {DayOfMonth} from './Calendar';

interface DayItemProps {
  day: DayOfMonth;
  isSelected: boolean;
  onPress: (day: DayOfMonth) => void;
}

const DAY_ITEM_WIDTH = 53;

export const DayItem: React.FC<DayItemProps> = ({day, isSelected, onPress}) => {
  return (
    <TouchableOpacity style={styles.dateSelection} onPress={() => onPress(day)}>
      <Text style={[styles.weekDayText, isSelected && {color: Colour100}]}>
        {day.dayOfWeek.toUpperCase()}
      </Text>

      {isSelected ? (
        <View style={styles.dateTodayContainer}>
          <Text style={styles.monthDayTextToday}>{day.dayOfMonth}</Text>
        </View>
      ) : (
        <Text style={styles.monthDayText}>{day.dayOfMonth}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
