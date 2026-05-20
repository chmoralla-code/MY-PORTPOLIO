import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { id, imageUrl } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // 1. Delete project from Postgres DB
    await supabase.deleteProject(id);

    // 2. Delete media object from Storage Bucket if imageUrl is present
    if (imageUrl) {
      const fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
      if (fileName) {
        await supabase.deleteMedia(fileName);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Error in project deletion API:', e);
    return NextResponse.json(
      { error: e.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
