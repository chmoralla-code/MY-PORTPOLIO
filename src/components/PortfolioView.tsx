'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDown, Mail, Phone, MapPin, Send, Check, X, Volume2, VolumeX, Eye } from 'lucide-react';
import BackgroundCanvas from './BackgroundCanvas';
import OptimizedMedia from './OptimizedMedia';
import type { PortfolioInfo, Project } from '@/lib/supabase';
import { useLenis } from 'lenis/react';

interface PortfolioViewProps {
  initialInfo: PortfolioInfo | null;
  initialProjects: Project[];
}

// ==========================================
// SKEUOMORPHIC SYNTHETIC AUDIO ENGINE
// ==========================================
class SonicEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private voices: Array<{ osc: OscillatorNode; gain: GainNode }> = [];
  private lfo: OscillatorNode | null = null;
  public isMuted: boolean = true;
  public analyser: AnalyserNode | null = null;

  constructor() {
    // Web Audio API context initialized on first user interaction
  }

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    this.ctx = new AudioContextClass();
    
    // Create master ambient drone gain
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    
    // Warm low-pass filter for absolute cinematic texture
    const lpFilter = this.ctx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(160, this.ctx.currentTime);
    lpFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    // Multi-voice epic generative meditation chord (A-suspended 2 chord)
    // A1 (55Hz) - Root weight
    // A2 (110Hz) - Solid core
    // E3 (164.81Hz) - Perfect fifth structural block
    // B3 (246.94Hz) - Suspended 2nd (cinematic tension/wonder)
    // E4 (329.63Hz) - Luminescent glow shimmer
    const pitches = [55, 110, 164.81, 246.94, 329.63];
    const waveTypes: OscillatorType[] = ['sine', 'triangle', 'sine', 'triangle', 'sine'];
    const voiceGains = [0.35, 0.22, 0.18, 0.12, 0.08];

    pitches.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = waveTypes[i];
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      // Slight detune for warm, rich chorusing/beating modulation
      osc.detune.setValueAtTime((Math.random() - 0.5) * 10, this.ctx.currentTime);
      
      gainNode.gain.setValueAtTime(voiceGains[i], this.ctx.currentTime);
      
      osc.connect(gainNode);
      gainNode.connect(lpFilter);
      osc.start();
      
      this.voices.push({ osc, gain: gainNode });
    });

    // Slow LFO to modulate the filter frequency for a breathing meditation texture
    this.lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(0.06, this.ctx.currentTime); // Deep slow breaths (~16.6 second cycle)
    
    lfoGain.gain.setValueAtTime(45, this.ctx.currentTime); // Modulate cutoff +/- 45Hz
    
    this.lfo.connect(lfoGain);
    lfoGain.connect(lpFilter.frequency);
    this.lfo.start();

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    lpFilter.connect(this.analyser);
    this.analyser.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.init();
    
    if (!this.ctx || !this.ambientGain) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const targetGain = muted ? 0.0 : 0.7; // 70% background volume
    this.ambientGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 1.5); // Warm slow fade-in
  }

  // Monospace digit coordinates rapid tick
  public tick() {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.008, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + 0.008);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.01);
  }

  // Tactile button mechanical click
  public click() {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.015);

    gain.gain.setValueAtTime(0.018, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.025);
  }

  // Slide transition dynamic deep swoop
  public swoop() {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.35);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(45, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.025, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  // High-fidelity sci-fi blueprint decode and scan sound effect
  public decode() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.18);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.7);
    filter.Q.setValueAtTime(5.0, now);
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(85, now);
    osc1.frequency.exponentialRampToValueAtTime(750, now + 0.2);
    osc1.frequency.exponentialRampToValueAtTime(150, now + 0.7);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(800, now);
    osc2.frequency.exponentialRampToValueAtTime(2400, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(350, now + 0.75);
    
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.03); // Fast swell
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.8);  // Slow tail decay
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    
    osc1.stop(now + 0.85);
    osc2.stop(now + 0.85);
  }

  // Deep, theatrical Godly Voice Synthesis announcement (Removed per user request)
  public speakIntro() {
    // No-op
  }
}

// ==========================================
// CUSTOM SPECIFICATION MATRIX DECODER
// ==========================================
const parseMaterials = (materialsString?: string) => {
  if (!materialsString) return { composition: 'RAW CONCRETE / GLASS', density: '2400 kg/m³', thermal: 'R-value: 0.12 m²·K/W' };
  const parts = materialsString.split(' || ');
  const composition = parts[0] || '';
  let density = '2400 kg/m³';
  let thermal = 'R-value: 0.12 m²·K/W';
  parts.forEach(part => {
    if (part.startsWith('DENSITY: ')) density = part.replace('DENSITY: ', '');
    else if (part.startsWith('THERMAL: ')) thermal = part.replace('THERMAL: ', '');
  });
  return { composition, density, thermal };
};

// ==========================================
// REAL-TIME VECTOR AUDIO OSCILLOSCOPE
// ==========================================
interface AudioVisualizerProps {
  audioEngine: React.MutableRefObject<SonicEngine | null>;
  isMuted: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioEngine, isMuted }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const bufferLength = 128;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;

      // Draw background grid base
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // Subtle drafting layout gridlines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.5;
      
      // Horizontal baseline
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Vertical tick gridlines
      for (let x = 0; x < width; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, height / 2 - 3);
        ctx.lineTo(x, height / 2 + 3);
        ctx.stroke();
      }

      const activeEngine = audioEngine.current;
      const analyser = activeEngine?.analyser;

      if (!isMuted && activeEngine && analyser && activeEngine.isMuted === false) {
        analyser.getByteTimeDomainData(dataArray);

        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#00ff66';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0; // 0.0 to 2.0
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
      } else {
        // Muted / Idle state: draw subtle electric digital noise baseline
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.25)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();

        let x = 0;
        const sliceWidth = 2;
        ctx.moveTo(0, height / 2);
        for (let i = 0; x < width; i++) {
          const noise = (Math.random() - 0.5) * 2.5; // very subtle digital jitter
          ctx.lineTo(x, height / 2 + noise);
          x += sliceWidth;
        }
        ctx.stroke();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [audioEngine, isMuted]);

  return (
    <div className="flex items-center gap-2 border border-white/10 px-3 py-1 rounded bg-[#09090b]/80 backdrop-blur-md">
      <span className="text-[7px] text-white/30 tracking-widest font-mono uppercase font-bold">[ Wv_OSC ]</span>
      <canvas 
        ref={canvasRef} 
        width={100} 
        height={18} 
        className="w-[100px] h-[18px] opacity-80"
      />
    </div>
  );
};

// ==========================================
// HIGH-TECH MONOSPACE GLYPH SCRAMBLER
// ==========================================
interface InteractiveScrambleTextProps {
  text: string;
  className?: string;
  scrambleColor?: string;
  triggerOnHover?: boolean;
}

const InteractiveScrambleText: React.FC<InteractiveScrambleTextProps> = ({
  text,
  className = '',
  scrambleColor = 'text-[#00ff66]',
  triggerOnHover = true
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*()_+=-{}[]|:;<>?,./';
  const frameRef = useRef<number | null>(null);

  const startScramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);

    const length = text.length;
    let frame = 0;
    const maxFrames = 20; // 330ms scramble cycle at 60fps
    const resolvedIndices = new Set<number>();

    const tick = () => {
      frame++;
      
      const progress = frame / maxFrames;
      const charsToResolve = Math.floor(progress * length);

      while (resolvedIndices.size < charsToResolve && resolvedIndices.size < length) {
        const randomIndex = Math.floor(Math.random() * length);
        resolvedIndices.add(randomIndex);
      }

      const result = text.split('').map((char, index) => {
        if (char === ' ' || char === '/' || char === ':' || char === '-' || char === '.' || char === '°') {
          return char; // Keep layout structure stable
        }
        if (resolvedIndices.has(index)) {
          return char;
        }
        return chars[Math.floor(Math.random() * chars.length)];
      });

      setDisplayText(result.join(''));

      if (frame < maxFrames) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayText(text);
        setIsScrambling(false);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    startScramble();
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text]);

  const handleMouseEnter = () => {
    if (triggerOnHover) {
      startScramble();
    }
  };

  return (
    <span 
      className={`inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      {displayText.split('').map((char, index) => {
        const isResolved = char === text[index];
        return (
          <span 
            key={index} 
            className={!isResolved ? scrambleColor : ''}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
};

export default function PortfolioView({ initialInfo, initialProjects }: PortfolioViewProps) {
  const lenis = useLenis();
  const audio = useRef<SonicEngine | null>(null);
  const hasSpoken = useRef(false);

  // States
  const [info] = useState<PortfolioInfo>(
    initialInfo || {
      id: 1,
      hero_title: 'CYRHIEL MORALLA',
      hero_subtitle: 'FRESH GRADUATE // LIVING ARCHITECTURE',
      poetry: 'The digital canvas treated as an evolving physical structure. Editorial layouts, stark contrasts, concrete structures, and kinetic poetry in continuous space.',
      about_text: 'I am Cyrhiel Moralla, a visionary architect and designer exploring the intersection between material physics, generative design, and digital workflows. Treating code and concrete as equivalent mediums of creation.',
      contact_email: 'cyrhielmaot@gmail.com',
      contact_phone: '09505339963',
      contact_address: 'BOHOL, TAGBILARAN CITY, UBUJAN 6300'
    }
  );

  const [avatarUrl, setAvatarUrl] = useState('/profile.png');

  useEffect(() => {
    const checkAvatar = async () => {
      const publicUrl = 'https://hzeqntoxqeylnglkgdnp.supabase.co/storage/v1/object/public/portfolio_images/profile_avatar.webp';
      try {
        const res = await fetch(publicUrl, { method: 'HEAD', cache: 'no-cache' });
        if (res.ok) {
          setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
        } else {
          setAvatarUrl('/profile.png');
        }
      } catch (err) {
        setAvatarUrl('/profile.png');
      }
    };
    checkAvatar();
  }, []);

  // Pad to minimum of 5 columns to guarantee a spectacular full landscape layout showcase
  const [projects] = useState<Project[]>(() => {
    const dbProjects = initialProjects || [];
    if (dbProjects.length >= 5) return dbProjects;

    const mockProjects: Project[] = [
      {
        id: 'mock-1',
        title: 'KINETIC SHELL / MONOLITHIC PAVILION',
        description: 'An exploration of self-supporting origami concrete shells utilizing hyper-thin fiber reinforced matrices. An ongoing spatial installation addressing structural weight in tropical microclimates.',
        scale: 'SCALE 1:50',
        location: 'PANGLAO, BOHOL',
        materials: 'GLASS-FIBER CONCRETE / ETHYLENE POLYMER',
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        year: 2026,
        client: 'BOHOL SPATIAL LAB',
        media_type: 'image'
      },
      {
        id: 'mock-2',
        title: 'OBSIDIAN CORE / APERTURE HOUSE',
        description: 'Residential typology carved entirely from basalt and volcanic aggregates. Operates as a thermodynamic sink utilizing deep-ground thermal mass cooling.',
        scale: 'SCALE 1:100',
        location: 'ALONA, PANGLAO',
        materials: 'POLISHED BASALT / STRUCTURAL STEEL / BLACK GLASS',
        image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        year: 2025,
        client: 'PRIVATE RESIDENCE',
        media_type: 'image'
      },
      {
        id: 'mock-3',
        title: 'LUMINAL MATRIX / THE BRUTALIST ARCHIVE',
        description: 'A civic research library utilizing post-tensioned raw concrete ribs. Natural light is filtered through deep concrete fins, creating an ever-shifting sundial layout inside.',
        scale: 'SCALE 1:250',
        location: 'TAGBILARAN CITY',
        materials: 'POURED CONCRETE / SANDBLASTED TITANIUM',
        image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        year: 2026,
        client: 'MUNICIPAL CIVIL DECK',
        media_type: 'image'
      },
      {
        id: 'mock-4',
        title: 'FRACTAL REEF / FLOATING AQUACENE',
        description: 'An offshore environmental research station constructed from carbon fiber composites. Features a modular frame designed to move in synchronization with oceanic swells.',
        scale: 'SCALE 1:500',
        location: 'MINDANAO TRENCH OVERLOOK',
        materials: 'CARBON-REINFORCED VINYL / STAINLESS STEEL',
        image_url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
        year: 2026,
        client: 'OCEANIC RESEARCH DECK',
        media_type: 'image'
      },
      {
        id: 'mock-5',
        title: 'AETHER SHROUD / TENSIONED PAVILION',
        description: 'Temporary lightweight exhibition architecture using ultra-strong tensegrity columns and translucent acoustic membranes.',
        scale: 'SCALE 1:25',
        location: 'UBUJAN ARCHITECTURAL DECK',
        materials: 'ALUMINUM EXTRUSION / SILICONE COATED TFE',
        image_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
        year: 2025,
        client: 'CULTURAL COMMISSION PH',
        media_type: 'image'
      }
    ];

    const combined = [...dbProjects];
    for (let i = combined.length; i < 5; i++) {
      combined.push(mockProjects[i - combined.length]);
    }
    return combined;
  });

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [terminalLog, setTerminalLog] = useState('SYSTEM BOOT INITIALIZATION... COMPLETE');
  const [isGlitching, setIsGlitching] = useState(false);

  // Kinetic Typography Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [loadCoords, setLoadCoords] = useState('LAT: 09.6500° N / LON: 123.8500° E');
  const [loadProgress, setLoadProgress] = useState(0);
  const [scaleAxisText, setScaleAxisText] = useState('SCALE_AXIS: [COMPUTING...]');

  // Interactive Custom Cursor states
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isCursorHovering, setIsCursorHovering] = useState(false);

  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', details: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // High-performance dynamic scroll parallax states
  const [scrollY, setScrollY] = useState(0);
  const [showcaseOffset, setShowcaseOffset] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Resize listener to optimize grid drifting on mobile/tablets
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const triggerVoiceIntro = () => {
    if (hasSpoken.current) return;
    hasSpoken.current = true;
    audio.current?.speakIntro();
  };

  // 1. Initialize Audio Engine & Setup Autoplay First Gesture Listeners
  useEffect(() => {
    audio.current = new SonicEngine();

    const handleFirstInteraction = () => {
      if (audio.current && isMuted) {
        setIsMuted(false);
        audio.current.setMuted(false);
        
        // If the loading screen has finished, speak immediately.
        // If it is still loading, it will speak when loading completes (hooked below).
        if (!isLoading) {
          setTimeout(() => {
            triggerVoiceIntro();
          }, 350);
        }
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('pointerdown', handleFirstInteraction);
    window.addEventListener('scroll', handleFirstInteraction);

    return () => {
      cleanup();
    };
  }, [isLoading, isMuted]);

  // Trigger Deep Godly Voice when loader has finished and audio is unmuted
  useEffect(() => {
    if (!isLoading && !isMuted) {
      // Delay slightly after loader finish for maximum cinematic dramatic timing
      const timer = setTimeout(() => {
        triggerVoiceIntro();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isMuted]);

  // 2. Kinetic Loading Sequence (High speed coordinates ticking)
  useEffect(() => {
    if (!isLoading) return;
    audio.current?.tick();

    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        // High frequency ticking
        audio.current?.tick();
        const randLat = (9.6000 + Math.random() * 0.1).toFixed(4);
        const randLon = (123.8000 + Math.random() * 0.1).toFixed(4);
        const randScale = (Math.random() * 800).toFixed(2);
        
        setLoadCoords(`LAT: ${randLat}° N // LON: ${randLon}° E`);
        setScaleAxisText(`GRID_SEG_D: ${randScale}m // AXIS: [1:${Math.round(Math.random() * 500)}]`);

        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
            audio.current?.swoop();
          }, 450);
          return 100;
        }
        return prev + 4;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [isLoading]);

  // 3. Dynamic Cursor Tracker & Telemetry Logger
  const triggerGlitch = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 350);
  };

  useEffect(() => {
    let lastTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      
      const now = Date.now();
      if (now - lastTime > 80) { // 80ms throttle is highly responsive but prevents main-thread block
        const normX = (e.clientX / window.innerWidth) - 0.5;
        const normY = (e.clientY / window.innerHeight) - 0.5;
        const xAngle = normX * 12;
        const yAngle = -normY * 12;
        setTerminalLog(`PARALLAX_CAM: [X: ${xAngle.toFixed(1)}°, Y: ${yAngle.toFixed(1)}°] // TELEMETRY: ACTIVE`);
        lastTime = now;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 4. Combined High-Performance Scroll, Snapping & Parallax Tracker
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY;
          setScrollY(scrollPos);

          // Snapping calculations (0 for Intro, 1 for Showcase)
          const windowHeight = window.innerHeight;
          const current = scrollPos >= windowHeight * 0.4 ? 1 : 0;
          
          if (current !== activeSection) {
            setActiveSection(current);
            audio.current?.tick();
          }

          // Calculate relative scroll offset inside the showcase
          if (showcaseRef.current) {
            const rect = showcaseRef.current.getBoundingClientRect();
            const sectionTop = rect.top + scrollPos;
            setShowcaseOffset(scrollPos - sectionTop);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger initial load calculation
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.details) return;

    audio.current?.click();
    setFormStatus('sending');
    setTerminalLog('DISPATCHING ENQUIRY VIA ENCRYPTED DECK...');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Message dispatch failed');

      setFormStatus('success');
      setTerminalLog('AUTOMATION MESSAGE DISPATCH SUCCESSFUL // CODE_200');
      audio.current?.swoop();
      setFormData({ name: '', email: '', details: '' });
      setTimeout(() => {
        setFormStatus('idle');
        setIsContactOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Contact submission error:', err);
      setFormStatus('error');
      setTerminalLog('SYSTEM DERAILMENT: DISPATCH FAILURE // CODE_500');
    }
  };

  const scrollToPanel = (idx: number) => {
    audio.current?.click();
    if (lenis) {
      lenis.scrollTo(idx * window.innerHeight);
    } else {
      window.scrollTo({
        top: idx * window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  // Convert scroll index to drafting scale representation
  const getDraftingScale = () => {
    if (activeSection === 0) return 'SCALE 1:1 [HUMAN AXIS]';
    return 'SCALE 1:100 [STRUCTURAL BLUEPRINTS]';
  };

  // Clamped drifting calculator for columns
  const getTranslationY = (idx: number) => {
    if (isMobile) return 0;
    const isOdd = idx % 2 === 0;
    const factor = isOdd ? 0.12 : -0.08;
    const translation = showcaseOffset * factor;
    return Math.max(-80, Math.min(80, translation));
  };

  // Calculate relative normalized coordinates for 3D tilt (-0.5 to 0.5)
  const getHeroPortraitStyle = () => {
    if (typeof window === 'undefined') return {};
    const normX = (cursorPos.x / window.innerWidth) - 0.5;
    const normY = (cursorPos.y / window.innerHeight) - 0.5;
    
    // Calculate tilt angles (max 12 degrees) and translates (max 8px)
    const rotateX = -normY * 12;
    const rotateY = normX * 12;
    const translateX = normX * 8;
    const translateY = normY * 8;
    
    return {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${translateX}px, ${translateY}px, 0)`,
      transition: 'transform 0.15s ease-out'
    };
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black antialiased overflow-x-hidden font-mono">
      {/* 1. CINEMATIC TYPOGRAPHY ENTRANCE LOADER */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col justify-between p-8 md:p-12 select-none pointer-events-auto">
          {/* Top coordinates readout */}
          <div className="flex justify-between items-center text-[9px] tracking-[0.25em] text-white/40 uppercase">
            <span>[ SYSTEM INITIALIZATION ]</span>
            <span>BOHOL, PH // ARCH_CELL</span>
          </div>

          {/* Central ticking matrix */}
          <div className="max-w-2xl">
            <div className="mb-4 text-white/30 text-[10px] tracking-widest font-bold">
              {loadCoords}
            </div>
            <div className="mb-8 text-white/30 text-[10px] tracking-widest font-bold">
              {scaleAxisText}
            </div>
            <div className="text-xl md:text-2xl font-light uppercase tracking-[0.2em] leading-relaxed text-white">
              ESTABLISHING DIGITAL BLUEPRINT MESH...
            </div>
            {/* Structural loading progress bar */}
            <div className="w-full h-[1px] bg-white/10 mt-8 relative overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>

          {/* Loading Bottom HUD */}
          <div className="flex justify-between items-end text-[9px] tracking-[0.3em] text-white/35">
            <span>{info.hero_title} // ARCHITECT</span>
            <span>{loadProgress}% LOADED</span>
          </div>
        </div>
      )}

      {/* 3. DYNAMIC CSS PHOTOGRAPHIC NOISE / GRAIN COVER */}
      <div className="fixed inset-0 pointer-events-none z-40 opacity-[0.02] bg-noise bg-repeat" />

      {/* 4. GPU-ACCELERATED WEBGL GEOMETRIC ENVIRONMENT */}
      <BackgroundCanvas />

      {/* 5. TOP HUD VIEWPORT HEADER (MAGNETIC HOVER STATE ACTIVE) */}
      <header className="fixed top-0 left-0 w-full z-30 flex justify-between items-center px-4 py-4 md:px-12 md:py-8 pointer-events-none">
        <div className="pointer-events-auto">
          <button 
            onClick={() => scrollToPanel(0)}
            className="font-bold text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.35em] text-white/80 hover:text-white transition-colors duration-300 focus:outline-none"
          >
            <InteractiveScrambleText text={info.hero_title} scrambleColor="text-white" />
          </button>
        </div>
        
        {/* Let's talk CTA only */}
        <div className="pointer-events-auto flex items-center gap-2 md:gap-4">
          <button
            onClick={() => { audio.current?.click(); setIsContactOpen(true); }}
            className="text-[8px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest px-3 py-2 md:px-5 md:py-2.5 rounded-full border border-white/20 bg-black/40 hover:bg-white hover:text-black hover:border-white hover:scale-105 transition-all duration-500 flex items-center gap-1 md:gap-2 cursor-pointer focus:outline-none"
          >
            LET'S TALK <ArrowUpRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
          </button>
        </div>
      </header>

      {/* HUD CORNER CROSSHAIR BOUNDS (Awwwards Drafting Aesthetic) */}
      <div className="fixed top-6 left-6 pointer-events-none z-20 w-3 h-3 border-t border-l border-white/15 hidden lg:block" />
      <div className="fixed top-6 right-6 pointer-events-none z-20 w-3 h-3 border-t border-r border-white/15 hidden lg:block" />
      <div className="fixed bottom-6 left-6 pointer-events-none z-20 w-3 h-3 border-b border-l border-white/15 hidden lg:block" />
      <div className="fixed bottom-6 right-6 pointer-events-none z-20 w-3 h-3 border-b border-r border-white/15 hidden lg:block" />

      {/* 6. BOTTOM HUD DECORATIVE BAR */}
      <div className="fixed bottom-0 left-0 w-full z-30 px-6 py-6 md:px-12 md:py-8 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto hidden md:flex items-center gap-6 select-none">
          <span className="text-[9px] tracking-[0.25em] text-white/30 uppercase font-bold">
            [ COORDINATES CELL ] {loadCoords}
          </span>
          <span className="text-[9px] tracking-[0.25em] text-[#00ff66] font-mono animate-pulse uppercase max-w-md truncate">
            {terminalLog}
          </span>
        </div>
        <div className="pointer-events-auto flex items-center gap-4 select-none">
          <AudioVisualizer audioEngine={audio} isMuted={isMuted} />
          <span className="text-[9px] tracking-[0.25em] text-white/50 uppercase font-bold">
            {getDraftingScale()}
          </span>
        </div>
      </div>

      {/* 7. DYNAMIC PAGINATION RAIL (DRAFTING MEASURING SCALE RULER) */}
      <div className="fixed top-1/2 right-6 md:right-12 z-35 -translate-y-1/2 flex flex-col items-end gap-6 pointer-events-none select-none">
        <div className="h-[120px] w-[1px] bg-white/10 relative mb-4 hidden lg:block">
          {/* Moving depth slider dot */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border border-black rounded-full transition-all duration-700 ease-out"
            style={{ top: `${activeSection * 100}%` }}
          />
        </div>
        <div className="flex flex-col gap-4 pointer-events-auto items-end text-right">
          <button
            onClick={() => scrollToPanel(0)}
            className={`text-[9px] tracking-[0.2em] transition-all duration-500 flex items-center gap-2 cursor-pointer focus:outline-none uppercase ${
              activeSection === 0 ? 'text-white scale-110 font-bold' : 'text-white/30 hover:text-white/60'
            }`}
          >
            00 INTRO {activeSection === 0 && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
          </button>
          
          <button
            onClick={() => scrollToPanel(1)}
            className={`text-[9px] tracking-[0.2em] transition-all duration-500 flex items-center gap-2 cursor-pointer focus:outline-none uppercase ${
              activeSection === 1 ? 'text-white scale-110 font-bold' : 'text-white/30 hover:text-white/60'
            }`}
          >
            01 BLUEPRINTS {activeSection === 1 && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
          </button>
        </div>
      </div>

      {/* 8. MAIN VIEWPORT CONTAINERS */}
      <main className="w-full">
        {/* VIEWPORT PANEL 00: IMMERSIVE HERO COPY & INTERACTIVE PORTRAIT */}
        <section className="w-full min-h-screen lg:h-screen flex items-center relative px-6 md:px-12 lg:px-24 select-none py-24 lg:py-0">
          <div className="w-full max-w-[90vw] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 pt-16 md:pt-20">
            {/* Left Column: stark typography */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left select-none">
              <span className="text-white/40 text-[9px] tracking-[0.3em] uppercase mb-4 block font-bold">
                [ THE LIVING DIGITAL WORKSPACE ]
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-light leading-none tracking-wide text-white uppercase select-text pr-2 block mb-6 font-sans">
                <InteractiveScrambleText text={info.hero_title} scrambleColor="text-[#00ff66]" />
              </h1>
              <span className="text-white/60 text-[10px] tracking-[0.25em] uppercase mb-6 block font-bold font-mono">
                <InteractiveScrambleText text={info.hero_subtitle} scrambleColor="text-white" />
              </span>
              <p className="text-xs md:text-sm text-white/55 tracking-wider uppercase leading-relaxed max-w-2xl mb-12 select-text font-mono">
                {info.poetry || info.hero_subtitle}
              </p>
              
              <button 
                onClick={() => scrollToPanel(1)}
                className="flex items-center gap-3 text-white/40 hover:text-white cursor-pointer transition-all duration-500 text-[10px] tracking-[0.3em] w-fit focus:outline-none font-bold uppercase"
              >
                DISCOVER BLUEPRINTS <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
              </button>
            </div>

            {/* Right Column: High-Fashion Interactive HUD Portrait */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end select-none">
              <div 
                className="relative w-64 h-[370px] sm:w-72 sm:h-[420px] md:w-80 md:h-[480px] rounded-[2.5rem] md:rounded-[3rem] border border-white/10 bg-[#0c0c0e]/40 p-4 backdrop-blur-md shadow-2xl overflow-hidden group cursor-pointer"
                style={getHeroPortraitStyle()}
              >
                {/* Tactical CAD grid lines overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-[0.06] z-10"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                    backgroundSize: '16px 16px'
                  }}
                />
                
                {/* Tech scanline animation */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-white/20 blur-[1px] animate-scan z-10 pointer-events-none" />

                {/* Corner Crosshairs */}
                <div className="absolute top-4 left-4 z-20 text-white/35 font-bold text-[8px]">+</div>
                <div className="absolute top-4 right-4 z-20 text-white/35 font-bold text-[8px]">+</div>
                <div className="absolute bottom-4 left-4 z-20 text-white/35 font-bold text-[8px]">+</div>
                <div className="absolute bottom-4 right-4 z-20 text-white/35 font-bold text-[8px]">+</div>

                {/* Top Readout */}
                <div className="absolute top-4 left-0 w-full text-center z-20 font-mono text-[7px] text-white/30 uppercase tracking-[0.25em] font-bold">
                  [ IDENTITY: CORE_SOUL_0965 ]
                </div>

                {/* Bottom Readout */}
                <div className="absolute bottom-4 left-0 w-full text-center z-20 font-mono text-[7px] text-white/30 uppercase tracking-[0.25em] font-bold">
                  [ STATUS: ARCHITECT // STABLE ]
                </div>

                {/* Portrait Image Block */}
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative border border-white/5">
                  <img
                    src={avatarUrl}
                    alt={info.hero_title}
                    className="w-full h-full object-cover grayscale contrast-125 scale-100 group-hover:scale-105 group-hover:grayscale-0 group-hover:contrast-110 transition-all duration-700 ease-out"
                  />
                  {/* Neon radial glow behind figure */}
                  <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/10 to-black/80 opacity-60" />
                  
                  {/* Elegant concrete overlay layer */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none mix-blend-overlay" />
                </div>

                {/* Interactive HUD Spec Cards sliding in from sides on hover */}
                <div className="absolute top-1/4 left-6 z-30 transition-all duration-500 transform -translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 bg-[#070707]/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg font-mono text-[7px] uppercase tracking-wider text-left leading-relaxed">
                  <span className="text-white/40 block">[ ORIGIN ]</span>
                  <span className="text-white font-bold">{info.contact_address ? info.contact_address.split(',')[0].trim() : 'BOHOL'}</span>
                </div>

                <div className="absolute bottom-1/4 right-6 z-30 transition-all duration-500 transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 bg-[#070707]/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg font-mono text-[7px] uppercase tracking-wider text-left leading-relaxed">
                  <span className="text-white/40 block">[ DEPTH ]</span>
                  <span className="text-white font-bold">GRID_ENG: 60FPS</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VIEWPORT PANEL 01: STARK OBSIDIAN-CONCRETE PORTRAIT PARALLAX SHOWCASE */}
        <section
          ref={showcaseRef}
          className="w-full min-h-screen py-24 md:py-36 px-6 md:px-12 relative border-t border-white/5 overflow-hidden flex flex-col justify-center select-none"
        >
          {/* Section Heading & Grid Controls */}
          <div className="max-w-[90vw] mx-auto w-full mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 relative z-10">
            <div>
              <span className="text-white/40 text-[9px] tracking-[0.3em] uppercase mb-2 block font-bold">
                [ INDEX 01 // SELECTED BLUEPRINTS ]
              </span>
              <h2 className="text-xl md:text-3xl font-light tracking-wide text-white uppercase font-sans">
                <InteractiveScrambleText text="LIVING ARCHITECTURE SPECIFICATIONS" scrambleColor="text-[#00ff66]" />
              </h2>
            </div>
            <div className="text-[9px] text-white/35 font-mono uppercase tracking-[0.2em] text-left md:text-right">
              // EVOLVING SPATIAL MATRIX<br />
              // HOVER FOR DOF BLUR // CLICK TO DECODE
            </div>
          </div>

          {/* Asymmetrical 5-Column Portrait Grid */}
          <div className="max-w-[90vw] mx-auto w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10 xl:gap-12 relative z-10 items-start min-h-[600px]">
            {projects.map((proj, idx) => {
              const translationY = getTranslationY(idx);
              const isHovered = hoveredIdx === idx;
              const isAnyHovered = hoveredIdx !== null;
              
              // Apply hover-based blurring classes
              let cardClass = "relative w-full aspect-[10/16] rounded-[2.25rem] md:rounded-[2.5rem] overflow-hidden border transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) cursor-pointer group shadow-lg";
              if (isAnyHovered) {
                if (isHovered) {
                  cardClass += " scale-105 opacity-100 grayscale-0 contrast-125 z-20 shadow-[0_0_60px_rgba(255,255,255,0.12)] border-white/40";
                } else {
                  cardClass += " scale-95 opacity-20 blur-[4px] grayscale pointer-events-none border-white/5";
                }
              } else {
                cardClass += " scale-100 opacity-60 grayscale contrast-[1.1] blur-[0.5px] border-white/10 hover:border-white/20";
              }

              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    audio.current?.decode();
                    triggerGlitch();
                    setSelectedProject(proj);
                    setTerminalLog(`DECODING BLUEPRINT ID: [${proj.id.toString().substring(0, 8)}] ... RENDER COMPLETE`);
                  }}
                  onMouseEnter={() => {
                    audio.current?.tick();
                    setHoveredIdx(idx);
                  }}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={cardClass}
                  style={{
                    transform: `translateY(${translationY}px)`,
                  }}
                >
                  {/* Aspect Ratio media element container */}
                  <div className="absolute inset-0 z-0 bg-neutral-950">
                    <OptimizedMedia
                      src={proj.image_url}
                      alt={proj.title}
                      type={proj.media_type}
                    />
                    {/* Contrast backdrop overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  </div>

                  {/* Top CAD Label */}
                  <div className="absolute top-6 left-6 z-10 font-mono text-[7px] text-white/35 uppercase tracking-[0.25em] flex justify-between w-[calc(100%-3rem)] font-bold">
                    <span>GRID_ID: 0{idx+1}</span>
                    <span>{proj.year}</span>
                  </div>

                  {/* Bottom title display */}
                  <div className="absolute bottom-6 left-6 right-6 z-10 transition-all duration-500 transform group-hover:-translate-y-4 group-hover:opacity-0 text-left">
                    <span className="text-[7px] text-white/45 uppercase tracking-widest block mb-1 font-bold">{proj.client}</span>
                    <h3 className="text-[11px] md:text-xs font-light text-white uppercase tracking-wider leading-snug line-clamp-2">
                      {proj.title}
                    </h3>
                  </div>

                  {/* Spec Deck HUD (Slides up on Hover) */}
                  <div className="absolute bottom-6 left-6 right-6 z-30 transition-all duration-500 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 bg-[#070707]/90 backdrop-blur-xl border border-white/15 p-5 rounded-2xl font-mono text-[9px] uppercase tracking-wider text-left leading-relaxed">
                    <div className="text-[7px] text-white/40 mb-2 border-b border-white/10 pb-1.5 flex justify-between font-bold">
                      <span>[ SPECIFICATION DECK ]</span>
                      <span>REF_AXIS_0{idx+1}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div>
                        <span className="text-white/35 block text-[7px]">[ SCALE ]</span>
                        <span className="text-white font-bold">{proj.scale || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-white/35 block text-[7px]">[ LOCATION ]</span>
                        <span className="text-white font-bold truncate block">{proj.location || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-white/35 block text-[7px]">[ MATERIALS ]</span>
                        <span className="text-white font-bold truncate block">{parseMaterials(proj.materials).composition || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="mt-3 text-center text-white/50 text-[7px] group-hover:text-white transition-colors duration-300 font-bold border-t border-white/10 pt-2 flex items-center justify-center gap-1">
                      DECODE SPECIFICATION <ArrowUpRight className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 9. FULL-SCREEN GLASSMORPHIC CONNECT OVERLAY */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl transition-all duration-500 animate-fadeIn">
          <div className="w-full max-w-lg bg-neutral-950/80 border border-white/10 p-8 md:p-10 relative overflow-hidden select-text shadow-2xl">
            {/* Close Trigger */}
            <button
              onClick={() => { audio.current?.click(); setIsContactOpen(false); setTerminalLog('AUTOMATION DRAWER TERMINATED... RETURN TO CORE'); }}
              className="absolute top-6 right-6 p-2 rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white hover:scale-105 transition-all duration-300 cursor-pointer focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-8">
              <span className="text-[9px] tracking-[0.3em] text-white/40 uppercase block mb-1">
                [ LET'S WORK TOGETHER ]
              </span>
              <h3 className="text-lg md:text-xl font-light uppercase tracking-widest text-white font-sans">
                <InteractiveScrambleText text="START AN AUTOMATION" scrambleColor="text-[#00ff66]" />
              </h3>
            </div>

            {/* Direct specs contact deck */}
            <div className="flex flex-col gap-3 text-[10px] text-white/60 mb-8 border-y border-white/5 py-4 font-mono">
              <div className="flex items-center gap-3">
                <Mail className="w-3.5 h-3.5 text-white/40" />
                <a href={`mailto:${info.contact_email}`} className="hover:text-white transition-colors duration-300">{info.contact_email}</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-3.5 h-3.5 text-white/40" />
                <a href={`tel:${info.contact_phone}`} className="hover:text-white transition-colors duration-300">{info.contact_phone}</a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-3.5 h-3.5 text-white/40" />
                <span className="truncate">{info.contact_address}</span>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="YOUR NAME"
                  required
                  disabled={formStatus === 'sending' || formStatus === 'success'}
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300 uppercase font-mono"
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="YOUR EMAIL"
                  required
                  disabled={formStatus === 'sending' || formStatus === 'success'}
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300 font-mono"
                />
              </div>
              <div>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  placeholder="BRIEF YOUR REQUIREMENT / AUTOMATION GOAL"
                  rows={4}
                  required
                  disabled={formStatus === 'sending' || formStatus === 'success'}
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300 resize-none uppercase font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={formStatus === 'sending' || formStatus === 'success'}
                className="w-full flex items-center justify-center gap-2 bg-white text-black py-3.5 px-4 font-bold tracking-widest text-xs hover:bg-neutral-200 transition-all duration-300 disabled:bg-neutral-600 disabled:text-neutral-400 rounded cursor-pointer focus:outline-none font-mono"
              >
                {formStatus === 'idle' && (
                  <>SEND ENQUIRY <Send className="w-3.5 h-3.5" /></>
                )}
                {formStatus === 'sending' && (
                  <>SENDING MESSAGE...</>
                )}
                {formStatus === 'success' && (
                  <>SENT SUCCESSFULLY <Check className="w-3.5 h-3.5" /></>
                )}
                {formStatus === 'error' && (
                  <>SUBMISSION ERROR</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 10. FULL-SCREEN OBSIDIAN STRUCTURAL DETAIL DRAWER */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-[#030303]/98 backdrop-blur-3xl overflow-y-auto p-4 md:p-12 lg:p-16 flex items-start md:items-center justify-center animate-fadeIn select-text">
          <div className="w-full max-w-6xl bg-neutral-950/80 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-12 my-auto mt-12 md:mt-0 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch min-h-[75vh]">
            {/* Decorative Blueprint grid background */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />
            
            {/* Close Trigger */}
            <button
              onClick={() => { audio.current?.swoop(); triggerGlitch(); setSelectedProject(null); setTerminalLog('SYSTEM RESET... IDLE CAM SENSOR ON'); }}
              className="absolute top-6 right-6 p-2 rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white hover:scale-110 transition-all duration-300 cursor-pointer focus:outline-none z-30"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left panel: CAD data display & details */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between z-10">
              <div>
                <div className="flex gap-4 text-[9px] tracking-[0.25em] text-white/40 mb-6 uppercase font-bold border-b border-white/5 pb-4 mt-4 lg:mt-0">
                  <span>[ SYSTEM SPECIFICATION ]</span>
                  <span>{selectedProject.client}</span>
                  <span>/</span>
                  <span>{selectedProject.year}</span>
                </div>

                <h3 className="text-xl md:text-4xl font-light tracking-wide text-white uppercase mb-6 md:mb-8 leading-snug font-sans">
                  <InteractiveScrambleText text={selectedProject.title} scrambleColor="text-[#00ff66]" />
                </h3>

                <p className="text-xs md:text-sm tracking-wider text-white/70 leading-relaxed mb-6 md:mb-8 uppercase font-mono max-w-lg">
                  {selectedProject.description}
                </p>

                {/* Expanded Engineering Specs Matrix */}
                {(() => {
                  const specs = parseMaterials(selectedProject.materials);
                  return (
                    <div className="grid grid-cols-2 gap-4 md:gap-6 border-t border-b border-white/10 py-6 md:py-8 mb-6 md:mb-8 uppercase text-[10px] tracking-wider font-mono">
                      <div>
                        <span className="text-white/35 block text-[7px] mb-1.5">[ DRAFTING SCALE ]</span>
                        <span className="text-white font-bold">{selectedProject.scale || '1:100'}</span>
                      </div>
                      <div>
                        <span className="text-white/35 block text-[7px] mb-1.5">[ COORDINATES / LOC ]</span>
                        <span className="text-white font-bold truncate block">{selectedProject.location || 'BOHOL, PH'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-white/35 block text-[7px] mb-1.5">[ EXTRACTED MATERIAL COMPOSITION ]</span>
                        <span className="text-white font-bold leading-relaxed">{specs.composition || 'RAW CONCRETE / GLASS'}</span>
                      </div>
                      <div className="col-span-2 border-t border-white/5 pt-4 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-white/35 block text-[7px] mb-1.5">[ STRUCTURAL DENSITY ]</span>
                          <span className="text-white/60">{specs.density}</span>
                        </div>
                        <div>
                          <span className="text-white/35 block text-[7px] mb-1.5">[ THERMAL RESISTANCE ]</span>
                          <span className="text-white/60">{specs.thermal}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 border-t border-white/5 pt-6 mb-6 lg:mb-0">
                <a
                  href={selectedProject.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-[10px] tracking-[0.25em] text-black bg-white hover:bg-neutral-200 py-3.5 rounded font-bold transition-all duration-300 uppercase flex items-center justify-center gap-2"
                >
                  VIEW HIGH-RES BLUEPRINT <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => { audio.current?.swoop(); triggerGlitch(); setSelectedProject(null); setTerminalLog('SYSTEM RESET... IDLE CAM SENSOR ON'); }}
                  className="flex-1 text-center text-[10px] tracking-[0.25em] text-white border border-white/10 hover:border-white/30 hover:bg-white/5 py-3.5 rounded font-bold transition-all duration-300 uppercase"
                >
                  CLOSE DOCUMENT
                </button>
              </div>
            </div>

            {/* Right panel: Blueprint visual block */}
            <div className="w-full lg:w-1/2 flex items-center justify-center z-10 relative">
              <div className="w-full h-full min-h-[250px] sm:min-h-[350px] lg:min-h-0 bg-neutral-900 border border-white/10 overflow-hidden relative rounded-[1.25rem] md:rounded-2xl group flex items-center justify-center">
                <OptimizedMedia
                  src={selectedProject.image_url}
                  alt={selectedProject.title}
                  type={selectedProject.media_type}
                />
                {/* Subtle blueprint lines overlay */}
                <div className="absolute inset-0 pointer-events-none border border-white/10" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. CHROMATIC GLITCH SCANLINE OVERLAY */}
      {isGlitching && (
        <div className="fixed inset-0 z-[999] pointer-events-none bg-black/10 animate-glitch-overlay mix-blend-screen flex flex-col justify-between p-6">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(0,255,102,0.15)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00ff66]/15 to-transparent animate-scanlines" />
          <div className="absolute inset-0 flex flex-col justify-center items-center gap-4 text-center">
            <div className="text-[9px] tracking-[0.4em] text-[#00ff66] font-mono font-bold uppercase animate-bounce">
              -- CHROMATIC ABERRATION ACTIVE --
            </div>
            <div className="text-[12px] tracking-[0.2em] text-white font-mono uppercase bg-black/85 px-4 py-2 border border-[#00ff66]/30">
              [ DATA SCANLINE GLITCH ]
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
