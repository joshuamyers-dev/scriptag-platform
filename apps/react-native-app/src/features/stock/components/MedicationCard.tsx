import AlertBox, {AlertBoxType} from '@components/AlertBox';
import CustomButton, {ButtonType} from '@components/CustomButton';
import {MyMedication} from '@graphql/generated';
import {
  Colour10,
  Colour100,
  Colour80,
  ColourPurple100,
  fontBodyS,
  fontBodyXs,
  fontLabelM,
  fontLabelS,
} from '@utils/tokens';
import {Image, StyleSheet, Text, TextStyle, View} from 'react-native';
import Animated, {FadeOut} from 'react-native-reanimated';

interface MedicationCardProps {
  medication: MyMedication;
  onPressLinkTag: () => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  onPressLinkTag,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.innerBorder} />

      <View style={{flexDirection: 'row'}}>
        {medication.schedule?.dosesRemaining && (
          <View style={styles.unitCountContainer}>
            <Text style={styles.unitText}>
              {medication.schedule?.dosesRemaining}
            </Text>
            <Text style={styles.unitsText}>Units</Text>
          </View>
        )}

        <View style={{flex: 1}}>
          <Text style={styles.medicationNameText}>
            {medication.brandName} {medication.activeIngredient}
          </Text>
          <Text style={styles.strengthText}>
            {medication.dosageStrength.toLowerCase()}
          </Text>
          {(medication.schedule?.scheduledDays ||
            medication.schedule?.timesPerDay) && (
            <Text style={styles.strengthText}>
              {medication.schedule?.scheduledDays}
              {medication.schedule?.scheduledDays && ', '}
              {medication.schedule?.timesPerDay}x per day
            </Text>
          )}
        </View>
      </View>

      {!medication.isTagLinked && (
        <Animated.View style={styles.linkContainer} exiting={FadeOut}>
          <AlertBox
            title="You can start taking your medication now, even before your NFC tag arrives."
            message={
              'Once your tag is set up, you’ll begin tracking doses by tapping the tag for each dose you take. During setup, we’ll ask you to input how much medication you have left so we can remind you when it’s time for a refill. For now, just follow your prescription, and your tracking will begin as soon as your tag is ready.'
            }
            type={AlertBoxType.INFO}
            ctaText="Ok, got it!"
          />

          <CustomButton
            type={ButtonType.Secondary}
            title="Link tag"
            icon={<Image source={require('@assets/icons/link.png')} />}
            onPress={onPressLinkTag}
          />
        </Animated.View>
      )}
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
    paddingRight: 16,
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
    marginRight: 16,
  },
  linkContainer: {
    gap: 16,
    marginTop: 16,
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
