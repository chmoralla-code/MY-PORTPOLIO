'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, Image as ImageIcon, Inbox, LogOut, Save, Plus, 
  Trash2, UploadCloud, CheckCircle, RefreshCw, Eye, User,
  Edit3, X, Film, Camera, Cpu, Terminal, Shield, Database,
  Search, Mail, Copy
} from 'lucide-react';
import type { PortfolioInfo, Project, ContactMessage } from '@/lib/supabase';

interface AdminDashboardProps {
  initialInfo: PortfolioInfo | null;
  initialProjects: Project[];
  initialMessages: ContactMessage[];
}

// ==========================================
// CLIENT-SIDE CANVAS WEBP PRE-COMPRESSOR
// ==========================================
const compressImageToWebP = (file: File, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 2048;
        const MAX_HEIGHT = 2048;
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob returned null'));
          }
        }, 'image/webp', quality);
      };
      img.onerror = () => reject(new Error('Image load error'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File reader error'));
    reader.readAsDataURL(file);
  });
};

export default function AdminDashboard({ initialInfo, initialProjects, initialMessages }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'copy' | 'gallery' | 'inbox' | 'system'>('copy');
  
  // Dashboard states
  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages || []);

  // Search & Filter States
  const [gallerySearch, setGallerySearch] = useState('');
  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Copy/Reply Message Modal Overlay
  const [activeMessageDetail, setActiveMessageDetail] = useState<ContactMessage | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // System Telemetry Console States
  const [systemLogs, setSystemLogs] = useState<string[]>([
    'SYSTEM INITIALIZATION SECURE DECK ACTIVATED',
    'VERIFYING CRYPTO AUTH TOKEN KEYS... [VALID]',
    'PORTFOLIO CONCRETE CORE SERVER ONLINE // BOHOL_MATRIX_UBUJAN_GRID_EDGE',
    'SUPABASE POSTGRES CONNECTION POOL STABLE... (CONN_OK)',
    'READY FOR BLUEPRINT TRANSMISSIONS'
  ]);
  const [pingTime, setPingTime] = useState<number>(32);

  // Periodic visual telemetry log updates
  React.useEffect(() => {
    if (activeTab !== 'system') return;

    const logSnippets = [
      'CORE ENGINE: THERMAL DISK DRAIN COMPLETED',
      'SUPABASE BUCKET: PORTFOLIO_IMAGES CHECKED // ALL READOUTS SYNCED',
      'VECTOR OSCILLOSCOPE: SONIC ENGINE EMISSION COEFFICIENT 0.70',
      'EDGE API DISPATCH: PARALLAX HUD CORES BOOTED',
      'BACKUP DRIVES: ENCRYPTING TELEMETRY SECTOR...',
      'SYSTEM DIAGNOSTICS: FRAMERATE STABLE AT 60FPS',
      'EDGE LATENCY: DISPATCHING MATRIX PING TO SGP-1',
      'VERCEL DEPLOYMENT: PRODUCTION SSL STATUS // RENDER STABLE',
      'DECRYPTING CYBERNETIC MEMORY BRUTALIST ARCHIVES...'
    ];

    const interval = setInterval(() => {
      const randomLog = logSnippets[Math.floor(Math.random() * logSnippets.length)];
      setSystemLogs(prev => [...prev.slice(-14), `[${new Date().toLocaleTimeString()}] ${randomLog}`]);
      setPingTime(Math.floor(25 + Math.random() * 18));
    }, 3500);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Database Backup JSON exporter
  const handleBackupExport = () => {
    const backupPayload = {
      exportedAt: new Date().toISOString(),
      source: 'Cyrhiel Moralla Avant-Garde Portfolio Admin Console',
      portfolioInfo: copyData,
      projects: projects,
      contactMessages: messages
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cyrhiel_portfolio_matrix_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };
  
  // Form states - Copy
  const [copyData, setCopyData] = useState({
    hero_title: initialInfo?.hero_title || '',
    hero_subtitle: initialInfo?.hero_subtitle || '',
    poetry: initialInfo?.poetry || '',
    about_text: initialInfo?.about_text || '',
    contact_email: initialInfo?.contact_email || '',
    contact_phone: initialInfo?.contact_phone || '',
    contact_address: initialInfo?.contact_address || '',
    telegram_bot_token: initialInfo?.telegram_bot_token || '',
    telegram_chat_id: initialInfo?.telegram_chat_id || ''
  });
  const [copyStatus, setCopyStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Avatar states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarStatus, setAvatarStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [avatarError, setAvatarError] = useState('');
  const [currentAvatar, setCurrentAvatar] = useState(() => {
    const publicUrl = 'https://hzeqntoxqeylnglkgdnp.supabase.co/storage/v1/object/public/portfolio_images/profile_avatar.webp';
    return `${publicUrl}?t=${Date.now()}`;
  });

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatarStatus('idle');
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarStatus('uploading');
    setAvatarError('');

    try {
      let fileToUpload = avatarFile;
      
      // Pre-compress to WebP
      try {
        const webpBlob = await compressImageToWebP(avatarFile, 0.85);
        fileToUpload = new File([webpBlob], 'profile_avatar.webp', { type: 'image/webp' });
      } catch (compressErr) {
        console.warn('Pre-compression for avatar failed, using raw file:', compressErr);
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);

      const res = await fetch('/api/admin/profile-avatar', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Avatar upload failed');
      }

      const data = await res.json();
      setCurrentAvatar(`${data.imageUrl}?t=${Date.now()}`);
      setAvatarFile(null);
      setAvatarStatus('success');
      setTimeout(() => setAvatarStatus('idle'), 2500);
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setAvatarStatus('error');
      setAvatarError(err.message || 'Upload failed');
    }
  };

  // Form states - New Project
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    year: new Date().getFullYear(),
    client: '',
    scale: '',
    location: '',
    materials: '',
    density: '2400 kg/m³',
    thermal: 'R-value: 0.12 m²·K/W'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Edit Project states
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editData, setEditData] = useState({
    title: '', description: '', year: 2026, client: '', scale: '', location: '', materials: '', density: '', thermal: ''
  });
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editStatus, setEditStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [editError, setEditError] = useState('');

  // Live media preview states
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setSelectedPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setSelectedPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!editFile) {
      setEditPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(editFile);
    setEditPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [editFile]);

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
      let fileToUpload = selectedFile;
      
      // Client-side canvas JPEG-to-WebP pre-compression for images
      if (selectedFile.type.startsWith('image/')) {
        setUploadError('COMPRESSING IMAGE MATRIX (WEBP)...');
        try {
          const webpBlob = await compressImageToWebP(selectedFile, 0.82);
          const newName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) + '.webp';
          fileToUpload = new File([webpBlob], newName, { type: 'image/webp' });
        } catch (compressErr) {
          console.warn('Pre-compression failed, using raw file:', compressErr);
        }
      }

      setUploadError('DISPATCHING TO SUPABASE BUCKET...');
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('title', projectData.title);
      formData.append('description', projectData.description);
      formData.append('year', projectData.year.toString());
      formData.append('client', projectData.client);
      formData.append('scale', projectData.scale);
      formData.append('location', projectData.location);
      
      // Encode density and thermal resistance in materials string
      let combinedMaterials = projectData.materials;
      if (projectData.density || projectData.thermal) {
        combinedMaterials += ` || DENSITY: ${projectData.density || '2400 kg/m³'} || THERMAL: ${projectData.thermal || 'R-value: 0.12 m²·K/W'}`;
      }
      formData.append('materials', combinedMaterials);

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        let errorMsg = 'File upload failed';
        try {
          const err = await res.json();
          errorMsg = err.message || errorMsg;
        } catch {
          const text = await res.text();
          errorMsg = text || `Upload failed (HTTP ${res.status})`;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      
      // Update local projects state
      setProjects(prev => [data.project[0], ...prev]);
      
      // Reset form
      setProjectData({
        title: '',
        description: '',
        year: new Date().getFullYear(),
        client: '',
        scale: '',
        location: '',
        materials: '',
        density: '2400 kg/m³',
        thermal: 'R-value: 0.12 m²·K/W'
      });
      setSelectedFile(null);
      setUploadStatus('success');
      setTimeout(() => {
        setUploadStatus('idle');
        setShowUploadForm(false);
      }, 1800);
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

  // ==========================================
  // EDIT PROJECT HANDLERS
  // ==========================================
  const startEditProject = (proj: Project) => {
    // Parse materials back to separate fields
    const matParts = (proj.materials || '').split(' || ');
    const composition = matParts[0] || '';
    let density = '2400 kg/m³';
    let thermal = 'R-value: 0.12 m²·K/W';
    matParts.forEach(part => {
      if (part.startsWith('DENSITY: ')) density = part.replace('DENSITY: ', '');
      else if (part.startsWith('THERMAL: ')) thermal = part.replace('THERMAL: ', '');
    });

    setEditingProject(proj);
    setEditData({
      title: proj.title,
      description: proj.description,
      year: proj.year,
      client: proj.client,
      scale: proj.scale || '',
      location: proj.location || '',
      materials: composition,
      density,
      thermal
    });
    setEditFile(null);
    setEditStatus('idle');
    setEditError('');
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditFile(e.target.files[0]);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setEditStatus('saving');
    setEditError('');

    try {
      let fileToUpload = editFile;

      // Pre-compress images
      if (fileToUpload && fileToUpload.type.startsWith('image/')) {
        try {
          const webpBlob = await compressImageToWebP(fileToUpload, 0.82);
          const newName = fileToUpload.name.substring(0, fileToUpload.name.lastIndexOf('.')) + '.webp';
          fileToUpload = new File([webpBlob], newName, { type: 'image/webp' });
        } catch (compressErr) {
          console.warn('Pre-compression failed:', compressErr);
        }
      }

      // Encode materials with density/thermal
      let combinedMaterials = editData.materials;
      if (editData.density || editData.thermal) {
        combinedMaterials += ` || DENSITY: ${editData.density || '2400 kg/m³'} || THERMAL: ${editData.thermal || 'R-value: 0.12 m²·K/W'}`;
      }

      const formData = new FormData();
      formData.append('id', editingProject.id);
      formData.append('title', editData.title);
      formData.append('description', editData.description);
      formData.append('year', editData.year.toString());
      formData.append('client', editData.client);
      formData.append('scale', editData.scale);
      formData.append('location', editData.location);
      formData.append('materials', combinedMaterials);
      formData.append('old_image_url', editingProject.image_url);

      if (fileToUpload) {
        formData.append('file', fileToUpload);
      }

      const res = await fetch('/api/admin/project-update', {
        method: 'PATCH',
        body: formData
      });

      if (!res.ok) {
        let errorMsg = 'Update failed';
        try {
          const err = await res.json();
          errorMsg = err.message || errorMsg;
        } catch {
          const text = await res.text();
          errorMsg = text || `Update failed (HTTP ${res.status})`;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      const updatedProject = data.project[0];

      // Update local state
      setProjects(prev => prev.map(p => p.id === editingProject.id ? updatedProject : p));

      setEditStatus('success');
      setTimeout(() => {
        setEditingProject(null);
        setEditStatus('idle');
      }, 1500);
    } catch (err: any) {
      console.error('Edit project error:', err);
      setEditStatus('error');
      setEditError(err.message || 'Update failed');
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
          {/* Simulated System Status Console */}
          <div className="border border-white/10 bg-neutral-950/80 p-4 rounded mb-4 text-[9px] uppercase leading-relaxed text-white/40 tracking-wider">
            <div className="text-white/80 font-bold mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              [ SYS_NODE: ACTIVE ]
            </div>
            <div>PROJECT_REF: hzeqntoxqey</div>
            <div>LATENCY: 42MS // GPU: SHDR</div>
            <div>PRE_COMPRESS: WEBP [0.82]</div>
            <div>VIDEO: MP4/WEBM [DIRECT]</div>
            <div>LIMIT_CEIL: 50MB [MAX]</div>
            <div className="w-full bg-white/5 h-[3px] mt-3 rounded-full overflow-hidden">
              <div className="bg-white h-full w-[78%] animate-pulse" />
            </div>
          </div>

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

          <button
            onClick={() => setActiveTab('system')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded text-[10px] tracking-widest text-left transition-all duration-300 focus:outline-none uppercase ${
              activeTab === 'system' 
                ? 'bg-white text-black font-bold' 
                : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Cpu className="w-4 h-4" /> System Console
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

              {/* Profile Avatar Upload Zone */}
              <div className="border border-white/10 bg-neutral-950/40 p-5 rounded flex flex-col md:flex-row gap-6 items-center mb-2">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 relative flex-shrink-0 bg-neutral-900">
                  <img 
                    src={currentAvatar} 
                    alt="Current Avatar" 
                    onError={() => {
                      if (currentAvatar !== '/profile.png') {
                        setCurrentAvatar('/profile.png');
                      }
                    }}
                    className="w-full h-full object-cover grayscale contrast-125"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-2 w-full">
                  <label className="text-[9px] uppercase text-white/55 tracking-wider font-bold">[ PORTRAIT CARD PROFILE PHOTO ]</label>
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <input
                      type="file"
                      accept="image/*"
                      id="avatar-file-input"
                      className="hidden"
                      onChange={handleAvatarSelect}
                    />
                    <label
                      htmlFor="avatar-file-input"
                      className="cursor-pointer border border-white/20 bg-white/5 hover:bg-white/10 transition px-4 py-2 text-center rounded text-[9px] uppercase font-bold tracking-widest flex items-center justify-center gap-2"
                    >
                      <UploadCloud className="w-3.5 h-3.5" /> BROWSE NEW PHOTO
                    </label>
                    {avatarFile && (
                      <button
                        type="button"
                        onClick={handleAvatarUpload}
                        disabled={avatarStatus === 'uploading'}
                        className="bg-white text-black font-bold uppercase tracking-widest text-[9px] px-4 py-2 rounded hover:bg-neutral-200 transition disabled:bg-neutral-600 disabled:text-neutral-400 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {avatarStatus === 'uploading' ? (
                          <><RefreshCw className="w-3 h-3 animate-spin" /> UPLOADING...</>
                        ) : (
                          'CONFIRM UPLOAD'
                        )}
                      </button>
                    )}
                  </div>
                  {avatarFile && (
                    <span className="text-[8px] text-green-400 uppercase font-mono block mt-1">
                      SELECTED: {avatarFile.name} ({(avatarFile.size / 1024).toFixed(1)} KB)
                    </span>
                  )}
                  {avatarStatus === 'success' && (
                    <span className="text-[8px] text-green-400 font-bold uppercase block mt-1">✓ PROFILE PORTRAIT UPDATED LIVE</span>
                  )}
                  {avatarStatus === 'error' && (
                    <span className="text-[8px] text-red-400 font-bold uppercase block mt-1">✗ UPLOAD ERROR: {avatarError}</span>
                  )}
                </div>
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
                  <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold">HERO SUBTITLE</label>
                  <input
                    type="text"
                    name="hero_subtitle"
                    value={copyData.hero_subtitle}
                    onChange={handleCopyChange}
                    className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-white focus:bg-white/10 uppercase transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold">HOMEPAGE TYPED POETIC STATEMENT</label>
                  <textarea
                    name="poetry"
                    rows={3}
                    value={copyData.poetry}
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
              
              {/* Media Uploader Form Header & Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6 gap-4">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-1">PROJECT GALLERY</h2>
                  <p className="text-[9px] text-white/40 uppercase">MANAGE AND SHOWCASE YOUR ARCHITECTURAL BLUEPRINTS MATRIX.</p>
                </div>
                <button
                  onClick={() => setShowUploadForm(!showUploadForm)}
                  className={`text-[9px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 px-4 py-2 rounded border transition-all duration-300 cursor-pointer focus:outline-none font-bold font-mono ${
                    showUploadForm 
                      ? 'border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10' 
                      : 'border-[#00ff66]/30 bg-[#00ff66]/5 text-[#00ff66] hover:bg-[#00ff66]/10'
                  }`}
                >
                  {showUploadForm ? '[ CLOSE UPLOADER ]' : '[ + ADD NEW PROJECT ]'}
                </button>
              </div>

              {/* Media Uploader Form */}
              {showUploadForm && (
                <div className="border-b border-white/10 pb-6 animate-fadeIn">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-1 text-[#00ff66]">UPLOAD NEW PROJECT</h2>
                  <p className="text-[9px] text-white/40 uppercase mb-4">Upload images (PNG, JPG, WebP) or videos (MP4, WebM) from your local computer.</p>
                  
                  <form onSubmit={handleProjectSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                    
                    {/* Drag & Drop Zone */}
                    <div className="lg:col-span-7">
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`w-full h-full min-h-[220px] rounded border border-dashed flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ${
                          dragActive ? 'border-[#00ff66] bg-[#00ff66]/5' : 'border-white/10 bg-white/[0.01] hover:border-white/20'
                        } relative overflow-hidden group`}
                      >
                        {selectedFile ? (
                          <div className="w-full h-full flex flex-col items-center gap-3 relative z-10 p-2">
                            {/* Live preview container */}
                            <div className="relative w-full max-w-[280px] aspect-[16/10] rounded overflow-hidden border border-white/20 bg-black/40 group-hover:border-white/40 transition-colors duration-300 shadow-lg">
                              {selectedFile.type.startsWith('video/') ? (
                                <video 
                                  src={selectedPreview || undefined} 
                                  controls 
                                  muted 
                                  className="w-full h-full object-cover" 
                                />
                              ) : (
                                <img 
                                  src={selectedPreview || undefined} 
                                  alt="Selected preview" 
                                  className="w-full h-full object-cover" 
                                />
                              )}
                              {/* Neon scan overlay for sci-fi vibe */}
                              <div className="absolute inset-0 pointer-events-none border border-white/10 bg-radial-gradient from-transparent to-black/40 mix-blend-overlay" />
                            </div>
                            
                            <div className="flex flex-col items-center gap-1">
                              <div className="px-2.5 py-1 rounded bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] font-mono font-bold uppercase tracking-widest text-[8px] flex items-center gap-1.5 animate-pulse">
                                {selectedFile.type.startsWith('video/') ? <><Film className="w-2.5 h-2.5" /> VIDEO READY</> : <><Camera className="w-2.5 h-2.5" /> IMAGE READY</>}
                              </div>
                              <span className="font-bold text-[9px] text-white/90 truncate max-w-[250px] uppercase tracking-wider font-mono mt-1">{selectedFile.name}</span>
                              <span className="text-[8px] text-white/40 font-mono uppercase">SIZE: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedFile(null)}
                              className="text-[8px] tracking-widest text-red-400 hover:text-red-300 font-bold font-mono uppercase cursor-pointer focus:outline-none hover:scale-105 transition-all mt-1"
                            >
                              [ DISCARD MEDIA ]
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <UploadCloud className="w-8 h-8 text-white/20 mb-1 group-hover:text-[#00ff66]/50 transition-colors duration-300" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Drag & Drop media here</span>
                            <span className="text-[9px] text-white/35 uppercase">Images (WebP/AVIF/PNG/JPG) or Videos (MP4/WebM)</span>
                            <label className="mt-3 cursor-pointer px-4 py-2 border border-white/10 bg-white/5 rounded text-[9px] tracking-widest uppercase hover:bg-white/10 hover:border-white/30 transition-all duration-300 focus:outline-none font-bold">
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
                        className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] text-xs transition-all duration-300 uppercase font-mono tracking-wider"
                      />
                      <input
                        type="text"
                        placeholder="CLIENT / TARGET"
                        value={projectData.client}
                        onChange={(e) => setProjectData(prev => ({ ...prev, client: e.target.value }))}
                        required
                        className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] text-xs transition-all duration-300 uppercase font-mono tracking-wider"
                      />
                      <input
                        type="number"
                        placeholder="YEAR"
                        value={projectData.year}
                        onChange={(e) => setProjectData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                        required
                        className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] text-xs transition-all duration-300 font-mono tracking-wider"
                      />
                      <textarea
                        placeholder="SHORT TECHNICAL DESCRIPTION"
                        rows={2}
                        value={projectData.description}
                        onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                        required
                        className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] text-xs transition-all duration-300 resize-none uppercase font-mono tracking-wider"
                      />
                      <input
                        type="text"
                        placeholder="SCALE (e.g., 1:1, 1:250)"
                        value={projectData.scale}
                        onChange={(e) => setProjectData(prev => ({ ...prev, scale: e.target.value }))}
                        className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] text-xs transition-all duration-300 uppercase font-mono tracking-wider"
                      />
                      <input
                        type="text"
                        placeholder="LOCATION (e.g., TAGBILARAN CITY)"
                        value={projectData.location}
                        onChange={(e) => setProjectData(prev => ({ ...prev, location: e.target.value }))}
                        className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] text-xs transition-all duration-300 uppercase font-mono tracking-wider"
                      />
                      <input
                        type="text"
                        placeholder="MATERIALS MATRIX (e.g., CARBON, GLASS, STEEL)"
                        value={projectData.materials}
                        onChange={(e) => setProjectData(prev => ({ ...prev, materials: e.target.value }))}
                        className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] text-xs transition-all duration-300 uppercase font-mono tracking-wider"
                      />

                      {/* Detailed Specifications Column */}
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="DENSITY (e.g., 2400 kg/m³)"
                          value={projectData.density}
                          onChange={(e) => setProjectData(prev => ({ ...prev, density: e.target.value }))}
                          className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] text-xs transition-all duration-300 uppercase font-mono tracking-wider"
                        />
                        <input
                          type="text"
                          placeholder="THERMAL (e.g., R-value: 0.12)"
                          value={projectData.thermal}
                          onChange={(e) => setProjectData(prev => ({ ...prev, thermal: e.target.value }))}
                          className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] text-xs transition-all duration-300 uppercase font-mono tracking-wider"
                        />
                      </div>

                      {uploadStatus === 'error' && (
                        <span className="text-[9px] text-red-400 font-bold uppercase font-mono">{uploadError}</span>
                      )}

                      <button
                        type="submit"
                        disabled={uploadStatus === 'uploading'}
                        className="w-full py-3 bg-white text-black font-bold tracking-widest text-[10px] rounded hover:bg-neutral-200 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer uppercase focus:outline-none font-mono"
                      >
                        {uploadStatus === 'uploading' ? (
                          <><RefreshCw className="w-3 animate-spin" /> UPLOADING TO BUCKET...</>
                        ) : uploadStatus === 'success' ? (
                          <><CheckCircle className="w-3 text-green-600" /> UPLOADED SUCCESSFULLY</>
                        ) : (
                          <><Plus className="w-3" /> ADD NEW PROJECT</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
                 {/* Grid Preview, Edit, and Delete */}
              <div>
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-white/5 pb-4 mb-5">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em]">[ CURRENT GALLERY ({projects.length}) ]</h2>
                  
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 w-3 h-3 text-white/30" />
                    <input
                      type="text"
                      placeholder="SEARCH BLUEPRINTS..."
                      value={gallerySearch}
                      onChange={(e) => setGallerySearch(e.target.value)}
                      className="w-full bg-neutral-950/60 border border-white/10 px-8 py-2 rounded text-[9px] uppercase font-mono tracking-widest text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all duration-300"
                    />
                    {gallerySearch && (
                      <button 
                        onClick={() => setGallerySearch('')}
                        className="absolute right-3 top-2 text-white/40 hover:text-white text-[8px] font-mono"
                      >
                        [X]
                      </button>
                    )}
                  </div>
                </div>

                {(() => {
                  const filteredProjects = projects.filter(proj => 
                    proj.title.toLowerCase().includes(gallerySearch.toLowerCase()) ||
                    (proj.client && proj.client.toLowerCase().includes(gallerySearch.toLowerCase())) ||
                    (proj.scale && proj.scale.toLowerCase().includes(gallerySearch.toLowerCase())) ||
                    (proj.location && proj.location.toLowerCase().includes(gallerySearch.toLowerCase())) ||
                    proj.year.toString().includes(gallerySearch)
                  );

                  if (filteredProjects.length === 0) {
                    return (
                      <div className="py-12 text-center text-[10px] text-white/20 border border-dashed border-white/10 rounded uppercase font-mono tracking-widest">
                        {gallerySearch ? 'NO MATRIX MATCHES FOUND FOR YOUR SEARCH QUERY.' : 'No items in the gallery. Upload above!'}
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProjects.map((proj) => (
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
                                onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                                onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                              />
                            ) : (
                              <img 
                                src={proj.image_url} 
                                alt={proj.title} 
                                className="w-full h-full object-cover grayscale brightness-90"
                              />
                            )}
                            <div className="absolute top-2 left-2 bg-black/60 text-[8px] font-bold tracking-widest px-2 py-0.5 rounded border border-white/10 uppercase flex items-center gap-1">
                              {proj.media_type === 'video' ? <Film className="w-2.5 h-2.5" /> : <Camera className="w-2.5 h-2.5" />}
                              {proj.media_type}
                            </div>
                          </div>

                          {/* Details & Actions */}
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex gap-2 text-[8px] text-white/40 tracking-wider mb-1 uppercase font-bold">
                                <span>{proj.client}</span>
                                <span>•</span>
                                <span>{proj.year}</span>
                              </div>
                              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider mb-2 truncate">{proj.title}</h3>
                              <p className="text-[9px] text-white/40 uppercase line-clamp-2 leading-relaxed mb-3">{proj.description}</p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditProject(proj)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-white/10 hover:border-white/30 text-[9px] font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/5 rounded transition-all duration-300 cursor-pointer uppercase focus:outline-none"
                              >
                                <Edit3 className="w-3 h-3" /> EDIT
                              </button>
                              <button
                                onClick={() => {
                                  if(confirm(`Are you sure you want to delete project: ${proj.title}?`)) {
                                    handleDeleteProject(proj.id, proj.image_url);
                                  }
                                }}
                                disabled={deletingId === proj.id}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-red-500/10 hover:border-red-500/40 text-[9px] font-bold tracking-widest text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded transition-all duration-300 cursor-pointer uppercase focus:outline-none"
                              >
                                {deletingId === proj.id ? (
                                  <><RefreshCw className="w-3 animate-spin" /> ...</>
                                ) : (
                                  <><Trash2 className="w-3" /> DELETE</>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
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

              {/* SEARCH & FILTER CONTROLS */}
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-b border-white/5 pb-4 mb-1">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-2.5 w-3 h-3 text-white/30" />
                  <input
                    type="text"
                    placeholder="SEARCH INBOX..."
                    value={inboxSearch}
                    onChange={(e) => setInboxSearch(e.target.value)}
                    className="w-full bg-neutral-950/60 border border-white/10 px-8 py-2 rounded text-[9px] uppercase font-mono tracking-widest text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all duration-300"
                  />
                  {inboxSearch && (
                    <button 
                      onClick={() => setInboxSearch('')}
                      className="absolute right-3 top-2 text-white/40 hover:text-white text-[8px] font-mono"
                    >
                      [X]
                    </button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 items-center text-[9px] font-mono">
                  <span className="text-white/30 mr-1">[ STATE ]</span>
                  <button
                    onClick={() => setInboxFilter('all')}
                    className={`px-2.5 py-1 border rounded uppercase transition-all duration-300 cursor-pointer focus:outline-none ${
                      inboxFilter === 'all' 
                        ? 'border-white text-white bg-white/5' 
                        : 'border-white/10 text-white/45 hover:text-white hover:bg-white/2'
                    }`}
                  >
                    ALL ({messages.length})
                  </button>
                  <button
                    onClick={() => setInboxFilter('unread')}
                    className={`px-2.5 py-1 border rounded uppercase transition-all duration-300 cursor-pointer focus:outline-none ${
                      inboxFilter === 'unread' 
                        ? 'border-[#00ff66]/60 text-[#00ff66] bg-[#00ff66]/5' 
                        : 'border-white/10 text-white/45 hover:text-white hover:bg-white/2'
                    }`}
                  >
                    UNREAD ({messages.filter(m => !m.read).length})
                  </button>
                  <button
                    onClick={() => setInboxFilter('read')}
                    className={`px-2.5 py-1 border rounded uppercase transition-all duration-300 cursor-pointer focus:outline-none ${
                      inboxFilter === 'read' 
                        ? 'border-white/40 text-white/60 bg-white/5' 
                        : 'border-white/10 text-white/45 hover:text-white hover:bg-white/2'
                    }`}
                  >
                    READ ({messages.filter(m => m.read).length})
                  </button>
                </div>
              </div>

              {copyFeedback && (
                <div className="fixed bottom-6 right-6 z-50 bg-[#070707] border border-[#00ff66]/40 px-4 py-2.5 rounded font-mono text-[9px] uppercase tracking-widest text-[#00ff66] shadow-[0_0_30px_rgba(0,255,102,0.1)]">
                  ✓ SPEC METADATA LOADED TO MEMORY STACK
                </div>
              )}

              <div className="flex flex-col gap-4 mt-2">
                {(() => {
                  const filteredMessages = messages.filter(msg => {
                    const matchesSearch = 
                      msg.name.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                      msg.email.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                      msg.details.toLowerCase().includes(inboxSearch.toLowerCase());
                      
                    const matchesFilter = 
                      inboxFilter === 'all' ||
                      (inboxFilter === 'unread' && !msg.read) ||
                      (inboxFilter === 'read' && msg.read);
                      
                    return matchesSearch && matchesFilter;
                  });

                  if (filteredMessages.length === 0) {
                    return (
                      <div className="py-12 text-center text-[10px] text-white/20 border border-dashed border-white/10 rounded uppercase font-mono tracking-widest">
                        {inboxSearch ? 'NO MATRIX INBOX MATCHES FOUND.' : 'Your inbox is currently empty.'}
                      </div>
                    );
                  }

                  return filteredMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`border p-5 rounded relative flex flex-col gap-3 transition-all duration-300 ${
                        msg.read 
                          ? 'border-white/5 bg-black/10 text-white/50' 
                          : 'border-white/25 bg-white/[0.02] text-white'
                      }`}
                    >
                      {/* Message header */}
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-white/40" />
                          <span className={`text-[11px] font-bold uppercase ${msg.read ? 'text-white/60' : 'text-white'}`}>{msg.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[9px] text-white/40 font-mono">
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
                        <div className="flex items-center gap-3 mb-3 font-mono text-[9px]">
                          <a href={`mailto:${msg.email}`} className="text-white hover:underline block font-normal">{msg.email}</a>
                          <span className="text-white/10 font-normal">|</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`NAME: ${msg.name}\nEMAIL: ${msg.email}\nDETAILS:\n${msg.details}`);
                              setCopyFeedback(true);
                              setTimeout(() => setCopyFeedback(false), 2000);
                            }}
                            className="text-[8px] tracking-widest text-white/40 hover:text-white flex items-center gap-1 cursor-pointer focus:outline-none uppercase"
                          >
                            <Copy className="w-2.5 h-2.5" /> COPY DATA
                          </button>
                        </div>
                        
                        <span className="text-[8px] uppercase tracking-wider text-white/35 block mb-1">AUTOMATION BRIEF</span>
                        <p className="bg-black/35 p-3 border border-white/5 rounded text-white/80 select-text whitespace-pre-wrap leading-relaxed max-w-2xl uppercase font-mono text-[9.5px] mb-3">
                          {msg.details}
                        </p>

                        <div className="flex gap-2 border-t border-white/5 pt-3 mt-1 font-mono">
                          <button
                            onClick={() => setActiveMessageDetail(msg)}
                            className="flex items-center gap-1.5 border border-white/10 px-3 py-1 bg-white/5 hover:bg-white/10 text-[8px] tracking-widest font-bold rounded cursor-pointer uppercase focus:outline-none text-white hover:border-white/20"
                          >
                            <Terminal className="w-3 h-3 text-[#00ff66]" /> DECODE BRIEF
                          </button>
                          
                          <a
                            href={`mailto:${msg.email}?subject=RE: ARCHITECTURAL BRIEF MATRIX&body=Dear ${msg.name},%0D%0A%0D%0AThank you for contacting me. I have decoded your automation brief details and would love to discuss...`}
                            className="flex items-center gap-1.5 border border-white/10 px-3 py-1 bg-white/5 hover:bg-white/10 text-[8px] tracking-widest font-bold rounded cursor-pointer uppercase focus:outline-none text-white hover:border-white/20"
                          >
                            <Mail className="w-3 h-3 text-blue-400" /> STACK REPLY
                          </a>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>

            </div>
          )}

          {/* TAB 4: SYSTEM CONSOLE */}
          {activeTab === 'system' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] border-b border-white/5 pb-2 mb-3">SYSTEM TELEMETRY CONSOLE</h2>
                <p className="text-[9px] text-white/40 leading-relaxed uppercase">Monitor active edge nodes, database transactions, live system telemetry, and execute backups.</p>
              </div>

              {/* Top Gauges and Telemetry Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Latency Gauge */}
                <div className="border border-white/10 bg-neutral-950/40 p-4 rounded flex flex-col gap-1.5 justify-between">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-white/35 block mb-1">EDGE NODE LATENCY</span>
                    <div className="flex items-baseline gap-2 font-mono">
                      <span className="text-2xl font-bold text-[#00ff66]">{pingTime}</span>
                      <span className="text-[9px] text-white/40 uppercase">ms</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[8px] text-[#00ff66] uppercase mt-2 font-bold">
                    <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full animate-pulse" />
                    SGP-1 NODE ACTIVE // EXCELLENT
                  </div>
                </div>

                {/* CDN Status */}
                <div className="border border-white/10 bg-neutral-950/40 p-4 rounded flex flex-col gap-1.5 justify-between">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-white/35 block mb-1">VERCEL EDGE SHIELD</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <span className="text-xs font-bold uppercase tracking-widest font-mono text-white/90">WAF SECURE</span>
                    </div>
                  </div>
                  <div className="text-[8px] text-white/40 uppercase mt-2 font-bold">
                    SSL CERT: ACTIVE [2048-BIT RSA]
                  </div>
                </div>

                {/* Supabase connection pool status */}
                <div className="border border-white/10 bg-neutral-950/40 p-4 rounded flex flex-col gap-1.5 justify-between">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-white/35 block mb-1">DATABASE CONNECTION</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Database className="w-5 h-5 text-green-400" />
                      <span className="text-xs font-bold uppercase tracking-widest font-mono text-[#00ff66]">POOLS_STABLE</span>
                    </div>
                  </div>
                  <div className="text-[8px] text-[#00ff66] uppercase mt-2 font-bold">
                    POSTGRES_VER: 15.6 // UP
                  </div>
                </div>

              </div>

              {/* System Backup and Live Terminal Console */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
                
                {/* Live Console Output */}
                <div className="lg:col-span-8 border border-white/10 bg-neutral-950 p-4 rounded flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-[#00ff66]" />
                      <span className="text-[9px] uppercase font-bold tracking-widest text-white/80">LIVE DIAGNOSTIC HUD TERMINAL</span>
                    </div>
                    <span className="text-[8px] text-white/30 uppercase tracking-widest">[ SHIELD PORT: 443 ]</span>
                  </div>

                  {/* Log stream box */}
                  <div className="h-56 bg-black/60 rounded border border-white/5 p-3 overflow-y-auto font-mono text-[9px] uppercase leading-relaxed text-[#00ff66] shadow-inner flex flex-col gap-1.5 font-bold">
                    {systemLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <span className="text-white/20 select-none">&gt;&gt;</span>
                        <span className="whitespace-pre-wrap select-text">{log}</span>
                      </div>
                    ))}
                    <div className="flex gap-2 items-center text-[#00ff66]/70">
                      <span className="text-white/20 select-none">&gt;&gt;</span>
                      <span className="inline-block w-1.5 h-3 bg-[#00ff66] animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Backup & System Settings */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <div className="border border-white/10 bg-[#070707] p-5 rounded relative overflow-hidden flex flex-col justify-between h-full shadow-[0_0_20px_rgba(255,255,255,0.02)]">
                    <div>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full translate-x-12 -translate-y-12 border border-white/5 pointer-events-none" />
                      <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/40 block mb-2">
                        [ SYSTEM ACTIONS ]
                      </span>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-white mb-2">
                        MATRIX STACK BACKUP
                      </h3>
                      <p className="text-[9px] text-white/40 uppercase leading-relaxed mb-6">
                        EXPORT ALL PORTFOLIO METADATA, Active Project blueprints, AND client inbox logs INTO A STATIC JSON backup FILE.
                      </p>
                    </div>

                    <button
                      onClick={handleBackupExport}
                      className="w-full flex items-center justify-center gap-2 bg-white text-black py-2.5 px-4 font-bold text-[9px] tracking-widest hover:bg-neutral-200 transition-all rounded cursor-pointer focus:outline-none uppercase"
                    >
                      <Database className="w-3.5 h-3.5" /> EXPORT SYSTEM JSON
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </section>
      </main>

      {/* FULL-SCREEN EDIT PROJECT OVERLAY */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl overflow-y-auto p-4 md:p-12 flex items-start md:items-center justify-center animate-fadeIn">
          <div className="w-full max-w-4xl bg-neutral-950/95 border border-[#00ff66]/20 p-6 md:p-10 rounded relative shadow-[0_0_50px_rgba(0,255,102,0.05)] animate-scaleIn">
            
            {/* Pulsing secure light / telemetry header */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#00ff66] rounded-full animate-ping" />
              <span className="text-[8px] uppercase tracking-[0.2em] text-[#00ff66] font-bold font-mono">
                [ BLUEPRINT DECODER // SPECIFICATION EDITOR ]
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => { setEditingProject(null); setEditStatus('idle'); }}
              className="absolute top-5 right-5 p-2 rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-[#00ff66]/40 hover:bg-[#00ff66]/5 hover:scale-105 transition-all duration-300 cursor-pointer focus:outline-none z-30"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mt-8 mb-6 border-b border-white/10 pb-4">
              <span className="text-[8px] tracking-[0.25em] text-white/30 uppercase block mb-1">PROJECT BLUEPRINT METADATA REGISTRATION</span>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#00ff66] font-mono">{editingProject.title}</h3>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-6 text-xs">
              
              {/* Current & Replacement Media - Split Layout */}
              <div className="border border-white/10 bg-neutral-950/60 rounded p-5 flex flex-col gap-4">
                <span className="text-[8px] uppercase text-white/35 tracking-wider block font-bold font-mono">
                  [ MEDIA REPLACEMENT FLOW: CURRENT ACTIVE VS. TARGET REPLACEMENT ]
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                  {/* Current Media */}
                  <div className="md:col-span-3 flex flex-col gap-2">
                    <span className="text-[8px] uppercase text-white/40 font-mono tracking-widest text-center">[ CURRENT ACTIVE BLUEPRINT ]</span>
                    <div className="w-full aspect-[16/10] rounded overflow-hidden border border-white/10 bg-[#111] relative">
                      {editingProject.media_type === 'video' ? (
                        <video src={editingProject.image_url} muted playsInline controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={editingProject.image_url} alt="Current" className="w-full h-full object-cover" />
                      )}
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center text-[#00ff66]/40 font-bold text-lg py-2">
                    <span className="hidden md:inline text-xl">→</span>
                    <span className="inline md:hidden text-xl">↓</span>
                  </div>

                  {/* Target Replacement Media */}
                  <div className="md:col-span-3 flex flex-col gap-2">
                    <span className="text-[8px] uppercase text-[#00ff66] font-mono tracking-widest text-center">[ TARGET REPLACEMENT DECODER ]</span>
                    <div className="w-full aspect-[16/10] rounded overflow-hidden border border-dashed border-[#00ff66]/20 bg-black/40 relative flex items-center justify-center text-center">
                      {editFile ? (
                        editFile.type.startsWith('video/') ? (
                          <video src={editPreview || undefined} muted playsInline controls className="w-full h-full object-cover" />
                        ) : (
                          <img src={editPreview || undefined} alt="New Preview" className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4">
                          <Camera className="w-5 h-5 text-white/10 mb-1" />
                          <span className="text-[8px] uppercase text-white/30 tracking-widest font-mono">NO REPLACEMENT FILE SELECTED</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* File Upload Selector Action Row */}
                <div className="flex flex-col gap-2 border-t border-white/5 pt-4 mt-1">
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        id="edit-file-input"
                        className="hidden"
                        onChange={handleEditFileSelect}
                      />
                      <label
                        htmlFor="edit-file-input"
                        className="cursor-pointer border border-[#00ff66]/30 bg-[#00ff66]/5 hover:bg-[#00ff66]/10 text-[#00ff66] transition px-4 py-2 text-center rounded text-[9px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 hover:border-[#00ff66]/50 focus:outline-none font-mono"
                      >
                        <UploadCloud className="w-3.5 h-3.5" /> BROWSE REPLACEMENT FILE
                      </label>

                      {editFile && (
                        <button
                          type="button"
                          onClick={() => setEditFile(null)}
                          className="text-[8px] tracking-widest text-red-400 hover:text-red-300 font-bold font-mono uppercase cursor-pointer focus:outline-none px-2 py-1 hover:scale-105 transition-all"
                        >
                          [ DISCARD REPLACEMENT ]
                        </button>
                      )}
                    </div>
                    
                    {editFile ? (
                      <span className="text-[8px] text-[#00ff66] uppercase font-mono tracking-wider flex items-center gap-1.5 animate-pulse font-bold">
                        {editFile.type.startsWith('video/') ? <Film className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                        READY: {editFile.name} ({(editFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    ) : (
                      <span className="text-[8px] text-white/30 uppercase font-mono tracking-wider">
                        LEAVE EMPTY TO PRESERVE CURRENT {editingProject.media_type.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Fields Form Block */}
              <div className="flex flex-col gap-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold font-mono">PROJECT TITLE</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] uppercase text-xs transition-all duration-300 font-mono tracking-wider"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold font-mono">CLIENT / OWNER</label>
                    <input
                      type="text"
                      value={editData.client}
                      onChange={(e) => setEditData(prev => ({ ...prev, client: e.target.value }))}
                      required
                      className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] uppercase text-xs transition-all duration-300 font-mono tracking-wider"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold font-mono">YEAR</label>
                    <input
                      type="number"
                      value={editData.year}
                      onChange={(e) => setEditData(prev => ({ ...prev, year: parseInt(e.target.value) || 2026 }))}
                      required
                      className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] text-xs transition-all duration-300 font-mono tracking-wider"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold font-mono">SCALE REPRESENTATION</label>
                    <input
                      type="text"
                      value={editData.scale}
                      onChange={(e) => setEditData(prev => ({ ...prev, scale: e.target.value }))}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] uppercase text-xs transition-all duration-300 font-mono tracking-wider"
                      placeholder="e.g., 1:1 OR 1:250"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold font-mono">LOCATION CODES</label>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] uppercase text-xs transition-all duration-300 font-mono tracking-wider"
                      placeholder="e.g., TAGBILARAN CITY"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold font-mono">TECHNICAL BRIEF / DESCRIPTION</label>
                  <textarea
                    rows={3}
                    value={editData.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] resize-none text-xs uppercase transition-all duration-300 font-mono leading-relaxed"
                  />
                </div>

                {/* Advanced Structural Metrics Group */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold font-mono">MATERIALS COMPOSITION</label>
                    <input
                      type="text"
                      value={editData.materials}
                      onChange={(e) => setEditData(prev => ({ ...prev, materials: e.target.value }))}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] uppercase text-xs transition-all duration-300 font-mono tracking-wider"
                      placeholder="e.g., CONCRETE, BAMBOO, COCOSHELL"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold font-mono">STRUCTURAL DENSITY</label>
                    <input
                      type="text"
                      value={editData.density}
                      onChange={(e) => setEditData(prev => ({ ...prev, density: e.target.value }))}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] uppercase text-xs transition-all duration-300 font-mono tracking-wider"
                      placeholder="e.g., 2400 kg/m³"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase text-white/50 tracking-wider font-bold font-mono">THERMAL RESISTANCE</label>
                    <input
                      type="text"
                      value={editData.thermal}
                      onChange={(e) => setEditData(prev => ({ ...prev, thermal: e.target.value }))}
                      className="bg-white/5 border border-white/10 rounded px-3 py-2.5 text-white focus:outline-none focus:border-[#00ff66]/50 focus:shadow-[0_0_10px_rgba(0,255,102,0.05)] uppercase text-xs transition-all duration-300 font-mono tracking-wider"
                      placeholder="e.g., R-value: 0.12 m²·K/W"
                    />
                  </div>
                </div>

              </div>

              {editStatus === 'error' && (
                <span className="text-[9px] text-red-400 font-bold uppercase font-mono">{editError}</span>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 border-t border-white/10 pt-5 mt-2">
                <button
                  type="button"
                  onClick={() => { setEditingProject(null); setEditStatus('idle'); }}
                  className="flex-1 border border-white/10 hover:border-white/20 text-white/70 hover:text-white py-3 px-4 font-bold tracking-widest text-[9px] hover:bg-white/5 transition-all duration-300 rounded cursor-pointer focus:outline-none uppercase font-mono"
                >
                  DISCARD CHANGES
                </button>
                
                <button
                  type="submit"
                  disabled={editStatus === 'saving'}
                  className="flex-[2] flex items-center justify-center gap-2 bg-[#00ff66] text-black hover:bg-[#00ff66]/90 py-3 px-4 font-bold tracking-widest text-[9px] transition-all duration-300 rounded disabled:bg-neutral-600 disabled:text-neutral-400 cursor-pointer focus:outline-none uppercase font-mono"
                >
                  {editStatus === 'saving' ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> DISPATCHING METADATA AMENDMENTS...</>
                  ) : editStatus === 'success' ? (
                    <><CheckCircle className="w-3.5 h-3.5 text-green-700 font-black" /> BLUEPRINT RE-REGISTERED SUCCESSFULLY</>
                  ) : (
                    <><Save className="w-3.5 h-3.5" /> COMMIT METADATA AMENDMENTS</>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MESSAGE DETAIL DECODE OVERLAY */}
      {activeMessageDetail && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl overflow-y-auto p-4 md:p-12 flex items-start md:items-center justify-center animate-fadeIn">
          <div className="w-full max-w-2xl bg-neutral-950/90 border border-[#00ff66]/20 p-6 md:p-8 rounded relative shadow-[0_0_50px_rgba(0,255,102,0.05)] animate-scaleIn">
            
            {/* Pulsing secure light */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00ff66] rounded-full animate-ping" />
              <span className="text-[8px] uppercase tracking-[0.2em] text-[#00ff66] font-bold">
                [ DECODED SECURE NODE STREAM ]
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setActiveMessageDetail(null)}
              className="absolute top-5 right-5 p-2 rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white hover:scale-105 transition-all duration-300 cursor-pointer focus:outline-none z-30"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mt-8 mb-6 border-b border-white/10 pb-4 font-bold">
              <span className="text-[8px] tracking-[0.25em] text-white/30 uppercase block mb-1">CLIENT BRIEF REF ID</span>
              <div className="font-mono text-[9px] text-[#00ff66] tracking-wider select-all uppercase">
                {activeMessageDetail.id}
              </div>
            </div>

            <div className="flex flex-col gap-4 text-xs font-mono font-bold">
              
              {/* Client Info Monospace Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-white/5 bg-black/45 p-3 rounded">
                  <span className="text-[8px] uppercase text-white/35 tracking-wider block mb-1">SENDER IDENTIFIER</span>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white select-all">{activeMessageDetail.name}</div>
                </div>
                <div className="border border-white/5 bg-black/45 p-3 rounded">
                  <span className="text-[8px] uppercase text-white/35 tracking-wider block mb-1">VERIFIED CONTACT EMAIL</span>
                  <a href={`mailto:${activeMessageDetail.email}`} className="text-[10px] font-bold tracking-wider text-blue-400 hover:underline select-all">{activeMessageDetail.email}</a>
                </div>
              </div>

              {/* Brief timestamp */}
              <div className="border border-white/5 bg-black/45 p-3 rounded">
                <span className="text-[8px] uppercase text-white/35 tracking-wider block mb-1">TRANSMISSION TIMESTAMP</span>
                <div className="text-[10px] text-white/70 select-all">
                  {activeMessageDetail.created_at ? new Date(activeMessageDetail.created_at).toLocaleString() : 'UNKNOWN'}
                </div>
              </div>

              {/* Raw message block */}
              <div className="border border-white/5 bg-black/45 p-4 rounded flex flex-col gap-2">
                <span className="text-[8px] uppercase text-white/35 tracking-wider block">RAW ARCHITECTURAL BRIEF DECODING</span>
                <p className="bg-[#070707] p-4 border border-[#00ff66]/10 rounded text-[10px] text-[#00ff66] select-text whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto uppercase shadow-inner font-bold">
                  {activeMessageDetail.details}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 border-t border-white/10 pt-5 mt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`NAME: ${activeMessageDetail.name}\nEMAIL: ${activeMessageDetail.email}\nTIMESTAMP: ${activeMessageDetail.created_at}\nDETAILS:\n${activeMessageDetail.details}`);
                    setCopyFeedback(true);
                    setTimeout(() => setCopyFeedback(false), 2000);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-black py-2.5 px-4 font-bold text-[9px] tracking-widest hover:bg-neutral-200 transition-all rounded cursor-pointer focus:outline-none uppercase"
                >
                  <Copy className="w-3.5 h-3.5" /> COPY TO CLIPBOARD
                </button>
                
                <a
                  href={`mailto:${activeMessageDetail.email}?subject=RE: ARCHITECTURAL BRIEF MATRIX&body=Dear ${activeMessageDetail.name},%0D%0A%0D%0AThank you for contacting me. I have decoded your automation brief details and would love to discuss...`}
                  className="flex-1 flex items-center justify-center gap-2 border border-[#00ff66]/20 bg-[#00ff66]/5 hover:bg-[#00ff66]/10 text-[#00ff66] py-2.5 px-4 font-bold text-[9px] tracking-widest transition-all rounded cursor-pointer focus:outline-none uppercase"
                >
                  <Mail className="w-3.5 h-3.5" /> STACK EMAIL REPLY
                </a>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
