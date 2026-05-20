'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, RefreshCw, AlertTriangle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Authentication failed');
      }

      // Route to admin control panel
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col items-center justify-center font-mono selection:bg-white selection:text-black relative p-4 overflow-hidden">
      {/* Moving CSS Noise Grain */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-noise bg-repeat" />
      
      {/* Decorative Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-sm bg-neutral-950/80 border border-white/10 p-8 md:p-10 rounded relative z-10 shadow-2xl">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/[0.02] rounded-full blur-[80px]" />
        
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white/80" />
          </div>
          <div>
            <span className="text-[9px] tracking-[0.35em] text-white/40 block mb-1 uppercase">[ SYSTEM ACCESS ]</span>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">ADMIN LOGIN CONTROL</h2>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold flex items-center gap-1.5">
              <User className="w-3 h-3 text-white/30" /> USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ENTER USERNAME"
              required
              disabled={status === 'loading'}
              className="bg-white/5 border border-white/10 rounded px-3.5 py-3 text-white focus:outline-none focus:border-white focus:bg-white/10 transition-all text-xs"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-white/30" /> PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER PASSWORD"
              required
              disabled={status === 'loading'}
              className="bg-white/5 border border-white/10 rounded px-3.5 py-3 text-white focus:outline-none focus:border-white focus:bg-white/10 transition-all text-xs"
            />
          </div>

          {status === 'error' && (
            <div className="mt-2 bg-red-950/20 border border-red-500/20 rounded p-3 flex items-start gap-2.5 text-[10px] text-red-400 font-bold uppercase tracking-wider leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-2 mt-4 bg-white text-black py-3.5 px-4 font-bold tracking-widest text-xs hover:bg-neutral-200 transition-all rounded disabled:bg-neutral-600 disabled:text-neutral-400 cursor-pointer focus:outline-none uppercase"
          >
            {status === 'loading' ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> AUTHENTICATING...</>
            ) : (
              'ESTABLISH SESSION'
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-[9px] text-white/20 tracking-[0.2em] z-10 text-center uppercase">
        SECURED SHELL CONNECTION // SYSTEM LEVEL 01
      </div>
    </div>
  );
}
