import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(request: Request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const yearStr = formData.get('year') as string;
    const client = formData.get('client') as string;
    const scale = formData.get('scale') as string;
    const location = formData.get('location') as string;
    const materials = formData.get('materials') as string;
    const file = formData.get('file') as File | null;
    const oldImageUrl = formData.get('old_image_url') as string;

    if (!id) {
      return NextResponse.json({ message: 'Project ID is required.' }, { status: 400 });
    }

    const year = parseInt(yearStr) || new Date().getFullYear();

    // Build updates object with provided fields
    const updates: Record<string, any> = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (yearStr) updates.year = year;
    if (client) updates.client = client;
    if (scale !== null && scale !== undefined) updates.scale = scale;
    if (location !== null && location !== undefined) updates.location = location;
    if (materials !== null && materials !== undefined) updates.materials = materials;

    // If a new media file was provided, upload it and replace the old one
    if (file && file.size > 0) {
      const fileExt = file.name.substring(file.name.lastIndexOf('.'));
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`;
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';

      // Upload new file
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const newImageUrl = await supabase.uploadMedia(buffer, uniqueFileName, file.type);

      updates.image_url = newImageUrl;
      updates.media_type = mediaType;

      // Delete old file from storage (best-effort)
      if (oldImageUrl) {
        try {
          const oldFileName = oldImageUrl.substring(oldImageUrl.lastIndexOf('/') + 1);
          // Strip query params if any
          const cleanFileName = oldFileName.split('?')[0];
          if (cleanFileName) {
            await supabase.deleteMedia(cleanFileName);
          }
        } catch (delErr) {
          console.warn('Old media cleanup warning:', delErr);
        }
      }
    }

    const result = await supabase.updateProject(id, updates);

    return NextResponse.json({ success: true, project: result });
  } catch (e: any) {
    console.error('Error in project update API:', e);
    return NextResponse.json(
      { message: e.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
