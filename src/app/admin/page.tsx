import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering on the admin dashboard to ensure the latest database states are always displayed
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  // Fetch data in parallel on the server — each call has its own error handling
  let portfolioInfo = null;
  let projects: any[] = [];
  let messages: any[] = [];

  try {
    [portfolioInfo, projects, messages] = await Promise.all([
      supabase.getPortfolioInfo(),
      supabase.getProjects(),
      supabase.getContactMessages()
    ]);
  } catch (e) {
    console.error('Admin page data fetch error:', e);
    // Fallback: try each individually
    try { portfolioInfo = await supabase.getPortfolioInfo(); } catch (_) {}
    try { projects = await supabase.getProjects(); } catch (_) {}
    try { messages = await supabase.getContactMessages(); } catch (_) {}
  }

  return (
    <AdminDashboard 
      initialInfo={portfolioInfo}
      initialProjects={projects || []}
      initialMessages={messages || []}
    />
  );
}
