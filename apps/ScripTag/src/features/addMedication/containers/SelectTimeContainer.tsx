import {SCAN_TAG_SCREEN} from '@navigators/ScreenConstants';
import {useCallback, useState} from 'react';
import {Button, StyleSheet, Text, TextInput, View} from 'react-native';
import DatePicker from 'react-native-date-picker';

const SelectTimeContainer = ({navigation, route}) => {
  const [date, setDate] = useState(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);

  const {params} = route;

  const onPressContinue = useCallback(() => {
    navigation.navigate(SCAN_TAG_SCREEN, {
      ...params,
      date: date.toISOString(),
    });
  }, [params, date]);

  return (
    <View style={{flex: 1, alignItems: 'center', paddingTop: 50}}>
      <Text style={{fontSize: 20, marginBottom: 20}}>
        Time of day you take it
      </Text>

      <DatePicker
        mode="time"
        modal
        open={pickerOpen}
        date={date}
        onDateChange={setDate}
        onCancel={() => setPickerOpen(false)}
      />

      <Button
        title="Select Date & Time"
        color="#841584"
        onPress={() => setPickerOpen(true)}
      />

      <Separator />

      <Button title="Continue" onPress={onPressContinue} />
    </View>
  );
};

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  title: {
    textAlign: 'center',
    marginVertical: 8,
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    marginVertical: 32,
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default SelectTimeContainer;
