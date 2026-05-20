import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight JWT signature verification using Web Crypto API for Next.js Edge compatibility
async function verifyJwt(token: string, secret: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    
    // Decode and parse payload
    const payloadStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr);
    
    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      console.warn('JWT has expired.');
      return null;
    }

    // Verify signature
    const encoder = new TextEncoder();
    const secretKeyData = encoder.encode(secret);
    
    const key = await crypto.subtle.importKey(
      'raw',
      secretKeyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBuffer = Uint8Array.from(
      atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    const verified = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBuffer,
      encoder.encode(`${headerB64}.${payloadB64}`)
    );

    return verified ? payload : null;
  } catch (e) {
    console.error('JWT Edge verification failed:', e);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect the /admin page and its subroutes (excluding login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('admin_session')?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const secret = process.env.JWT_SECRET || 'super-secret-key-1234-portfolio-cyrhiel-moralla-fresh-2026';
    const decoded = await verifyJwt(sessionCookie, secret);

    if (!decoded || decoded.role !== 'admin') {
      // Clear invalid cookie and redirect
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
