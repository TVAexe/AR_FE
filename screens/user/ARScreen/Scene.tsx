import {
  Viro3DObject,
  ViroAmbientLight,
  ViroARScene,
  ViroNode,
  ViroTrackingStateConstants,
} from '@reactvision/react-viro';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

interface Props {
  glbUrl: string;
  onARReady?: (ready: boolean) => void;
  onStateChange?: (state: { hasPreview: boolean; placed: boolean }) => void;
  onReady?: (controls: { place: () => void }) => void;
}

const Scene = forwardRef<any, Props>((props, _ref) => {
  /* ================= LOCK FLAGS ================= */
  const placedRef = useRef(false);

  /* ================= TRANSFORMS ================= */
  const positionRef = useRef<[number, number, number]>([0, 0, -1]);
  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const scaleRef = useRef<[number, number, number]>([0.2, 0.2, 0.2]);

  const [position, setPosition] = useState(positionRef.current);
  const [rotation, setRotation] = useState(rotationRef.current);
  const [scale, setScale] = useState(scaleRef.current);

  /* ================= HIT TEST (PREVIEW ONLY) ================= */
  const hitTestInterval = useRef<any>(null);

  const startHitTest = (scene: any) => {
    stopHitTest();

    hitTestInterval.current = setInterval(async () => {
      if (placedRef.current) return;

      try {
        const res = await scene.performARHitTestWithPoint(0.5, 0.5);
        if (res?.length) {
          const hit = res.find(
            (r: any) => r.type === 'ExistingPlaneUsingExtent'
          );
          if (hit) {
            positionRef.current = hit.transform.position;
            setPosition([...positionRef.current]);
            props.onStateChange?.({
              hasPreview: true,
              placed: false,
            });
          }
        }
      } catch {}
    }, 120);
  };

  const stopHitTest = () => {
    if (hitTestInterval.current) {
      clearInterval(hitTestInterval.current);
      hitTestInterval.current = null;
    }
  };

  /* ================= PLACE (LOCK HERE) ================= */
  const place = () => {
    if (placedRef.current) return;

    placedRef.current = true;
    stopHitTest();

    setPosition([...positionRef.current]); // SNAPSHOT
    props.onStateChange?.({
      hasPreview: true,
      placed: true,
    });
  };

  useImperativeHandle(props.onReady as any, () => ({
    place,
  }));

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => stopHitTest();
  }, []);

  /* ================= RENDER ================= */
  return (
    <ViroARScene
      onTrackingUpdated={(state) => {
        if (
          state === ViroTrackingStateConstants.TRACKING_NORMAL &&
          !hitTestInterval.current
        ) {
          props.onARReady?.(true);
        }
      }}
      onCameraARHitTest={(e) => {
        // KHÔNG dùng continuous hit-test ở đây
      }}
      ref={(scene) => {
        if (scene && !hitTestInterval.current) {
          startHitTest(scene);
        }
      }}
    >
      <ViroAmbientLight color="#ffffff" intensity={800} />

      {/* ===== MODEL NODE (DUY NHẤT) ===== */}
      <ViroNode
        position={position}
        rotation={rotation}
        scale={scale}
        dragType="FixedToWorld"
        onDrag={(dragPos) => {
          if (!placedRef.current) return;
          positionRef.current = dragPos;
          setPosition([...dragPos]);
        }}
        onPinch={(state, factor) => {
          if (!placedRef.current || state !== 2) return;
          const s = scaleRef.current[0] * factor;
          scaleRef.current = [s, s, s];
          setScale([...scaleRef.current]);
        }}
        onRotate={(state, rot) => {
          if (!placedRef.current || state !== 2) return;
          rotationRef.current = [0, rotationRef.current[1] + rot, 0];
          setRotation([...rotationRef.current]);
        }}
      >
        <Viro3DObject
          source={{ uri: props.glbUrl }}
          type="GLB"
        />
      </ViroNode>
    </ViroARScene>
  );
});

export default Scene;
