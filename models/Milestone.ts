import mongoose, { Schema, Document, Model } from 'mongoose';

export type MilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

export interface IMilestone extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  rehabilitationPlanId?: mongoose.Types.ObjectId;
  phaseNumber: number; // 1 to 4
  name: string;
  description: string;
  criteria?: string;
  targetDate?: Date;
  completedDate?: Date;
  status: MilestoneStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    rehabilitationPlanId: { type: Schema.Types.ObjectId, ref: 'RehabilitationPlan' },
    phaseNumber: { type: Number, required: true, min: 1, max: 4, default: 1 },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    criteria: { type: String, default: '' },
    targetDate: { type: Date },
    completedDate: { type: Date },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'],
      default: 'NOT_STARTED',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Milestone: Model<IMilestone> =
  mongoose.models.Milestone || mongoose.model<IMilestone>('Milestone', MilestoneSchema);
export default Milestone;
