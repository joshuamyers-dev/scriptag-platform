import {
  Colour0,
  Colour10,
  Colour100,
  Colour80,
  fontBodyS,
  fontLabelS,
  Spacing16,
} from '@utils/tokens';
import {ReactNode, useCallback, useRef} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface InputLabelProps {
  label?: string;
  value?: string | null;
  iconLeft?: ReactNode | null;
  placeholder?: string;
  onChangeText: (text: string) => void;
  inputProps?: TextInputProps;
  onPress?: () => void | undefined;
}

const InputLabel = ({
  label = '',
  value = '',
  iconLeft = null,
  placeholder,
  onChangeText,
  onPress = undefined,
  inputProps = {},
}: InputLabelProps) => {
  const inputRef = useRef<TextInput>(null);

  const onPressBox = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      inputRef.current?.focus();
    }
  }, [onPress]);

  return (
    <View>
      {label !== '' && <Text style={styles.labelText}>{label}</Text>}

      <TouchableWithoutFeedback onPress={onPressBox}>
        <View style={styles.inputContainer}>
          {iconLeft && iconLeft}
          <TextInput
            ref={inputRef}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            style={styles.textInput}
            placeholderTextColor={Colour80}
            onPress={onPress}
            readOnly={onPress ? true : false}
            {...inputProps}
          />
        </View>
      </TouchableWithoutFeedback>
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
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    borderColor: Colour10,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: Colour0,
    padding: Spacing16.original,
    marginTop: 8,
  },
  textInput: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
  },
});

export default InputLabel;
