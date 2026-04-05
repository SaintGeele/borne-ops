import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const allowedIPs = process.env.ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];
  const clientIP =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // Skip IP check in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // Skip for static files and health checks
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico' ||
    pathname === '/health'
  ) {
    return NextResponse.next();
  }

  // Check if IP is allowed
  const isAllowed = allowedIPs.some(ip => {
    if (ip.includes('/')) {
      // CIDR range check (simplified)
      const [base, bits] = ip.split('/');
      const mask = ~(~0 << (32 - parseInt(bits)));
      const ipNum = ipToNumber(clientIP);
      const baseNum = ipToNumber(base);
      return (ipNum & mask) === (baseNum & mask);
    }
    return ip === clientIP;
  });

  if (!isAllowed) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct), 0) >>> 0;
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};