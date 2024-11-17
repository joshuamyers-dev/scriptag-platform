import CustomButton from '@components/CustomButton';
import EmptyState from '@components/EmptyState';
import {Spacing16, Spacing24} from '@utils/tokens';
import {Image, Text, View} from 'react-native';

const StockContainer = () => {
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: Spacing16.original,
        paddingTop: Spacing24.original,
        paddingBottom: Spacing16.original,
      }}>
      <EmptyState
        header="Stay on top of your supply"
        description="Here’s where you can view all your medications and their current stock levels. Easily check how much you have left and get reminders when it’s time to refill."
        image={<Image source={require('@assets/images/stock-empty.png')} />}
      />

      <CustomButton title="New Medication" />
    </View>
  );
};

export default StockContainer;
