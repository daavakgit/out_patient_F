import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import RehabilitationPlan from '@/models/RehabilitationPlan';
import RehabilitationPhase from '@/models/RehabilitationPhase';
import Patient from '@/models/Patient';
import Notification from '@/models/Notification';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const plan = await RehabilitationPlan.findById(params.id)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email avatar' } })
      .populate({ path: 'therapistId', populate: { path: 'userId', select: 'name email' } })
      .lean();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (session.role === 'PATIENT' && plan.patientId?._id?.toString() !== session.patientId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const phases = await RehabilitationPhase.find({ planId: plan._id }).sort({ phaseNumber: 1 }).lean();

    return NextResponse.json({ plan: { ...plan, phases } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(['THERAPIST', 'ADMIN']);
    await connectToDatabase();

    const plan = await RehabilitationPlan.findById(params.id);
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const body = await req.json();

    if (body.name) plan.name = body.name;
    if (body.status) plan.status = body.status;
    if (body.therapistNotes !== undefined) plan.therapistNotes = body.therapistNotes;
    if (body.goals) plan.goals = body.goals;

    if (body.currentPhase && body.currentPhase !== plan.currentPhase) {
      plan.currentPhase = body.currentPhase;

      // Update patient's current phase
      await Patient.updateOne({ _id: plan.patientId }, { currentPhase: body.currentPhase });

      // Update phase statuses
      await RehabilitationPhase.updateMany(
        { planId: plan._id, phaseNumber: { $lt: body.currentPhase } },
        { status: 'COMPLETED' }
      );
      await RehabilitationPhase.updateOne(
        { planId: plan._id, phaseNumber: body.currentPhase },
        { status: 'IN_PROGRESS' }
      );
      await RehabilitationPhase.updateMany(
        { planId: plan._id, phaseNumber: { $gt: body.currentPhase } },
        { status: 'NOT_STARTED' }
      );

      // Notify patient of phase upgrade
      const pDoc = await Patient.findById(plan.patientId).select('userId').lean();
      if (pDoc?.userId) {
        await Notification.create({
          userId: pDoc.userId,
          title: '🎉 Promoted to Next Rehabilitation Phase',
          message: `Congratulations! Your therapist moved you to Phase ${body.currentPhase}.`,
          type: 'PLAN',
          link: '/patient/plan',
        });
      }
    }

    await plan.save();

    const updatedPhases = await RehabilitationPhase.find({ planId: plan._id }).sort({ phaseNumber: 1 }).lean();

    return NextResponse.json({
      message: 'Rehabilitation plan updated successfully',
      plan: { ...plan.toObject(), phases: updatedPhases },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
