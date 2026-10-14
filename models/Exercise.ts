import mongoose, { Schema, Document, Model } from 'mongoose';

export type ExerciseCategory = 'Mobility' | 'Strength' | 'Flexibility' | 'Balance' | 'Recovery' | 'Functional Training';
export type ExerciseDifficulty = 'Easy' | 'Moderate' | 'Hard';

export interface IExercise extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  category: ExerciseCategory;
  difficulty: ExerciseDifficulty;
  targetArea: string;
  defaultSets: number;
  defaultReps: number;
  defaultHoldDuration: number; // in seconds
  defaultRestDuration: number; // in seconds
  description: string;
  instructions: string;
  safetyInstructions: string;
  imageUrl: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Mobility', 'Strength', 'Flexibility', 'Balance', 'Recovery', 'Functional Training'],
      required: true,
    },
    difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], default: 'Moderate' },
    targetArea: { type: String, required: true },
    defaultSets: { type: Number, required: true, min: 1, default: 3 },
    defaultReps: { type: Number, required: true, min: 1, default: 10 },
    defaultHoldDuration: { type: Number, default: 5 },
    defaultRestDuration: { type: Number, default: 30 },
    description: { type: String, required: true },
    instructions: { type: String, required: true },
    safetyInstructions: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Exercise: Model<IExercise> = mongoose.models.Exercise || mongoose.model<IExercise>('Exercise', ExerciseSchema);
export default Exercise;
