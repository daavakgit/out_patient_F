import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import Patient from '@/models/Patient';
import User from '@/models/User';
import Therapist from '@/models/Therapist';
import RehabilitationPlan from '@/models/RehabilitationPlan';
import RehabilitationPhase from '@/models/RehabilitationPhase';
import Milestone from '@/models/Milestone';
import bcrypt from 'bcryptjs';
import { addPatientSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let query: any = {};

    // Patient Data Isolation for Therapists
    if (session.role === 'THERAPIST') {
      if (!session.therapistId) {
        return NextResponse.json({ patients: [] });
      }
      query.therapistId = session.therapistId;
    } else if (session.role === 'PATIENT') {
      // Patient can only get their own patient object
      query._id = session.patientId;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const patients = await Patient.find(query)
      .populate('userId', 'name email avatar status')
      .populate({ path: 'therapistId', populate: { path: 'userId', select: 'name email' } })
      .sort({ createdAt: -1 })
      .lean();

    const mappedPatients = patients.map((p: any) => ({
      ...p,
      portalPassword: p.portalPassword || 'password123',
    }));

    // Client-side search filter on populated fields if present
    let filtered = mappedPatients;
    if (search) {
      const term = search.toLowerCase();
      filtered = mappedPatients.filter(
        (p: any) =>
          p.patientCode?.toLowerCase().includes(term) ||
          p.userId?.name?.toLowerCase().includes(term) ||
          p.medicalHistory?.reasonForVisit?.toLowerCase().includes(term)
      );
    }

    return NextResponse.json({ patients: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(['ADMIN', 'THERAPIST']);
    await connectToDatabase();

    const body = await req.json();
    const validated = addPatientSchema.parse(body);

    const existingUser = await User.findOne({ email: validated.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 400 });
    }

    // Determine therapist ID
    let assignedTherapistId = session.therapistId;
    if (session.role === 'ADMIN' && body.therapistId) {
      assignedTherapistId = body.therapistId;
    }

    if (!assignedTherapistId) {
      // Fallback to first available therapist
      const firstTherapist = await Therapist.findOne().lean();
      if (!firstTherapist) {
        return NextResponse.json({ error: 'No active therapist found to assign patient' }, { status: 400 });
      }
      assignedTherapistId = firstTherapist._id.toString();
    }

    // Create Patient User
    const defaultPassword = body.password || 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await User.create({
      name: validated.name,
      email: validated.email.toLowerCase(),
      password: hashedPassword,
      role: 'PATIENT',
      status: 'ACTIVE',
    });

    const patientCount = await Patient.countDocuments({});
    const patientCode = `PAT-${1000 + patientCount + 1}`;

    const patient = await Patient.create({
      userId: user._id,
      therapistId: assignedTherapistId,
      patientCode,
      portalPassword: defaultPassword,
      dateOfBirth: validated.dateOfBirth,
      gender: validated.gender,
      phone: validated.phone,
      address: validated.address,
      emergencyContact: validated.emergencyContact,
      medicalHistory: {
        reasonForVisit: validated.reasonForVisit,
        affectedBodyPart: validated.affectedBodyPart,
        currentSymptoms: validated.currentSymptoms,
        initialPainScore: validated.initialPainScore,
        previousInjury: validated.previousInjury || '',
        previousSurgery: validated.previousSurgery || '',
        relevantMedicalHistory: validated.relevantMedicalHistory || '',
        currentMedications: validated.currentMedications || '',
        referringPhysician: validated.referringPhysician || '',
      },
      initialAssessment: {
        assessmentNotes: validated.assessmentNotes,
        functionalObservations: validated.functionalObservations,
        initialPainScore: validated.initialPainScore,
        initialGoals: validated.initialGoals,
        recommendedPhase: validated.recommendedPhase || 1,
        therapistNotes: validated.therapistNotes || '',
      },
      currentPhase: validated.recommendedPhase || 1,
      adherenceScore: 100,
      status: 'ON_TRACK',
    });

    // Auto-create initial Rehabilitation Plan & 4 Phases
    const plan = await RehabilitationPlan.create({
      patientId: patient._id,
      therapistId: assignedTherapistId,
      name: `${validated.affectedBodyPart} Recovery Journey`,
      startDate: new Date(),
      expectedDurationWeeks: 12,
      goals: validated.initialGoals,
      currentPhase: validated.recommendedPhase || 1,
      status: 'ACTIVE',
    });

    const phaseNames = [
      'Phase 1: Pain Management & Mobility',
      'Phase 2: Strength Development',
      'Phase 3: Functional Recovery',
      'Phase 4: Return to Normal Activity',
    ];

    for (let i = 1; i <= 4; i++) {
      await RehabilitationPhase.create({
        planId: plan._id,
        patientId: patient._id,
        phaseNumber: i,
        name: phaseNames[i - 1],
        description: `Phase ${i} therapeutic progression for ${validated.affectedBodyPart}`,
        goals: validated.initialGoals,
        durationWeeks: 3,
        status: i === (validated.recommendedPhase || 1) ? 'IN_PROGRESS' : i < (validated.recommendedPhase || 1) ? 'COMPLETED' : 'NOT_STARTED',
      });
    }

    // Auto-create default milestone
    await Milestone.create({
      patientId: patient._id,
      rehabilitationPlanId: plan._id,
      phaseNumber: 1,
      name: 'Initial Clinical Assessment',
      description: 'Comprehensive physical therapy onboarding evaluation',
      criteria: 'Flexion baseline established',
      status: 'COMPLETED',
      completedDate: new Date(),
    });

    return NextResponse.json({
      message: 'Patient registered successfully',
      patient: {
        id: patient._id.toString(),
        patientCode: patient.patientCode,
        name: user.name,
        email: user.email,
        password: defaultPassword,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Add Patient error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add patient' }, { status: 500 });
  }
}
