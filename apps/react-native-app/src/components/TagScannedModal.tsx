import {Portal} from '@gorhom/portal';
import {
  Colour80,
  fontBodyS,
  fontLabelM,
  Spacing16,
  Spacing32,
} from '@utils/tokens';
import {StyleSheet, TextStyle} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
} from 'react-native-reanimated';
import {FullWindowOverlay} from 'react-native-screens';
import BootSplash from 'react-native-bootsplash';

import {
  MyMedicationsDocument,
  useOnTagScannedMutation,
} from '@graphql/generated';
import {ToastType, useGlobalStore} from '@store';
import LottieView from 'lottie-react-native';
import {useEffect, useState} from 'react';
import {triggerNotificationSuccessHaptic} from '@utils/Helpers';

const TagScannedModal: React.FC = () => {
  const [tagScannedMutation, {loading, data, error}] =
    useOnTagScannedMutation();

  const {
    tagScanned: medicationId,
    setTagScanned,
    showToast,
  } = useGlobalStore(state => state);

  useEffect(() => {
    if (medicationId) {
      const scanTag = async () => {
        console.log(medicationId);

        await tagScannedMutation({
          variables: {
            input: {
              medicationId,
            },
          },
          refetchQueries: [MyMedicationsDocument],
        });
      };

      scanTag();
    }
  }, [medicationId]);

  useEffect(() => {
    if (data?.tagScanned) {
      triggerNotificationSuccessHaptic();
      setTimeout(() => {
        setTagScanned(null);
      }, 1500);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      showToast('Error scanning tag', error.message, ToastType.ERROR);
      setTagScanned(null);
    }
  }, [error]);

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
          <LottieView
            source={require('@assets/anims/tag-scanned.json')}
            autoPlay
            loop={false}
            style={{width: 500, height: 200}}
          />
        </Animated.View>
      </FullWindowOverlay>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: Spacing32.original,
    borderRadius: 4,
    margin: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

export default TagScannedModal;
