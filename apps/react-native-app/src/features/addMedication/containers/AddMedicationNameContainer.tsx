import {
  useSearchMedicationsLazyQuery,
  useSearchMedicationsQuery,
} from '@graphql/generated';
import {SELECT_TIME_SCREEN} from '@navigators/ScreenConstants';
import {useCallback, useEffect, useState} from 'react';
import {
  Button,
  LayoutAnimation,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useGlobalStore} from '../../../../Store';

const AddMedicationNameContainer = ({navigation}) => {
  const [medicationName, setMedicationName] = useState<string | null>(null);
  const [amountRemaining, setAmountRemaining] = useState<string | null>(null);
  const [selectedMedicationId, setSelectedMedicationId] = useState<
    string | null
  >(null);

  const [searchMedicationsMutation, {data, loading, error}] =
    useSearchMedicationsLazyQuery();

  const onPressContinue = useCallback(() => {
    navigation.navigate(SELECT_TIME_SCREEN, {
      medicationName,
      amountRemaining,
      selectedMedicationId,
    });
  }, [medicationName, amountRemaining, selectedMedicationId]);

  useEffect(() => {
    if (medicationName && medicationName.length >= 3) {
      searchMedicationsMutation({variables: {query: medicationName}});
    }
  }, [medicationName]);

  const onPressMedication = useCallback((medicationId: string) => {
    setSelectedMedicationId(medicationId);
  }, []);

  return (
    <View style={{flex: 1, alignItems: 'center', paddingTop: 50}}>
      <Text style={{fontSize: 20, marginBottom: 20}}>Name your pill</Text>

      <TextInput
        placeholder="Enter medication name"
        placeholderTextColor="grey"
        onChangeText={text => setMedicationName(text)}
        style={{
          backgroundColor: 'white',
          width: '80%',
          padding: 10,
          marginBottom: 20,
        }}
      />

      {!selectedMedicationId && (
        <ScrollView
          style={{maxHeight: 100, width: '100%', paddingHorizontal: 32}}>
          {data?.searchMedications.edges.map(edge => (
            <TouchableOpacity onPress={() => onPressMedication(edge.node.id)}>
              <Text style={{color: 'black', fontWeight: 'bold', fontSize: 16}}>
                {edge.node.brandName}
              </Text>
              <Text style={{color: 'black'}}>{edge.node.activeIngredient}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TextInput
        placeholder="Amount remaining"
        placeholderTextColor="grey"
        onChangeText={text => setAmountRemaining(text)}
        style={{
          backgroundColor: 'white',
          width: '80%',
          padding: 10,
          marginBottom: 20,
        }}
      />

      <Button title="Continue" onPress={onPressContinue} />
    </View>
  );
};

export default AddMedicationNameContainer;
