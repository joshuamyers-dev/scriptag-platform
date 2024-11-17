import {
  Colour100,
  Colour80,
  fontBodyS,
  fontLabelM,
  Spacing16,
} from '@utils/tokens';
import {ReactNode} from 'react';
import {StyleSheet, Text, TextStyle, View} from 'react-native';

interface EmptyStateProps {
  header: string;
  description: string;
  image: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  header,
  description,
  image,
}) => {
  return (
    <View style={styles.container}>
      {image}
      <Text style={styles.headerText}>{header}</Text>
      <Text style={styles.descriptionText}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing16.original,
    paddingHorizontal: Spacing16.original,
  },
  headerText: {
    fontFamily: fontLabelM.fontFamily,
    fontSize: fontLabelM.fontSize,
    fontWeight: fontLabelM.fontWeight as TextStyle['fontWeight'],
    lineHeight: fontLabelM.lineHeight,
    color: Colour100,
    textAlign: 'center',
  },
  descriptionText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
    color: Colour80,
    textAlign: 'center',
  },
});

export default EmptyState;
