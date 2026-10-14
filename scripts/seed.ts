import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../lib/db/connect';
import User from '../models/User';
import Therapist from '../models/Therapist';
import Patient from '../models/Patient';
import Exercise from '../models/Exercise';
import RehabilitationPlan from '../models/RehabilitationPlan';
import RehabilitationPhase from '../models/RehabilitationPhase';
import ExerciseAssignment from '../models/ExerciseAssignment';
import ExerciseSession from '../models/ExerciseSession';
import Milestone from '../models/Milestone';
import Appointment from '../models/Appointment';
import Notification from '../models/Notification';
import Message from '../models/Message';

export async function runSeed() {
  console.log('Starting RehabPulse Seed Process...');
  await connectToDatabase();

  // Clear existing collections safely for dev seeding
  await User.deleteMany({});
  await Therapist.deleteMany({});
  await Patient.deleteMany({});
  await Exercise.deleteMany({});
  await RehabilitationPlan.deleteMany({});
  await RehabilitationPhase.deleteMany({});
  await ExerciseAssignment.deleteMany({});
  await ExerciseSession.deleteMany({});
  await Milestone.deleteMany({});
  await Appointment.deleteMany({});
  await Notification.deleteMany({});
  await Message.deleteMany({});

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const adminUser = await User.create({
    name: 'Dr. Eleanor Vance',
    email: 'admin@rehabpulse.com',
    password: hashedPassword,
    role: 'ADMIN',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
  });

  const therapistUser = await User.create({
    name: 'Dr. Sarah Jenkins, DPT',
    email: 'therapist@rehabpulse.com',
    password: hashedPassword,
    role: 'THERAPIST',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce7890b?w=150&auto=format&fit=crop&q=80',
  });

  const patientAUser = await User.create({
    name: 'Marcus Vance',
    email: 'patient@rehabpulse.com',
    password: hashedPassword,
    role: 'PATIENT',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  });

  const patientBUser = await User.create({
    name: 'Elena Rostova',
    email: 'patient2@rehabpulse.com',
    password: hashedPassword,
    role: 'PATIENT',
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  });

  // 2. Create Therapist details
  const therapistDoc = await Therapist.create({
    userId: therapistUser._id,
    position: 'Senior Physiotherapist',
    department: 'Outpatient Orthopedics & Sports Medicine',
    specialization: 'Knee ACL Recovery, Shoulder Rotator Cuff Repair',
    phone: '+1 (555) 234-5678',
  });

  // 3. Create Patients
  const patientA = await Patient.create({
    userId: patientAUser._id,
    therapistId: therapistDoc._id,
    patientCode: 'PAT-1001',
    dateOfBirth: '1992-05-14',
    gender: 'Male',
    phone: '+1 (555) 019-2831',
    address: '742 Evergreen Terrace, Springfield',
    emergencyContact: 'Sarah Vance (Wife) - +1 (555) 019-2832',
    medicalHistory: {
      reasonForVisit: 'Post-Operative ACL Reconstruction (Right Knee)',
      affectedBodyPart: 'Right Knee Quadriceps & Hamstrings',
      currentSymptoms: 'Mild localized swelling, limited flexion (90 deg), knee instability',
      initialPainScore: 6,
      previousInjury: 'ACL Tear during basketball match in June 2026',
      previousSurgery: 'Right Knee Arthroscopic ACL Graft (August 2026)',
      relevantMedicalHistory: 'No chronic cardiovascular conditions',
      currentMedications: 'Ibuprofen 400mg as needed',
      referringPhysician: 'Dr. Robert Hayes, MD (Orthopedic Surgery)',
    },
    initialAssessment: {
      assessmentNotes: 'Patient demonstrates mild quadriceps inhibition post-graft surgery. Extension lag of 5 degrees.',
      functionalObservations: 'Gait requires single crutch assistance. Flexion currently at 90 degrees.',
      initialPainScore: 6,
      initialGoals: [
        'Restore full terminal knee extension (0 deg)',
        'Achieve active quad contraction without lag',
        'Independent stair climbing by week 6',
      ],
      recommendedPhase: 2, // Phase 2: Strength Development
      therapistNotes: 'Motivated patient, compliant with home exercise program.',
    },
    currentPhase: 2,
    adherenceScore: 92,
    status: 'IMPROVING',
  });

  const patientB = await Patient.create({
    userId: patientBUser._id,
    therapistId: therapistDoc._id,
    patientCode: 'PAT-1002',
    dateOfBirth: '1985-11-20',
    gender: 'Female',
    phone: '+1 (555) 019-7412',
    address: '104 Beacon St, Boston MA',
    emergencyContact: 'Dmitri Rostova - +1 (555) 019-7413',
    medicalHistory: {
      reasonForVisit: 'Rotator Cuff Arthroscopic Tendon Repair',
      affectedBodyPart: 'Left Shoulder Rotator Cuff',
      currentSymptoms: 'Restricted overhead abduction, stiffness in internal rotation',
      initialPainScore: 7,
      previousInjury: 'Repetitive strain from swimming',
      previousSurgery: 'Supraspinatus Repair (July 2026)',
      relevantMedicalHistory: 'None',
      currentMedications: 'Acetaminophen 500mg',
      referringPhysician: 'Dr. Michael Chang, MD',
    },
    initialAssessment: {
      assessmentNotes: 'Passive range of motion restricted. Active elevation limited to 60 degrees.',
      functionalObservations: 'Guarded arm posture, difficulty dressing independently.',
      initialPainScore: 7,
      initialGoals: ['Increase passive shoulder abduction to 120 deg', 'Control night pain'],
      recommendedPhase: 1,
      therapistNotes: 'Gentle passive mobility phase required before resistance exercises.',
    },
    currentPhase: 1,
    adherenceScore: 88,
    status: 'ON_TRACK',
  });

  // 4. Create Global Exercises
  const kneeHold = await Exercise.create({
    name: 'Knee Extension Isometric Hold',
    category: 'Strength',
    difficulty: 'Easy',
    targetArea: 'Knee Quadriceps',
    defaultSets: 3,
    defaultReps: 10,
    defaultHoldDuration: 5,
    defaultRestDuration: 30,
    description: 'Targeted quadriceps isometric strengthening with towel roll support under knee.',
    instructions: '1. Sit upright on a firm surface with legs extended.\n2. Place a rolled towel under the knee.\n3. Contract the quad muscle and press the knee downward into the towel.\n4. Hold contraction for 5 seconds.\n5. Relax and repeat.',
    safetyInstructions: 'Maintain smooth diaphragmatic breathing. Do not hold breath during isometric contraction.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80',
    createdBy: therapistUser._id,
  });

  const straightLegRaise = await Exercise.create({
    name: 'Straight Leg Raise (Anterior)',
    category: 'Strength',
    difficulty: 'Moderate',
    targetArea: 'Quadriceps & Hip Flexors',
    defaultSets: 3,
    defaultReps: 12,
    defaultHoldDuration: 3,
    defaultRestDuration: 30,
    description: 'Isolation exercise to re-train active quadriceps contraction without knee lag.',
    instructions: '1. Lie flat on back with non-operated knee bent.\n2. Lock operating knee straight.\n3. Lift operating leg approximately 12 inches off floor.\n4. Pause for 3 seconds at peak height.\n5. Slowly lower with control.',
    safetyInstructions: 'Keep lower back flat against floor. If lower back arches, reduce lift height.',
    imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=600&auto=format&fit=crop&q=80',
    createdBy: therapistUser._id,
  });

  const heelSlides = await Exercise.create({
    name: 'Heel Slides with Quad Activation',
    category: 'Mobility',
    difficulty: 'Easy',
    targetArea: 'Knee Joint Flexion & Hamstrings',
    defaultSets: 3,
    defaultReps: 10,
    defaultHoldDuration: 2,
    defaultRestDuration: 20,
    description: 'Passive-assisted knee flexion exercise to restore ROM post-graft surgery.',
    instructions: '1. Sit with back supported on mat.\n2. Slowly slide operating heel toward glutes.\n3. Hold gentle end-range stretch for 2 seconds.\n4. Slide heel back out straight.',
    safetyInstructions: 'Move within comfortable pain-free tolerance. Do not force past sharp pain.',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
    createdBy: therapistUser._id,
  });

  const wallSquats = await Exercise.create({
    name: 'Standing Wall Squat with Ball',
    category: 'Functional Training',
    difficulty: 'Hard',
    targetArea: 'Gluteus & Quadriceps',
    defaultSets: 3,
    defaultReps: 8,
    defaultHoldDuration: 10,
    defaultRestDuration: 45,
    description: 'Closed kinetic chain functional loading exercise for multi-joint knee stability.',
    instructions: '1. Place swiss ball behind lower back against smooth wall.\n2. Feet shoulder width apart, slightly forward.\n3. Lower down until knees reach 60-90 degrees.\n4. Hold isometric squat position.',
    safetyInstructions: 'Ensure knees do not cave inward past big toes.',
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
    createdBy: therapistUser._id,
  });

  const pendulumSwings = await Exercise.create({
    name: 'Rotator Cuff Pendulum Swings',
    category: 'Recovery',
    difficulty: 'Easy',
    targetArea: 'Shoulder Rotator Cuff & Glenohumeral Joint',
    defaultSets: 2,
    defaultReps: 15,
    defaultHoldDuration: 0,
    defaultRestDuration: 20,
    description: 'Passive gravitational decompression swing for early rotator cuff healing.',
    instructions: '1. Lean forward resting unaffected arm on sturdy table.\n2. Let operated arm hang completely relaxed toward floor.\n3. Gently sway torso to initiate small circular swings.',
    safetyInstructions: 'Do not actively muscle the arm. Use torso momentum to float the shoulder.',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
    createdBy: therapistUser._id,
  });

  // 5. Rehabilitation Plans
  const planA = await RehabilitationPlan.create({
    patientId: patientA._id,
    therapistId: therapistDoc._id,
    name: 'Right Knee ACL Reconstruction Journey',
    startDate: new Date('2026-08-15'),
    expectedDurationWeeks: 12,
    goals: [
      'Eliminate knee effusion',
      'Achieve 0-120 degree knee flexion',
      'Quad limb symmetry index > 80%',
      'Return to jogging at week 12',
    ],
    currentPhase: 2,
    therapistNotes: 'Patient progressing very well through Phase 2 strength protocols.',
    status: 'ACTIVE',
  });

  const planB = await RehabilitationPlan.create({
    patientId: patientB._id,
    therapistId: therapistDoc._id,
    name: 'Left Rotator Cuff Preservation & Mobility',
    startDate: new Date('2026-09-01'),
    expectedDurationWeeks: 10,
    goals: ['Protect tendon repair graft', 'Restore passive forward flexion', 'Pain score under 2/10'],
    currentPhase: 1,
    therapistNotes: 'Focus strictly on passive ROM without active resistance loading.',
    status: 'ACTIVE',
  });

  // 6. Phases for Plan A
  const phase1A = await RehabilitationPhase.create({
    planId: planA._id,
    patientId: patientA._id,
    phaseNumber: 1,
    name: 'Phase 1: Pain Management & ROM Mobility',
    description: 'Protect graft, control swelling, and restore full passive extension.',
    goals: ['Full extension', 'Patellar mobility', 'Gait normalization'],
    durationWeeks: 3,
    status: 'COMPLETED',
  });

  const phase2A = await RehabilitationPhase.create({
    planId: planA._id,
    patientId: patientA._id,
    phaseNumber: 2,
    name: 'Phase 2: Strength Development & Neuromuscular Control',
    description: 'Progressive quadriceps loading, closed kinetic chain exercises, and balance.',
    goals: ['Increase quad strength LSI', 'Single leg balance 30s', 'Full active flexion'],
    durationWeeks: 4,
    status: 'IN_PROGRESS',
  });

  const phase3A = await RehabilitationPhase.create({
    planId: planA._id,
    patientId: patientA._id,
    phaseNumber: 3,
    name: 'Phase 3: Functional Recovery & Dynamic Stability',
    description: 'Agility drills, eccentric loading, plyometric introduction.',
    goals: ['Hop test symmetry > 85%', 'Dynamic balance'],
    durationWeeks: 3,
    status: 'NOT_STARTED',
  });

  const phase4A = await RehabilitationPhase.create({
    planId: planA._id,
    patientId: patientA._id,
    phaseNumber: 4,
    name: 'Phase 4: Return to Sport & Normal Activity',
    description: 'Sports-specific drills, high-velocity movement, discharge testing.',
    goals: ['Pass ACL return-to-play assessment', 'Full confidence in knee stability'],
    durationWeeks: 2,
    status: 'NOT_STARTED',
  });

  // 7. Patient-Specific Exercise Assignments (CRITICAL: Marcus Vance gets Knee exercises, Elena gets Pendulum)
  const assignmentA1 = await ExerciseAssignment.create({
    patientId: patientA._id,
    therapistId: therapistDoc._id,
    exerciseId: kneeHold._id,
    rehabilitationPlanId: planA._id,
    phaseId: phase2A._id,
    sets: 3,
    reps: 10,
    holdDuration: 5,
    restDuration: 30,
    frequency: 'Daily (2x per day)',
    startDate: new Date('2026-08-16'),
    therapistNotes: 'Focus on maximum isometric squeeze at top of movement.',
    status: 'ACTIVE',
  });

  const assignmentA2 = await ExerciseAssignment.create({
    patientId: patientA._id,
    therapistId: therapistDoc._id,
    exerciseId: straightLegRaise._id,
    rehabilitationPlanId: planA._id,
    phaseId: phase2A._id,
    sets: 3,
    reps: 12,
    holdDuration: 3,
    restDuration: 30,
    frequency: 'Daily',
    startDate: new Date('2026-08-16'),
    therapistNotes: 'Maintain strict knee extension throughout lift.',
    status: 'ACTIVE',
  });

  const assignmentA3 = await ExerciseAssignment.create({
    patientId: patientA._id,
    therapistId: therapistDoc._id,
    exerciseId: wallSquats._id,
    rehabilitationPlanId: planA._id,
    phaseId: phase2A._id,
    sets: 3,
    reps: 8,
    holdDuration: 10,
    restDuration: 45,
    frequency: '3x per week',
    startDate: new Date('2026-09-01'),
    therapistNotes: 'Ensure equal weight distribution between both legs.',
    status: 'ACTIVE',
  });

  // Patient B Assignment
  const assignmentB1 = await ExerciseAssignment.create({
    patientId: patientB._id,
    therapistId: therapistDoc._id,
    exerciseId: pendulumSwings._id,
    rehabilitationPlanId: planB._id,
    sets: 2,
    reps: 15,
    holdDuration: 0,
    restDuration: 20,
    frequency: 'Daily (3x per day)',
    startDate: new Date('2026-09-02'),
    therapistNotes: 'Perform in the morning and before sleep for decompression.',
    status: 'ACTIVE',
  });

  // 8. Milestones for Patient A
  await Milestone.create({
    patientId: patientA._id,
    rehabilitationPlanId: planA._id,
    phaseNumber: 1,
    name: 'Initial Assessment & Evaluation',
    description: 'Post-op mobility baseline establish',
    criteria: 'Flexion > 80 deg, Pain < 7/10',
    completedDate: new Date('2026-08-15'),
    status: 'COMPLETED',
    notes: 'Completed successfully on first visit.',
  });

  await Milestone.create({
    patientId: patientA._id,
    rehabilitationPlanId: planA._id,
    phaseNumber: 1,
    name: 'Full Terminal Knee Extension (0°)',
    description: 'Restore complete passive extension symmetry with healthy knee.',
    criteria: '0 degrees extension measured via goniometer',
    completedDate: new Date('2026-08-28'),
    status: 'COMPLETED',
    notes: 'Achieved full extension without pain.',
  });

  await Milestone.create({
    patientId: patientA._id,
    rehabilitationPlanId: planA._id,
    phaseNumber: 2,
    name: 'Active Quad Contraction & Lag Elimination',
    description: 'Straight leg raise performed with zero knee flexion lag.',
    criteria: '10 consecutive SLRs with straight leg',
    status: 'IN_PROGRESS',
    notes: 'Currently performing 8/10 reps with perfect form.',
  });

  await Milestone.create({
    patientId: patientA._id,
    rehabilitationPlanId: planA._id,
    phaseNumber: 3,
    name: 'Functional Strength & Stair Climbing',
    description: 'Ascend and descend stairs reciprocally without handrail dependence.',
    criteria: 'Step-up test index > 80%',
    status: 'NOT_STARTED',
  });

  await Milestone.create({
    patientId: patientA._id,
    rehabilitationPlanId: planA._id,
    phaseNumber: 4,
    name: 'Full Return to Sport Clearance',
    description: 'Complete ACL discharge battery testing.',
    criteria: 'Y-Balance & Single Leg Hop symmetry > 90%',
    status: 'NOT_STARTED',
  });

  // 9. Past Sessions for Patient A (Populates Adherence & Pain Charts)
  const now = new Date();
  const pastDays = [1, 2, 3, 4, 5, 6, 7];

  for (const day of pastDays) {
    const sessionDate = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
    await ExerciseSession.create({
      sessionId: `sess-a-${day}-${Date.now()}`,
      patientId: patientA._id,
      therapistId: therapistDoc._id,
      exerciseId: kneeHold._id,
      exerciseAssignmentId: assignmentA1._id,
      rehabilitationPlanId: planA._id,
      phaseId: phase2A._id,
      startTime: sessionDate,
      endTime: new Date(sessionDate.getTime() + 12 * 60 * 1000),
      duration: 720,
      targetSets: 3,
      completedSets: 3,
      targetRepetitions: 10,
      completedRepetitions: 10,
      pauseDuration: 30,
      status: 'COMPLETED',
      painLevel: Math.max(1, 6 - day), // pain decreasing from 5 to 1
      difficulty: day % 2 === 0 ? 'Moderate' : 'Easy',
      notes: `Session completed smoothly. Quad activation feeling stronger on day ${day}.`,
    });
  }

  // 10. Appointments
  await Appointment.create({
    patientId: patientA._id,
    therapistId: therapistDoc._id,
    date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    time: '10:30 AM',
    type: 'Follow-up Progress Review',
    status: 'SCHEDULED',
    notes: 'Re-evaluating quad limb symmetry and adjusting wall squat resistance.',
  });

  await Appointment.create({
    patientId: patientB._id,
    therapistId: therapistDoc._id,
    date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    time: '02:00 PM',
    type: 'Passive ROM Check',
    status: 'SCHEDULED',
    notes: 'Checking rotator cuff healing progress.',
  });

  // 11. Messages & Notifications
  await Message.create({
    senderId: therapistUser._id,
    receiverId: patientAUser._id,
    patientId: patientA._id,
    content: 'Hi Marcus! Great work completing yesterday’s session. How is your knee feeling today?',
    read: true,
  });

  await Message.create({
    senderId: patientAUser._id,
    receiverId: therapistUser._id,
    patientId: patientA._id,
    content: 'Hi Dr. Jenkins, feeling good! Quad soreness is down to 2/10 and extension feels natural.',
    read: false,
  });

  await Notification.create({
    userId: patientAUser._id,
    title: 'Exercise Session Complete',
    message: 'Your Knee Extension Isometric Hold session was logged successfully.',
    type: 'SESSION',
    read: false,
  });

  await Notification.create({
    userId: therapistUser._id,
    title: 'New Patient Session Logged',
    message: 'Marcus Vance completed Knee Extension session with pain score 2/10.',
    type: 'SESSION',
    read: false,
  });

  console.log('Seed completed successfully!');
  return { success: true, message: 'Database seeded successfully with realistic RehabPulse data' };
}

if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('✅ Seed completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seed error:', err);
      process.exit(1);
    });
}
