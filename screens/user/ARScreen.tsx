import React, { useState, useRef } from 'react';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroAmbientLight,
  ViroDirectionalLight,
  Viro3DObject,
  ViroNode,
  ViroARPlaneSelector,
} from '@reactvision/react-viro';

// Thêm interface cho props
interface SceneProps {
  glbUrl: string;
}

const Scene = ({ glbUrl }: SceneProps) => {
  const initialScale: [number, number, number] = [0.5, 0.5, 0.5];
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const currentRotationY = useRef(0);
  const ROTATION_SENSITIVITY = 1;

  const _onRotate = (rotateState: number, rotationFactor: number, source: any) => {
    if (rotateState === 2) {
      const newY = currentRotationY.current - (rotationFactor * ROTATION_SENSITIVITY);
      setRotation([0, newY, 0]);
    } else if (rotateState === 3) {
      const finalY = currentRotationY.current - (rotationFactor * ROTATION_SENSITIVITY);
      currentRotationY.current = finalY;
      setRotation([0, finalY, 0]);
    }
  };

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={500} />
      <ViroDirectionalLight direction={[0, -1, -0.3]} intensity={1000} />

      <ViroARPlaneSelector
        minHeight={0.5}
        minWidth={0.5}
        alignment="Horizontal"
      >
        <ViroNode
          position={[0, 0, 0]}
          dragType="FixedToWorld"
          onDrag={() => {}}
        >
          <Viro3DObject
            source={{
              uri: glbUrl, // 📌 Sử dụng glbUrl từ props
            }}
            type="GLB"
            position={[0, 0, 0]}
            scale={initialScale}
            rotation={rotation}
            onRotate={_onRotate}
            onPinch={() => {}}
          />
        </ViroNode>
      </ViroARPlaneSelector>
    </ViroARScene>
  );
};

// 📌 Cập nhật component chính để nhận route params
interface ARScreenProps {
  route: {
    params: {
      product?: any;
      glbUrl?: string;
    };
  };
}

export default function ARScreen({ route }: ARScreenProps) {
  const { glbUrl } = route.params || {};
  
  // Fallback URL nếu không có glbUrl
  const modelUrl = glbUrl || 'https://funiture-shop-storage.s3.ap-southeast-1.amazonaws.com/chair%20GLB.glb';

  return (
    <ViroARSceneNavigator
      autofocus
      initialScene={{ 
        scene: () => <Scene glbUrl={modelUrl} /> 
      }}
    />
  );
}