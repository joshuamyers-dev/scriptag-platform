import InputLabel from '@components/InputLabel';
import {
  Colour100,
  Colour80,
  fontBodyS,
  fontLabelL,
  fontLabelM,
  Spacing16,
  Spacing8,
} from '@utils/tokens';
import {StyleSheet, Text, TextStyle, View} from 'react-native';

const EnablePushNotifications = () => {
  return (
    <View>
      <Text style={styles.sectionTitle}>
        We’ll never overload you with alerts.
      </Text>

      <Text style={styles.passwordHint}>
        The point of this app is to only send you the most critical
        notifications. You can also change your preference any time.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: fontLabelM.fontFamily,
    fontSize: fontLabelM.fontSize,
    fontWeight: fontLabelM.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
    paddingVertical: Spacing8.original,
  },
  passwordHint: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    color: Colour80,
    paddingBottom: Spacing8.original,
  },
});

export default EnablePushNotifications;
