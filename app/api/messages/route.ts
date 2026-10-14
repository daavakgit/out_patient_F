import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import Message from '@/models/Message';
import Patient from '@/models/Patient';
import Therapist from '@/models/Therapist';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { createMessageSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    let targetPatientId = patientId;
    if (session.role === 'PATIENT') {
      targetPatientId = session.patientId || null;
    }

    if (!targetPatientId) {
      return NextResponse.json({ messages: [] });
    }

    const messages = await Message.find({ patientId: targetPatientId })
      .populate('senderId', 'name email avatar role')
      .populate('receiverId', 'name email avatar role')
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const body = await req.json();
    const validated = createMessageSchema.parse(body);

    const message = await Message.create({
      senderId: session.userId,
      receiverId: validated.receiverId,
      patientId: validated.patientId,
      content: validated.content,
      read: false,
    });

    // Notify receiver
    await Notification.create({
      userId: validated.receiverId,
      title: `New Message from ${session.name}`,
      message: validated.content.length > 50 ? `${validated.content.substring(0, 50)}...` : validated.content,
      type: 'MESSAGE',
      link: session.role === 'PATIENT' ? `/therapist/messages` : `/patient/messages`,
    });

    return NextResponse.json({ message });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
