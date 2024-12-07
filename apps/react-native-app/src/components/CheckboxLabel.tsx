import {Colour100, fontLabelS} from '@utils/tokens';
import {
  Image,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface CheckboxLabelProps {
  checked: boolean;
  label: string;
  onPress?: () => void;
  containerStyle?: ViewStyle;
}

const CheckboxLabel: React.FC<CheckboxLabelProps> = ({
  checked,
  label,
  onPress,
  containerStyle = {},
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}>
      {checked && (
        <Image source={require('@assets/icons/checkbox-filled.png')} />
      )}
      {!checked && (
        <Image source={require('@assets/icons/checkbox-unfilled.png')} />
      )}
      <Text style={styles.labelText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    fontFamily: fontLabelS.fontFamily,
    fontSize: fontLabelS.fontSize,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
    marginLeft: 8,
  },
});

export default CheckboxLabel;
