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

  // 2. Projects Gallery Management
  async getProjects(): Promise<Project[]> {
    try {
      return await supabaseFetch('/rest/v1/projects?order=created_at.desc', {
        method: 'GET',
        next: { revalidate: 0 }
      });
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
    return supabaseFetch('/rest/v1/contact_messages?order=created_at.desc', {
      method: 'GET',
      next: { revalidate: 0 }
    });
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
