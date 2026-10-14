import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import User from '@/models/User';
import Patient from '@/models/Patient';
import Therapist from '@/models/Therapist';
import Exercise from '@/models/Exercise';
import RehabilitationPlan from '@/models/RehabilitationPlan';
import ExerciseSession from '@/models/ExerciseSession';

export async function GET() {
  try {
    await requireRole(['ADMIN']);
    await connectToDatabase();

    const [
      totalUsers,
      activeUsers,
      totalPatients,
      activeTherapists,
      totalExercises,
      activePlans,
      patientsNeedingAttention,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: 'ACTIVE' }),
      Patient.countDocuments({}),
      User.countDocuments({ role: 'THERAPIST', status: 'ACTIVE' }),
      Exercise.countDocuments({}),
      RehabilitationPlan.countDocuments({ status: 'ACTIVE' }),
      Patient.countDocuments({ status: 'NEEDS_ATTENTION' }),
    ]);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sessionsToday = await ExerciseSession.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    const activeSessions = await ExerciseSession.countDocuments({
      status: { $in: ['STARTED', 'PAUSED'] },
    });

    // Recent activity log
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name role createdAt email')
      .lean();

    const recentSessions = await ExerciseSession.find({ status: 'COMPLETED' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name' } })
      .populate('exerciseId', 'name')
      .lean();

    // Chart distribution
    const rehabStatusDist = [
      { name: 'On Track', value: await Patient.countDocuments({ status: 'ON_TRACK' }) },
      { name: 'Improving', value: await Patient.countDocuments({ status: 'IMPROVING' }) },
      { name: 'Needs Attention', value: await Patient.countDocuments({ status: 'NEEDS_ATTENTION' }) },
      { name: 'Inactive', value: await Patient.countDocuments({ status: 'INACTIVE' }) },
    ];

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalPatients,
        activeTherapists,
        totalExercises,
        activePlans,
        sessionsToday,
        activeSessions,
        patientsNeedingAttention,
      },
      rehabStatusDist,
      recentUsers,
      recentSessions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: error.message === 'UNAUTHORIZED' ? 401 : 403 });
  }
}
