'use client';

import { useEffect, useState } from 'react';

export function useWebGLSupport(): boolean {
  const [webglSupported, setWebglSupported] = useState(false);

  useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch (e) {
        return false;
      }
    };

    setWebglSupported(checkWebGLSupport());
  }, []);

  return webglSupported;
}
