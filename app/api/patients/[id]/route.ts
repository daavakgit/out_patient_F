import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import Patient from '@/models/Patient';
import User from '@/models/User';
import RehabilitationPlan from '@/models/RehabilitationPlan';
import RehabilitationPhase from '@/models/RehabilitationPhase';
import ExerciseAssignment from '@/models/ExerciseAssignment';
import ExerciseSession from '@/models/ExerciseSession';
import Milestone from '@/models/Milestone';
import Appointment from '@/models/Appointment';
import Message from '@/models/Message';
import bcrypt from 'bcryptjs';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    await connectToDatabase();

    const patientId = params.id;

    // Strict Patient Data Isolation Check
    if (session.role === 'PATIENT' && session.patientId !== patientId) {
      return NextResponse.json({ error: 'Forbidden: You are not authorized to view another patient data.' }, { status: 403 });
    }

    const patient = await Patient.findById(patientId)
      .populate('userId', 'name email avatar status lastActive')
      .populate({ path: 'therapistId', populate: { path: 'userId', select: 'name email avatar position department' } })
      .lean();

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Additional Therapist Isolation Check
    const assignedId = (patient.therapistId as any)?._id
      ? (patient.therapistId as any)._id.toString()
      : (patient.therapistId as any)?.toString();

    if (session.role === 'THERAPIST' && assignedId !== session.therapistId) {
      return NextResponse.json({ error: 'Forbidden: Patient is assigned to a different therapist.' }, { status: 403 });
    }

    // Fetch all records strictly scoped to this patientId
    const [plans, phases, assignments, sessions, milestones, appointments, messages] = await Promise.all([
      RehabilitationPlan.find({ patientId }).sort({ createdAt: -1 }).lean(),
      RehabilitationPhase.find({ patientId }).sort({ phaseNumber: 1 }).lean(),
      ExerciseAssignment.find({ patientId })
        .populate('exerciseId')
        .sort({ createdAt: -1 })
        .lean(),
      ExerciseSession.find({ patientId })
        .populate('exerciseId', 'name category targetArea imageUrl')
        .sort({ createdAt: -1 })
        .lean(),
      Milestone.find({ patientId }).sort({ phaseNumber: 1, createdAt: 1 }).lean(),
      Appointment.find({ patientId })
        .populate({ path: 'therapistId', populate: { path: 'userId', select: 'name email' } })
        .sort({ date: 1 })
        .lean(),
      Message.find({ patientId }).sort({ createdAt: 1 }).lean(),
    ]);

    return NextResponse.json({
      patient,
      plans,
      phases,
      assignments,
      sessions,
      milestones,
      appointments,
      messages,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(['ADMIN', 'THERAPIST']);
    await connectToDatabase();

    const patientId = params.id;
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Therapist isolation check
    const assignedId = (patient.therapistId as any)?._id
      ? (patient.therapistId as any)._id.toString()
      : (patient.therapistId as any)?.toString();

    if (session.role === 'THERAPIST' && assignedId !== session.therapistId) {
      return NextResponse.json({ error: 'Forbidden: Patient is assigned to a different therapist.' }, { status: 403 });
    }

    const body = await req.json();

    // 1. Update User info (name, email, password)
    if (patient.userId) {
      const userUpdates: any = {};
      if (body.name && typeof body.name === 'string') {
        userUpdates.name = body.name.trim();
      }
      if (body.email && typeof body.email === 'string') {
        const newEmail = body.email.toLowerCase().trim();
        const existing = await User.findOne({ email: newEmail, _id: { $ne: patient.userId } });
        if (existing) {
          return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 400 });
        }
        userUpdates.email = newEmail;
      }
      // Password update
      const newPassword = body.password || body.portalPassword;
      if (newPassword && typeof newPassword === 'string' && newPassword.trim().length >= 4) {
        userUpdates.password = await bcrypt.hash(newPassword.trim(), 10);
        patient.portalPassword = newPassword.trim();
      }

      if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(patient.userId, userUpdates);
      }
    }

    // 2. Update Patient demographic & clinical fields
    if (body.phone !== undefined) patient.phone = body.phone;
    if (body.dateOfBirth !== undefined) patient.dateOfBirth = body.dateOfBirth;
    if (body.gender !== undefined) patient.gender = body.gender;
    if (body.address !== undefined) patient.address = body.address;
    if (body.emergencyContact !== undefined) patient.emergencyContact = body.emergencyContact;
    if (body.status !== undefined) patient.status = body.status;
    if (body.currentPhase !== undefined) patient.currentPhase = Number(body.currentPhase);
    if (body.adherenceScore !== undefined) patient.adherenceScore = Number(body.adherenceScore);
    if (body.portalPassword !== undefined) patient.portalPassword = body.portalPassword;

    // 3. Update Medical History
    if (body.medicalHistory && typeof body.medicalHistory === 'object') {
      const existing = (patient.medicalHistory as any)?.toObject?.() || patient.medicalHistory || {};
      patient.medicalHistory = {
        ...existing,
        ...body.medicalHistory,
      };
    } else {
      if (!patient.medicalHistory) {
        patient.medicalHistory = {} as any;
      }
      if (body.reasonForVisit !== undefined) patient.medicalHistory.reasonForVisit = body.reasonForVisit;
      if (body.affectedBodyPart !== undefined) patient.medicalHistory.affectedBodyPart = body.affectedBodyPart;
      if (body.currentSymptoms !== undefined) patient.medicalHistory.currentSymptoms = body.currentSymptoms;
      if (body.initialPainScore !== undefined) patient.medicalHistory.initialPainScore = Number(body.initialPainScore);
      if (body.previousInjury !== undefined) patient.medicalHistory.previousInjury = body.previousInjury;
      if (body.previousSurgery !== undefined) patient.medicalHistory.previousSurgery = body.previousSurgery;
      if (body.relevantMedicalHistory !== undefined) patient.medicalHistory.relevantMedicalHistory = body.relevantMedicalHistory;
      if (body.currentMedications !== undefined) patient.medicalHistory.currentMedications = body.currentMedications;
      if (body.referringPhysician !== undefined) patient.medicalHistory.referringPhysician = body.referringPhysician;
    }

    // 4. Update Initial Assessment / Goals
    if (body.initialAssessment && typeof body.initialAssessment === 'object') {
      const existingAssessment = (patient.initialAssessment as any)?.toObject?.() || patient.initialAssessment || {};
      patient.initialAssessment = {
        ...existingAssessment,
        ...body.initialAssessment,
      };
    } else {
      if (!patient.initialAssessment) {
        patient.initialAssessment = {} as any;
      }
      if (body.assessmentNotes !== undefined) patient.initialAssessment.assessmentNotes = body.assessmentNotes;
      if (body.functionalObservations !== undefined) patient.initialAssessment.functionalObservations = body.functionalObservations;
      if (body.initialGoals !== undefined) {
        patient.initialAssessment.initialGoals = Array.isArray(body.initialGoals)
          ? body.initialGoals
          : [body.initialGoals];
      }
      if (body.therapistNotes !== undefined) patient.initialAssessment.therapistNotes = body.therapistNotes;
      if (body.recommendedPhase !== undefined) patient.initialAssessment.recommendedPhase = Number(body.recommendedPhase);
    }

    await patient.save();

    // Sync RehabilitationPlan currentPhase if updated
    if (body.currentPhase !== undefined) {
      await RehabilitationPlan.updateMany(
        { patientId: patient._id },
        { currentPhase: Number(body.currentPhase) }
      );
    }

    const updatedPatient = await Patient.findById(patient._id)
      .populate('userId', 'name email avatar status')
      .populate({ path: 'therapistId', populate: { path: 'userId', select: 'name email' } })
      .lean();

    return NextResponse.json({
      message: 'Patient profile updated successfully',
      patient: updatedPatient,
    });
  } catch (error: any) {
    console.error('Update patient error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update patient profile' }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  return PATCH(req, context);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(['ADMIN', 'THERAPIST']);
    await connectToDatabase();

    const patientId = params.id;
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Therapist isolation check
    const assignedId = (patient.therapistId as any)?._id
      ? (patient.therapistId as any)._id.toString()
      : (patient.therapistId as any)?.toString();

    if (session.role === 'THERAPIST' && assignedId !== session.therapistId) {
      return NextResponse.json({ error: 'Forbidden: Patient is assigned to a different therapist.' }, { status: 403 });
    }

    // Cascade delete all associated records for clean removal
    await Promise.all([
      patient.userId ? User.findByIdAndDelete(patient.userId) : Promise.resolve(),
      RehabilitationPlan.deleteMany({ patientId }),
      RehabilitationPhase.deleteMany({ patientId }),
      ExerciseAssignment.deleteMany({ patientId }),
      ExerciseSession.deleteMany({ patientId }),
      Milestone.deleteMany({ patientId }),
      Appointment.deleteMany({ patientId }),
      Message.deleteMany({ patientId }),
      Patient.findByIdAndDelete(patientId),
    ]);

    return NextResponse.json({
      message: 'Patient and all associated records deleted successfully',
      deletedPatientId: patientId,
    });
  } catch (error: any) {
    console.error('Delete patient error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete patient' }, { status: 500 });
  }
}
