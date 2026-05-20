'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// GLSL Simplex 3D Noise by Ashima Arts (re-used to offset particle vertex heights on the GPU)
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
varying vec3 vPosition;

void main() {
  vec3 pos = position;
  
  // Custom GPU wave height equation based on noise (running entirely on the graphics card)
  float elevation = snoise(vec3(pos.x * uNoiseFreq, pos.z * uNoiseFreq, uTime * 0.15)) * uNoiseAmp;
  pos.y = elevation;
  
  vPosition = pos;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // size attenuation based on depth and elevation
  gl_PointSize = (14.0 / -mvPosition.z) * (1.0 + elevation * 0.12);
}
`;

const fragmentShader = `
varying vec3 vPosition;

void main() {
  // Circular soft glowing particles
  float dist = distance(gl_PointCoord, vec2(0.5));
  if (dist > 0.5) discard;
  
  float alpha = smoothstep(0.5, 0.08, dist) * 0.5;
  
  // Elevate colors based on vertex position height
  float heightColor = clamp((vPosition.y + 1.8) / 3.6, 0.0, 1.0);
  
  // Slate/cool gray base fading into clean white crests
  vec3 color = mix(vec3(0.32, 0.35, 0.4), vec3(1.0, 1.0, 1.0), heightColor);
  
  gl_FragColor = vec4(color, alpha);
}
`;

export default function BackgroundCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Detect environment viewport width
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const isMobile = window.innerWidth < 768;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.035);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
    // Camera position: tilted bird's-eye architectural preview perspective
    camera.position.set(0, 12, 24);
    camera.lookAt(0, -2, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
    renderer.setClearColor(0x0a0a0a, 1.0);
    
    // Clear container and append canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Generate particles grid
    const gridCols = isMobile ? 40 : 120;
    const gridRows = isMobile ? 40 : 120;
    const spacing = 0.45;
    const particleCount = gridCols * gridRows;

    const positions = new Float32Array(particleCount * 3);

    let idx = 0;
    for (let c = 0; c < gridCols; c++) {
      for (let r = 0; r < gridRows; r++) {
        // Center the grid around origin (0,0)
        const posX = (c - gridCols / 2) * spacing;
        const posZ = (r - gridRows / 2) * spacing;
        
        positions[idx * 3] = posX;
        positions[idx * 3 + 1] = 0; // elevation computed in vertex shader
        positions[idx * 3 + 2] = posZ;
        
        idx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // 5. Shader Material definition
    const uniforms = {
      uTime: { value: 0 },
      uNoiseFreq: { value: isMobile ? 0.08 : 0.09 },
      uNoiseAmp: { value: isMobile ? 1.5 : 2.2 }
    };

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, shaderMaterial);
    scene.add(particles);

    // 6. Interactive parallax controls (Desktop only)
    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      // Normalize mouse coordinates between -1 and 1
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

    // 8. Viewport and visibility optimization (Pause rendering out of focus/tab)
    let isRendering = true;
    const handleVisibilityChange = () => {
      isRendering = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Intersection observer to pause rendering when canvas element leaves viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isRendering = entry.isIntersecting && !document.hidden;
      });
    }, { threshold: 0.1 });
    observer.observe(containerRef.current);

    // 9. Main Render Loop
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (!isRendering) return;

      const elapsedTime = clock.getElapsedTime();
      
      // Update Uniforms
      uniforms.uTime.value = elapsedTime;

      // Smooth camera parallax interpolation (lerp)
      if (!isMobile) {
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;
        
        camera.position.x = mouseRef.current.x * 2.5;
        camera.position.y = 12 + mouseRef.current.y * 1.5;
        camera.lookAt(0, -1.8, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
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
      geometry.dispose();
      shaderMaterial.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#0a0a0a]"
      style={{ touchAction: 'none' }}
    />
  );
}
