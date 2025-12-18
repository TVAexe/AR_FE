import { View, Text, StyleSheet } from 'react-native';

const OverlayText = ({ text }: { text: string }) => (
  <View style={styles.overlay}>
    <Text style={styles.overlayText}>{text}</Text>
  </View>
);
export default OverlayText;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
});
