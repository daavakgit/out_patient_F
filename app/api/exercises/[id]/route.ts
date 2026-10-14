import { NextResponse } from 'next/server';
import { requireRole, requireAuth } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import Exercise from '@/models/Exercise';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    await connectToDatabase();

    const exercise = await Exercise.findById(params.id).lean();
    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    return NextResponse.json({ exercise });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(['ADMIN', 'THERAPIST']);
    await connectToDatabase();

    const body = await req.json();
    const updated = await Exercise.findByIdAndUpdate(params.id, body, { new: true });

    return NextResponse.json({ message: 'Exercise updated', exercise: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(['ADMIN', 'THERAPIST']);
    await connectToDatabase();

    await Exercise.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Exercise deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
