import fs from 'fs';
import path from 'path';

// Load .env.local if not already in process.env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...vals] = trimmed.split('=');
      process.env[key.trim()] = vals.join('=').trim();
    }
  }
}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../lib/db/connect';
import User from '../models/User';
import Therapist from '../models/Therapist';
import Patient from '../models/Patient';
import Exercise from '../models/Exercise';
import RehabilitationPlan from '../models/RehabilitationPlan';
import RehabilitationPhase from '../models/RehabilitationPhase';
import ExerciseAssignment from '../models/ExerciseAssignment';
import ExerciseSession from '../models/ExerciseSession';
import Milestone from '../models/Milestone';
import Appointment from '../models/Appointment';
import Notification from '../models/Notification';
import Message from '../models/Message';

export async function resetToFreshPortal() {
  console.log('🔄 Resetting RehabPulse Database to FRESH state...');
  await connectToDatabase();

  // 1. Purge all dummy transactional and historical activity
  console.log('Clearing dummy sessions, assignments, plans, milestones, appointments, messages...');
  await ExerciseSession.deleteMany({});
  await ExerciseAssignment.deleteMany({});
  await Milestone.deleteMany({});
  await Appointment.deleteMany({});
  await Notification.deleteMany({});
  await Message.deleteMany({});
  await RehabilitationPlan.deleteMany({});
  await RehabilitationPhase.deleteMany({});

  // 2. Clear existing users and profiles
  await User.deleteMany({});
  await Therapist.deleteMany({});
  await Patient.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 3. Create fresh base clean accounts for Admin, Therapist, Patient
  console.log('Creating clean fresh portal accounts...');

  const adminUser = await User.create({
    name: 'Admin',
    email: 'admin@rehabpulse.com',
    password: hashedPassword,
    role: 'ADMIN',
    status: 'ACTIVE',
  });

  const therapistUser = await User.create({
    name: 'Dr. Therapist',
    email: 'therapist@rehabpulse.com',
    password: hashedPassword,
    role: 'THERAPIST',
    status: 'ACTIVE',
  });

  const therapistDoc = await Therapist.create({
    userId: therapistUser._id,
    position: 'Staff Physiotherapist',
    department: 'Outpatient Physical Therapy',
    specialization: 'Orthopedic Rehabilitation',
    phone: '+1 (555) 000-1111',
  });

  const patientUser = await User.create({
    name: 'Patient',
    email: 'patient@rehabpulse.com',
    password: hashedPassword,
    role: 'PATIENT',
    status: 'ACTIVE',
  });

  await Patient.create({
    userId: patientUser._id,
    therapistId: therapistDoc._id,
    patientCode: 'PAT-1001',
    dateOfBirth: '1995-01-01',
    gender: 'Other',
    phone: '+1 (555) 000-2222',
    currentPhase: 1,
    adherenceScore: 100,
    status: 'ON_TRACK',
    medicalHistory: {
      reasonForVisit: 'General Outpatient Physical Therapy',
      affectedBodyPart: 'General Musculoskeletal',
      currentSymptoms: 'Under physical evaluation',
      initialPainScore: 2,
    },
    initialAssessment: {
      assessmentNotes: 'Initial outpatient baseline assessment scheduled.',
      functionalObservations: 'Full baseline evaluation pending.',
      initialPainScore: 2,
      initialGoals: ['Establish active rehabilitation plan', 'Baseline functional mobility'],
      recommendedPhase: 1,
      therapistNotes: 'Welcome to RehabPulse.',
    },
  });

  console.log('✅ Database reset to FRESH state successfully!');
  console.log('Fresh Credentials:');
  console.log(' - Admin:     admin@rehabpulse.com     / password123');
  console.log(' - Therapist: therapist@rehabpulse.com / password123');
  console.log(' - Patient:   patient@rehabpulse.com   / password123');
}

if (require.main === module) {
  resetToFreshPortal()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error resetting database:', err);
      process.exit(1);
    });
}
