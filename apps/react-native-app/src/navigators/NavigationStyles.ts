import {ColourNeutral100, fontBodyS, fontLabelL} from '@utils/tokens';
import {TextStyle} from 'react-native';

export const defaultHeaderTitleStyle = {
  fontFamily: fontBodyS.fontFamily,
  fontSize: fontBodyS.fontSize,
  fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
  color: ColourNeutral100,
};

export const largeHeaderTitleStyle = {
  fontFamily: fontLabelL.fontFamily,
  fontSize: fontLabelL.fontSize,
  fontWeight: fontLabelL.fontWeight as TextStyle['fontWeight'],
  color: ColourNeutral100,
};
