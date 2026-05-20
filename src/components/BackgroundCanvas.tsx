'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// GLSL Simplex 3D Noise by Ashima Arts (running on the GPU to compute dynamic deformations)
const simplexNoiseGLSL = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - D.yyy;

  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

const vertexShader = `
${simplexNoiseGLSL}

uniform float uTime;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform vec2 uMouse;
uniform float uWarpRadius;
uniform float uWarpStrength;
varying vec3 vPosition;
varying float vElevation;

void main() {
  vec3 pos = position;
  
  // 1. Compute dynamic landscape wave elevation on the GPU
  float elevation = snoise(vec3(pos.x * uNoiseFreq, pos.z * uNoiseFreq, uTime * 0.12)) * uNoiseAmp;
  pos.y = elevation;
  
  // 2. Compute kinetic cursor magnetic warp (attraction / indentation force-field)
  // Maps standard screen cursor to grid coordinates (grid scales up to +/- 18 on X/Z)
  vec2 targetMouse = uMouse * 16.0;
  float distToMouse = distance(pos.xz, targetMouse);
  
  if (distToMouse < uWarpRadius) {
    // Elegant displacement drop-off curve (smoothstep dome deformation)
    float force = smoothstep(uWarpRadius, 0.0, distToMouse);
    pos.y += force * uWarpStrength;
    pos.x += (pos.x - targetMouse.x) * force * 0.15; // horizontal mesh stretching
    pos.z += (pos.z - targetMouse.y) * force * 0.15;
  }
  
  vPosition = pos;
  vElevation = pos.y;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform vec3 uColor;
uniform float uOpacity;
varying vec3 vPosition;
varying float vElevation;

void main() {
  // Elevate brightness based on vertex wave crests (structural contours)
  float heightIntensity = clamp((vElevation + 2.0) / 4.0, 0.0, 1.0);
  
  // Additive neon bloom color
  vec3 finalColor = mix(uColor * 0.6, vec3(1.0, 1.0, 1.0), heightIntensity * 0.45);
  
  gl_FragColor = vec4(finalColor, uOpacity);
}
`;

export default function BackgroundCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Viewport constants
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const isMobile = window.innerWidth < 768;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.038); // Dense atmospheric blueprint fog

    // 2. Camera setup (Bird's eye tilted structural view)
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 10, 22);
    camera.lookAt(0, -1.5, 0);

    // 3. High Performance Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 2.0)); // Clamp mobile to 1.0 for speed
    renderer.setClearColor(0x050505, 1.0); // Dark obsidian void
    
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Generate line lattices helper
    const buildGridGeometry = (cols: number, rows: number, spacing: number) => {
      const segmentsCount = (cols - 1) * rows + cols * (rows - 1);
      const positions = new Float32Array(segmentsCount * 2 * 3); // 2 points per segment, 3 floats per point
      let idx = 0;

      // Horizontal segments
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const posX1 = (c - cols / 2) * spacing;
          const posZ1 = (r - rows / 2) * spacing;
          const posX2 = (c + 1 - cols / 2) * spacing;
          const posZ2 = (r - rows / 2) * spacing;

          // Point 1
          positions[idx++] = posX1;
          positions[idx++] = 0;
          positions[idx++] = posZ1;

          // Point 2
          positions[idx++] = posX2;
          positions[idx++] = 0;
          positions[idx++] = posZ2;
        }
      }

      // Vertical segments
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 1; r++) {
          const posX1 = (c - cols / 2) * spacing;
          const posZ1 = (r - rows / 2) * spacing;
          const posX2 = (c - cols / 2) * spacing;
          const posZ2 = (r + 1 - rows / 2) * spacing;

          // Point 1
          positions[idx++] = posX1;
          positions[idx++] = 0;
          positions[idx++] = posZ1;

          // Point 2
          positions[idx++] = posX2;
          positions[idx++] = 0;
          positions[idx++] = posZ2;
        }
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      return geom;
    };

    // 5. Construct Double-Layer Lattices
    // Layer 1: Primary structural grid (steel foundations - low density, thick, glowing concrete white)
    const primaryCols = isMobile ? 16 : 40;
    const primaryRows = isMobile ? 16 : 40;
    const primarySpacing = isMobile ? 1.8 : 0.9;
    const primaryGeometry = buildGridGeometry(primaryCols, primaryRows, primarySpacing);

    const primaryUniforms = {
      uTime: { value: 0 },
      uNoiseFreq: { value: 0.08 },
      uNoiseAmp: { value: 2.5 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uWarpRadius: { value: 5.5 },
      uWarpStrength: { value: 2.2 },
      uColor: { value: new THREE.Color(0xdbeafe) }, // Pure concrete white glow
      uOpacity: { value: isMobile ? 0.18 : 0.28 }
    };

    const primaryMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: primaryUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const primaryLattice = new THREE.LineSegments(primaryGeometry, primaryMaterial);
    scene.add(primaryLattice);

    // Layer 2: Secondary facade grid (glass panels - high density, thin, cyan/indigo hue)
    const secondaryCols = isMobile ? 24 : 70;
    const secondaryRows = isMobile ? 24 : 70;
    const secondarySpacing = isMobile ? 1.0 : 0.5;
    const secondaryGeometry = buildGridGeometry(secondaryCols, secondaryRows, secondarySpacing);

    const secondaryUniforms = {
      uTime: { value: 0 },
      uNoiseFreq: { value: 0.12 },
      uNoiseAmp: { value: 1.6 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uWarpRadius: { value: 4.5 },
      uWarpStrength: { value: -1.2 }, // Indentation (reverse push) under the cursor!
      uColor: { value: new THREE.Color(0x06b6d4) }, // Vivid cyan glass panels
      uOpacity: { value: isMobile ? 0.08 : 0.16 }
    };

    const secondaryMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: secondaryUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const secondaryLattice = new THREE.LineSegments(secondaryGeometry, secondaryMaterial);
    scene.add(secondaryLattice);

    // 6. Interactive controls (Snapping screen coordinates)
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize coordinate between -1 and 1
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 7. Responsive handling
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 8. GPU Rendering Throttling (Pause loop when tab is hidden or element is off-screen)
    let isRendering = true;
    
    const handleVisibilityChange = () => {
      isRendering = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isRendering = entry.isIntersecting && !document.hidden;
      });
    }, { threshold: 0.05 });
    observer.observe(containerRef.current);

    // 9. Main GPU Delta-Time Rendering Loop
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (!isRendering) return;

      const elapsedTime = clock.getElapsedTime();
      
      // Update Uniforms
      primaryUniforms.uTime.value = elapsedTime;
      secondaryUniforms.uTime.value = elapsedTime;

      // Interpolate cursor coords smoothly (easing slide)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const currentMouse = new THREE.Vector2(mouseRef.current.x, mouseRef.current.y);
      primaryUniforms.uMouse.value = currentMouse;
      secondaryUniforms.uMouse.value = currentMouse;

      // Rotate/tilt the mountain ranges in 3D to organically follow cursor movement
      primaryLattice.rotation.y = mouseRef.current.x * 0.12;
      primaryLattice.rotation.x = -mouseRef.current.y * 0.08;
      secondaryLattice.rotation.y = mouseRef.current.x * 0.12;
      secondaryLattice.rotation.x = -mouseRef.current.y * 0.08;

      // Parallax camera slide based on cursor coordinates (Desktop only)
      if (!isMobile) {
        camera.position.x = mouseRef.current.x * 2.8;
        camera.position.y = 10 + mouseRef.current.y * 1.5;
        camera.lookAt(0, -1.2, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      primaryGeometry.dispose();
      primaryMaterial.dispose();
      secondaryGeometry.dispose();
      secondaryMaterial.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#050505]"
      style={{ touchAction: 'none' }}
    />
  );
}
