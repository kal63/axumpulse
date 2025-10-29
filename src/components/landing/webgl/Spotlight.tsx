'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Spotlight() {
  const lightRef = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 2;
      lightRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 2;
      lightRef.current.position.y = 3;
    }
  });

  return (
    <spotLight
      ref={lightRef}
      position={[0, 3, 0]}
      angle={0.3}
      penumbra={0.5}
      intensity={1}
      color="#3b82f6"
      castShadow
    />
  );
}