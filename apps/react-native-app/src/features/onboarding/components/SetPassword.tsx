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
import {useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, TextStyle, View} from 'react-native';
import {OnboardingContext} from '../containers/ProfileOnboardingContainer';

const SetPassword = () => {
  const context = useContext(OnboardingContext);
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    if (password) {
      context?.setContinueEnabled(true);
      context?.setPassword(password);
    } else {
      context?.setContinueEnabled(false);
    }
  }, [password]);

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Don’t worry, we can retrieve this securely later.
      </Text>

      <Text style={styles.passwordHint}>
        Your password must have at least 1 symbol and 1 special character.
      </Text>

      <InputLabel
        placeholder="Type your password here"
        inputProps={{secureTextEntry: true}}
        onChangeText={setPassword}
        value={password}
      />
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

export default SetPassword;
