import {
  Colour0,
  ColourPurple50,
  fontBodyS,
  Radius4,
  Spacing16,
} from '@utils/tokens';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';

export enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Link = 'link',
}

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  type?: ButtonType;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  title,
  type = ButtonType.Primary,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        type === ButtonType.Secondary && {backgroundColor: Colour0},
        type === ButtonType.Secondary && {
          borderColor: ColourPurple50,
          borderWidth: 1,
        },
        type === ButtonType.Link && {backgroundColor: 'transparent'},
      ]}
      onPress={onPress}>
      <Text
        style={[
          styles.buttonText,
          type === ButtonType.Secondary && {color: ColourPurple50},
          type === ButtonType.Link && {
            color: ColourPurple50,
          },
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    backgroundColor: ColourPurple50,
    padding: Spacing16.original,
    borderRadius: Radius4.original,
    alignItems: 'center',
  },
  buttonText: {
    color: Colour0,
    fontSize: fontBodyS.fontSize,
    fontFamily: fontBodyS.fontFamily,
  },
});

export default CustomButton;
