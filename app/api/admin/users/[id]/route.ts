import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import User from '@/models/User';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireRole(['ADMIN']);
    await connectToDatabase();

    const body = await req.json();
    const { status, role, name } = body;

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (status) user.status = status;
    if (role) user.role = role;
    if (name) user.name = name;

    await user.save();

    return NextResponse.json({ message: 'User updated successfully', user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
