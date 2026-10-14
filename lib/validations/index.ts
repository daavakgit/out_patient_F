import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export const createTherapistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  position: z.string().min(2, 'Position required'),
  department: z.string().min(2, 'Department required'),
  specialization: z.string().min(2, 'Specialization required'),
  phone: z.string().optional(),
});

export const addPatientSchema = z.object({
  // Step 1: Basic Info
  name: z.string().min(2, 'Patient name required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(4, 'Password must be at least 4 characters').optional().default('password123'),
  dateOfBirth: z.string().min(1, 'Date of birth required'),
  gender: z.string().min(1, 'Gender required'),
  phone: z.string().min(5, 'Phone number required'),
  address: z.string().min(2, 'Address required'),
  emergencyContact: z.string().min(2, 'Emergency contact required'),

  // Step 2: Medical Info
  reasonForVisit: z.string().min(2, 'Reason for visit required'),
  affectedBodyPart: z.string().min(2, 'Affected body part required'),
  currentSymptoms: z.string().min(2, 'Current symptoms required'),
  initialPainScore: z.number().min(0).max(10),
  previousInjury: z.string().optional(),
  previousSurgery: z.string().optional(),
  relevantMedicalHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  referringPhysician: z.string().optional(),

  // Step 3: Initial Assessment
  assessmentNotes: z.string().min(2, 'Assessment notes required'),
  functionalObservations: z.string().min(2, 'Functional observations required'),
  initialGoals: z.array(z.string()).min(1, 'At least one initial goal is required'),
  recommendedPhase: z.number().min(1).max(4).default(1),
  therapistNotes: z.string().optional(),
});

export const createExerciseSchema = z.object({
  name: z.string().min(2, 'Exercise name required'),
  category: z.enum(['Mobility', 'Strength', 'Flexibility', 'Balance', 'Recovery', 'Functional Training']),
  difficulty: z.enum(['Easy', 'Moderate', 'Hard']),
  targetArea: z.string().min(2, 'Target area required'),
  defaultSets: z.number().int().positive('Sets must be a positive integer'),
  defaultReps: z.number().int().positive('Reps must be a positive integer'),
  defaultHoldDuration: z.number().int().min(0),
  defaultRestDuration: z.number().int().min(0),
  description: z.string().min(5, 'Description required'),
  instructions: z.string().min(5, 'Instructions required'),
  safetyInstructions: z.string().min(5, 'Safety instructions required'),
  imageUrl: z.string().url('Please enter a valid image URL').or(z.string().min(1)),
});

export const assignExerciseSchema = z.object({
  patientIds: z.array(z.string()).min(1, 'Select at least one patient'),
  exerciseId: z.string().min(1, 'Select an exercise'),
  rehabilitationPlanId: z.string().optional(),
  phaseId: z.string().optional(),
  sets: z.number().int().positive('Sets must be a positive integer'),
  reps: z.number().int().positive('Reps must be a positive integer'),
  holdDuration: z.number().int().min(0),
  restDuration: z.number().int().min(0),
  frequency: z.string().min(1, 'Frequency required'),
  therapistNotes: z.string().optional(),
});

export const startSessionSchema = z.object({
  exerciseId: z.string().min(1, 'Exercise ID required'),
  exerciseAssignmentId: z.string().optional(),
  rehabilitationPlanId: z.string().optional(),
  phaseId: z.string().optional(),
  targetSets: z.number().int().positive(),
  targetRepetitions: z.number().int().positive(),
});

export const submitSessionSchema = z.object({
  sessionId: z.string().optional(),
  completedSets: z.number().int().min(0),
  completedRepetitions: z.number().int().min(0),
  duration: z.number().int().min(0).optional().default(0),
  pauseDuration: z.number().int().min(0).optional().default(0),
  painLevel: z.number().min(0).max(10, 'Pain level must be between 0 and 10'),
  difficulty: z.enum(['Easy', 'Moderate', 'Hard', 'Too Easy', 'Challenging', 'Extreme']).or(z.string()),
  notes: z.string().optional(),
});

export const createMilestoneSchema = z.object({
  patientId: z.string().min(1, 'Patient required'),
  rehabilitationPlanId: z.string().optional(),
  phaseNumber: z.number().int().min(1).max(4),
  name: z.string().min(2, 'Milestone name required'),
  description: z.string().min(2, 'Description required'),
  criteria: z.string().optional(),
  targetDate: z.string().optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']),
  notes: z.string().optional(),
});

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient required'),
  date: z.string().min(1, 'Date required'),
  time: z.string().min(1, 'Time required'),
  type: z.string().min(1, 'Type required'),
  notes: z.string().optional(),
});

export const createMessageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver required'),
  patientId: z.string().min(1, 'Patient required'),
  content: z.string().min(1, 'Message cannot be empty'),
});
