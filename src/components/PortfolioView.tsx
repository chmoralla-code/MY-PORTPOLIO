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
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  public isMuted: boolean = true;

  constructor() {
    // Web Audio API context initialized on first user interaction
  }

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    this.ctx = new AudioContextClass();
    
    // Create deep architectural hum (60Hz structural ambient drone)
    this.ambientOsc = this.ctx.createOscillator();
    this.ambientGain = this.ctx.createGain();
    const lpFilter = this.ctx.createBiquadFilter();

    lpFilter.type = 'lowpass';
    lpFilter.frequency.setValueAtTime(90, this.ctx.currentTime);

    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A hum

    this.ambientGain.gain.setValueAtTime(0.0, this.ctx.currentTime); // Start muted

    this.ambientOsc.connect(lpFilter);
    lpFilter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);
    
    this.ambientOsc.start();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.init();
    
    if (!this.ctx || !this.ambientGain) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const targetGain = muted ? 0.0 : 0.012; // Extremely soft background level
    this.ambientGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.4);
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
}

export default function PortfolioView({ initialInfo, initialProjects }: PortfolioViewProps) {
  const lenis = useLenis();
  const audio = useRef<SonicEngine | null>(null);

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

  const [projects] = useState<Project[]>(initialProjects || []);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

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

  // 1. Initialize Audio Engine
  useEffect(() => {
    audio.current = new SonicEngine();
  }, []);

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

  // 3. Dynamic Cursor Tracker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 4. Scroll monitoring for navigation rails & dynamic viewport swoops
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const windowHeight = window.innerHeight;
      const current = Math.round(scrollPos / windowHeight);
      
      if (current !== activeSection) {
        setActiveSection(current);
        audio.current?.tick(); // Soft tick on slide snapping
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audio.current?.setMuted(nextMuted);
    audio.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.details) return;

    audio.current?.click();
    setFormStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Message dispatch failed');

      setFormStatus('success');
      audio.current?.swoop();
      setFormData({ name: '', email: '', details: '' });
      setTimeout(() => {
        setFormStatus('idle');
        setIsContactOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Contact submission error:', err);
      setFormStatus('error');
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
    if (activeSection === 1) return 'SCALE 1:25 [FOUNDATION]';
    if (activeSection === 2) return 'SCALE 1:100 [STRUCTURAL]';
    if (activeSection === 3) return 'SCALE 1:250 [TOPOLOGICAL]';
    return `SCALE 1:${activeSection * 125} [MACRO GRID]`;
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
            <span>CYRHIEL MORALLA // ARCHITECT</span>
            <span>{loadProgress}% LOADED</span>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC CUSTOM INTERACTIVE CURSOR */}
      <div 
        className={`fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/45 hidden lg:block transition-all duration-300 ease-out ${
          isCursorHovering ? 'w-20 h-20 bg-white/5 border-white border-dashed scale-110 blur-[1px]' : 'w-7 h-7'
        }`}
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`
        }}
      >
        <div className="absolute inset-0 m-auto w-1 h-1 bg-white rounded-full" />
      </div>

      {/* 3. DYNAMIC CSS PHOTOGRAPHIC NOISE / GRAIN COVER */}
      <div className="fixed inset-0 pointer-events-none z-40 opacity-[0.02] bg-noise bg-repeat" />

      {/* 4. GPU-ACCELERATED WEBGL GEOMETRIC ENVIRONMENT */}
      <BackgroundCanvas />

      {/* 5. TOP HUD VIEWPORT HEADER (MAGNETIC HOVER STATE ACTIVE) */}
      <header className="fixed top-0 left-0 w-full z-30 flex justify-between items-center px-6 py-6 md:px-12 md:py-8 pointer-events-none">
        <div className="pointer-events-auto">
          <button 
            onClick={() => scrollToPanel(0)}
            className="font-bold text-xs uppercase tracking-[0.35em] text-white/80 hover:text-white transition-colors duration-300 focus:outline-none"
          >
            CYRHIEL MORALLA
          </button>
        </div>
        
        {/* Sound toggle & Let's talk */}
        <div className="pointer-events-auto flex items-center gap-4">
          <button
            onClick={toggleSound}
            className="text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded border border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/30 text-white/60 hover:text-white transition-all duration-300 flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            {isMuted ? <><VolumeX className="w-3.5 h-3.5" /> MUTED</> : <><Volume2 className="w-3.5 h-3.5 animate-pulse" /> SONIC</>}
          </button>
          <button
            onClick={() => { audio.current?.click(); setIsContactOpen(true); }}
            className="text-[9px] md:text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full border border-white/20 bg-black/40 hover:bg-white hover:text-black hover:border-white hover:scale-105 transition-all duration-500 flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            LET'S TALK <ArrowUpRight className="w-3.5 h-3.5" />
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
        <div className="pointer-events-auto hidden md:block">
          <span className="text-[9px] tracking-[0.25em] text-white/30 uppercase font-bold">
            [ COORDINATES CELL ] {loadCoords}
          </span>
        </div>
        <div className="pointer-events-auto">
          <span className="text-[9px] tracking-[0.25em] text-white/50 uppercase font-bold">
            {getDraftingScale()}
          </span>
        </div>
      </div>

      {/* 7. DYNAMIC PAGINATION RAIL (DRAFTING MEASURING SCALE RULER) */}
      <div className="fixed top-1/2 right-6 md:right-12 z-35 -translate-y-1/2 flex flex-col items-end gap-6 pointer-events-none select-none">
        <div className="h-[200px] w-[1px] bg-white/10 relative mb-4 hidden lg:block">
          {/* Moving depth slider dot */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border border-black rounded-full transition-all duration-700 ease-out"
            style={{ top: `${(activeSection / Math.max(projects.length, 1)) * 100}%` }}
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
          
          {projects.map((proj, idx) => (
            <button
              key={proj.id}
              onClick={() => scrollToPanel(idx + 1)}
              className={`text-[9px] tracking-[0.2em] transition-all duration-500 flex items-center gap-2 cursor-pointer focus:outline-none uppercase ${
                activeSection === idx + 1 ? 'text-white scale-110 font-bold' : 'text-white/30 hover:text-white/60'
              }`}
            >
              {(idx + 1).toString().padStart(2, '0')} {proj.title.substring(0, 10)}... {activeSection === idx + 1 && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* 8. MAIN VIEWPORT CONTAINERS */}
      <main className="w-full">
        {/* VIEWPORT PANEL 00: IMMERSIVE HERO COPY */}
        <section className="w-full h-screen flex flex-col justify-center relative px-6 md:px-24 select-none">
          <div className="max-w-4xl z-10 select-none">
            <span className="text-white/40 text-[9px] tracking-[0.3em] uppercase mb-4 block font-bold">
              [ THE LIVING DIGITAL WORKSPACE ]
            </span>
            <h1 className="text-3xl md:text-6xl font-light leading-tight tracking-wide text-white uppercase select-text pr-2 block mb-6 font-sans">
              CYRHIEL MORALLA // FRESH GRADUATE
            </h1>
            <p className="text-sm md:text-base text-white/55 tracking-wider uppercase leading-relaxed max-w-2xl mb-12 select-text font-mono">
              {info.poetry || info.hero_subtitle}
            </p>
            
            <button 
              onClick={() => scrollToPanel(1)}
              className="flex items-center gap-3 text-white/40 hover:text-white cursor-pointer transition-all duration-500 text-[10px] tracking-[0.3em] w-fit focus:outline-none font-bold uppercase"
            >
              DISCOVER BLUEPRINTS <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            </button>
          </div>
        </section>

        {/* VIEWPORT PANELS 01+: DYNAMIC ASYMMETRICAL SPLIT-SCREEN REVEALS */}
        {projects.map((proj, idx) => (
          <section
            key={proj.id}
            className="w-full h-screen flex flex-col justify-end md:justify-center relative px-6 md:px-24 py-16 border-t border-white/5 overflow-hidden select-none"
          >
            {/* Background Geometric Indexes */}
            <div className="absolute top-24 left-10 md:left-24 font-bold text-[18vw] text-white/[0.015] select-none leading-none z-0 tracking-tighter">
              {(idx + 1).toString().padStart(2, '0')}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center z-10 w-full relative">
              {/* Left Column: Asymmetrical Editorial Copy & Specifications Grid */}
              <div 
                className="lg:col-span-5 flex flex-col justify-center select-text order-2 lg:order-1 transition-all duration-1000"
                style={{
                  transform: activeSection === idx + 1 ? 'translateY(0)' : 'translateY(30px)',
                  opacity: activeSection === idx + 1 ? 1 : 0
                }}
              >
                <div className="flex gap-4 text-[9px] tracking-[0.25em] text-white/40 mb-4 uppercase font-bold">
                  <span>{proj.client}</span>
                  <span>/</span>
                  <span>{proj.year}</span>
                </div>
                
                <h2 className="text-xl md:text-3xl font-light tracking-wide text-white uppercase mb-6 leading-snug font-sans">
                  {proj.title}
                </h2>
                
                <p className="text-xs md:text-sm tracking-wider text-white/60 leading-relaxed mb-8 uppercase max-w-md font-mono">
                  {proj.description}
                </p>

                {/* Technical Specifications Matrix Grid */}
                <div className="grid grid-cols-2 gap-4 border-t border-b border-white/10 py-6 mb-8 uppercase text-[10px] tracking-wider font-mono">
                  <div>
                    <span className="text-white/35 block text-[8px] mb-1">[ SCALE ]</span>
                    <span className="text-white font-bold">{proj.scale || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-white/35 block text-[8px] mb-1">[ LOCATION ]</span>
                    <span className="text-white font-bold">{proj.location || 'N/A'}</span>
                  </div>
                  <div className="col-span-2 mt-2">
                    <span className="text-white/35 block text-[8px] mb-1">[ MATERIALS MATRIX ]</span>
                    <span className="text-white font-bold">{proj.materials || 'N/A'}</span>
                  </div>
                </div>

                <a
                  href={proj.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] tracking-[0.25em] text-white flex items-center gap-2 hover:text-white/60 w-fit transition-colors duration-300 font-bold"
                >
                  FULL RENDER SPEC <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              {/* Right Column: Visual Frame featuring Aspect-Ratio Shift Protection */}
              <div 
                className="lg:col-span-7 flex justify-center items-center order-1 lg:order-2 transition-all duration-1000"
                style={{
                  transform: activeSection === idx + 1 ? 'translateY(0)' : 'translateY(-30px)',
                  opacity: activeSection === idx + 1 ? 1 : 0
                }}
                onMouseEnter={() => setIsCursorHovering(true)}
                onMouseLeave={() => setIsCursorHovering(false)}
              >
                <div className="w-full aspect-[16/10] shadow-2xl bg-neutral-950 overflow-hidden relative group">
                  <OptimizedMedia
                    src={proj.image_url}
                    alt={proj.title}
                    type={proj.media_type}
                  />
                  {/* Subtle technical zoom lens frame overlay */}
                  <div className="absolute inset-0 pointer-events-none border border-white/10 group-hover:border-white/20 transition-all duration-500" />
                  <div className="absolute top-4 right-4 text-[8px] bg-black/60 px-2.5 py-1 border border-white/10 font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 uppercase">
                    [ VIEW SPECIFICATIONS ]
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </main>

      {/* 9. FULL-SCREEN GLASSMORPHIC CONNECT OVERLAY */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl transition-all duration-500 animate-fadeIn">
          <div className="w-full max-w-lg bg-neutral-950/80 border border-white/10 p-8 md:p-10 relative overflow-hidden select-text shadow-2xl">
            {/* Close Trigger */}
            <button
              onClick={() => { audio.current?.click(); setIsContactOpen(false); }}
              className="absolute top-6 right-6 p-2 rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white hover:scale-105 transition-all duration-300 cursor-pointer focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-8">
              <span className="text-[9px] tracking-[0.3em] text-white/40 uppercase block mb-1">
                [ LET'S WORK TOGETHER ]
              </span>
              <h3 className="text-lg md:text-xl font-light uppercase tracking-widest text-white font-sans">
                START AN AUTOMATION
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
    </div>
  );
}
