'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const emojis = ['💪', '🏃‍♂️', '🏋️‍♀️', '🧘‍♀️', '🚴‍♂️', '🏊‍♀️', '🤸‍♂️', '🎯', '⚡', '🔥', '💎', '🌟'];

export function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const textRef = useRef<THREE.Group>(null);

  const particles = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Random positions in a sphere
      const radius = Math.random() * 15 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Blue-purple gradient colors
      const color = new THREE.Color();
      color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5 + Math.random() * 0.3);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
    
    if (textRef.current) {
      textRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      textRef.current.position.y = 2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      textRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1);
    }
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particles.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Compound 360 3D Text */}
      <group ref={textRef} position={[0, 2, 0]}>
        {/* Background glow effect */}
        {/* <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[4, 1.5]} />
          <meshBasicMaterial
            color="#3b82f6"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh> */}
        
        {/* Main 3D Text */}
        <Text
          position={[0, 0, 0]}
          fontSize={0.8}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          material-toneMapped={false}
          outlineWidth={0.02}
          outlineColor="#3b82f6"
        >
          Compound 360
        </Text>
        
        {/* Glow effect behind text */}
        <Text
          position={[0, 0, -0.01]}
          fontSize={0.82}
          color="#3b82f6"
          anchorX="center"
          anchorY="middle"
          material-toneMapped={false}
          material-transparent={true}
          material-opacity={0.5}
        >
          Compound 360
        </Text>
      </group>

      {/* Floating Emojis */}
      {emojis.map((emoji, index) => {
        const angle = (index / emojis.length) * Math.PI * 2;
        const radius = 8 + Math.random() * 4;
        const height = (Math.random() - 0.5) * 6;
        
        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * radius,
              height,
              Math.sin(angle) * radius,
            ]}
          >
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </>
  );
}
