import {Portal} from '@gorhom/portal';
import {StyleSheet, Text, TextStyle, View} from 'react-native';
import {FullWindowOverlay} from 'react-native-screens';
import CustomButton, {ButtonType} from './CustomButton';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
} from 'react-native-reanimated';
import {
  Colour80,
  ColourPurple50,
  fontBodyS,
  fontLabelM,
  Spacing16,
  Spacing32,
} from '@utils/tokens';

interface TagExplainerModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const TagExplainerModal: React.FC<TagExplainerModalProps> = ({
  isVisible,
  onClose,
}) => {
  if (!isVisible) return null;

  return (
    <Portal>
      <FullWindowOverlay>
        <Animated.View
          style={styles.overlay}
          entering={FadeIn}
          exiting={FadeOut}
        />
        <Animated.View
          style={styles.modalContainer}
          entering={FadeInDown.delay(250)}
          exiting={FadeOutUp}>
          <Text style={styles.modalHeader}>What's an NFC tag?</Text>
          <Text style={styles.modalBody}>
            An NFC tag is a small sticker that you can stick on your medication
            packet. It's like a tiny chip that can store information and send it
            to your phone when you tap it. It's how you can tell the app that
            you've taken your medication.
          </Text>
          <Text style={[styles.modalBody, {fontWeight: 700}]}>
            Get your first NFC Tag on us!
          </Text>
          <Text style={styles.modalBody}>
            To start using the NFC feature, you’ll need to get a tag from our
            app. Each medication container needs one tag — even if you have
            multiple medicines in one organiser, just one tag is all you need!
          </Text>
          <Text style={styles.modalBody}>
            Pricing starts at $2.99, but you’ll get your first NFC tag for free.
            Once it’s delivered, we’ll guide you through easy step-by-step
            instructions to set it up and use it. It’s that simple!
          </Text>

          <View style={styles.buttonContainer}>
            <CustomButton
              type={ButtonType.Primary}
              title="Ok, got it."
              onPress={onClose}
            />
          </View>
        </Animated.View>
      </FullWindowOverlay>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: Spacing32.original,
    borderRadius: 4,
    margin: 16,
    flex: 1,
    marginVertical: 114,
    borderColor: ColourPurple50,
    borderWidth: 2,
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    ...StyleSheet.absoluteFillObject,
  },
  modalHeader: {
    fontSize: fontLabelM.fontSize,
    fontFamily: fontLabelM.fontFamily,
    fontWeight: fontLabelM.fontWeight as TextStyle['fontWeight'],
    marginBottom: 16,
  },
  modalBody: {
    fontSize: fontBodyS.fontSize,
    fontFamily: fontBodyS.fontFamily,
    lineHeight: fontBodyS.lineHeight,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour80,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: Spacing16.original,
  },
});

export default TagExplainerModal;
