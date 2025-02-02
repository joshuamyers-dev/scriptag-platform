import SearchMedicationsInput from '@features/addMedication/components/SearchMedicationsInput';
import {useSearchMedicationsLazyQuery} from '@graphql/generated';
import {useDebounce} from '@hooks/useDebounce';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {AddMedicationContext} from './AddMedicationContainer';

const SearchMedicationContainer = () => {
  const context = useContext(AddMedicationContext);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const debouncedSearchValue = useDebounce(searchValue);
  const [medicationName, setMedicationName] = useState<string | null>(null);
  const [amountRemaining, setAmountRemaining] = useState<string | null>(null);
  const [selectedMedicationId, setSelectedMedicationId] = useState<
    string | null
  >(null);

  const [
    searchMedicationsMutation,
    {data, loading: queryFetching, error, fetchMore},
  ] = useSearchMedicationsLazyQuery();

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

  useEffect(() => {
    if (searchValue && searchValue.length > 0) {
      setLoading(true);
    }
  }, [searchValue]);

  useEffect(() => {
    if (data?.searchMedications || error?.message) {
      setLoading(false);
    }
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

  return (
    <SearchMedicationsInput
      results={searchResults}
      isFetching={queryFetching || isLoading}
      searchValue={searchValue}
      onSearch={setSearchValue}
      onSelectMedication={medication => {
        context?.setSelectedMedication(medication);
        context?.handleStepChange(context.currentStep + 2, 1);
      }}
      onPressSpecify={() =>
        context?.handleStepChange(context.currentStep + 1, 1)
      }
      onClearSearch={() => setSearchValue(null)}
      onEndReached={onEndReached}
    />
  );
};

export default SearchMedicationContainer;
