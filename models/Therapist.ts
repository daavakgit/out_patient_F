import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITherapist extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  position: string; // e.g. "Senior Physiotherapist", "Orthopedic Specialist"
  department: string; // e.g. "Outpatient Orthopedics", "Sports Rehab"
  specialization: string; // e.g. "ACL Recovery, Rotator Cuff"
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TherapistSchema = new Schema<ITherapist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    position: { type: String, required: true, default: 'Physiotherapist' },
    department: { type: String, required: true, default: 'Physical Therapy' },
    specialization: { type: String, required: true, default: 'General Rehabilitation' },
    phone: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Therapist: Model<ITherapist> = mongoose.models.Therapist || mongoose.model<ITherapist>('Therapist', TherapistSchema);
export default Therapist;
