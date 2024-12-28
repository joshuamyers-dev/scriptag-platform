import CustomButton from '@components/CustomButton';
import InputLabel from '@components/InputLabel';
import InputMultipleSelect from '@components/InputMultipleSelect';
import {useAddMyMedicationMutation} from '@graphql/generated';
import {UNIT_MEASUREMENTS} from '@utils/Constants';
import {
  Colour10,
  Colour100,
  Colour80,
  fontBodyS,
  fontLabelM,
  fontLabelS,
  Spacing16,
} from '@utils/tokens';
import {useCallback, useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, TextStyle, View} from 'react-native';
import {AddMedicationContext} from './AddMedicationContainer';

const SpecifyMedicationContainer = () => {
  const context = useContext(AddMedicationContext);
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);

  const [createMedicationMutation, {loading, error, data}] =
    useAddMyMedicationMutation();

  const onPressContinue = useCallback(async () => {
    await createMedicationMutation({
      variables: {
        input: {
          name,
          dosageStrength: `${strength} ${UNIT_MEASUREMENTS[selectedUnitIndex].value}`,
        },
      },
    });
  }, [name, strength, selectedUnitIndex]);

  useEffect(() => {
    if (!error && data?.addMyMedication) {
      context?.handleStepChange(context.currentStep + 1, 1);
    }
  }, [error, data]);

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>
        Name your medication and specify the dose.
      </Text>
      <Text style={styles.subTitleText}>
        This is important so you can identify it later.
      </Text>

      <View style={styles.inputContainer}>
        <InputLabel
          label="Name"
          value={name}
          inputProps={{placeholder: 'Type the name here'}}
          onChangeText={setName}
        />
        <InputLabel
          label="Strength / Dose"
          value={strength}
          inputProps={{
            placeholder: 'Type a number',
            keyboardType: 'number-pad',
          }}
          onChangeText={setStrength}
        />
        <InputMultipleSelect
          label="Unit of measurement"
          placeholder="Select a measurement"
          items={UNIT_MEASUREMENTS}
          value={UNIT_MEASUREMENTS[selectedUnitIndex]?.title}
          onSelectItem={index => setSelectedUnitIndex(index)}
          containerMaxHeight={130}
        />
      </View>

      <View style={styles.footerContainer}>
        <CustomButton
          title="Continue"
          disabled={name === '' || strength === ''}
          onPress={onPressContinue}
          loading={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleText: {
    fontFamily: fontLabelM.fontFamily,
    fontSize: fontLabelM.fontSize,
    fontWeight: fontLabelM.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  subTitleText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour80,
    paddingTop: 8,
  },
  inputContainer: {
    marginTop: 24,
    gap: 24,
  },
  footerContainer: {
    borderTopColor: Colour10,
    borderTopWidth: 2,
    padding: Spacing16.original,
    paddingBottom: 32,
    position: 'absolute',
    bottom: 0,
    left: -16,
    right: -16,
    backgroundColor: 'white',
  },
  bottomSheetContentContainer: {
    height: 230,
    alignItems: 'center',
  },
  selectedLayoutStyle: {
    backgroundColor: Colour10,
    borderRadius: 2,
  },
  containerStyle: {
    width: '100%',
  },
  modalTitle: {
    fontFamily: fontLabelS.fontFamily,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    fontSize: fontLabelS.fontSize,
    color: Colour80,
    paddingTop: 16,
  },
  elementTextStyle: {
    fontFamily: fontLabelS.fontFamily,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    fontSize: fontLabelS.fontSize,
    color: Colour100,
  },
});

export default SpecifyMedicationContainer;
