import {ColourPurple50} from '@utils/tokens';
import {Image, TouchableOpacity} from 'react-native';

interface CloseButtonProps {
  isColoured?: boolean;
  onPress: () => void;
}

const CloseButton: React.FC<CloseButtonProps> = ({
  isColoured = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{top: 10, left: 10, bottom: 10, right: 10}}>
      <Image
        source={require('@assets/icons/x-close.png')}
        style={[
          isColoured && {tintColor: ColourPurple50},
          {width: 24, height: 24},
        ]}
      />
    </TouchableOpacity>
  );
};

export default CloseButton;
