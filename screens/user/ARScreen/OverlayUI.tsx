import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface OverlayTextProps {
  text: string;
}

interface ExitButtonProps {
  onPress: () => void;
}

interface CaptureButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const OverlayText = ({ text }: OverlayTextProps) => {
  if (!text) return null;

  return (
    <View style={styles.overlay}>
      <Text style={styles.overlayText}>{text}</Text>
    </View>
  );
};

export const ExitButton = ({ onPress }: ExitButtonProps) => {
  return (
    <TouchableOpacity style={styles.exitButton} onPress={onPress}>
      <Text style={styles.exitText}>✕</Text>
    </TouchableOpacity>
  );
};

export const CaptureButton = ({ onPress, disabled = false }: CaptureButtonProps) => (
  <TouchableOpacity
    style={[
      styles.captureButton,
      disabled && styles.disabled,
    ]}
    onPress={disabled ? undefined : onPress}
    activeOpacity={disabled ? 1 : 0.7}
  >
    <Text style={styles.captureText}>📸</Text>
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
  },

  exitButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  exitText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  captureButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureText: {
    fontSize: 22,
    color: '#fff',
  },

  disabled: {
    opacity: 0.4,
  },

});
