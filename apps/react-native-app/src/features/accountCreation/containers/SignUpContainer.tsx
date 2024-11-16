import CustomButton, {ButtonType} from '@components/CustomButton';
import InputLabel from '@components/InputLabel';
import {
  PROFILE_ONBOARDING_SCREEN,
  PROFILE_ONBOARDING_STACK,
} from '@navigators/ScreenConstants';
import {SCREEN_HEIGHT} from '@utils/Constants';
import {
  Colour0,
  Colour100,
  ColourNeutral80,
  ColourPurple50,
  fontBodyS,
  fontLabelL,
  Radius24,
  Spacing16,
  Spacing32,
} from '@utils/tokens';
import {useCallback, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';

type SignUpContainerProps = {
  navigation: SignUpScreenNavigationProp;
  route: SignUpStackParamList;
};

const SignUpContainer: React.FC<SignUpContainerProps> = ({navigation}) => {
  const [email, setEmail] = useState('');

  const onPressSignup = useCallback(() => {
    navigation.navigate(PROFILE_ONBOARDING_STACK, {
      screen: PROFILE_ONBOARDING_SCREEN,
      params: {
        email,
      },
    });
  }, [email]);

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior="position">
      <View style={styles.container}>
        <Image source={require('@assets/images/account-setup.png')} />

        <Text style={styles.titleText}>Let’s set you up</Text>
        <Text style={styles.descText}>
          We’re excited to help you stay on top of your routine with ease.
        </Text>
      </View>
      <View style={styles.cardContainer}>
        <View style={{paddingBottom: Spacing16.original}}>
          <InputLabel
            label="Enter your email"
            placeholder="Type your email here"
            inputProps={{
              keyboardType: 'email-address',
              autoComplete: 'email',
              spellCheck: false,
              autoCorrect: false,
              autoCapitalize: 'none',
            }}
            onChangeText={setEmail}
          />
        </View>
        <CustomButton
          type={ButtonType.Primary}
          title="Sign up"
          onPress={onPressSignup}
          disabled={!email}
        />

        <View style={styles.socialLoginsContainer}>
          <Text style={styles.socialLoginsText}>Or sign up with</Text>

          <View style={styles.socialButtonsContainer}>
            <View style={{flex: 1}}>
              <CustomButton
                type={ButtonType.Tertiary}
                icon={<Image source={require('@assets/icons/google.png')} />}
                containerStyle={{minHeight: 60}}
              />
            </View>
            <View style={{flex: 1}}>
              <CustomButton
                type={ButtonType.Tertiary}
                icon={<Image source={require('@assets/icons/apple.png')} />}
              />
            </View>
          </View>

          <View style={{paddingTop: Spacing16.original}}>
            <Text style={styles.signupText}>
              Already have an account?{' '}
              <Text style={styles.highlightedText}>Log-in here</Text>
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColourPurple50,
    alignItems: 'center',
    paddingTop: SCREEN_HEIGHT * 0.06,
  },
  titleText: {
    fontFamily: fontLabelL.fontFamily,
    fontSize: fontLabelL.fontSize,
    color: Colour0,
    fontWeight: fontLabelL.fontWeight as TextStyle['fontWeight'],
    paddingVertical: Spacing16.original,
  },
  descText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    color: Colour0,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    textAlign: 'center',
    paddingBottom: 70,
  },
  cardContainer: {
    backgroundColor: Colour0,
    borderTopLeftRadius: Radius24.original,
    borderTopRightRadius: Radius24.original,
    marginTop: -25,
    paddingVertical: Spacing32.original,
    paddingHorizontal: Spacing16.original,
  },
  socialLoginsContainer: {
    marginTop: Spacing32.original,
  },
  socialLoginsText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    color: Colour100,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: Spacing16.original,
  },
  signupText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    color: ColourNeutral80,
    textAlign: 'center',
  },
  highlightedText: {
    color: ColourPurple50,
    fontWeight: 400,
  },
});

export default SignUpContainer;
