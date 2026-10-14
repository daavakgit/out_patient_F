import mongoose, { Schema, Document, Model } from 'mongoose';

export type PatientStatus = 'ON_TRACK' | 'IMPROVING' | 'NEEDS_ATTENTION' | 'INACTIVE';

export interface IMedicalHistory {
  reasonForVisit: string;
  affectedBodyPart: string;
  currentSymptoms: string;
  initialPainScore: number;
  previousInjury?: string;
  previousSurgery?: string;
  relevantMedicalHistory?: string;
  currentMedications?: string;
  referringPhysician?: string;
}

export interface IInitialAssessment {
  assessmentNotes: string;
  functionalObservations: string;
  initialPainScore: number;
  initialGoals: string[];
  recommendedPhase: number;
  therapistNotes?: string;
}

export interface IPatient extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  patientCode: string;
  portalPassword?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory: IMedicalHistory;
  initialAssessment: IInitialAssessment;
  currentPhase: number;
  adherenceScore: number; // percentage e.g. 85
  status: PatientStatus;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalHistorySchema = new Schema<IMedicalHistory>({
  reasonForVisit: { type: String, required: true },
  affectedBodyPart: { type: String, required: true },
  currentSymptoms: { type: String, required: true },
  initialPainScore: { type: Number, required: true, min: 0, max: 10, default: 5 },
  previousInjury: { type: String, default: '' },
  previousSurgery: { type: String, default: '' },
  relevantMedicalHistory: { type: String, default: '' },
  currentMedications: { type: String, default: '' },
  referringPhysician: { type: String, default: '' },
});

const InitialAssessmentSchema = new Schema<IInitialAssessment>({
  assessmentNotes: { type: String, required: true },
  functionalObservations: { type: String, required: true },
  initialPainScore: { type: Number, required: true, min: 0, max: 10, default: 5 },
  initialGoals: [{ type: String }],
  recommendedPhase: { type: Number, default: 1 },
  therapistNotes: { type: String, default: '' },
});

const PatientSchema = new Schema<IPatient>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true },
    patientCode: { type: String, required: true, unique: true },
    portalPassword: { type: String, default: 'password123' },
    dateOfBirth: { type: String, default: '' },
    gender: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    medicalHistory: { type: MedicalHistorySchema, required: true },
    initialAssessment: { type: InitialAssessmentSchema, required: true },
    currentPhase: { type: Number, default: 1, min: 1, max: 4 },
    adherenceScore: { type: Number, default: 100, min: 0, max: 100 },
    status: { type: String, enum: ['ON_TRACK', 'IMPROVING', 'NEEDS_ATTENTION', 'INACTIVE'], default: 'ON_TRACK' },
  },
  { timestamps: true }
);

export const Patient: Model<IPatient> = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
export default Patient;
