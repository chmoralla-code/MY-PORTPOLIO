import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'Missing avatar file.' },
        { status: 400 }
      );
    }

    // Read the file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload profile avatar directly to Supabase storage, overwriting any existing file
    const imageUrl = await supabase.uploadMedia(buffer, 'profile_avatar.webp', file.type);

    return NextResponse.json({ success: true, imageUrl });
  } catch (e: any) {
    console.error('Error in profile avatar upload api:', e);
    return NextResponse.json(
      { message: e.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
