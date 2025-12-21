import {
  Viro3DObject,
  ViroARPlaneSelector,
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroMaterials,
  ViroNode,
  ViroQuad,
  ViroSpinner,
} from '@reactvision/react-viro';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// ViroMaterials.createMaterials({
//   shadow: {
//     diffuseColor: "rgba(0,0,0,0.35)",
//     lightingModel: "Constant",
//     // blendMode: "Add",
//     // diffuseIntensity: 0.25, // điều chỉnh độ mờ
//   },
// });

ViroMaterials.createMaterials({
  shadow: {
    diffuseColor: "rgba(0,0,0,0.35)",
    lightingModel: "Constant",
  },
  shadowSoft: {
    diffuseColor: "rgba(0,0,0,0.18)",
    lightingModel: "Constant",
  },
});


/**
 * Props truyền từ ARScreen
 */
interface AppProps {
  glbUrl: string;
  resetSignal: number; // thay đổi giá trị để reset object
  scaleSignal: number;
  rotateSignal: number;
}

interface SceneProps {
  arSceneNavigator: {
    viroAppProps: AppProps;
  };
}

const INITIAL_POSITION: [number, number, number] = [0, 0.02, 0];
const INITIAL_SCALE: [number, number, number] = [1, 1, 1];

const MIN_SCALE = 0.15;
const MAX_SCALE = 1.2;

const SCALE_STEP = 0.05;
const ROTATE_STEP = 45;

const SHADOW_BASE = 0.9; // thử 0.7 – 1.1 tuỳ model

const Scene = (props: SceneProps) => {
  const { glbUrl, resetSignal, scaleSignal, rotateSignal } = props.arSceneNavigator.viroAppProps;

  // ===== STATE =====
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [isLoading, setIsLoading] = useState(true);

  // Lưu rotation Y hiện tại (tránh re-render liên tục)
  const currentRotationY = useRef(0);

  const [planeKey, setPlaneKey] = useState(0);

  const shadowScale = scale[0] * SHADOW_BASE;

  // ===== RESET OBJECT =====
  useEffect(() => {
    setPosition(INITIAL_POSITION);
    setRotation([0, 0, 0]);
    setScale(INITIAL_SCALE);
    currentRotationY.current = 0;

    setPlaneKey((k) => k + 1);
  }, [resetSignal]);

  useEffect(() => {
    if (!scaleSignal) return;
    const next = Math.min(1.2, Math.max(0.15, scale[0] + scaleSignal * SCALE_STEP));
    setScale([next, next, next]);
  }, [scaleSignal]);

  // rotate step 45°
  useEffect(() => {
    if (!rotateSignal) return;
    currentRotationY.current += rotateSignal * ROTATE_STEP;
    setRotation([0, currentRotationY.current, 0]);
  }, [rotateSignal]);

  // ===== ROTATE: khóa trục Y =====
  const onRotate = useCallback((rotateState: number, rotationFactor: number) => {
    if (rotateState === 3) {
      currentRotationY.current -= rotationFactor;
      setRotation([0, currentRotationY.current, 0]);
    }
  }, []);

  // ===== PINCH: scale có giới hạn =====
  const onPinch = useCallback(
    (pinchState: number, scaleFactor: number) => {
      const nextScale = scale[0] * scaleFactor;
      const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
      setScale([clamped, clamped, clamped]);
    },
    [scale]
  );

  // ===== DRAG: kéo object trên mặt phẳng =====
  const onDrag = useCallback((newPosition: [number, number, number]) => {
    setPosition(newPosition);
  }, []);

  return (
    <ViroARScene>
      
      <ViroAmbientLight color="#ffffff" intensity={500} />

      <ViroDirectionalLight
        direction={[0, -1, -0.3]}
        intensity={800}
        castsShadow
      />

      <ViroARPlaneSelector
        alignment="Horizontal"
        minHeight={0.2}
        minWidth={0.2}
        key={planeKey}
      >
        <ViroNode
          position={position}
          dragType="FixedToWorld"
          onDrag={onDrag}
        >
          {/* Spinner khi đang load model */}
          {isLoading && (
            <ViroSpinner position={[0, 0.1, 0]} scale={[0.2, 0.2, 0.2]} />
          )}

          <Viro3DObject
            source={{ uri: glbUrl }}
            type="GLB"
            scale={scale}
            rotation={rotation}
            onRotate={onRotate}
            onPinch={onPinch}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
          />

          {/* <ViroNode 
            position={[0, -0.01, 0]}
            scale={[scale[0] * 1.2, 1, scale[2] * 1.2]}
          > 
            <ViroQuad
              // position={[0, 0, 0]}
              rotation={[-90, 0, 0]}
              width={1} 
              height={1}
              materials={["shadow"]}
            />
          </ViroNode> */}
          {/* Shadow mềm ngoài */}
          <ViroNode position={[0, -0.012, 0]} scale={[shadowScale * 1.3, 1, shadowScale * 1.3]}>
            <ViroQuad
              rotation={[-90, 0, 0]}
              width={1}
              height={1}
              materials={["shadowSoft"]}
            />
          </ViroNode>

          {/* Shadow đậm ở giữa */}
          <ViroNode position={[0, -0.01, 0]} scale={[shadowScale, 1, shadowScale]}>
            <ViroQuad
              rotation={[-90, 0, 0]}
              width={1}
              height={1}
              materials={["shadow"]}
            />
          </ViroNode>
        </ViroNode>
      </ViroARPlaneSelector>
    </ViroARScene>
  );
};

export default Scene;