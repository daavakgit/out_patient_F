import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import Appointment from '@/models/Appointment';
import Patient from '@/models/Patient';
import Notification from '@/models/Notification';
import { createAppointmentSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    let query: any = {};
    if (session.role === 'PATIENT') {
      query.patientId = session.patientId;
    } else if (session.role === 'THERAPIST') {
      query.therapistId = session.therapistId;
    }

    const appointments = await Appointment.find(query)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email avatar' } })
      .populate({ path: 'therapistId', populate: { path: 'userId', select: 'name email' } })
      .sort({ date: 1 })
      .lean();

    return NextResponse.json({ appointments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const body = await req.json();
    const validated = createAppointmentSchema.parse(body);

    let therapistId = session.therapistId;

    if (session.role === 'PATIENT') {
      const pDoc = await Patient.findById(session.patientId).lean();
      if (pDoc) therapistId = pDoc.therapistId.toString();
    }

    if (!therapistId) {
      return NextResponse.json({ error: 'Therapist reference required for appointment' }, { status: 400 });
    }

    const appointment = await Appointment.create({
      patientId: validated.patientId,
      therapistId,
      date: new Date(validated.date),
      time: validated.time,
      type: validated.type,
      status: 'SCHEDULED',
      notes: validated.notes || '',
    });

    // Send notifications
    const pDoc = await Patient.findById(validated.patientId).select('userId').lean();
    if (pDoc?.userId) {
      await Notification.create({
        userId: pDoc.userId,
        title: 'New Appointment Scheduled',
        message: `Appointment scheduled for ${validated.date} at ${validated.time} (${validated.type}).`,
        type: 'APPOINTMENT',
        link: '/patient/appointments',
      });
    }

    return NextResponse.json({ message: 'Appointment created successfully', appointment });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
