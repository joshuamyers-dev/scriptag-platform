import SearchMedicationsInput from '@features/addMedication/components/SearchMedicationsInput';
import {useSearchMedicationsLazyQuery} from '@graphql/generated';
import {useDebounce} from '@hooks/useDebounce';
import {SELECT_TIME_SCREEN} from '@navigators/ScreenConstants';
import {
  Colour100,
  ColourPurple10,
  ColourPurple50,
  fontLabelL,
} from '@utils/tokens';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, TextStyle, View} from 'react-native';
import ProgressBar from 'react-native-animated-progress';

const AddMedicationNameContainer = ({navigation}) => {
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const debouncedSearchValue = useDebounce(searchValue, 250);
  const [medicationName, setMedicationName] = useState<string | null>(null);
  const [amountRemaining, setAmountRemaining] = useState<string | null>(null);
  const [selectedMedicationId, setSelectedMedicationId] = useState<
    string | null
  >(null);

  const [searchMedicationsMutation, {data, loading, error, fetchMore}] =
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
      searchMedicationsMutation({
        variables: {query: debouncedSearchValue},
        fetchPolicy: 'network-only',
      });
    }
  }, [debouncedSearchValue]);

  const onPressMedication = useCallback((medicationId: string) => {
    setSelectedMedicationId(medicationId);
  }, []);

  const searchResults = useMemo(() => {
    return data?.searchMedications?.edges?.map(edge => edge.node);
  }, [data]);

  const onEndReached = useCallback(async () => {
    if (data?.searchMedications?.pageInfo?.hasNextPage) {
      await fetchMore({
        variables: {
          after: data?.searchMedications?.pageInfo?.endCursor,
        },
      });
    }
  }, [data?.searchMedications?.pageInfo?.hasNextPage, debouncedSearchValue]);

  console.log(data);

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

      <SearchMedicationsInput
        results={searchResults}
        isFetching={loading}
        searchValue={searchValue}
        onSearch={setSearchValue}
        onSelectMedication={medication => console.log(medication)}
        onSelectOther={() => console.log('other')}
        onClearSearch={() => setSearchValue(null)}
        onEndReached={onEndReached}
      />

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
