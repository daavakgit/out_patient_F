import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import ExerciseSession from '@/models/ExerciseSession';
import Patient from '@/models/Patient';
import Therapist from '@/models/Therapist';
import Notification from '@/models/Notification';
import Exercise from '@/models/Exercise';
import { submitSessionSchema } from '@/lib/validations';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const body = await req.json();
    const { action } = body; // 'PAUSE' | 'RESUME' | 'SUBMIT'

    const exerciseSession = await ExerciseSession.findOne({
      $or: [{ _id: params.id }, { sessionId: params.id }],
    });

    if (!exerciseSession) {
      return NextResponse.json({ error: 'Exercise session record not found' }, { status: 404 });
    }

    // Patient isolation check
    if (session.role === 'PATIENT' && exerciseSession.patientId.toString() !== session.patientId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prevent duplicate submissions
    if (exerciseSession.status === 'COMPLETED' && action === 'SUBMIT') {
      return NextResponse.json({ message: 'Session already submitted', session: exerciseSession });
    }

    if (action === 'PAUSE') {
      exerciseSession.status = 'PAUSED';
      await exerciseSession.save();
      return NextResponse.json({ message: 'Session paused', session: exerciseSession });
    }

    if (action === 'RESUME') {
      exerciseSession.status = 'STARTED';
      await exerciseSession.save();
      return NextResponse.json({ message: 'Session resumed', session: exerciseSession });
    }

    if (action === 'SUBMIT') {
      const validated = submitSessionSchema.parse({
        ...body,
        painLevel: Number(body.painLevel ?? 0),
        completedSets: Number(body.completedSets ?? 0),
        completedRepetitions: Number(body.completedRepetitions ?? 0),
        pauseDuration: Number(body.pauseDuration ?? 0),
        sessionId: body.sessionId || exerciseSession.sessionId || exerciseSession._id.toString(),
      });

      const endTime = new Date();
      // Calculate server-authoritative duration in seconds
      const startMs = new Date(exerciseSession.startTime).getTime();
      const rawSeconds = Math.max(1, Math.floor((endTime.getTime() - startMs) / 1000));
      const netDuration = Math.max(1, rawSeconds - (validated.pauseDuration || 0));

      // Normalize difficulty to SessionDifficulty enum ('Easy' | 'Moderate' | 'Hard')
      let mappedDifficulty: 'Easy' | 'Moderate' | 'Hard' = 'Moderate';
      const rawDiff = String(validated.difficulty || '').toLowerCase();
      if (rawDiff.includes('easy')) {
        mappedDifficulty = 'Easy';
      } else if (rawDiff.includes('hard') || rawDiff.includes('challeng') || rawDiff.includes('extreme')) {
        mappedDifficulty = 'Hard';
      } else {
        mappedDifficulty = 'Moderate';
      }

      exerciseSession.endTime = endTime;
      exerciseSession.duration = netDuration;
      exerciseSession.completedSets = validated.completedSets;
      exerciseSession.completedRepetitions = validated.completedRepetitions;
      exerciseSession.pauseDuration = validated.pauseDuration || 0;
      exerciseSession.painLevel = validated.painLevel;
      exerciseSession.difficulty = mappedDifficulty;
      exerciseSession.notes = validated.notes || '';
      exerciseSession.status = validated.completedSets >= exerciseSession.targetSets ? 'COMPLETED' : 'PARTIALLY_COMPLETED';

      await exerciseSession.save();

      // Recalculate patient adherence score based on sessions completed vs expected
      const patient = await Patient.findById(exerciseSession.patientId);
      if (patient) {
        const totalSessions = await ExerciseSession.countDocuments({ patientId: patient._id });
        const completedSessions = await ExerciseSession.countDocuments({ patientId: patient._id, status: 'COMPLETED' });
        patient.adherenceScore = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 100;
        
        // Update patient status if pain is high
        if (validated.painLevel >= 7) {
          patient.status = 'NEEDS_ATTENTION';
        } else if (patient.adherenceScore >= 85) {
          patient.status = 'IMPROVING';
        }
        await patient.save();

        // Notify therapist if pain high or session completed
        if (patient.therapistId) {
          const therapistDoc = await Therapist.findById(patient.therapistId).select('userId').lean();
          if (therapistDoc?.userId) {
            const exerciseDoc = await Exercise.findById(exerciseSession.exerciseId).select('name').lean();
            const exerciseName = exerciseDoc?.name || 'Exercise';

            await Notification.create({
              userId: therapistDoc.userId,
              title: validated.painLevel >= 7 ? '⚠️ High Pain Level Alert' : 'Patient Completed Session',
              message: `${session.name} completed ${exerciseName} session (${validated.completedSets}/${exerciseSession.targetSets} sets). Pain level: ${validated.painLevel}/10.`,
              type: 'SESSION',
              link: `/therapist/patients/${patient._id}`,
            });
          }
        }
      }

      return NextResponse.json({
        message: 'Exercise session submitted successfully',
        session: exerciseSession,
      });
    }

    return NextResponse.json({ error: 'Invalid session action specified' }, { status: 400 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Session update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update session' }, { status: 500 });
  }
}
