import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { name, email, details } = await request.json();

    if (!name || !email || !details) {
      return NextResponse.json(
        { error: 'Name, email, and details are required' },
        { status: 400 }
      );
    }

    // 1. Save contact message to PostgreSQL DB
    const result = await supabase.addContactMessage({ name, email, details });

    // 2. Fetch Telegram Bot credentials from portfolio_info or fallback to preserved ones
    let botToken = '8773584098:AAE1QmEQ91OpzwENLD1okkHqqgDhhqkhIfs';
    let chatId = '5144639792';

    try {
      const info = await supabase.getPortfolioInfo();
      if (info?.telegram_bot_token) {
        botToken = info.telegram_bot_token;
      }
      if (info?.telegram_chat_id) {
        chatId = info.telegram_chat_id;
      }
    } catch (dbErr) {
      console.warn('Could not load Telegram credentials from database. Using defaults:', dbErr);
    }

    // 3. Dispatch automated alert to Telegram Bot channel in the background
    try {
      const telegramText = `⚡️ <b>[NEW PORTFOLIO INQUIRY]</b> ⚡️\n\n` +
        `👤 <b>NAME:</b> ${name.toUpperCase()}\n` +
        `✉️ <b>EMAIL:</b> ${email}\n` +
        `📅 <b>DATE:</b> ${new Date().toLocaleString()}\n\n` +
        `📝 <b>AUTOMATION BRIEF:</b>\n<pre>${details.toUpperCase()}</pre>`;

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramText,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        console.warn(`Telegram API error: ${response.statusText}`);
      }
    } catch (telegramErr) {
      console.error('Failed sending Telegram notification:', telegramErr);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (e: any) {
    console.error('Error in contact submissions:', e);
    return NextResponse.json(
      { error: e.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
