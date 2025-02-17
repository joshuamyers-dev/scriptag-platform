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
    title: 'Profile',
    blocks: ['Contact details'],
  },
  {
    title: 'Settings',
    blocks: ['Alerts & notifications'],
  },
  {
    title: 'Security',
    blocks: ['Log-in & password', 'Sharing'],
  },
  {
    title: 'About',
    blocks: ['App Version', 'Privacy Policy'],
  },
];

const AccountContainer = () => {
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

export default AccountContainer;
