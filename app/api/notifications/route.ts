import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import Notification from '@/models/Notification';

export async function GET() {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const notifications = await Notification.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId: session.userId, read: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const body = await req.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      await Notification.updateMany({ userId: session.userId }, { read: true });
    } else if (notificationId) {
      await Notification.updateOne({ _id: notificationId, userId: session.userId }, { read: true });
    }

    return NextResponse.json({ message: 'Notifications updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
