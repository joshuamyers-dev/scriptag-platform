import {Medication, MyMedication} from '@graphql/generated';
import {
  Colour10,
  Colour100,
  Colour80,
  ColourPurple100,
  fontBodyS,
  fontBodyXs,
  fontLabelM,
  fontLabelS,
  fontLabelXl,
} from '@utils/tokens';
import {useCallback, useMemo} from 'react';
import {StyleSheet, Text, TextStyle, View} from 'react-native';

interface MedicationCardProps {
  medication: MyMedication;
}

const MedicationCard: React.FC<MedicationCardProps> = ({medication}) => {
  return (
    <View style={styles.container}>
      <View style={styles.innerBorder} />

      <View style={{flexDirection: 'row'}}>
        <View style={styles.unitCountContainer}>
          <Text style={styles.unitText}>
            {medication.schedule?.dosesRemaining}
          </Text>
          <Text style={styles.unitsText}>Units</Text>
        </View>

        <View style={{marginHorizontal: 16, flex: 1}}>
          <Text style={styles.medicationNameText}>
            {medication.brandName} {medication.activeIngredient}
          </Text>
          <Text style={styles.strengthText}>
            {medication.dosageStrength.toLowerCase()}
          </Text>
          <Text style={styles.strengthText}>
            {medication.schedule?.scheduledDays}
            {medication.schedule?.scheduledDays && ', '}
            {medication.schedule?.timesPerDay}x per day
          </Text>
        </View>
      </View>
    </View>
  );
};

export default MedicationCard;

const styles = StyleSheet.create({
  container: {
    borderColor: Colour10,
    borderWidth: 2,
    borderRadius: 4,
    paddingLeft: 24,
    paddingVertical: 16,
    marginBottom: 8,
  },
  innerBorder: {
    width: 12,
    backgroundColor: ColourPurple100,
    position: 'absolute',
    top: -1,
    bottom: -1,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  unitCountContainer: {
    borderColor: Colour10,
    borderWidth: 2,
    paddingHorizontal: 17,
    paddingVertical: 11,
    alignSelf: 'flex-start',
    borderRadius: 17,
    alignItems: 'center',
  },
  unitText: {
    fontFamily: fontLabelM.fontFamily,
    fontSize: fontLabelM.fontSize,
    fontWeight: fontLabelM.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  unitsText: {
    fontFamily: fontBodyXs.fontFamily,
    fontSize: fontBodyXs.fontSize,
    fontWeight: fontBodyXs.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  medicationNameText: {
    fontFamily: fontLabelS.fontFamily,
    fontSize: fontLabelS.fontSize,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  strengthText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour80,
  },
});
