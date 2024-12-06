import {Medication} from '@graphql/generated';
import {roundNumbersDown} from '@utils/Helpers';
import {
  Colour10,
  Colour100,
  Colour80,
  ColourPurple10,
  ColourPurple50,
  fontBodyS,
  fontBodyXs,
  fontLabelS,
  Radius4,
  Spacing16,
  Spacing8,
} from '@utils/tokens';
import {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {MaterialIndicator} from 'react-native-indicators';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import MedicationNotFound from './MedicationNotFound';

interface SearchMedicationsInputProps {
  results: Medication[] | undefined;
  isFetching: boolean;
  searchValue: string | null;
  onSearch: (searchValue: string) => void;
  onSelectMedication: (medication: Medication) => void;
  onPressSpecify: () => void;
  onClearSearch: () => void;
  onEndReached: () => void;
}

const SearchMedicationsInput: React.FC<SearchMedicationsInputProps> = ({
  onSearch,
  results,
  isFetching,
  searchValue,
  onSelectMedication,
  onPressSpecify,
  onClearSearch,
  onEndReached,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setFocused] = useState(false);

  const borderColor = useSharedValue(Colour10);
  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(borderColor.value, {duration: 300}),
    };
  });

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  return (
    <View>
      <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
        <Animated.View style={[styles.container, animatedBorderStyle]}>
          <Image
            source={
              !isFocused
                ? require('@assets/icons/search.png')
                : require('@assets/icons/search-coloured.png')
            }
            style={isFocused && {tintColor: ColourPurple50}}
          />
          <TextInput
            ref={inputRef}
            submitBehavior="submit"
            autoFocus
            style={styles.input}
            value={searchValue ?? ''}
            placeholder="Search medication"
            placeholderTextColor={Colour80}
            onChangeText={text => console.log(text)}
            returnKeyType="search"
            onFocus={() => {
              setFocused(true);
              borderColor.value = ColourPurple50;
            }}
            onBlur={() => {
              setFocused(false);
              borderColor.value = Colour10;
            }}
            onChange={e => {
              onSearch(e.nativeEvent.text);
            }}
            autoCorrect={false}
            autoComplete="off"
          />
          {isFetching && (
            <Animated.View
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}>
              <MaterialIndicator color={ColourPurple50} size={20} />
            </Animated.View>
          )}
          {!isFetching && searchValue && searchValue?.length > 0 && (
            <TouchableOpacity onPress={onClearSearch}>
              <Image source={require('@assets/icons/x-close-filled.png')} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </TouchableWithoutFeedback>

      {searchValue?.length > 0 && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          style={styles.resultsContainer}>
          <FlatList
            removeClippedSubviews
            persistentScrollbar
            data={results}
            extraData={results}
            keyExtractor={item => item.id}
            style={{flexGrow: 0}}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            renderItem={({item}) => (
              <TouchableHighlight
                style={styles.resultRow}
                underlayColor={ColourPurple10}
                onPress={() => {
                  onSelectMedication(item);
                }}>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                  <View style={styles.medNameContainer}>
                    <Text style={styles.brandText}>
                      {item.brandName === item.activeIngredient
                        ? item.brandName
                        : item.brandName + ' - ' + item.activeIngredient}
                    </Text>
                  </View>
                  <View style={{maxWidth: 130, marginLeft: 16}}>
                    <Text style={styles.strengthText}>
                      {item.strength?.toLowerCase()}
                    </Text>
                  </View>
                </View>
              </TouchableHighlight>
            )}
            ListEmptyComponent={
              <MedicationNotFound
                isVisible={!isFetching}
                onPressSpecify={onPressSpecify}
              />
            }
            // ListFooterComponent={
            //   <TouchableHighlight
            //     style={styles.resultRow}
            //     underlayColor={ColourPurple10}
            //     onPress={onSelectOther}>
            //     <View style={{flexDirection: 'row', width: '100%'}}>
            //       <View style={{flex: 1}}>
            //         <Text style={styles.otherText}>Other</Text>
            //       </View>
            //       <Text style={styles.specifyText}>Specify</Text>
            //     </View>
            //   </TouchableHighlight>
            // }
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 2,
    borderColor: Colour10,
    borderRadius: Radius4.original,
    padding: Spacing16.original,
    flexDirection: 'row',
    gap: Spacing8.original,
  },
  input: {
    flex: 1,
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  resultsContainer: {
    borderWidth: 2,
    borderColor: Colour10,
    borderRadius: Radius4.original,
    maxHeight: 250,
  },
  resultRow: {
    padding: Spacing16.original,
    flexDirection: 'row',
  },
  medNameContainer: {
    flex: 1,
  },
  brandText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  otherText: {
    fontFamily: fontLabelS.fontFamily,
    fontSize: fontLabelS.fontSize,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  specifyText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: ColourPurple50,
  },
  strengthText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour80,
  },
});

export default SearchMedicationsInput;
