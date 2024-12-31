import CustomButton from '@components/CustomButton';
import EmptyState from '@components/EmptyState';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import {Portal} from '@gorhom/portal';
import {MyMedication, useMyMedicationsQuery} from '@graphql/generated';
import {
  ADD_MEDICATION_STACK,
  SCAN_TAG_SCREEN,
} from '@navigators/ScreenConstants';
import {Spacing16, Spacing24} from '@utils/tokens';
import {useCallback, useRef} from 'react';
import {FlatList, Image, StyleSheet, Text, View} from 'react-native';
import MedicationCard from '../components/MedicationCard';

const StockContainer = ({navigation}) => {
  const {data: myMedicationsData, loading} = useMyMedicationsQuery({
    fetchPolicy: 'cache-and-network',
  });

  const onPressLinkTag = useCallback((medication: MyMedication) => {
    navigation.navigate(SCAN_TAG_SCREEN, {medicationId: medication.id});
  }, []);

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: Spacing16.original,
        paddingBottom: Spacing16.original,
      }}>
      {myMedicationsData?.myMedications.edges.length === 0 && (
        <View style={{marginTop: 24, flex: 1}}>
          <EmptyState
            header="Stay on top of your supply"
            description="Here’s where you can view all your medications and their current stock levels. Easily check how much you have left and get reminders when it’s time to refill."
            image={<Image source={require('@assets/images/stock-empty.png')} />}
          />
        </View>
      )}
      <FlatList
        data={myMedicationsData?.myMedications.edges}
        extraData={myMedicationsData?.myMedications.edges}
        renderItem={({item}) => (
          <MedicationCard
            medication={item.node}
            onPressLinkTag={() => onPressLinkTag(item.node)}
          />
        )}
        keyExtractor={item => item.node.id}
        contentContainerStyle={{paddingTop: 24}}
        showsVerticalScrollIndicator={false}
      />
      <CustomButton
        title="New Medication"
        icon={<Image source={require('@assets/icons/plus-add.png')} />}
        onPress={() => navigation.navigate(ADD_MEDICATION_STACK)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StockContainer;
