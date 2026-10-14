import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'rehabpulse_super_secret_jwt_key_2026_production_grade_32byte';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'THERAPIST' | 'PATIENT';
  name: string;
  patientId?: string;
  therapistId?: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getSessionToken(roleHint?: 'ADMIN' | 'THERAPIST' | 'PATIENT'): Promise<string | null> {
  const cookieStore = cookies();
  let headerStore: ReturnType<typeof headers> | null = null;
  try {
    headerStore = headers();
  } catch {
    // headers() might not be available in non-request contexts
  }

  // 1. Check Bearer token in Authorization header
  if (headerStore) {
    const authHeader = headerStore.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7).trim();
      if (bearerToken) return bearerToken;
    }
  }

  // 2. Determine target role from hint, x-portal-role header, or referer URL
  let targetRole = roleHint;
  if (!targetRole && headerStore) {
    const portalHeader = headerStore.get('x-portal-role')?.toUpperCase();
    if (portalHeader === 'THERAPIST' || portalHeader === 'PATIENT' || portalHeader === 'ADMIN') {
      targetRole = portalHeader as any;
    } else {
      const referer = headerStore.get('referer')?.toLowerCase() || '';
      if (referer.includes('/therapist')) targetRole = 'THERAPIST';
      else if (referer.includes('/patient')) targetRole = 'PATIENT';
      else if (referer.includes('/admin')) targetRole = 'ADMIN';
    }
  }

  // 3. If targetRole is identified, check its dedicated role cookie
  if (targetRole === 'THERAPIST') {
    const token = cookieStore.get('rehabpulse_token_therapist')?.value;
    if (token) return token;
  } else if (targetRole === 'PATIENT') {
    const token = cookieStore.get('rehabpulse_token_patient')?.value;
    if (token) return token;
  } else if (targetRole === 'ADMIN') {
    const token = cookieStore.get('rehabpulse_token_admin')?.value;
    if (token) return token;
  }

  // 4. Check general cookie rehabpulse_token
  const defaultToken = cookieStore.get('rehabpulse_token')?.value;
  if (defaultToken) {
    if (targetRole) {
      const decoded = verifyToken(defaultToken);
      if (decoded && decoded.role === targetRole) {
        return defaultToken;
      }
    } else {
      return defaultToken;
    }
  }

  // 5. Fallback: check any present role-specific token
  return (
    cookieStore.get('rehabpulse_token_therapist')?.value ||
    cookieStore.get('rehabpulse_token_patient')?.value ||
    cookieStore.get('rehabpulse_token_admin')?.value ||
    null
  );
}
