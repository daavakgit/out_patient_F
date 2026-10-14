import { NextResponse, NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully' });

  let role = '';
  try {
    const body = await req.json();
    role = body?.role || '';
  } catch {
    // body might be empty
  }

  if (!role) {
    const headerRole = req.headers.get('x-portal-role');
    if (headerRole) role = headerRole.toUpperCase();
    else {
      const referer = req.headers.get('referer')?.toLowerCase() || '';
      if (referer.includes('/therapist')) role = 'THERAPIST';
      else if (referer.includes('/patient')) role = 'PATIENT';
      else if (referer.includes('/admin')) role = 'ADMIN';
    }
  }

  if (role === 'THERAPIST') {
    response.cookies.delete('rehabpulse_token_therapist');
  } else if (role === 'PATIENT') {
    response.cookies.delete('rehabpulse_token_patient');
  } else if (role === 'ADMIN') {
    response.cookies.delete('rehabpulse_token_admin');
  } else {
    // If no role specified, clear all
    response.cookies.delete('rehabpulse_token_therapist');
    response.cookies.delete('rehabpulse_token_patient');
    response.cookies.delete('rehabpulse_token_admin');
  }

  response.cookies.delete('rehabpulse_token');
  return response;
}
