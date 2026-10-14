import mongoose, { Schema, Document, Model } from 'mongoose';

export type PlanStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface IRehabilitationPlan extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  name: string;
  startDate: Date;
  expectedDurationWeeks: number;
  goals: string[];
  currentPhase: number;
  therapistNotes?: string;
  status: PlanStatus;
  createdAt: Date;
  updatedAt: Date;
}

const RehabilitationPlanSchema = new Schema<IRehabilitationPlan>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true },
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, default: Date.now },
    expectedDurationWeeks: { type: Number, default: 12 },
    goals: [{ type: String }],
    currentPhase: { type: Number, default: 1, min: 1, max: 4 },
    therapistNotes: { type: String, default: '' },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const RehabilitationPlan: Model<IRehabilitationPlan> =
  mongoose.models.RehabilitationPlan || mongoose.model<IRehabilitationPlan>('RehabilitationPlan', RehabilitationPlanSchema);
export default RehabilitationPlan;
