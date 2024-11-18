import {Medication} from '@graphql/generated';
import {useDebounce} from '@hooks/useDebounce';
import {
  Colour10,
  Colour100,
  Colour80,
  ColourPurple50,
  fontBodyS,
  fontBodyXs,
  Radius4,
  Spacing16,
  Spacing8,
} from '@utils/tokens';
import {useRef, useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  LinearTransition,
  SlideInDown,
} from 'react-native-reanimated';

interface SearchInputProps {
  onSearch: (searchValue: string) => void;
  results: Medication[];
}

const SearchInput: React.FC<SearchInputProps> = ({onSearch, results}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setFocused] = useState(false);

  return (
    <View>
      <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
        <View
          style={[
            styles.container,
            isFocused && {borderColor: ColourPurple50},
          ]}>
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
            style={styles.input}
            placeholder="Search medication"
            placeholderTextColor={Colour80}
            onChangeText={text => console.log(text)}
            returnKeyType="search"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={e => onSearch(e.nativeEvent.text)}
            autoCorrect={false}
            spellCheck={false}
          />
        </View>
      </TouchableWithoutFeedback>

      {results?.length > 0 && (
        <Animated.View
          entering={FadeInUp}
          exiting={FadeOutDown}
          style={styles.resultsContainer}>
          <FlatList
            data={results}
            extraData={results}
            renderItem={({item}) => (
              <TouchableOpacity style={styles.resultRow}>
                <View style={styles.medNameContainer}>
                  <Text style={styles.brandText}>{item.brandName}</Text>
                  <Text style={styles.ingredientText}>
                    {item.activeIngredient}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
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
    maxHeight: 300,
  },
  resultRow: {
    padding: Spacing16.original,
    flexDirection: 'row',
  },
  medNameContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  ingredientText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  brandText: {
    fontFamily: fontBodyXs.fontFamily,
    fontSize: fontBodyXs.fontSize,
    fontWeight: fontBodyXs.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  strengthText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour80,
  },
});

export default SearchInput;
