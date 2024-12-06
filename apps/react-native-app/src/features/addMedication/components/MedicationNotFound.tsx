import {
  Colour100,
  ColourPurple10,
  ColourPurple50,
  fontBodyS,
  fontLabelL,
  fontLabelS,
} from '@utils/tokens';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';

interface MedicationNotFoundProps {
  onPressSpecify: () => void;
  isVisible: boolean;
}

const MedicationNotFound: React.FC<MedicationNotFoundProps> = ({
  onPressSpecify,
  isVisible = false,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>
        We can’t seem to find this medication.
      </Text>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          Please type your medication manually.
        </Text>
        <TouchableOpacity
          onPress={onPressSpecify}
          hitSlop={{top: 20, left: 20, right: 20, bottom: 20}}>
          <Text style={styles.specifyText}>Specify now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  titleText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    color: Colour100,
    padding: 15,
  },
  footerContainer: {
    backgroundColor: ColourPurple10,
    padding: 15,
  },
  footerText: {
    fontFamily: fontLabelS.fontFamily,
    fontSize: fontLabelS.fontSize,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
  },
  specifyText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: ColourPurple50,
    paddingTop: 4,
  },
});

export default MedicationNotFound;
