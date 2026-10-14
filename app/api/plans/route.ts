import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import RehabilitationPlan from '@/models/RehabilitationPlan';
import RehabilitationPhase from '@/models/RehabilitationPhase';
import Patient from '@/models/Patient';
import Notification from '@/models/Notification';
import { z } from 'zod';

const createPlanSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  name: z.string().min(3, 'Plan name is required'),
  expectedDurationWeeks: z.number().min(1).default(12),
  goals: z.array(z.string()).default([]),
  currentPhase: z.number().min(1).max(4).default(1),
  therapistNotes: z.string().optional(),
});

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

    const plans = await RehabilitationPlan.find(query)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email avatar' } })
      .populate({ path: 'therapistId', populate: { path: 'userId', select: 'name email' } })
      .sort({ createdAt: -1 })
      .lean();

    // Attach phases to each plan
    const plansWithPhases = await Promise.all(
      plans.map(async (p: any) => {
        const phases = await RehabilitationPhase.find({ planId: p._id }).sort({ phaseNumber: 1 }).lean();
        return {
          ...p,
          phases,
        };
      })
    );

    return NextResponse.json({ plans: plansWithPhases });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(['THERAPIST', 'ADMIN']);
    await connectToDatabase();

    const body = await req.json();
    const validated = createPlanSchema.parse(body);

    const therapistId = session.therapistId || body.therapistId;
    if (!therapistId) {
      return NextResponse.json({ error: 'Therapist context is required' }, { status: 400 });
    }

    const patient = await Patient.findById(validated.patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const plan = await RehabilitationPlan.create({
      patientId: validated.patientId,
      therapistId,
      name: validated.name,
      startDate: new Date(),
      expectedDurationWeeks: validated.expectedDurationWeeks,
      goals: validated.goals,
      currentPhase: validated.currentPhase,
      therapistNotes: validated.therapistNotes || '',
      status: 'ACTIVE',
    });

    const phaseNames = [
      'Phase 1: Pain Management & Mobility',
      'Phase 2: Strength Development',
      'Phase 3: Functional Recovery',
      'Phase 4: Return to Normal Activity',
    ];

    const phases = [];
    for (let i = 1; i <= 4; i++) {
      const ph = await RehabilitationPhase.create({
        planId: plan._id,
        patientId: validated.patientId,
        phaseNumber: i,
        name: phaseNames[i - 1],
        description: `Therapeutic progression phase ${i} towards full discharge.`,
        goals: validated.goals,
        durationWeeks: Math.ceil(validated.expectedDurationWeeks / 4),
        status: i === validated.currentPhase ? 'IN_PROGRESS' : i < validated.currentPhase ? 'COMPLETED' : 'NOT_STARTED',
      });
      phases.push(ph);
    }

    // Update patient current phase
    patient.currentPhase = validated.currentPhase;
    await patient.save();

    // Send notification
    const patientUser = await Patient.findById(validated.patientId).select('userId').lean();
    if (patientUser?.userId) {
      await Notification.create({
        userId: patientUser.userId,
        title: 'New Rehabilitation Plan Assigned',
        message: `Your therapist assigned "${validated.name}" (Phase ${validated.currentPhase} active).`,
        type: 'PLAN',
        link: '/patient/plan',
      });
    }

    return NextResponse.json({
      message: 'Rehabilitation plan created successfully',
      plan: {
        ...plan.toObject(),
        phases,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Plan creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create plan' }, { status: 500 });
  }
}
