import {useAddMyMedicationMutation} from '@graphql/generated';
import {useCallback, useEffect} from 'react';
import {Button, Text, View} from 'react-native';
import NfcManager, {Ndef, NfcTech} from 'react-native-nfc-manager';

NfcManager.start();

const ScanTagContainer = ({navigation, route}) => {
  const [addMedicationMutation, {data, loading, error}] =
    useAddMyMedicationMutation();

  const {params} = route;

  console.log('params', params);

  const onPressScanTag = useCallback(async () => {
    await addMedicationMutation({
      variables: {
        input: {
          medicationId: params.selectedMedicationId,
          dosageStrength: '10mg',
          consumptionTime: params.date,
        },
      },
    });
  }, []);

  const scanTag = useCallback(async () => {
    let result = false;

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const bytes = Ndef.encodeMessage([
        Ndef.uriRecord(
          `https://scriptag.com.au/medication/${data?.addMyMedication?.medication?.id}`,
        ),
      ]);

      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes);
        result = true;
      }
    } catch (ex) {
      console.warn(ex);
    } finally {
      NfcManager.cancelTechnologyRequest();
    }

    return result;
  }, [data]);

  useEffect(() => {
    if (data?.addMyMedication) {
      scanTag();
    }
  }, [data]);

  return (
    <View style={{flex: 1, alignItems: 'center', paddingTop: 50}}>
      <Text style={{fontSize: 20, marginBottom: 20}}>Set up tag</Text>

      <Button title="Scan Tag" onPress={onPressScanTag} />
    </View>
  );
};

export default ScanTagContainer;
