import {
  Colour0,
  Colour10,
  Colour100,
  Colour80,
  fontBodyS,
  fontLabelS,
  Spacing16,
} from '@utils/tokens';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
} from 'react-native';

interface InputLabelProps {
  label?: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  inputProps?: TextInputProps;
}

const InputLabel = ({
  label = '',
  placeholder,
  onChangeText,
  inputProps = {},
}: InputLabelProps) => {
  return (
    <View>
      {label !== '' && <Text style={styles.labelText}>{label}</Text>}
      <TextInput
        placeholder={placeholder}
        onChangeText={onChangeText}
        style={styles.textInput}
        placeholderTextColor={Colour80}
        {...inputProps}
      />
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
    backgroundColor: Colour0,
    padding: Spacing16.original,
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    marginTop: 8,
  },
});

export default InputLabel;
