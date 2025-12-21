import { useNavigation } from '@react-navigation/native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import React, { useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Share from 'react-native-share';
import { CaptureButton, ExitButton, OverlayText } from './OverlayUI';
import PlacementControls from './PlacementControls';
import ProductInfoOverlay from './ProductInfoOverlay';
import Scene from './Scene';

interface SceneControls {
  place: () => void;
}

export default function ARScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const arRef = useRef<any>(null);
  const sceneControls = useRef<SceneControls | null>(null);

  const [arReady, setArReady] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [flash, setFlash] = useState(false);
  const [arState, setArState] = useState({
    hasPreview: false,
    placed: false,
  });

  const modelUrl =
    route?.params?.glbUrl ||
    'https://funiture-shop-storage.s3.ap-southeast-1.amazonaws.com/chair%20GLB.glb';

  const SceneWrapper = useMemo(
    () => () => (
      <Scene
        glbUrl={modelUrl}
        onARReady={setArReady}
        onStateChange={setArState}
        onReady={controls => {
          sceneControls.current = controls;
        }}
      />
    ),
    [modelUrl]
  );

  const captureAndShare = async () => {
    if (!arReady) {
      Alert.alert('AR chưa sẵn sàng');
      return;
    }

    setUiVisible(false);
    setFlash(true);
    setTimeout(() => setFlash(false), 120);

    setTimeout(async () => {
      try {
        const result = await arRef.current?.takeScreenshot(
          'ar_capture',
          true
        );
        if (result?.url) {
          await Share.open({
            url: 'file://' + result.url,
            type: 'image/jpeg',
            failOnCancel: false,
          });
        }
      } finally {
        setUiVisible(true);
      }
    }, 150);
  };

  const hintText = !arReady
    ? 'Move device to scan floor'
    : !arState.hasPreview
    ? 'Point camera at floor'
    : !arState.placed
    ? 'Tap to place'
    : 'Pinch · Rotate · Drag';

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        ref={arRef}
        autofocus
        style={StyleSheet.absoluteFill}
        initialScene={{ scene: SceneWrapper }}
      />

      {uiVisible && (
        <>
          <View style={styles.topBar}>
            <ProductInfoOverlay
              name={route?.params?.product?.name || 'Product'}
              price={route?.params?.product?.price || 0}
              saleRate={route?.params?.product?.saleRate || 0}
            />
            <CaptureButton onPress={captureAndShare} disabled={!arReady} />
            <ExitButton onPress={() => navigation.goBack()} />
          </View>

          <OverlayText text={hintText} />

          <PlacementControls
            visible={arState.hasPreview && !arState.placed}
            onPlace={() => sceneControls.current?.place()}
          />
        </>
      )}

      {flash && <View style={styles.flash} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    opacity: 0.8,
  },
});
