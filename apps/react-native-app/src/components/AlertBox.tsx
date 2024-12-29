import {
  ColourBlue10,
  ColourBlue100,
  ColourBlue50,
  fontBodyS,
  fontLabelS,
} from '@utils/tokens';
import {
  Image,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomButton, {ButtonType} from './CustomButton';

export enum AlertBoxType {
  INFO = 'info',
}

interface AlertBoxProps {
  title: string;
  message: string;
  type: AlertBoxType;
  ctaText?: string;
}

const AlertBox: React.FC<AlertBoxProps> = ({
  title,
  message,
  type = AlertBoxType.INFO,
  ctaText,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconBorder}>
        <Image source={require('@assets/icons/info-blue.png')} />
      </View>
      <View style={styles.messageContainer}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.messageText}>{message}</Text>
        {ctaText && (
          <TouchableOpacity>
            <Text style={styles.ctaText}>{ctaText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: ColourBlue50,
    borderWidth: 1,
    borderRadius: 4,
  },
  titleText: {
    fontFamily: fontLabelS.fontFamily,
    fontSize: fontLabelS.fontSize,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    color: ColourBlue100,
  },
  messageText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: ColourBlue100,
  },
  messageContainer: {
    marginLeft: 68,
    marginVertical: 16,
    marginRight: 16,
    gap: 4,
  },
  iconBorder: {
    backgroundColor: ColourBlue10,
    position: 'absolute',
    top: 0.5,
    left: 0.5,
    bottom: 0.5,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  ctaText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: ColourBlue50,
  },
});

export default AlertBox;
