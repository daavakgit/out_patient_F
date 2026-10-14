import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import Milestone from '@/models/Milestone';
import Patient from '@/models/Patient';
import Notification from '@/models/Notification';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(['THERAPIST', 'ADMIN']);
    await connectToDatabase();

    const body = await req.json();
    const { status, notes, criteria, name } = body;

    const milestone = await Milestone.findById(params.id);
    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    if (status) milestone.status = status;
    if (status === 'COMPLETED' && !milestone.completedDate) {
      milestone.completedDate = new Date();
    }
    if (notes !== undefined) milestone.notes = notes;
    if (criteria !== undefined) milestone.criteria = criteria;
    if (name) milestone.name = name;

    await milestone.save();

    // Notify patient
    const patientDoc = await Patient.findById(milestone.patientId).select('userId').lean();
    if (patientDoc?.userId) {
      await Notification.create({
        userId: patientDoc.userId,
        title: status === 'COMPLETED' ? '🎉 Milestone Achieved!' : 'Milestone Progress Updated',
        message: `Your milestone "${milestone.name}" is now ${status}.`,
        type: 'MILESTONE',
        link: '/patient/milestones',
      });
    }

    return NextResponse.json({ message: 'Milestone updated successfully', milestone });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
