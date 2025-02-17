import {Colour10, Colour100, fontBodyS, fontLabelS} from '@utils/tokens';
import {
  Image,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';

const Blocks = [
  {
    title: 'Contact Us',
    blocks: ['Send us a message'],
  },
  {
    title: 'Orders',
    blocks: ['Track my order', 'Report issues'],
  },
  {
    title: 'Shop',
    blocks: ['Buy NFC tags', 'Subscriptions'],
  },
  {
    title: 'Resources',
    blocks: ['Frequently asked questions', 'How-to videos'],
  },
];

const HelpContainer = () => {
  return (
    <View style={styles.container}>
      {Blocks.map((block, index) => (
        <View style={styles.boxContainer}>
          <Text style={styles.titleText}>{block.title}</Text>
          {block.blocks.map((item, index) => (
            <TouchableOpacity style={styles.labelRow}>
              <Text style={styles.labelText}>{item}</Text>
              <Image
                source={require('@assets/icons/chevron-up.png')}
                style={{
                  transform: [{rotate: '90deg'}],
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  boxContainer: {
    width: '100%',
    borderWidth: 2,
    borderColor: Colour10,
    padding: 16,
    borderRadius: 4,
    marginTop: 8,
  },
  titleText: {
    fontFamily: fontBodyS.fontFamily,
    fontSize: fontBodyS.fontSize,
    fontWeight: fontBodyS.fontWeight as TextStyle['fontWeight'],
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 11,
  },
  labelText: {
    fontFamily: fontLabelS.fontFamily,
    fontSize: fontLabelS.fontSize,
    fontWeight: fontLabelS.fontWeight as TextStyle['fontWeight'],
    color: Colour100,
    paddingTop: 11,
  },
});

export default HelpContainer;
