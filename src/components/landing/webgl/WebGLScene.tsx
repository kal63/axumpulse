'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import { ImageRing } from './ImageRing';
import { Particles } from './Particles';
import { Spotlight } from './Spotlight';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function Scene() {
  const { camera } = useThree();
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Set initial camera position - zoomed out to see full image ring
    camera.position.set(0, 0, 6);

    // Create scroll-triggered camera animations
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: 'section',
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          
          // Animate camera position based on scroll
          gsap.to(camera.position, {
            x: Math.sin(progress * Math.PI * 2) * 2,
            y: progress * 2,
            z: 7 + Math.cos(progress * Math.PI * 2) * 2,
            duration: 0.1,
          });

          // Rotate the scene
          if (groupRef.current) {
            gsap.to(groupRef.current.rotation, {
              y: progress * Math.PI * 2,
              duration: 0.1,
            });
          }
        },
      },
    });

    return () => {
      tl.kill();
    };
  }, [camera]);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Subtle rotation
    groupRef.current.rotation.y += 0.001;
  });

  return (
    <group ref={groupRef}>
      <ImageRing />
      <Particles />
      <Spotlight />
    </group>
  );
}

export function WebGLScene() {
  return (
    <Canvas
      className="webgl-canvas"
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
      gl={{ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={75} />
      <Suspense fallback={null}>
        <Scene />
        <Environment preset="night" />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Suspense>
    </Canvas>
  );
}