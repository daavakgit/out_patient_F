import { getSessionToken, verifyToken, TokenPayload } from './jwt';
import { connectToDatabase } from '@/lib/db/connect';
import User from '@/models/User';
import Patient from '@/models/Patient';
import Therapist from '@/models/Therapist';

export interface UserSession extends TokenPayload {
  userDocId: string;
}

export async function getCurrentUser(roleHint?: 'ADMIN' | 'THERAPIST' | 'PATIENT'): Promise<UserSession | null> {
  const token = await getSessionToken(roleHint);
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  // If roleHint was explicitly provided and doesn't match decoded role, reject
  if (roleHint && decoded.role !== roleHint) {
    return null;
  }

  await connectToDatabase();

  const user = await User.findById(decoded.userId).lean();
  if (!user || user.status !== 'ACTIVE') {
    return null;
  }

  let patientId = decoded.patientId;
  let therapistId = decoded.therapistId;

  if (user.role === 'PATIENT' && !patientId) {
    const patientDoc = await Patient.findOne({ userId: user._id }).select('_id').lean();
    if (patientDoc) {
      patientId = patientDoc._id.toString();
    }
  } else if (user.role === 'THERAPIST' && !therapistId) {
    const therapistDoc = await Therapist.findOne({ userId: user._id }).select('_id').lean();
    if (therapistDoc) {
      therapistId = therapistDoc._id.toString();
    }
  }

  return {
    userId: user._id.toString(),
    userDocId: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    patientId,
    therapistId,
  };
}

export async function requireAuth(roleHint?: 'ADMIN' | 'THERAPIST' | 'PATIENT'): Promise<UserSession> {
  const session = await getCurrentUser(roleHint);
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function requireRole(allowedRoles: Array<'ADMIN' | 'THERAPIST' | 'PATIENT'>): Promise<UserSession> {
  // If only one role is allowed (e.g. ['THERAPIST']), pass it directly as hint
  let session: UserSession | null = null;
  
  if (allowedRoles.length === 1) {
    session = await getCurrentUser(allowedRoles[0]);
  } else {
    // If multiple roles allowed, try the matching role hint first based on request or try allowed roles
    for (const r of allowedRoles) {
      session = await getCurrentUser(r);
      if (session && allowedRoles.includes(session.role)) break;
    }
  }

  if (!session) {
    // Fallback attempt without role hint
    session = await getCurrentUser();
  }

  if (!session) {
    throw new Error('UNAUTHORIZED');
  }

  if (!allowedRoles.includes(session.role)) {
    throw new Error('FORBIDDEN');
  }

  return session;
}
