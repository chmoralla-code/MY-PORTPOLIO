import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const yearStr = formData.get('year') as string;
    const client = formData.get('client') as string;
    const scale = formData.get('scale') as string;
    const location = formData.get('location') as string;
    const materials = formData.get('materials') as string;

    if (!file || !title || !description || !client || !yearStr) {
      return NextResponse.json(
        { message: 'Missing required project data fields or file.' },
        { status: 400 }
      );
    }

    const year = parseInt(yearStr) || new Date().getFullYear();
    const fileExt = file.name.substring(file.name.lastIndexOf('.'));
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`;
    
    // Determine media type
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

    // 1. Upload file buffer to Supabase Storage Bucket
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const imageUrl = await supabase.uploadMedia(buffer, uniqueFileName, file.type);

    // 2. Insert metadata record in PostgreSQL projects table
    const project = await supabase.addProject({
      title,
      description,
      image_url: imageUrl,
      year,
      client,
      media_type: mediaType,
      scale: scale || undefined,
      location: location || undefined,
      materials: materials || undefined
    });

    return NextResponse.json({ success: true, project });
  } catch (e: any) {
    console.error('Error in media upload api:', e);
    return NextResponse.json(
      { message: e.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
