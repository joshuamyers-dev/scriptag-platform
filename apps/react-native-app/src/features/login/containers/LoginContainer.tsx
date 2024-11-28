import CustomButton, {ButtonType} from '@components/CustomButton';
import InputLabel from '@components/InputLabel';
import {useLoginMutation} from '@graphql/generated';
import {
  PROFILE_ONBOARDING_SCREEN,
  PROFILE_ONBOARDING_STACK,
  SIGN_UP_STACK,
  STOCK_STACK,
  TAB_NAVIGATOR,
} from '@navigators/ScreenConstants';
import {useGlobalStore} from '@store';
import {SCREEN_HEIGHT} from '@utils/Constants';
import {
  Colour0,
  Colour100,
  ColourNeutral80,
  ColourPurple10,
  ColourPurple50,
  fontBodyS,
  fontLabelL,
  Radius24,
  Spacing16,
  Spacing32,
} from '@utils/tokens';
import {updateClientHeaders} from '../../../../ApolloClient';
import {useCallback, useEffect, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';

type LoginContainerProps = {
  navigation: SignUpScreenNavigationProp;
  route: SignUpStackParamList;
};

const LoginContainer: React.FC<LoginContainerProps> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loginMutation, {loading, error, data}] = useLoginMutation();

  const onPressSignup = useCallback(() => {
    navigation.navigate(SIGN_UP_STACK);
  }, []);

  const {showToast, setAuthToken} = useGlobalStore(state => state);

  const onPressLogin = useCallback(async () => {
    await loginMutation({
      variables: {
        input: {
          email,
          password,
        },
      },
    });
  }, [email, password]);

  useEffect(() => {
    if (error?.message) {
      showToast('Whoops.', error.message);
    }
  }, [error]);

  useEffect(() => {
    if (data?.login && data?.login?.token && data?.login?.user) {
      updateClientHeaders(data.login.token);
      setAuthToken(data.login.token);
      navigation.replace(TAB_NAVIGATOR);
    }
  }, [data]);

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      contentContainerStyle={{flex: 1}}
      behavior="position">
      <View style={styles.container}>
        <Image source={require('@assets/images/welcome-back.png')} />

        <Text style={styles.titleText}>Welcome back</Text>
      </View>
      <View style={styles.cardContainer}>
        <View style={{paddingBottom: Spacing16.original}}>
          <InputLabel
            label="Log in with your email and password"
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
          <InputLabel
            placeholder="Type your password here"
            inputProps={{
              autoComplete: 'current-password',
              spellCheck: false,
              autoCorrect: false,
              autoCapitalize: 'none',
              secureTextEntry: true,
            }}
            onChangeText={setPassword}
          />
        </View>
        <CustomButton
          type={ButtonType.Primary}
          loading={loading}
          title="Log in"
          onPress={onPressLogin}
          disabled={!email && !password}
        />
        <CustomButton type={ButtonType.Link} title="Forgot Password?" />

        <View style={styles.socialLoginsContainer}>
          <Text style={styles.socialLoginsText}>Or Log in with</Text>

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
        </View>

        <View
          style={{
            marginVertical: Spacing16.original,
            flexDirection: 'row',
            alignSelf: 'center',
          }}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={onPressSignup}>
            <Text style={styles.highlightedText}>Sign up here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColourPurple10,
    alignItems: 'center',
    paddingTop: SCREEN_HEIGHT * 0.06,
    paddingBottom: 40,
  },
  titleText: {
    fontFamily: fontLabelL.fontFamily,
    fontSize: fontLabelL.fontSize,
    color: Colour100,
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
    flex: 1,
    backgroundColor: Colour0,
    borderTopLeftRadius: Radius24.original,
    borderTopRightRadius: Radius24.original,
    marginTop: -25,
    paddingVertical: Spacing32.original,
    paddingHorizontal: Spacing16.original,
  },
  socialLoginsContainer: {
    marginTop: Spacing32.original,
    flex: 1,
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
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
  },
});

export default LoginContainer;
