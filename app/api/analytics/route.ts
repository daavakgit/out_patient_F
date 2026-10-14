import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import ExerciseSession from '@/models/ExerciseSession';
import Patient from '@/models/Patient';
import Milestone from '@/models/Milestone';
import ExerciseAssignment from '@/models/ExerciseAssignment';

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    if (session.role === 'PATIENT' || (patientId && session.role === 'THERAPIST')) {
      const targetPatientId = session.role === 'PATIENT' ? session.patientId : patientId;

      if (!targetPatientId) {
        return NextResponse.json({ error: 'Patient ID required' }, { status: 400 });
      }

      // Fetch patient's sessions sorted chronologically
      const sessions = await ExerciseSession.find({ patientId: targetPatientId })
        .populate('exerciseId', 'name')
        .sort({ startTime: 1 })
        .lean();

      // Pain score trend
      const painTrend = sessions.map((s: any, idx: number) => ({
        index: idx + 1,
        date: new Date(s.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        pain: s.painLevel ?? 0,
        difficulty: s.difficulty || 'Moderate',
        durationMinutes: Math.round(s.duration / 60),
        exercise: s.exerciseId?.name || 'Exercise',
      }));

      // Adherence calculations (last 7 days)
      const now = new Date();
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toLocaleDateString([], { weekday: 'short' });
        const startOfDay = new Date(d.setHours(0, 0, 0, 0));
        const endOfDay = new Date(d.setHours(23, 59, 59, 999));

        const daySessions = sessions.filter(
          (s: any) => new Date(s.startTime) >= startOfDay && new Date(s.startTime) <= endOfDay
        );

        last7Days.push({
          day: dateStr,
          completed: daySessions.filter((s: any) => s.status === 'COMPLETED').length,
          total: daySessions.length > 0 ? daySessions.length : 1, // expected target
        });
      }

      // Milestone progress
      const totalMilestones = await Milestone.countDocuments({ patientId: targetPatientId });
      const completedMilestones = await Milestone.countDocuments({
        patientId: targetPatientId,
        status: 'COMPLETED',
      });

      return NextResponse.json({
        painTrend,
        weeklyAdherence: last7Days,
        milestones: {
          total: totalMilestones,
          completed: completedMilestones,
          percentage: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
        },
        totalSessionsLogged: sessions.length,
      });
    }

    if (session.role === 'THERAPIST') {
      const therapistPatients = await Patient.find({ therapistId: session.therapistId }).lean();
      const patientIds = therapistPatients.map((p) => p._id);

      const sessions = await ExerciseSession.find({ patientId: { $in: patientIds } })
        .populate('exerciseId', 'name')
        .sort({ startTime: -1 })
        .limit(100)
        .lean();

      // Pain trends across all active patients
      const painTrend = sessions.slice(0, 20).reverse().map((s: any, idx: number) => ({
        index: idx + 1,
        date: new Date(s.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        pain: s.painLevel ?? 0,
      }));

      // Distribution of adherence
      const adherenceDist = [
        { name: 'Excellent (90-100%)', count: therapistPatients.filter((p) => p.adherenceScore >= 90).length },
        { name: 'Good (75-89%)', count: therapistPatients.filter((p) => p.adherenceScore >= 75 && p.adherenceScore < 90).length },
        { name: 'Needs Attention (<75%)', count: therapistPatients.filter((p) => p.adherenceScore < 75).length },
      ];

      return NextResponse.json({
        painTrend,
        adherenceDist,
        totalActivePatients: therapistPatients.length,
        totalSessionsLogged: sessions.length,
      });
    }

    return NextResponse.json({ message: 'OK' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
