'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, Image as ImageIcon, Inbox, LogOut, Save, Plus, 
  Trash2, UploadCloud, CheckCircle, RefreshCw, Eye, User 
} from 'lucide-react';
import type { PortfolioInfo, Project, ContactMessage } from '@/lib/supabase';

interface AdminDashboardProps {
  initialInfo: PortfolioInfo | null;
  initialProjects: Project[];
  initialMessages: ContactMessage[];
}

export default function AdminDashboard({ initialInfo, initialProjects, initialMessages }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'copy' | 'gallery' | 'inbox'>('copy');
  
  // Dashboard states
  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages || []);
  
  // Form states - Copy
  const [copyData, setCopyData] = useState({
    hero_title: initialInfo?.hero_title || '',
    hero_subtitle: initialInfo?.hero_subtitle || '',
    about_text: initialInfo?.about_text || '',
    contact_email: initialInfo?.contact_email || '',
    contact_phone: initialInfo?.contact_phone || '',
    contact_address: initialInfo?.contact_address || '',
    telegram_bot_token: initialInfo?.telegram_bot_token || '',
    telegram_chat_id: initialInfo?.telegram_chat_id || ''
  });
  const [copyStatus, setCopyStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Form states - Project
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    year: new Date().getFullYear(),
    client: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');

  // Delete project states
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Unread messages count
  const unreadCount = messages.filter(m => !m.read).length;

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/admin/login');
        router.refresh();
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const handleCopyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCopyData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCopyStatus('saving');
    try {
      const res = await fetch('/api/admin/copy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copyData)
      });
      if (!res.ok) throw new Error('Save copy failed');
      
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2500);
    } catch (err) {
      console.error('Error saving copy:', err);
      setCopyStatus('error');
    }
  };

  // Drag and drop file zone helpers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadStatus('error');
      setUploadError('Please select a media file to upload.');
      return;
    }

    setUploadStatus('uploading');
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', projectData.title);
      formData.append('description', projectData.description);
      formData.append('year', projectData.year.toString());
      formData.append('client', projectData.client);

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'File upload failed');
      }

      const data = await res.json();
      
      // Update local projects state
      setProjects(prev => [data.project[0], ...prev]);
      
      // Reset form
      setProjectData({
        title: '',
        description: '',
        year: new Date().getFullYear(),
        client: ''
      });
      setSelectedFile(null);
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 2500);
    } catch (err: any) {
      console.error('Project upload error:', err);
      setUploadStatus('error');
      setUploadError(err.message || 'Upload failed');
    }
  };

  const handleDeleteProject = async (id: string, imageUrl: string) => {
    setDeletingId(id);
    try {
      const res = await fetch('/api/admin/project-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, imageUrl })
      });
      
      if (!res.ok) throw new Error('Deletion failed');

      // Update state
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error('Delete project error:', e);
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/admin/messages-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
      }
    } catch (e) {
      console.error('Error marking message read:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col font-mono selection:bg-white selection:text-black">
      {/* HUD Header Dashboard */}
      <header className="border-b border-white/10 bg-black/80 sticky top-0 z-30 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-white/90">
            CYRHIEL MORALLA PANEL
          </span>
        </div>
        <button 
          onClick={handleLogout}
          className="text-[9px] md:text-xs uppercase tracking-widest text-white/60 hover:text-white flex items-center gap-2 px-3 py-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer focus:outline-none"
        >
          LOGOUT <LogOut className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Control Panel Grid Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-56 flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('copy')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded text-[10px] tracking-widest text-left transition-all duration-300 focus:outline-none uppercase ${
              activeTab === 'copy' 
                ? 'bg-white text-black font-bold' 
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" /> Manage Copy
          </button>
          
          <button
            onClick={() => setActiveTab('gallery')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded text-[10px] tracking-widest text-left transition-all duration-300 focus:outline-none uppercase ${
              activeTab === 'gallery' 
                ? 'bg-white text-black font-bold' 
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Project Gallery
          </button>
          
          <button
            onClick={() => setActiveTab('inbox')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded text-[10px] tracking-widest text-left transition-all duration-300 focus:outline-none uppercase ${
              activeTab === 'inbox' 
                ? 'bg-white text-black font-bold' 
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-3"><Inbox className="w-4 h-4" /> Client Inbox</span>
            {unreadCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                activeTab === 'inbox' ? 'bg-black text-white' : 'bg-white text-black'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        </aside>

        {/* Dynamic Panel Content */}
        <section className="flex-1 bg-black/40 border border-white/10 p-6 md:p-8 rounded min-h-[500px]">
          
          {/* TAB 1: MANAGE PORTFOLIO COPY */}
          {activeTab === 'copy' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] border-b border-white/5 pb-2 mb-3">MANAGE PORTFOLIO COPY</h2>
                <p className="text-[9px] text-white/40 leading-relaxed uppercase">Instantly update the general texts, contact details, email addresses, and automated Telegram channel alerts.</p>
              </div>

              <form onSubmit={handleCopySubmit} className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold">HERO TITLE</label>
                    <input
                      type="text"
                      name="hero_title"
                      value={copyData.hero_title}
                      onChange={handleCopyChange}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-white focus:bg-white/10 uppercase transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold">CONTACT EMAIL</label>
                    <input
                      type="email"
                      name="contact_email"
                      value={copyData.contact_email}
                      onChange={handleCopyChange}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-white focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold">CONTACT PHONE</label>
                    <input
                      type="text"
                      name="contact_phone"
                      value={copyData.contact_phone}
                      onChange={handleCopyChange}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-white focus:bg-white/10 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold">CONTACT ADDRESS</label>
                    <input
                      type="text"
                      name="contact_address"
                      value={copyData.contact_address}
                      onChange={handleCopyChange}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-white focus:bg-white/10 uppercase transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold">HOMEPAGE TYPED POETIC STATEMENT</label>
                  <textarea
                    name="hero_subtitle"
                    rows={3}
                    value={copyData.hero_subtitle}
                    onChange={handleCopyChange}
                    className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-white focus:bg-white/10 resize-none uppercase transition-all leading-relaxed"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold">BIOGRAPHY TEXT (ABOUT BLOCK)</label>
                  <textarea
                    name="about_text"
                    rows={4}
                    value={copyData.about_text}
                    onChange={handleCopyChange}
                    className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-white focus:bg-white/10 resize-none uppercase transition-all leading-relaxed"
                  />
                </div>

                <div className="border-t border-white/10 pt-4 mt-2">
                  <h3 className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-3">[ TELEGRAM ALERTS AUTOMATION ]</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold">TELEGRAM BOT TOKEN</label>
                      <input
                        type="password"
                        name="telegram_bot_token"
                        value={copyData.telegram_bot_token}
                        onChange={handleCopyChange}
                        placeholder="ENTER BOT TOKEN"
                        className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-white focus:bg-white/10 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold">TELEGRAM CHAT ID</label>
                      <input
                        type="text"
                        name="telegram_chat_id"
                        value={copyData.telegram_chat_id}
                        onChange={handleCopyChange}
                        placeholder="ENTER CHAT ID"
                        className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-white focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={copyStatus === 'saving'}
                  className="w-full flex items-center justify-center gap-2 mt-4 bg-white text-black py-3 px-4 font-bold tracking-widest hover:bg-neutral-200 transition-all rounded disabled:bg-neutral-600 disabled:text-neutral-400 cursor-pointer focus:outline-none"
                >
                  {copyStatus === 'saving' ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> SAVING...</>
                  ) : copyStatus === 'success' ? (
                    <><CheckCircle className="w-3.5 h-3.5 text-green-600" /> COPIES SAVED INSTANTLY</>
                  ) : (
                    <><Save className="w-3.5 h-3.5" /> SAVE CHANGES</>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: PROJECT GALLERY */}
          {activeTab === 'gallery' && (
            <div className="flex flex-col gap-8">
              
              {/* Media Uploader Form */}
              <div className="border-b border-white/10 pb-6">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">UPLOAD NEW ARCHITECTURAL WORK</h2>
                
                <form onSubmit={handleProjectSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                  
                  {/* Drag & Drop Zone */}
                  <div className="lg:col-span-7">
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`w-full h-full min-h-[180px] rounded border border-dashed flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ${
                        dragActive ? 'border-white bg-white/5' : 'border-white/10 bg-white/[0.01]'
                      } relative overflow-hidden`}
                    >
                      {selectedFile ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="px-3 py-1.5 rounded bg-white/5 border border-white/10 font-bold uppercase tracking-widest text-[9px]">
                            {selectedFile.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'}
                          </div>
                          <span className="font-bold text-[10px] text-white/90 truncate max-w-[220px]">{selectedFile.name}</span>
                          <span className="text-[9px] text-white/40">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="mt-2 text-[9px] tracking-widest text-red-400 hover:text-red-300 uppercase cursor-pointer focus:outline-none"
                          >
                            Remove File
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <UploadCloud className="w-8 h-8 text-white/20 mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Drag & Drop media here</span>
                          <span className="text-[9px] text-white/35 uppercase">Images (WebP/AVIF/PNG) or Videos (MP4/WebM)</span>
                          <label className="mt-3 cursor-pointer px-4 py-2 border border-white/10 bg-white/5 rounded text-[9px] tracking-widest uppercase hover:bg-white/10 transition-all duration-300 focus:outline-none">
                            BROWSE FILES
                            <input
                              type="file"
                              accept="image/*,video/*"
                              className="hidden"
                              onChange={handleFileSelect}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata fields */}
                  <div className="lg:col-span-5 flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="PROJECT TITLE"
                      value={projectData.title}
                      onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-white uppercase text-xs"
                    />
                    <input
                      type="text"
                      placeholder="CLIENT / TARGET"
                      value={projectData.client}
                      onChange={(e) => setProjectData(prev => ({ ...prev, client: e.target.value }))}
                      required
                      className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-white uppercase text-xs"
                    />
                    <input
                      type="number"
                      placeholder="YEAR"
                      value={projectData.year}
                      onChange={(e) => setProjectData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                      required
                      className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-white text-xs"
                    />
                    <textarea
                      placeholder="SHORT TECHNICAL DESCRIPTION"
                      rows={2}
                      value={projectData.description}
                      onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                      required
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-white resize-none text-xs uppercase"
                    />

                    {uploadStatus === 'error' && (
                      <span className="text-[9px] text-red-400 font-bold uppercase">{uploadError}</span>
                    )}

                    <button
                      type="submit"
                      disabled={uploadStatus === 'uploading'}
                      className="w-full py-3 bg-white text-black font-bold tracking-widest text-[10px] rounded hover:bg-neutral-200 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer uppercase focus:outline-none"
                    >
                      {uploadStatus === 'uploading' ? (
                        <><RefreshCw className="w-3 animate-spin" /> UPLOADING TO BUCKET...</>
                      ) : uploadStatus === 'success' ? (
                        <><CheckCircle className="w-3 text-green-600" /> UPLOADED SUCCESSFULLY</>
                      ) : (
                        <><Plus className="w-3" /> ADD TO GALLERY</>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Grid Preview and Delete */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">CURRENT PROJECTS GALLERY ({projects.length})</h2>
                
                {projects.length === 0 ? (
                  <div className="py-12 text-center text-[10px] text-white/20 border border-dashed border-white/10 rounded uppercase">
                    No items in the gallery. Upload above!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((proj) => (
                      <div key={proj.id} className="border border-white/10 bg-black/20 rounded overflow-hidden flex flex-col group relative">
                        
                        {/* Media preview */}
                        <div className="aspect-[16/10] bg-[#111] overflow-hidden relative border-b border-white/10">
                          {proj.media_type === 'video' ? (
                            <video 
                              src={proj.image_url} 
                              muted 
                              loop 
                              playsInline 
                              className="w-full h-full object-cover grayscale brightness-90"
                            />
                          ) : (
                            <img 
                              src={proj.image_url} 
                              alt={proj.title} 
                              className="w-full h-full object-cover grayscale brightness-90"
                            />
                          )}
                          <div className="absolute top-2 left-2 bg-black/60 text-[8px] font-bold tracking-widest px-2 py-0.5 rounded border border-white/10 uppercase">
                            {proj.media_type}
                          </div>
                        </div>

                        {/* Details & Action */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex gap-2 text-[8px] text-white/40 tracking-wider mb-1 uppercase font-bold">
                              <span>{proj.client}</span>
                              <span>•</span>
                              <span>{proj.year}</span>
                            </div>
                            <h3 className="text-[11px] font-bold text-white uppercase tracking-wider mb-2 truncate">{proj.title}</h3>
                          </div>

                          <button
                            onClick={() => {
                              if(confirm(`Are you sure you want to delete project: ${proj.title}?`)) {
                                handleDeleteProject(proj.id, proj.image_url);
                              }
                            }}
                            disabled={deletingId === proj.id}
                            className="w-full mt-3 flex items-center justify-center gap-1.5 py-1.5 border border-red-500/10 hover:border-red-500/40 text-[9px] font-bold tracking-widest text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded transition-all duration-300 cursor-pointer uppercase focus:outline-none"
                          >
                            {deletingId === proj.id ? (
                              <><RefreshCw className="w-3 animate-spin" /> DELETING...</>
                            ) : (
                              <><Trash2 className="w-3" /> DELETE PROJECT</>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: CLIENT INBOX */}
          {activeTab === 'inbox' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] border-b border-white/5 pb-2 mb-3">CLIENT INBOX MESSAGES</h2>
                <p className="text-[9px] text-white/40 leading-relaxed uppercase">Review inquiries received through the contact forms.</p>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                {messages.length === 0 ? (
                  <div className="py-12 text-center text-[10px] text-white/20 border border-dashed border-white/10 rounded uppercase">
                    Your inbox is currently empty.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`border p-5 rounded relative flex flex-col gap-3 transition-all duration-300 ${
                        msg.read 
                          ? 'border-white/5 bg-black/10 text-white/50' 
                          : 'border-white/20 bg-white/[0.02] text-white'
                      }`}
                    >
                      {/* Message header */}
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-white/40" />
                          <span className={`text-[11px] font-bold uppercase ${msg.read ? 'text-white/60' : 'text-white'}`}>{msg.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[9px] text-white/40">
                          <span>{msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}</span>
                          {!msg.read && (
                            <button
                              onClick={() => handleMarkAsRead(msg.id)}
                              className="text-[8px] tracking-widest text-white hover:text-white/60 flex items-center gap-1 border border-white/10 px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded cursor-pointer uppercase focus:outline-none"
                            >
                              <Eye className="w-2.5 h-2.5" /> MARK READ
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Details / Message */}
                      <div className="text-[11px] leading-relaxed select-text font-bold">
                        <span className="text-[8px] uppercase tracking-wider text-white/35 block mb-1">EMAIL</span>
                        <a href={`mailto:${msg.email}`} className="text-white hover:underline block mb-3 font-normal">{msg.email}</a>
                        
                        <span className="text-[8px] uppercase tracking-wider text-white/35 block mb-1">AUTOMATION BRIEF</span>
                        <p className="bg-black/30 p-3 border border-white/5 rounded text-white/80 select-text whitespace-pre-wrap leading-relaxed max-w-2xl uppercase">
                          {msg.details}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </section>
      </main>
    </div>
  );
}
