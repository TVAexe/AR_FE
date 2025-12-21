import {
  Viro3DObject,
  ViroARPlaneSelector,
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroNode,
  ViroSpinner,
} from '@reactvision/react-viro';
import React, { useCallback, useRef, useState } from 'react';

interface AppProps {
    glbUrl: string;
}
interface SceneProps {
  arSceneNavigator: {
    viroAppProps: AppProps;
  };
}

const Scene = (props: SceneProps) => {
  const { glbUrl } = props.arSceneNavigator.viroAppProps;
  const [position, setPosition] = useState<[number, number, number]>([0, 0.02, 0]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [scale, setScale] = useState<[number, number, number]>([0.3, 0.3, 0.3]);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentRotationY = useRef(0);

  const _onRotate = useCallback((rotateState: number, rotationFactor: number) => {
    if (rotateState === 2) {
      setRotation([0, currentRotationY.current - rotationFactor, 0]);
    } else if (rotateState === 3) {
      currentRotationY.current -= rotationFactor;
      setRotation([0, currentRotationY.current, 0]);
    }
  }, []);

  const _onPinch = useCallback((pinchState: number, scaleFactor: number) => {
    if (pinchState === 3) {
      const newScaleValue = scale[0] * scaleFactor;
      setScale([newScaleValue, newScaleValue, newScaleValue]);
    }
  }, [scale]);

  const _onDrag = useCallback((newPosition: [number, number, number]) => {
    setPosition(newPosition);
  }, []);

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={500} />
      <ViroDirectionalLight direction={[0, -1, -0.3]} intensity={1000} />

      <ViroARPlaneSelector 
        minHeight={0.2} 
        minWidth={0.2} 
        alignment="Horizontal"
      >
        <ViroNode 
          position={position}
          dragType="FixedToWorld" 
          onDrag={_onDrag}
        >
          {isLoading && <ViroSpinner position={[0, 0.1, 0]} scale={[0.2, 0.2, 0.2]} />}
          
          <Viro3DObject
            source={{ uri: glbUrl }}
            type="GLB"
            scale={scale}
            rotation={rotation}
            onRotate={_onRotate}
            onPinch={_onPinch}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
          />
        </ViroNode>
      </ViroARPlaneSelector>
    </ViroARScene>
  );
};

export default Scene;