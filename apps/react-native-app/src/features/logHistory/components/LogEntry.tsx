import React from 'react';
import {StyleSheet, Text, View, Image, TextStyle} from 'react-native';
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
  fontLabelS,
  Spacing16,
} from '@utils/tokens';
import {MedicationLogEntry, MedicationLogEntryStatus} from '@graphql/generated';
import dayjs from '@utils/Dayjs';
import Animated, {FadeIn} from 'react-native-reanimated';

interface LogEntryProps {
  entry: MedicationLogEntry;
  index: number;
}

export const LogEntry: React.FC<LogEntryProps> = ({entry, index}) => {
  return (
    <Animated.View
      key={`${entry.id}-${index}`}
      style={styles.timeGroupContainer}
      entering={FadeIn}>
      <Text style={styles.timeTitle}>
        {dayjs(entry.dueTime).format('h:mm a')}
      </Text>

      <View style={styles.medicationRowContainer}>
        <View style={{width: 200}}>
          <Text style={styles.medicationNameText}>
            {entry.myMedication.brandName} {entry.myMedication.activeIngredient}
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
              <Image source={require('@assets/icons/green-tick.png')} />
              <Text style={styles.takenText}>Taken</Text>
            </>
          )}

          {entry.status === MedicationLogEntryStatus.Upcoming && (
            <>
              <Image source={require('@assets/icons/info-blue.png')} />
              <Text style={styles.upcomingText}>To be taken</Text>
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  medicationRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timeGroupContainer: {
    paddingVertical: Spacing16.original,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colour10,
  },
  medicationNameText: {
    fontFamily: fontLabelS.fontFamily,
    fontSize: fontLabelS.fontSize,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  timeTitle: {
    fontFamily: fontBodyM.fontFamily,
    fontSize: fontBodyM.fontSize,
    fontWeight: fontBodyM.fontWeight as TextStyle['fontWeight'],
    color: Colour50,
    paddingBottom: Spacing16.original,
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
