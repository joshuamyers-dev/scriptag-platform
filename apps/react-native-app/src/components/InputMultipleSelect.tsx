import {triggerLightHaptic} from '@utils/Helpers';
import {
  Colour0,
  Colour10,
  Colour100,
  Colour80,
  ColourPurple10,
  fontBodyS,
  fontLabelS,
  Spacing16,
} from '@utils/tokens';
import {useCallback, useEffect, useRef, useState} from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface InputMultipleSelectProps {
  label?: string;
  value?: string | null;
  items: {title: string; value: string}[];
  placeholder?: string;
  onSelectItem: (index: number) => void;
  containerMaxHeight: number;
}

const InputMultipleSelect = ({
  label = '',
  placeholder,
  items,
  value = null,
  onSelectItem,
  containerMaxHeight,
}: InputMultipleSelectProps) => {
  const [open, setOpen] = useState(false);
  const [pressingItemIndex, setPressingItemIndex] = useState(-1);
  const chevronRotation = useSharedValue(180);
  const dropdownHeight = useSharedValue(0);

  const scrollViewRef = useRef<ScrollView>(null);

  const onPress = useCallback(() => {
    openCloseDropdown();
  }, [open]);

  const onPressItem = useCallback((index: number) => {
    openCloseDropdown();
    onSelectItem(index);
  }, []);

  const openCloseDropdown = useCallback(() => {
    Keyboard.dismiss();
    triggerLightHaptic();
    setOpen(open => !open);

    setTimeout(() => {
      scrollViewRef.current?.flashScrollIndicators();
    }, 500);
  }, [scrollViewRef]);

  useEffect(() => {
    chevronRotation.value = withTiming(!open ? 0 : 180, {duration: 300});
    dropdownHeight.value = withTiming(open ? containerMaxHeight : 0, {
      duration: 300,
    });
  }, [open]);

  const animatedChevronStyle = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${chevronRotation.value}deg`}],
    };
  });

  const animatedDropdownStyle = useAnimatedStyle(() => {
    return {
      maxHeight: dropdownHeight.value,
      opacity: dropdownHeight.value / containerMaxHeight,
    };
  });

  return (
    <View>
      {label !== '' && <Text style={styles.labelText}>{label}</Text>}
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={styles.textInput}>
          <View style={{flex: 1, paddingRight: 32}}>
            {!value && (
              <Text style={styles.placeholderText}>{placeholder}</Text>
            )}
            {value && (
              <Text style={styles.valueText} numberOfLines={1}>
                {value}
              </Text>
            )}
          </View>
          <Animated.Image
            source={require('@assets/icons/chevron-up.png')}
            style={animatedChevronStyle}
          />
        </View>
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.selectContainer, animatedDropdownStyle]}>
        <ScrollView ref={scrollViewRef} persistentScrollbar>
          {items.map((item, index) => (
            <TouchableHighlight
              onPressIn={() => setPressingItemIndex(index)}
              onPressOut={() => setPressingItemIndex(-1)}
              style={styles.selectItem}
              onPress={() => onPressItem(index)}
              underlayColor={ColourPurple10}>
              <Text
                style={[
                  styles.selectItemText,
                  pressingItemIndex === index && styles.valueText,
                  value === item.title && styles.valueText,
                ]}>
                {item.title}
              </Text>
            </TouchableHighlight>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  labelText: {
    fontFamily: fontLabelS.fontFamily,
    fontSize: fontLabelS.fontSize,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  textInput: {
    borderColor: Colour10,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: Colour0,
    padding: Spacing16.original,
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour80,
  },
  valueText: {
    fontFamily: fontLabelS.fontFamily,
    fontSize: fontLabelS.fontSize,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
  selectContainer: {
    borderColor: Colour10,
    borderWidth: 2,
    borderRadius: 4,
    borderTopWidth: 0,
  },
  selectItem: {
    padding: 16,
  },
  selectItemText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
  },
});

export default InputMultipleSelect;
