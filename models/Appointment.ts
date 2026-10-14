import mongoose, { Schema, Document, Model } from 'mongoose';

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface IAppointment extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  date: Date;
  time: string; // e.g. "10:00 AM"
  type: string; // e.g. "Initial Assessment", "Follow-up Review", "Session Guidance"
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true, index: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    type: { type: String, required: true, default: 'Follow-up Review' },
    status: { type: String, enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Appointment: Model<IAppointment> =
  mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
export default Appointment;
