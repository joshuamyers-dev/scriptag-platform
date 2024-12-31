import CustomButton from '@components/CustomButton';
import {
  MyMedicationsDocument,
  useUpdateMedicationTagLinkedMutation,
} from '@graphql/generated';
import {ToastType, useGlobalStore} from '@store';
import {
  Colour10,
  Colour100,
  Colour80,
  ColourPurple10,
  ColourPurple50,
  fontBodyS,
  fontLabelL,
  fontLabelM,
  Spacing16,
} from '@utils/tokens';
import {useCallback, useEffect} from 'react';
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import NfcManager, {Ndef, NfcTech} from 'react-native-nfc-manager';

NfcManager.start();

const ScanTagContainer = ({navigation, route}) => {
  const {params} = route;

  const [updateMedicationTagLinkedMutation, {loading}] =
    useUpdateMedicationTagLinkedMutation();

  const {showToast} = useGlobalStore(state => state);

  const onPressScanTag = useCallback(async () => {
    let result = false;

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tag = await NfcManager.getTag();

      const bytes = Ndef.encodeMessage([
        Ndef.uriRecord(
          `https://scriptag.com.au/medication/${params.medicationId}`,
        ),
      ]);

      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        result = true;
      }
    } catch (ex) {
      console.log(JSON.stringify(ex));
      // showToast('Something went wrong.', ex as string, ToastType.ERROR);
    } finally {
      NfcManager.cancelTechnologyRequest();
    }

    if (result) {
      await updateMedicationTagLinkedMutation({
        variables: {
          input: {
            myMedicationId: params.medicationId,
            isTagLinked: true,
          },
        },
        refetchQueries: [
          {
            query: MyMedicationsDocument,
          },
        ],
      });

      navigation.pop();
      showToast(
        'All done!',
        'You’re all set up. When it’s time for your medication, tap the NFC tag with your phone.',
        ToastType.SUCCESS,
      );
    }

    return result;
  }, []);

  return (
    <View style={{flex: 1, marginHorizontal: 16}}>
      <Image
        source={require('@assets/images/link-tag.png')}
        style={{alignSelf: 'center', marginTop: 16}}
      />

      <View style={styles.instructions}>
        <View style={styles.step}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <View style={styles.instructionContainer}>
            <Text style={styles.stepTitle}>Attach the NFC Tag</Text>
            <Text style={styles.bodyText}>
              Stick the NFC tag to a flat surface on your medication container.
              The tag is about the size of a $1 coin. If it doesn’t fit, use the
              provided label and string to wrap and tie it around your
              container, then stick the NFC tag on the label.
            </Text>
          </View>
        </View>
        <View style={styles.step}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <View style={styles.instructionContainer}>
            <Text style={styles.stepTitle}>Scan the NFC Tag</Text>
            <Text style={styles.bodyText}>
              Hold your phone above the NFC tag to scan it. Your phone will
              recognize it automatically.
            </Text>
          </View>
        </View>
        <View style={styles.step}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <View style={styles.instructionContainer}>
            <Text style={styles.stepTitle}>You’re good to go</Text>
            <Text style={styles.bodyText}>
              When it’s time for your medication, tap the NFC tag with your
              phone. A notification will confirm you’ve taken your dose. No need
              to open the app!
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.footerContainer}>
        <CustomButton title="Scan tag" onPress={onPressScanTag} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  title: {
    fontFamily: fontLabelM.fontFamily,
    fontSize: fontLabelM.fontSize,
    fontWeight: fontLabelM.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  instructions: {
    flex: 1,
    marginTop: 16,
  },
  instructionContainer: {
    flex: 1,
  },
  stepCircle: {
    backgroundColor: ColourPurple10,
    borderRadius: 56 / 2,
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumber: {
    fontFamily: fontLabelL.fontFamily,
    fontSize: fontLabelL.fontSize,
    fontWeight: fontLabelL.fontWeight as TextStyle['fontWeight'],
    color: ColourPurple50,
  },
  stepTitle: {
    fontFamily: fontLabelM.fontFamily,
    fontSize: fontLabelM.fontSize,
    fontWeight: fontLabelM.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  bodyText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour80,
    paddingTop: 8,
  },
  footerContainer: {
    borderTopColor: Colour10,
    borderTopWidth: 2,
    backgroundColor: 'white',
    zIndex: 10,
    padding: Spacing16.original,
    position: 'absolute',
    bottom: 25,
    left: -16,
    right: -16,
  },
});

export default ScanTagContainer;
