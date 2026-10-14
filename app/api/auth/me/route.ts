import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    // 1. Check query parameter ?portal=therapist|patient|admin
    let portal = req.nextUrl.searchParams.get('portal')?.toUpperCase();

    // 2. Check header x-portal-role
    if (!portal) {
      portal = req.headers.get('x-portal-role')?.toUpperCase();
    }

    // 3. Check referer URL
    if (!portal) {
      const referer = req.headers.get('referer')?.toLowerCase() || '';
      if (referer.includes('/therapist')) portal = 'THERAPIST';
      else if (referer.includes('/patient')) portal = 'PATIENT';
      else if (referer.includes('/admin')) portal = 'ADMIN';
    }

    const roleHint =
      portal === 'THERAPIST' || portal === 'PATIENT' || portal === 'ADMIN'
        ? (portal as 'THERAPIST' | 'PATIENT' | 'ADMIN')
        : undefined;

    const user = await getCurrentUser(roleHint);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, user });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
