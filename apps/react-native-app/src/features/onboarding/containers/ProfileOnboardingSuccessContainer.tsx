import CustomButton, {ButtonType} from '@components/CustomButton';
import TagExplainerModal from '@components/TagExplainerModal';
import {TAB_NAVIGATOR} from '@navigators/ScreenConstants';
import {
  Colour10,
  Colour100,
  Colour80,
  fontBodyS,
  fontLabelL,
  fontLabelM,
  Spacing16,
  Spacing32,
  Spacing8,
} from '@utils/tokens';
import {useCallback, useState} from 'react';
import {Image, StyleSheet, Text, TextStyle, View} from 'react-native';

const ProfileOnboardingSuccessContainer = ({navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const onPressSkip = useCallback(() => {
    navigation.replace(TAB_NAVIGATOR);
  }, []);

  return (
    <View style={styles.container}>
      <TagExplainerModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      <Text style={styles.titleText}>Your account is good to go!</Text>
      <Image source={require('@assets/images/account-success.png')} />
      <Text style={styles.subTitleText}>Now hurry and get those tags.</Text>
      <Text style={styles.hintText}>
        This app will only work with our own set of NFC tags.
      </Text>
      <CustomButton
        type={ButtonType.Link}
        title="What's an NFC tag?"
        onPress={() => setModalVisible(true)}
      />
      <View style={styles.footerContainer}>
        <CustomButton title="Get tags" />
        <CustomButton
          type={ButtonType.Secondary}
          title="Skip for now"
          onPress={onPressSkip}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing16.original,
    paddingHorizontal: Spacing16.original,
    paddingTop: Spacing16.original,
  },
  titleText: {
    fontFamily: fontLabelL.fontFamily,
    fontSize: fontLabelL.fontSize,
    fontWeight: fontLabelL.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
    textAlign: 'center',
    paddingHorizontal: Spacing16.original,
  },
  subTitleText: {
    fontFamily: fontLabelM.fontFamily,
    fontSize: fontLabelM.fontSize,
    fontWeight: fontLabelM.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
    textAlign: 'center',
  },
  hintText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour80,
    textAlign: 'center',
    paddingHorizontal: Spacing16.original,
  },
  footerContainer: {
    borderTopColor: Colour10,
    borderTopWidth: 2,
    paddingHorizontal: Spacing32.original,
    paddingVertical: Spacing16.original,
    position: 'absolute',
    gap: Spacing16.original,
    bottom: 25,
    left: -16,
    right: -16,
  },
});

export default ProfileOnboardingSuccessContainer;
