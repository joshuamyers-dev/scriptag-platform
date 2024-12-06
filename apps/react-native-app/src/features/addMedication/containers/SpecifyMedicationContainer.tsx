import CustomButton from '@components/CustomButton';
import InputLabel from '@components/InputLabel';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {Portal} from '@gorhom/portal';
import {useAddMyMedicationMutation} from '@graphql/generated';
import {UNIT_MEASUREMENTS} from '@utils/Constants';
import {
  Colour10,
  Colour100,
  Colour80,
  ColourPurple10,
  ColourPurple50,
  fontBodyS,
  fontLabelM,
  fontLabelS,
  Spacing16,
} from '@utils/tokens';
import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {Keyboard, StyleSheet, Text, TextStyle, View} from 'react-native';
import {WheelPicker} from 'react-native-infinite-wheel-picker';
import {AddMedicationContext} from './AddMedicationContainer';

const SpecifyMedicationContainer = () => {
  const context = useContext(AddMedicationContext);
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);

  const bottomSheetRef = useRef<BottomSheet>(null);

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

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        enableTouchThrough
      />
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          // handleComponent={null}
          enablePanDownToClose
          backdropComponent={renderBackdrop}>
          <BottomSheetView style={styles.bottomSheetContentContainer}>
            <Text style={styles.modalTitle}>Select a unit of measurement</Text>
            <WheelPicker
              initialSelectedIndex={0}
              infiniteScroll={false}
              data={UNIT_MEASUREMENTS.map(item => item.title)}
              restElements={2}
              elementHeight={30}
              onChangeValue={(index, value) => {
                setSelectedUnitIndex(index);
              }}
              selectedIndex={selectedUnitIndex}
              containerStyle={styles.containerStyle}
              selectedLayoutStyle={styles.selectedLayoutStyle}
              elementTextStyle={styles.elementTextStyle}
            />
          </BottomSheetView>
        </BottomSheet>
      </Portal>

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
        <InputLabel
          label="Unit of measurement"
          value={UNIT_MEASUREMENTS[selectedUnitIndex]?.title}
          inputProps={{placeholder: 'Select a measurement'}}
          onPress={() => {
            Keyboard.dismiss();
            bottomSheetRef.current?.expand();
          }}
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
    position: 'absolute',
    bottom: 25,
    left: -16,
    right: -16,
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
