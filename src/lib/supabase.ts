const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hzeqntoxqeylnglkgdnp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Type Definitions
export interface PortfolioInfo {
  id: number;
  hero_title: string;
  hero_subtitle: string;
  poetry: string;
  about_text: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  telegram_bot_token?: string;
  telegram_chat_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  scale?: string;
  location?: string;
  materials?: string;
  image_url: string;
  year: number;
  client: string;
  media_type: 'image' | 'video';
  created_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  details: string;
  read: boolean;
  created_at: string;
}

// Base request helper
async function supabaseFetch(path: string, options: RequestInit = {}) {
  const isServer = typeof window === 'undefined';
  const key = isServer ? (supabaseServiceKey || supabaseAnonKey) : supabaseAnonKey;
  
  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Supabase REST Error (${response.status}): ${err}`);
  }

  // Handle empty or deleted responses (no content, e.g. 204)
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const supabase = {
  // 1. Portfolio Copy Management
  async getPortfolioInfo(): Promise<PortfolioInfo | null> {
    try {
      const data = await supabaseFetch('/rest/v1/portfolio_info?id=eq.1', {
        method: 'GET',
        next: { revalidate: 0 } // Bypass Next.js cache to ensure dynamic updates load instantly
      });
      return data[0] || null;
    } catch (e) {
      console.error('Error fetching portfolio info:', e);
      return null;
    }
  },

  async updatePortfolioInfo(updates: Partial<PortfolioInfo>): Promise<PortfolioInfo[]> {
    return supabaseFetch('/rest/v1/portfolio_info?id=eq.1', {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString()
      }),
      headers: {
        'Prefer': 'return=representation'
      }
    });
  },

  async getProjects(): Promise<Project[]> {
    try {
      const data = await supabaseFetch('/rest/v1/projects?order=created_at.desc', {
        method: 'GET',
        next: { revalidate: 0 }
      });

      // If database has 0 projects, auto-seed the 5 master blueprints on server-side
      if (Array.isArray(data) && data.length === 0 && typeof window === 'undefined') {
        console.log('No projects found in database. Auto-seeding 5 default blueprints...');
        const mockProjectsToSeed = [
          {
            title: 'KINETIC SHELL / MONOLITHIC PAVILION',
            description: 'An exploration of self-supporting origami concrete shells utilizing hyper-thin fiber reinforced matrices. An ongoing spatial installation addressing structural weight in tropical microclimates.',
            scale: 'SCALE 1:50',
            location: 'PANGLAO, BOHOL',
            materials: 'GLASS-FIBER CONCRETE // DENSITY: 2400 kg/m³ // THERMAL: 1.3 W/mK',
            image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            year: 2026,
            client: 'BOHOL SPATIAL LAB',
            media_type: 'image'
          },
          {
            title: 'OBSIDIAN CORE / APERTURE HOUSE',
            description: 'Residential typology carved entirely from basalt and volcanic aggregates. Operates as a thermodynamic sink utilizing deep-ground thermal mass cooling.',
            scale: 'SCALE 1:100',
            location: 'ALONA, PANGLAO',
            materials: 'POLISHED BASALT // DENSITY: 2900 kg/m³ // THERMAL: 1.7 W/mK',
            image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
            year: 2025,
            client: 'PRIVATE RESIDENCE',
            media_type: 'image'
          },
          {
            title: 'LUMINAL MATRIX / THE BRUTALIST ARCHIVE',
            description: 'A civic research library utilizing post-tensioned raw concrete ribs. Natural light is filtered through deep concrete fins, creating an ever-shifting sundial layout inside.',
            scale: 'SCALE 1:250',
            location: 'TAGBILARAN CITY',
            materials: 'POURED CONCRETE // DENSITY: 2300 kg/m³ // THERMAL: 1.2 W/mK',
            image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            year: 2026,
            client: 'MUNICIPAL CIVIL DECK',
            media_type: 'image'
          },
          {
            title: 'FRACTAL REEF / FLOATING AQUACENE',
            description: 'An offshore environmental research station constructed from carbon fiber composites. Features a modular frame designed to move in synchronization with oceanic swells.',
            scale: 'SCALE 1:500',
            location: 'MINDANAO TRENCH OVERLOOK',
            materials: 'CARBON-REINFORCED VINYL // DENSITY: 1600 kg/m³ // THERMAL: 0.15 W/mK',
            image_url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
            year: 2026,
            client: 'OCEANIC RESEARCH DECK',
            media_type: 'image'
          },
          {
            title: 'AETHER SHROUD / TENSIONED PAVILION',
            description: 'Temporary lightweight exhibition architecture using ultra-strong tensegrity columns and translucent acoustic membranes.',
            scale: 'SCALE 1:25',
            location: 'UBUJAN ARCHITECTURAL DECK',
            materials: 'ALUMINUM EXTRUSION // DENSITY: 2700 kg/m³ // THERMAL: 200 W/mK',
            image_url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
            year: 2025,
            client: 'CULTURAL COMMISSION PH',
            media_type: 'image'
          }
        ];

        try {
          const seeded = await supabaseFetch('/rest/v1/projects', {
            method: 'POST',
            body: JSON.stringify(mockProjectsToSeed),
            headers: {
              'Prefer': 'return=representation'
            }
          });
          console.log('Successfully seeded 5 default blueprints into Supabase!');
          return seeded || [];
        } catch (seedError) {
          console.error('Failed to auto-seed projects:', seedError);
        }
      }

      return data;
    } catch (e) {
      console.error('Error fetching projects:', e);
      return [];
    }
  },

  async addProject(project: Omit<Project, 'id' | 'created_at'>): Promise<Project[]> {
    return supabaseFetch('/rest/v1/projects', {
      method: 'POST',
      body: JSON.stringify(project),
      headers: {
        'Prefer': 'return=representation'
      }
    });
  },

  async deleteProject(id: string): Promise<void> {
    return supabaseFetch(`/rest/v1/projects?id=eq.${id}`, {
      method: 'DELETE'
    });
  },

  // 3. Contact Messages Management
  async addContactMessage(message: Omit<ContactMessage, 'id' | 'read' | 'created_at'>): Promise<ContactMessage[]> {
    return supabaseFetch('/rest/v1/contact_messages', {
      method: 'POST',
      body: JSON.stringify({
        ...message,
        read: false
      }),
      headers: {
        'Prefer': 'return=representation'
      }
    });
  },

  async getContactMessages(): Promise<ContactMessage[]> {
    try {
      return await supabaseFetch('/rest/v1/contact_messages?order=created_at.desc', {
        method: 'GET',
        next: { revalidate: 0 }
      });
    } catch (e) {
      console.error('Error fetching contact messages:', e);
      return [];
    }
  },

  async markMessageAsRead(id: string): Promise<ContactMessage[]> {
    return supabaseFetch(`/rest/v1/contact_messages?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
      headers: {
        'Prefer': 'return=representation'
      }
    });
  },

  // Update an existing project's metadata
  async updateProject(id: string, updates: Partial<Project>): Promise<Project[]> {
    return supabaseFetch(`/rest/v1/projects?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      headers: {
        'Prefer': 'return=representation'
      }
    });
  },

  // 4. Storage Upload/Delete (Server-Side Only for Security)
  async uploadMedia(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
    const key = supabaseServiceKey || supabaseAnonKey;
    const response = await fetch(`${supabaseUrl}/storage/v1/object/portfolio_images/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'apikey': key,
        'Content-Type': contentType,
        'x-upsert': 'true'
      },
      body: fileBuffer as any
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Storage upload error (${response.status}): ${err}`);
    }

    return `${supabaseUrl}/storage/v1/object/public/portfolio_images/${fileName}`;
  },

  async deleteMedia(fileName: string): Promise<boolean> {
    const key = supabaseServiceKey || supabaseAnonKey;
    
    // Deleting from storage bucket requires DELETE call with object path
    const response = await fetch(`${supabaseUrl}/storage/v1/object/portfolio_images/${fileName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${key}`,
        'apikey': key
      }
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn(`Storage delete warning (${response.status}): ${err}`);
    }
    return true;
  }
};
