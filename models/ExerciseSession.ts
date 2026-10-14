import mongoose, { Schema, Document, Model } from 'mongoose';

export type SessionStatus = 'STARTED' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'PARTIALLY_COMPLETED';
export type SessionDifficulty = 'Easy' | 'Moderate' | 'Hard';

export interface IExerciseSession extends Document {
  _id: mongoose.Types.ObjectId;
  sessionId: string;
  patientId: mongoose.Types.ObjectId;
  therapistId?: mongoose.Types.ObjectId;
  exerciseId: mongoose.Types.ObjectId;
  exerciseAssignmentId?: mongoose.Types.ObjectId;
  rehabilitationPlanId?: mongoose.Types.ObjectId;
  phaseId?: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  targetSets: number;
  completedSets: number;
  targetRepetitions: number;
  completedRepetitions: number;
  pauseDuration: number; // seconds
  status: SessionStatus;
  painLevel?: number; // 0 to 10
  difficulty?: SessionDifficulty;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSessionSchema = new Schema<IExerciseSession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'Therapist' },
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    exerciseAssignmentId: { type: Schema.Types.ObjectId, ref: 'ExerciseAssignment' },
    rehabilitationPlanId: { type: Schema.Types.ObjectId, ref: 'RehabilitationPlan' },
    phaseId: { type: Schema.Types.ObjectId, ref: 'RehabilitationPhase' },
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number, default: 0 },
    targetSets: { type: Number, required: true, min: 1 },
    completedSets: { type: Number, required: true, default: 0 },
    targetRepetitions: { type: Number, required: true, min: 1 },
    completedRepetitions: { type: Number, required: true, default: 0 },
    pauseDuration: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['STARTED', 'PAUSED', 'COMPLETED', 'CANCELLED', 'PARTIALLY_COMPLETED'],
      default: 'STARTED',
    },
    painLevel: { type: Number, min: 0, max: 10, default: 0 },
    difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], default: 'Moderate' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const ExerciseSession: Model<IExerciseSession> =
  mongoose.models.ExerciseSession || mongoose.model<IExerciseSession>('ExerciseSession', ExerciseSessionSchema);
export default ExerciseSession;
