import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import ExerciseSession from '@/models/ExerciseSession';
import ExerciseAssignment from '@/models/ExerciseAssignment';
import Exercise from '@/models/Exercise';
import Patient from '@/models/Patient';
import Notification from '@/models/Notification';
import Therapist from '@/models/Therapist';
import { startSessionSchema, submitSessionSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    let query: any = {};

    if (session.role === 'PATIENT') {
      query.patientId = session.patientId;
    } else if (patientId) {
      query.patientId = patientId;
    } else if (session.role === 'THERAPIST') {
      query.therapistId = session.therapistId;
    }

    const sessions = await ExerciseSession.find(query)
      .populate('exerciseId')
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email avatar' } })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

// START EXERCISE SESSION
export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    if (session.role !== 'PATIENT' || !session.patientId) {
      return NextResponse.json({ error: 'Only authenticated patients can initiate exercise sessions.' }, { status: 403 });
    }

    const body = await req.json();
    const validated = startSessionSchema.parse(body);

    // Verify exercise exists
    const exercise = await Exercise.findById(validated.exerciseId);
    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    const patient = await Patient.findById(session.patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newSession = await ExerciseSession.create({
      sessionId,
      patientId: session.patientId,
      therapistId: patient.therapistId,
      exerciseId: validated.exerciseId,
      exerciseAssignmentId: validated.exerciseAssignmentId || undefined,
      rehabilitationPlanId: validated.rehabilitationPlanId || undefined,
      phaseId: validated.phaseId || undefined,
      startTime: new Date(),
      duration: 0,
      targetSets: validated.targetSets,
      completedSets: 0,
      targetRepetitions: validated.targetRepetitions,
      completedRepetitions: 0,
      pauseDuration: 0,
      status: 'STARTED',
    });

    return NextResponse.json({ message: 'Session started successfully', session: newSession });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
