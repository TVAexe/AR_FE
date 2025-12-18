import { ViroARSceneNavigator } from '@reactvision/react-viro';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Scene from './Scene';

interface ARScreenProps {
  route: {
    params: {
      product?: any;
      glbUrl?: string;
    };
  };
}

export default function ARScreen({ route }: ARScreenProps) {
  const modelUrl =
    route?.params?.glbUrl ||
    'https://funiture-shop-storage.s3.ap-southeast-1.amazonaws.com/chair%20GLB.glb';

  const [arState, setArState] = useState({
    planeDetected: false,
    placed: false,
    showHint: true,
  });

  const getHintText = () => {
    if (!arState.planeDetected) {
      return 'Move your device to scan the area';
    }
    if (arState.planeDetected && !arState.placed) {
      return 'Tap on the surface to place the object';
    }
    if (arState.placed && arState.showHint) {
      return 'Drag to move\nPinch to scale\nRotate with two fingers';
    }
    return null;
  };

  const hintText = getHintText();

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus
        style={StyleSheet.absoluteFill}
        initialScene={{
          scene: () => (
            <Scene
              glbUrl={modelUrl}
              onStateChange={setArState}
            />
          ),
        }}
      />

      {hintText && (
        <View style={styles.overlay}>
          <Text style={styles.hintText}>
            {hintText}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  hintText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    lineHeight: 22,
  },
});



