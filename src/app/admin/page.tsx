import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering on the admin dashboard to ensure the latest database states are always displayed
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  // Fetch data in parallel on the server
  const [portfolioInfo, projects, messages] = await Promise.all([
    supabase.getPortfolioInfo(),
    supabase.getProjects(),
    supabase.getContactMessages()
  ]);

  return (
    <AdminDashboard 
      initialInfo={portfolioInfo}
      initialProjects={projects}
      initialMessages={messages}
    />
  );
}
