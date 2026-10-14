import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import ExerciseAssignment from '@/models/ExerciseAssignment';
import Patient from '@/models/Patient';
import RehabilitationPlan from '@/models/RehabilitationPlan';
import Notification from '@/models/Notification';
import { assignExerciseSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    let query: any = {};

    if (session.role === 'PATIENT') {
      // Strict Patient Data Isolation
      query.patientId = session.patientId;
    } else if (patientId) {
      query.patientId = patientId;
    } else if (session.role === 'THERAPIST') {
      query.therapistId = session.therapistId;
    }

    const assignments = await ExerciseAssignment.find(query)
      .populate('exerciseId')
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email' } })
      .populate('rehabilitationPlanId', 'name currentPhase')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ assignments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(['THERAPIST', 'ADMIN']);
    await connectToDatabase();

    const body = await req.json();
    const validated = assignExerciseSchema.parse(body);

    const createdAssignments = [];

    for (const pId of validated.patientIds) {
      // Find patient's active plan if not provided
      let planId = validated.rehabilitationPlanId;
      let phaseId = validated.phaseId;

      if (!planId) {
        const activePlan = await RehabilitationPlan.findOne({ patientId: pId, status: 'ACTIVE' }).lean();
        if (activePlan) {
          planId = activePlan._id.toString();
        }
      }

      const assignment = await ExerciseAssignment.create({
        patientId: pId,
        therapistId: session.therapistId || body.therapistId,
        exerciseId: validated.exerciseId,
        rehabilitationPlanId: planId || undefined,
        phaseId: phaseId || undefined,
        sets: validated.sets,
        reps: validated.reps,
        holdDuration: validated.holdDuration,
        restDuration: validated.restDuration,
        frequency: validated.frequency,
        startDate: new Date(),
        therapistNotes: validated.therapistNotes || '',
        status: 'ACTIVE',
      });

      // Send notification to patient
      const patientDoc = await Patient.findById(pId).select('userId').lean();
      if (patientDoc?.userId) {
        await Notification.create({
          userId: patientDoc.userId,
          title: 'New Exercise Assigned',
          message: `Your therapist assigned a new exercise protocol: ${validated.sets} sets × ${validated.reps} reps.`,
          type: 'EXERCISE',
          link: '/patient/exercises',
        });
      }

      createdAssignments.push(assignment);
    }

    return NextResponse.json({
      message: `Successfully assigned exercise to ${createdAssignments.length} patient(s)`,
      assignments: createdAssignments,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Assign Exercise error:', error);
    return NextResponse.json({ error: error.message || 'Failed to assign exercise' }, { status: 500 });
  }
}
