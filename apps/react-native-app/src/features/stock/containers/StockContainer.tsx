import CustomButton from '@components/CustomButton';
import EmptyState from '@components/EmptyState';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import {Portal} from '@gorhom/portal';
import {ADD_MEDICATION_STACK} from '@navigators/ScreenConstants';
import {Spacing16, Spacing24} from '@utils/tokens';
import {useCallback, useRef} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

const StockContainer = ({navigation}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

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
    <View
      style={{
        flex: 1,
        paddingHorizontal: Spacing16.original,
        paddingTop: Spacing24.original,
        paddingBottom: Spacing16.original,
      }}>
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          enablePanDownToClose
          backdropComponent={renderBackdrop}>
          <BottomSheetView style={styles.contentContainer}>
            <Text>Awesome 🎉</Text>
          </BottomSheetView>
        </BottomSheet>
      </Portal>
      <EmptyState
        header="Stay on top of your supply"
        description="Here’s where you can view all your medications and their current stock levels. Easily check how much you have left and get reminders when it’s time to refill."
        image={<Image source={require('@assets/images/stock-empty.png')} />}
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
