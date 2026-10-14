import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import Therapist from '@/models/Therapist';
import User from '@/models/User';
import Patient from '@/models/Patient';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    await connectToDatabase();

    const therapist = await Therapist.findById(params.id)
      .populate('userId', 'name email status avatar lastActive')
      .lean();

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    const patients = await Patient.find({ therapistId: therapist._id })
      .populate('userId', 'name email avatar status')
      .lean();

    return NextResponse.json({
      therapist: {
        ...therapist,
        assignedPatients: patients,
        patientCount: patients.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(['ADMIN']);
    await connectToDatabase();

    const therapist = await Therapist.findById(params.id);
    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    const body = await req.json();

    if (body.position) therapist.position = body.position;
    if (body.department) therapist.department = body.department;
    if (body.specialization) therapist.specialization = body.specialization;
    if (body.phone !== undefined) therapist.phone = body.phone;

    await therapist.save();

    if (body.status || body.name) {
      const user = await User.findById(therapist.userId);
      if (user) {
        if (body.status) user.status = body.status;
        if (body.name) user.name = body.name;
        await user.save();
      }
    }

    return NextResponse.json({ message: 'Therapist updated successfully', therapist });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
