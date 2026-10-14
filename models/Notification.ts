import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType = 'EXERCISE' | 'APPOINTMENT' | 'MILESTONE' | 'SESSION' | 'MESSAGE' | 'SYSTEM';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['EXERCISE', 'APPOINTMENT', 'MILESTONE', 'SESSION', 'MESSAGE', 'SYSTEM'],
      default: 'SYSTEM',
    },
    read: { type: Boolean, default: false },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
