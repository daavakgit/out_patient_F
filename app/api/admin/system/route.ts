import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import mongoose from 'mongoose';
import User from '@/models/User';
import Patient from '@/models/Patient';
import Therapist from '@/models/Therapist';
import Exercise from '@/models/Exercise';
import RehabilitationPlan from '@/models/RehabilitationPlan';
import ExerciseSession from '@/models/ExerciseSession';
import Appointment from '@/models/Appointment';

export async function GET() {
  try {
    await requireRole(['ADMIN']);
    const startTime = Date.now();
    await connectToDatabase();
    const dbLatencyMs = Date.now() - startTime;

    const [
      totalUsers,
      totalPatients,
      totalTherapists,
      totalExercises,
      totalPlans,
      totalSessions,
      totalAppointments,
    ] = await Promise.all([
      User.countDocuments({}),
      Patient.countDocuments({}),
      Therapist.countDocuments({}),
      Exercise.countDocuments({}),
      RehabilitationPlan.countDocuments({}),
      ExerciseSession.countDocuments({}),
      Appointment.countDocuments({}),
    ]);

    const dbState = mongoose.connection.readyState;
    const dbStateMap: { [key: number]: string } = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    };

    return NextResponse.json({
      system: {
        appVersion: '1.0.0-PROD',
        environment: process.env.NODE_ENV || 'production',
        status: 'OPERATIONAL',
        serverUptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
      database: {
        engine: 'MongoDB Atlas (Replica Set)',
        status: dbStateMap[dbState] || 'Unknown',
        latencyMs: dbLatencyMs,
        host: mongoose.connection.host || 'cluster0.awnzkwa.mongodb.net',
        name: mongoose.connection.name || 'outpatient_rehab_db',
      },
      counts: {
        totalUsers,
        totalPatients,
        totalTherapists,
        totalExercises,
        totalPlans,
        totalSessions,
        totalAppointments,
      },
      security: {
        authStrategy: 'HMAC-SHA256 JWT in HttpOnly Strict Cookies',
        roleAuthorization: 'Server-Authoritative RBAC (ADMIN, THERAPIST, PATIENT)',
        dataIsolation: 'Strict PatientId Scoped Server Queries',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
