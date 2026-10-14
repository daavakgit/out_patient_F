import mongoose, { Schema, Document, Model } from 'mongoose';

export type AssignmentStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED';

export interface IExerciseAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  exerciseId: mongoose.Types.ObjectId;
  rehabilitationPlanId?: mongoose.Types.ObjectId;
  phaseId?: mongoose.Types.ObjectId;
  sets: number;
  reps: number;
  holdDuration: number;
  restDuration: number;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  therapistNotes?: string;
  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseAssignmentSchema = new Schema<IExerciseAssignment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true },
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    rehabilitationPlanId: { type: Schema.Types.ObjectId, ref: 'RehabilitationPlan' },
    phaseId: { type: Schema.Types.ObjectId, ref: 'RehabilitationPhase' },
    sets: { type: Number, required: true, min: 1 },
    reps: { type: Number, required: true, min: 1 },
    holdDuration: { type: Number, default: 5 },
    restDuration: { type: Number, default: 30 },
    frequency: { type: String, default: 'Daily' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    therapistNotes: { type: String, default: '' },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'PAUSED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const ExerciseAssignment: Model<IExerciseAssignment> =
  mongoose.models.ExerciseAssignment || mongoose.model<IExerciseAssignment>('ExerciseAssignment', ExerciseAssignmentSchema);
export default ExerciseAssignment;
