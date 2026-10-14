import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import Milestone from '@/models/Milestone';
import Patient from '@/models/Patient';
import Notification from '@/models/Notification';
import { createMilestoneSchema } from '@/lib/validations';

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
    }

    const milestones = await Milestone.find(query).sort({ phaseNumber: 1, createdAt: 1 }).lean();
    return NextResponse.json({ milestones });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(['THERAPIST', 'ADMIN']);
    await connectToDatabase();

    const body = await req.json();
    const validated = createMilestoneSchema.parse(body);

    const milestone = await Milestone.create({
      patientId: validated.patientId,
      rehabilitationPlanId: validated.rehabilitationPlanId || undefined,
      phaseNumber: validated.phaseNumber,
      name: validated.name,
      description: validated.description,
      criteria: validated.criteria || '',
      targetDate: validated.targetDate ? new Date(validated.targetDate) : undefined,
      status: validated.status,
      notes: validated.notes || '',
    });

    // Notify patient
    const patientDoc = await Patient.findById(validated.patientId).select('userId').lean();
    if (patientDoc?.userId) {
      await Notification.create({
        userId: patientDoc.userId,
        title: 'New Milestone Set',
        message: `Your therapist added a milestone: "${validated.name}" for Phase ${validated.phaseNumber}.`,
        type: 'MILESTONE',
        link: '/patient/milestones',
      });
    }

    return NextResponse.json({ message: 'Milestone created', milestone });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
