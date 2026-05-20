import PortfolioView from '@/components/PortfolioView';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering so updates on the admin dashboard display instantly on the public website
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  // Fetch data in parallel on the server
  const [portfolioInfo, projects] = await Promise.all([
    supabase.getPortfolioInfo(),
    supabase.getProjects()
  ]);

  return (
    <PortfolioView 
      initialInfo={portfolioInfo}
      initialProjects={projects}
    />
  );
}
