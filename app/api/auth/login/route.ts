import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db/connect';
import User from '@/models/User';
import Patient from '@/models/Patient';
import Therapist from '@/models/Therapist';
import { signToken } from '@/lib/auth/jwt';
import { loginSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    await connectToDatabase();

    const user = await User.findOne({ email: validated.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account is deactivated. Please contact system admin.' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(validated.password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    let patientId: string | undefined;
    let therapistId: string | undefined;

    if (user.role === 'PATIENT') {
      const patientDoc = await Patient.findOne({ userId: user._id }).lean();
      if (patientDoc) patientId = patientDoc._id.toString();
    } else if (user.role === 'THERAPIST') {
      const therapistDoc = await Therapist.findOne({ userId: user._id }).lean();
      if (therapistDoc) therapistId = therapistDoc._id.toString();
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      patientId,
      therapistId,
    });

    const response = NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        patientId,
        therapistId,
        avatar: user.avatar,
      },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    };

    // Set role-specific isolated cookie
    const roleCookieName =
      user.role === 'THERAPIST'
        ? 'rehabpulse_token_therapist'
        : user.role === 'PATIENT'
        ? 'rehabpulse_token_patient'
        : 'rehabpulse_token_admin';

    response.cookies.set(roleCookieName, token, cookieOptions);

    // Also set active default cookie
    response.cookies.set('rehabpulse_token', token, cookieOptions);

    return response;
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
}
