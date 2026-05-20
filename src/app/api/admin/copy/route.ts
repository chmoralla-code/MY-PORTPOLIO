import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    
    // Updates only allowed fields for security
    const { 
      hero_title, 
      hero_subtitle, 
      poetry,
      about_text, 
      contact_email, 
      contact_phone, 
      contact_address,
      telegram_bot_token,
      telegram_chat_id
    } = body;

    const updates = {
      hero_title,
      hero_subtitle,
      poetry,
      about_text,
      contact_email,
      contact_phone,
      contact_address,
      telegram_bot_token,
      telegram_chat_id
    };

    // Filter out undefined values
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    const result = await supabase.updatePortfolioInfo(cleanedUpdates);

    return NextResponse.json({ success: true, data: result });
  } catch (e: any) {
    console.error('Error in copy update api:', e);
    return NextResponse.json(
      { error: e.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
