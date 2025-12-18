import {
    Viro3DObject,
    ViroAmbientLight,
    ViroARPlaneSelector,
    ViroARScene,
    ViroDirectionalLight,
    ViroNode,
} from '@reactvision/react-viro';
import React, { useEffect, useRef, useState } from 'react';

interface SceneProps {
  glbUrl: string;
  onStateChange: (state: {
    planeDetected: boolean;
    placed: boolean;
    showHint: boolean;
  }) => void;
}

const ROTATION_SENSITIVITY = 1;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;

const Scene = ({ glbUrl, onStateChange }: SceneProps) => {
  /** Lighting */
  const [ambientIntensity, setAmbientIntensity] = useState(500);
  const [ambientColor, setAmbientColor] = useState('#ffffff');

  /** Object transform */
  const currentScale = useRef(1);
  const currentRotationY = useRef(0);

  const [scale, setScale] = useState<[number, number, number]>([1, 1, 1]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);

  /** AR state */
  const [planeDetected, setPlaneDetected] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [showHint, setShowHint] = useState(true);

  /** Notify parent */
  useEffect(() => {
    onStateChange({ planeDetected, placed, showHint });
  }, [planeDetected, placed, showHint]);

  /** Auto hide hint */
  useEffect(() => {
    if (!placed) return;
    const timer = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(timer);
  }, [placed]);

  /** Gestures */
  const onRotate = (state: number, factor: number) => {
    if (state === 2) {
      const newY = currentRotationY.current - factor * ROTATION_SENSITIVITY;
      setRotation([0, newY, 0]);
    }
    if (state === 3) {
      currentRotationY.current -= factor * ROTATION_SENSITIVITY;
      setRotation([0, currentRotationY.current, 0]);
    }
  };

  const onPinch = (state: number, factor: number) => {
    if (state === 2) {
      const newScale = Math.min(
        Math.max(currentScale.current * factor, MIN_SCALE),
        MAX_SCALE
      );
      setScale([newScale, newScale, newScale]);
    }
    if (state === 3) {
      currentScale.current = scale[0];
    }
  };

  return (
    <ViroARScene
      onAmbientLightUpdate={({ color, intensity }) => {
        setAmbientColor(color);
        setAmbientIntensity(Math.min(intensity, 1000));
      }}
    >
      <ViroAmbientLight
        color={ambientColor}
        intensity={ambientIntensity}
      />
      <ViroDirectionalLight
        direction={[0, -1, -0.3]}
        intensity={600}
        castsShadow
      />

      <ViroARPlaneSelector
        alignment="Horizontal"
        minWidth={0.5}
        minHeight={0.5}
        onPlaneSelected={() => {
          setPlaneDetected(true);
          setPlaced(true);
        }}
      >
        {placed && (
          <ViroNode
            position={[0, 0, 0]}
            dragType="FixedToWorld"
          >
            <Viro3DObject
              source={{ uri: glbUrl }}
              type="GLB"
              position={[0, 0, 0]}
              scale={scale}
              rotation={rotation}
              onRotate={onRotate}
              onPinch={onPinch}
              shadowCastingBitMask={1}
              lightReceivingBitMask={1}
            />
          </ViroNode>
        )}
      </ViroARPlaneSelector>
    </ViroARScene>
  );
};

export default Scene;
