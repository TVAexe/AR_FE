import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  visible: boolean;
  onPlace: () => void;
}

const PlacementControls = ({
  visible,
  onPlace,
}: Props) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.placeBtn} onPress={onPlace}>
        <Text style={styles.placeText}>Place</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PlacementControls;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 32,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },

  placeBtn: {
    backgroundColor: '#22c55e', // green
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    marginHorizontal: 8,

    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },

  placeText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
