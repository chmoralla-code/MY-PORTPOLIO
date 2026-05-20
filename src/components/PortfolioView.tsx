'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDown, Mail, Phone, MapPin, Send, Check, X } from 'lucide-react';
import BackgroundCanvas from './BackgroundCanvas';
import OptimizedMedia from './OptimizedMedia';
import type { PortfolioInfo, Project } from '@/lib/supabase';
import { useLenis } from 'lenis/react';

interface PortfolioViewProps {
  initialInfo: PortfolioInfo | null;
  initialProjects: Project[];
}

export default function PortfolioView({ initialInfo, initialProjects }: PortfolioViewProps) {
  const lenis = useLenis();
  const [info] = useState<PortfolioInfo>(
    initialInfo || {
      id: 1,
      hero_title: 'CYRHIEL MORALLA',
      hero_subtitle: 'MY GOAL IS TO MAKE YOUR BUSINESS MAKE MORE MONEY THRU AUTOMATION',
      about_text: 'MY GOAL IS TO MAKE YOUR BUSINESS MAKE MORE MONEY THRU AUTOMATION',
      contact_email: 'cyrhielmaot@gmail.com',
      contact_phone: '09505339963',
      contact_address: 'BOHOL, TAGBILARAN CITY, UBUJAN 6300'
    }
  );
  
  const [projects] = useState<Project[]>(initialProjects || []);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0); // 0 = Hero, 1+ = Projects
  const [typewriterText, setTypewriterText] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', details: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Typewriter effect for the floated poetic block of text
  useEffect(() => {
    const fullText = info.hero_subtitle || info.about_text;
    let idx = 0;
    setTypewriterText('');
    
    const interval = setInterval(() => {
      if (idx < fullText.length) {
        setTypewriterText((prev) => prev + fullText.charAt(idx));
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 40); // Typewriter speed

    return () => clearInterval(interval);
  }, [info.hero_subtitle, info.about_text]);

  // Track scroll position to update active index in navigation rail
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const windowHeight = window.innerHeight;
      const current = Math.round(scrollPos / windowHeight);
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.details) return;

    setFormStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Message dispatch failed');

      setFormStatus('success');
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
    if (lenis) {
      lenis.scrollTo(idx * window.innerHeight);
    } else {
      window.scrollTo({
        top: idx * window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-white selection:bg-white selection:text-black antialiased overflow-x-hidden font-mono">
      {/* Dynamic CSS Photographic Noise/Grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-noise bg-repeat" />

      {/* 3D WEBGL GRAPHICS ENVIRONMENT */}
      <BackgroundCanvas />

      {/* TOP HEADER HUD NAVIGATION */}
      <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-6 py-6 md:px-12 md:py-8 bg-gradient-to-b from-black/80 via-transparent to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <button 
            onClick={() => scrollToPanel(0)}
            className="font-bold text-xs uppercase tracking-[0.3em] text-white/90 hover:text-white transition-colors duration-300 focus:outline-none"
          >
            CYRHIEL MORALLA
          </button>
        </div>
        <div className="pointer-events-auto">
          <button
            onClick={() => setIsContactOpen(true)}
            className="text-[10px] md:text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full border border-white/20 bg-black/40 hover:bg-white hover:text-black hover:border-white hover:scale-105 transition-all duration-500 flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            LET'S TALK <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* BOTTOM LEFT SOCIALS DECORATIVE DECK */}
      <div className="fixed bottom-0 left-0 z-40 p-6 md:p-12 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none hidden md:block">
        <div className="flex gap-8 pointer-events-auto text-[10px] tracking-[0.2em] text-white/40">
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300 uppercase">LINKEDIN</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300 uppercase">INSTAGRAM</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300 uppercase">TWITTER</a>
        </div>
      </div>

      {/* RIGHT SIDEBAR MINI INDEX RAIL */}
      <div className="fixed top-1/2 right-6 md:right-12 z-40 -translate-y-1/2 flex flex-col items-center gap-6 pointer-events-none">
        <div className="flex flex-col gap-4 pointer-events-auto items-center">
          {/* Index 00: Intro */}
          <button
            onClick={() => scrollToPanel(0)}
            className={`text-[10px] tracking-widest transition-all duration-500 flex items-center gap-2 cursor-pointer focus:outline-none ${
              activeSection === 0 ? 'text-white scale-110 font-bold' : 'text-white/30 hover:text-white/60'
            }`}
          >
            00 {activeSection === 0 && <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />}
          </button>
          
          {/* Indices 01, 02...: Projects */}
          {projects.map((proj, idx) => (
            <button
              key={proj.id}
              onClick={() => scrollToPanel(idx + 1)}
              className={`text-[10px] tracking-widest transition-all duration-500 flex items-center gap-2 cursor-pointer focus:outline-none ${
                activeSection === idx + 1 ? 'text-white scale-110 font-bold' : 'text-white/30 hover:text-white/60'
              }`}
            >
              {(idx + 1).toString().padStart(2, '0')} {activeSection === idx + 1 && <span className="w-1.5 h-1.5 bg-white rounded-full inline-block" />}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN VIEWPORT PANELS CONTAINER */}
      <main className="w-full">
        {/* VIEWPORT PANEL 00: POETIC TEXT ENTRY */}
        <section className="w-full h-screen flex flex-col justify-center relative px-6 md:px-24 select-none">
          {/* Coordinates HUD Grid */}
          <div className="absolute top-24 left-1/4 h-[70vh] w-[1px] bg-white/[0.02] hidden lg:block" />
          <div className="absolute top-1/3 left-12 w-[80vw] h-[1px] bg-white/[0.02] hidden lg:block" />
          
          <div className="max-w-3xl mt-12 z-10 select-none">
            <div className="min-h-[140px] md:min-h-[180px] select-text">
              <p className="text-white/40 text-[10px] tracking-[0.25em] uppercase mb-4">
                [ VISION & AUTOMATION STATEMENT ]
              </p>
              <h1 className="text-xl md:text-4xl font-light leading-relaxed tracking-wide text-white uppercase select-text typewriter-cursor pr-2 inline-block">
                {typewriterText}
              </h1>
            </div>
            
            <button 
              onClick={() => scrollToPanel(1)}
              className="mt-16 md:mt-24 flex items-center gap-3 text-white/40 hover:text-white cursor-pointer transition-all duration-500 text-[10px] tracking-[0.2em] w-fit focus:outline-none"
            >
              DISCOVER WORKS <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            </button>
          </div>
        </section>

        {/* VIEWPORT PANELS 01+: DYNAMIC PROJECTS SLIDER */}
        {projects.map((proj, idx) => (
          <section
            key={proj.id}
            className="w-full h-screen flex flex-col justify-end md:justify-center relative px-6 md:px-24 py-16 border-t border-white/5 overflow-hidden select-none"
          >
            {/* HUD Gridlines */}
            <div className="absolute inset-0 border-x border-white/[0.01] pointer-events-none mx-24 hidden lg:block" />

            {/* Giant Geometric Background Indexing */}
            <div className="absolute top-20 left-10 md:left-24 font-bold text-[14vw] text-white/[0.015] select-none leading-none z-0 tracking-tighter">
              {(idx + 1).toString().padStart(2, '0')}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center z-10 w-full">
              {/* Left Column: Technical Metadata Block */}
              <div className="lg:col-span-4 flex flex-col justify-center select-text order-2 lg:order-1">
                <div className="flex gap-4 text-[10px] tracking-widest text-white/40 mb-3 uppercase font-bold">
                  <span>{proj.client}</span>
                  <span>/</span>
                  <span>{proj.year}</span>
                </div>
                <h2 className="text-xl md:text-3xl font-light tracking-wide text-white uppercase mb-4 leading-snug">
                  {proj.title}
                </h2>
                <p className="text-xs md:text-sm tracking-wider text-white/60 leading-relaxed max-w-sm mb-8 uppercase">
                  {proj.description}
                </p>
                <a
                  href={proj.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] tracking-[0.25em] text-white flex items-center gap-2 hover:text-white/60 w-fit transition-colors duration-300 font-bold"
                >
                  FULL RESOLUTION <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              {/* Right Column: Visual Frame */}
              <div className="lg:col-span-8 flex justify-center items-center order-1 lg:order-2">
                <div className="w-full aspect-[16/10] shadow-2xl bg-neutral-900 overflow-hidden">
                  <OptimizedMedia
                    src={proj.image_url}
                    alt={proj.title}
                    type={proj.media_type}
                  />
                </div>
              </div>
            </div>
          </section>
        ))}
      </main>

      {/* FULL-SCREEN GLASSMORPHIC CONNECT OVERLAY */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl transition-all duration-500 animate-fadeIn">
          <div className="w-full max-w-lg bg-neutral-950/80 border border-white/10 p-8 md:p-10 relative overflow-hidden select-text shadow-2xl">
            {/* Subtle glow nodes */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/[0.03] rounded-full blur-[80px]" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-white/[0.03] rounded-full blur-[80px]" />

            {/* Close Trigger */}
            <button
              onClick={() => setIsContactOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white hover:scale-105 transition-all duration-300 cursor-pointer focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-8">
              <span className="text-[9px] tracking-[0.3em] text-white/40 uppercase block mb-1">
                [ LET'S CONNECT ]
              </span>
              <h3 className="text-lg md:text-xl font-light uppercase tracking-widest text-white">
                START AN AUTOMATION
              </h3>
            </div>

            {/* Direct Contact Blocks */}
            <div className="flex flex-col gap-3 text-xs text-white/60 mb-8 border-y border-white/5 py-4 font-mono">
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

            {/* Monospace Message Form */}
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
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300 uppercase"
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
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300"
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
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300 resize-none uppercase"
                />
              </div>

              {/* Status Submission Button */}
              <button
                type="submit"
                disabled={formStatus === 'sending' || formStatus === 'success'}
                className="w-full flex items-center justify-center gap-2 bg-white text-black py-3.5 px-4 font-bold tracking-widest text-xs hover:bg-neutral-200 transition-all duration-300 disabled:bg-neutral-600 disabled:text-neutral-400 rounded cursor-pointer focus:outline-none"
              >
                {formStatus === 'idle' && (
                  <>SEND ENQUIRY <Send className="w-3.5 h-3.5" /></>
                )}
                {formStatus === 'sending' && (
                  <>SENDING...</>
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
