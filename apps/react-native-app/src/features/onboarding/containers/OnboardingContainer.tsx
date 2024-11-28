import CustomButton, {ButtonType} from '@components/CustomButton';
import TagExplainerModal from '@components/TagExplainerModal';
import {
  LOGIN_STACK,
  SIGN_UP_SCREEN,
  SIGN_UP_STACK,
} from '@navigators/ScreenConstants';
import {useGlobalStore} from '@store';
import {SCREEN_HEIGHT} from '@utils/Constants';
import {
  ColourNeutral100,
  ColourNeutral80,
  ColourPurple10,
  ColourPurple50,
  fontBodyM,
  fontBodyS,
  fontBodyXs,
  fontLabelM,
  Spacing16,
  Spacing32,
} from '@utils/tokens';
import {useCallback, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';

const OnboardingContainer = ({navigation}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onPressOpenExplainerModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const onPressSignup = useCallback(() => {
    navigation.navigate(SIGN_UP_STACK);
  }, []);

  const onPressLogin = useCallback(() => {
    navigation.navigate(LOGIN_STACK);
  }, []);

  return (
    <SafeAreaView style={{flex: 1, alignItems: 'center', marginHorizontal: 16}}>
      <TagExplainerModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
      <Image
        source={require('@assets/images/logo.png')}
        style={{marginTop: 39}}
      />

      <Swiper
        autoplay
        loop
        autoplayTimeout={5}
        style={styles.sliderContainer}
        containerStyle={{marginBottom: Spacing32.original}}
        showsButtons={false}
        index={0}
        dotStyle={{
          backgroundColor: ColourPurple10,
          height: 12,
          width: 12,
          borderRadius: 12 / 2,
        }}
        activeDotStyle={{
          backgroundColor: ColourPurple50,
          height: 12,
          width: 12,
          borderRadius: 12 / 2,
        }}>
        <View style={styles.slideContainer}>
          <Image source={require('@assets/images/onboarding-1.png')} />
          <Text style={styles.textHeader}>Stick, tap and go!</Text>
          <Text style={styles.textBody}>
            Grab your NFC tag from the app, stick it on your medication, and tap
            to confirm your dose. Once set-up, there’s no need to open the app.
            Easy.
          </Text>
          <CustomButton
            type={ButtonType.Link}
            title="What's an NFC tag?"
            onPress={onPressOpenExplainerModal}
          />
        </View>
        <View style={styles.slideContainer}>
          <Image source={require('@assets/images/onboarding-2.png')} />
          <Text style={styles.textHeader}>Share for peace of mind</Text>
          <Text style={styles.textBody}>
            Share access with family and healthcare providers for real-time
            updates on your medication progress.
          </Text>
        </View>
        <View style={styles.slideContainer}>
          <Image source={require('@assets/images/onboarding-3.png')} />
          <Text style={styles.textHeader}>Nudges when you need it</Text>
          <Text style={styles.textBody}>
            Get restock reminders so you can refill just in time or set a
            reminder to get into a habit. There’s no overload, just the right
            nudge when you need it.
          </Text>
        </View>
        <View style={styles.slideContainer}>
          <Image source={require('@assets/images/onboarding-4.png')} />
          <Text style={styles.textHeader}>Tap into healthier habits</Text>
          <Text style={styles.textBody}>
            Staying on track becomes effortless with scriptag. Build a
            consistent routine without the stress and focus on what matters
            most!
          </Text>
        </View>
      </Swiper>

      <View style={styles.actionButtonsContainer}>
        <CustomButton title="Log in" onPress={onPressLogin} />
        <CustomButton
          title="Sign up"
          type={ButtonType.Secondary}
          onPress={onPressSignup}
        />

        <View style={styles.legalDocsContainer}>
          <Text style={styles.legalText}>View our </Text>
          <TouchableOpacity>
            <Text style={styles.highlightedText}>Privacy policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalText}> and </Text>
          <TouchableOpacity>
            <Text style={styles.highlightedText}>Terms & conditions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    marginTop: Spacing32.original,
  },
  slideContainer: {
    alignItems: 'center',
    marginHorizontal: Spacing16.original,
  },
  textHeader: {
    color: ColourNeutral100,
    fontSize: fontLabelM.fontSize,
    fontFamily: fontLabelM.fontFamily,
    fontWeight: fontLabelM.fontWeight as TextStyle['fontWeight'],
    textAlign: 'center',
    paddingTop: Spacing32.original,
  },
  textBody: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    color: ColourNeutral80,
    lineHeight: fontBodyS.lineHeight,
    textAlign: 'center',
    paddingTop: Spacing16.original,
  },
  actionButtonsContainer: {
    gap: Spacing16.original,
    width: '100%',
    paddingBottom: Spacing16.original,
  },
  legalDocsContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  legalText: {
    fontFamily: fontBodyXs.fontFamily,
    fontSize: fontBodyXs.fontSize,
    color: ColourNeutral80,
  },
  highlightedText: {
    fontFamily: fontBodyXs.fontFamily,
    fontSize: fontBodyXs.fontSize,
    color: ColourPurple50,
    fontWeight: fontBodyXs.fontWeight as TextStyle['fontWeight'],
  },
});

export default OnboardingContainer;
