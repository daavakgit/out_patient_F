import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import Therapist from '@/models/Therapist';
import User from '@/models/User';
import Patient from '@/models/Patient';
import bcrypt from 'bcryptjs';
import { createTherapistSchema } from '@/lib/validations';

export async function GET() {
  try {
    await requireAuth();
    await connectToDatabase();

    const therapists = await Therapist.find({})
      .populate('userId', 'name email status avatar lastActive')
      .lean();

    // Attach patient count to each therapist
    const formatted = await Promise.all(
      therapists.map(async (t) => {
        const patientCount = await Patient.countDocuments({ therapistId: t._id });
        return {
          id: t._id.toString(),
          therapistId: t._id.toString(),
          position: t.position,
          department: t.department,
          specialization: t.specialization,
          phone: t.phone,
          user: t.userId,
          patientCount,
        };
      })
    );

    return NextResponse.json({ therapists: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(['ADMIN']);
    await connectToDatabase();

    const body = await req.json();
    const validated = createTherapistSchema.parse(body);

    const existingUser = await User.findOne({ email: validated.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const user = await User.create({
      name: validated.name,
      email: validated.email.toLowerCase(),
      password: hashedPassword,
      role: 'THERAPIST',
      status: 'ACTIVE',
    });

    const therapist = await Therapist.create({
      userId: user._id,
      position: validated.position,
      department: validated.department,
      specialization: validated.specialization,
      phone: validated.phone || '',
    });

    return NextResponse.json({
      message: 'Therapist created successfully',
      therapist: {
        id: therapist._id.toString(),
        position: therapist.position,
        department: therapist.department,
        user: { name: user.name, email: user.email },
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
