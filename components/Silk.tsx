"use client";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useRef, useMemo, useLayoutEffect } from 'react';
import { Color } from 'three';

const hexToNormalizedRGB = (hex: string) => {
  hex = hex.replace("#", "");
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255
  ];
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;
uniform float uTime;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

void main() {
  vec2 uv = vUv;
  
  // 创建平滑的波浪效果
  float wave1 = sin(uv.x * 3.0 + uv.y * 2.0 + uTime * uSpeed * 0.3);
  float wave2 = sin(uv.x * 2.0 - uv.y * 4.0 + uTime * uSpeed * 0.2);
  float wave3 = cos(uv.x * 5.0 + uTime * uSpeed * 0.15);
  
  // 混合波浪，创建宽大的丝绸褶皱
  float pattern = (wave1 + wave2 * 0.5 + wave3 * 0.3) * 0.5 + 0.5;
  
  // 平滑过渡，减少颗粒感
  pattern = smoothstep(0.3, 0.7, pattern);
  
  // 应用颜色，保持柔和的质感
  vec3 finalColor = uColor * (0.3 + pattern * 0.7);
  
  // 添加微妙的高光
  float highlight = pow(pattern, 3.0) * 0.4;
  finalColor += vec3(highlight);
  
  // 降低噪点强度，保持画面干净
  float noise = uNoiseIntensity * 0.02;
  finalColor += noise;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

const SilkPlane = forwardRef(function SilkPlane({ uniforms }: any, ref: any) {
  const { viewport } = useThree();
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [ref, viewport]);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.material.uniforms.uTime.value += 0.1 * delta;
    }
  });
  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 128, 128]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
});
SilkPlane.displayName = 'SilkPlane';

const Silk = ({ speed = 5, scale = 1, color = "#7A7A81", noiseIntensity = 1.5, rotation = 0 }) => {
  const meshRef = useRef<any>(null);
  const uniforms = useMemo(() => ({
    uSpeed: { value: speed },
    uScale: { value: scale },
    uNoiseIntensity: { value: noiseIntensity },
    uColor: { value: new Color(...hexToNormalizedRGB(color)) },
    uRotation: { value: rotation },
    uTime: { value: 0 }
  }), [speed, scale, noiseIntensity, color, rotation]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#050505' }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 1] }}>
        <SilkPlane ref={meshRef} uniforms={uniforms} />
      </Canvas>
    </div>
  );
};

export default Silk;