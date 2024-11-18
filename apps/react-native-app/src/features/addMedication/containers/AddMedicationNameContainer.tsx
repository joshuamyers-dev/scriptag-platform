import {
  useSearchMedicationsLazyQuery,
  useSearchMedicationsQuery,
} from '@graphql/generated';
import {SELECT_TIME_SCREEN} from '@navigators/ScreenConstants';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Button,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import {useGlobalStore} from '../../../../Store';
import {
  Colour100,
  ColourPurple10,
  ColourPurple50,
  fontLabelL,
} from '@utils/tokens';
import ProgressBar from 'react-native-animated-progress';
import SearchInput from '@components/SearchInput';
import {useDebounce} from '@hooks/useDebounce';

const AddMedicationNameContainer = ({navigation}) => {
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const debouncedSearchValue = useDebounce(searchValue);
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
    if (debouncedSearchValue && debouncedSearchValue.length >= 3) {
      searchMedicationsMutation({variables: {query: debouncedSearchValue}});
    }
  }, [debouncedSearchValue]);

  const onPressMedication = useCallback((medicationId: string) => {
    setSelectedMedicationId(medicationId);
  }, []);

  const searchResults = useMemo(() => {
    return data?.searchMedications?.edges?.map(edge => edge.node);
  }, [data]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        paddingTop: 16,
        paddingHorizontal: 16,
      }}>
      <Text style={styles.headerTitle}>Search</Text>

      <View style={{paddingVertical: 16, width: '100%'}}>
        <ProgressBar
          progress={30}
          height={16}
          animated
          trackColor={ColourPurple10}
          backgroundColor={ColourPurple50}
        />
      </View>

      <SearchInput onSearch={setSearchValue} results={searchResults} />

      {/* <TextInput
        placeholder="Enter medication name"
        placeholderTextColor="grey"
        onChangeText={text => setMedicationName(text)}
        style={{
          backgroundColor: 'white',
          width: '80%',
          padding: 10,
          marginBottom: 20,
        }}
      /> */}

      {/* {!selectedMedicationId && (
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
      )} */}

      {/* <TextInput
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

      <Button title="Continue" onPress={onPressContinue} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: fontLabelL.fontFamily,
    fontSize: fontLabelL.fontSize,
    fontWeight: fontLabelL.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
});

export default AddMedicationNameContainer;
