import {ColourPurple50} from '@utils/tokens';
import {Image, TouchableOpacity} from 'react-native';

interface BackButtonProps {
  isColoured?: boolean;
  onPress: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({
  isColoured = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{top: 10, left: 10, bottom: 10, right: 10}}>
      <Image
        source={require('@assets/icons/back.png')}
        style={isColoured && {tintColor: ColourPurple50}}
      />
    </TouchableOpacity>
  );
};

export default BackButton;
