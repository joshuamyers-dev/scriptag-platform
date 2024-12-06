import {
  Colour0,
  Colour10,
  ColourPurple10,
  ColourPurple100,
  ColourPurple50,
  fontBodyS,
  Radius4,
  Spacing16,
} from '@utils/tokens';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, ViewStyle} from 'react-native';
import {MaterialIndicator} from 'react-native-indicators';

import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import ProgressBar from 'react-native-animated-progress';

export enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
  Link = 'link',
}

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  type?: ButtonType;
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  title,
  type = ButtonType.Primary,
  icon = null,
  containerStyle = {},
  disabled = false,
  loading = false,
}) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      style={[
        styles.button,
        type === ButtonType.Primary && {minHeight: 56},
        type === ButtonType.Secondary && {backgroundColor: Colour0},
        type === ButtonType.Secondary && {
          borderColor: ColourPurple50,
          borderWidth: 1,
        },
        type === ButtonType.Link && {backgroundColor: 'transparent'},
        type === ButtonType.Tertiary && {
          backgroundColor: 'transparent',
          borderColor: Colour10,
          borderWidth: 2,
          borderRadius: Radius4.original,
        },
        containerStyle,
        disabled && {backgroundColor: ColourPurple10},
      ]}
      onPress={onPress}>
      {icon && !loading && icon}
      {title && (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
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
        </Animated.View>
      )}
      {loading && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={{
            position: 'absolute',
            bottom: 1,
            left: 0,
            right: 0,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}>
          <ProgressBar
            indeterminate
            height={4}
            animated
            trackColor={ColourPurple100}
            backgroundColor={ColourPurple10}
          />
        </Animated.View>
      )}
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
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  buttonText: {
    color: Colour0,
    fontSize: fontBodyS.fontSize,
    fontFamily: fontBodyS.fontFamily,
  },
});

export default CustomButton;
