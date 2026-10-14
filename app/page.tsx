import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';

export default async function HomePage() {
  const session = await getCurrentUser();

  if (!session) {
    redirect('/login');
  }

  if (session.role === 'ADMIN') {
    redirect('/admin/dashboard');
  } else if (session.role === 'THERAPIST') {
    redirect('/therapist/dashboard');
  } else if (session.role === 'PATIENT') {
    redirect('/patient/dashboard');
  }

  redirect('/login');
}
