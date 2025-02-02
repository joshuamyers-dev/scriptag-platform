import CustomButton from '@components/CustomButton';
import EmptyState from '@components/EmptyState';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import {Portal} from '@gorhom/portal';
import {
  MyMedication,
  useAddFcmTokenMutation,
  useMyMedicationsQuery,
} from '@graphql/generated';
import {
  ADD_MEDICATION_STACK,
  SCAN_TAG_SCREEN,
} from '@navigators/ScreenConstants';
import {ColourPurple50, Spacing16, Spacing24} from '@utils/tokens';
import {useCallback, useEffect, useLayoutEffect, useRef} from 'react';
import {FlatList, Image, StyleSheet, Text, View} from 'react-native';
import MedicationCard from '../components/MedicationCard';
import {firebase} from '@react-native-firebase/messaging';
import {useFocusEffect} from '@react-navigation/native';
import {MaterialIndicator} from 'react-native-indicators';
import Animated, {FadeIn} from 'react-native-reanimated';

const StockContainer = ({navigation}) => {
  const {
    data: myMedicationsData,
    loading,
    fetchMore,
    refetch,
  } = useMyMedicationsQuery({
    fetchPolicy: 'cache-and-network',
  });

  const [addFcmTokenMutation] = useAddFcmTokenMutation();

  useEffect(() => {
    firebase
      .messaging()
      .requestPermission()
      .then(() => {
        firebase
          .messaging()
          .getToken()
          .then(token => {
            addFcmTokenMutation({
              variables: {
                token,
              },
            });
          });
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  const onPressLinkTag = useCallback((medication: MyMedication) => {
    navigation.navigate(SCAN_TAG_SCREEN, {medicationId: medication.id});
  }, []);

  const onEndReached = useCallback(() => {
    if (myMedicationsData?.myMedications.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          after: myMedicationsData?.myMedications.pageInfo.endCursor,
        },
      });
    }
  }, [myMedicationsData?.myMedications?.pageInfo]);

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: Spacing16.original,
        paddingBottom: Spacing16.original,
      }}>
      {myMedicationsData?.myMedications.edges.length === 0 && loading && (
        <MaterialIndicator
          size={25}
          color={ColourPurple50}
          style={{marginTop: 24}}
        />
      )}

      {myMedicationsData?.myMedications.edges.length === 0 && (
        <Animated.View style={{marginTop: 24, flex: 1}} entering={FadeIn}>
          <EmptyState
            header="Stay on top of your supply"
            description="Here’s where you can view all your medications and their current stock levels. Easily check how much you have left and get reminders when it’s time to refill."
            image={<Image source={require('@assets/images/stock-empty.png')} />}
          />
        </Animated.View>
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
        onEndReached={onEndReached}
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
