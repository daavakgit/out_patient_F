import mongoose, { Schema, Document, Model } from 'mongoose';

export type PhaseStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface IRehabilitationPhase extends Document {
  _id: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  phaseNumber: number; // 1, 2, 3, 4
  name: string; // e.g. "Pain Management & Mobility"
  description: string;
  goals: string[];
  durationWeeks: number;
  status: PhaseStatus;
  createdAt: Date;
  updatedAt: Date;
}

const RehabilitationPhaseSchema = new Schema<IRehabilitationPhase>(
  {
    planId: { type: Schema.Types.ObjectId, ref: 'RehabilitationPlan', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    phaseNumber: { type: Number, required: true, min: 1, max: 4 },
    name: { type: String, required: true },
    description: { type: String, required: true },
    goals: [{ type: String }],
    durationWeeks: { type: Number, default: 3 },
    status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], default: 'NOT_STARTED' },
  },
  { timestamps: true }
);

export const RehabilitationPhase: Model<IRehabilitationPhase> =
  mongoose.models.RehabilitationPhase || mongoose.model<IRehabilitationPhase>('RehabilitationPhase', RehabilitationPhaseSchema);
export default RehabilitationPhase;
