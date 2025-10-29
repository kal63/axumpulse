'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import * as THREE from 'three';

// Placeholder images - replace with actual AxumPulse images
const imageUrls = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
];

function ImagePlane({ 
  texture, 
  position, 
  rotation 
}: { 
  texture: THREE.Texture; 
  position: [number, number, number]; 
  rotation: [number, number, number]; 
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Subtle floating animation
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[3, 2.25]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        opacity={0.9}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function ImageRing() {
  const groupRef = useRef<Group>(null);
  const textures = useTexture(imageUrls);

  const imagePositions = useMemo(() => {
    const positions: Array<{ position: [number, number, number]; rotation: [number, number, number] }> = [];
    const radius = 2.5;
    const count = imageUrls.length;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      positions.push({
        position: [x, 0, z],
        rotation: [0, -angle, 0],
      });
    }

    return positions;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Slow rotation
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  return (
    <group ref={groupRef}>
      {imagePositions.map(({ position, rotation }, index) => (
        <ImagePlane
          key={index}
          texture={textures[index]}
          position={position}
          rotation={rotation}
        />
      ))}
    </group>
  );
}
