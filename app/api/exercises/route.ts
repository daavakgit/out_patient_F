import { NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/db/connect';
import Exercise from '@/models/Exercise';
import { createExerciseSchema } from '@/lib/validations';

export async function GET(req: Request) {
  try {
    await requireAuth();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');

    const query: any = {};
    if (category && category !== 'ALL') query.category = category;
    if (difficulty && difficulty !== 'ALL') query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { targetArea: { $regex: search, $options: 'i' } },
      ];
    }

    const exercises = await Exercise.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ exercises });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(['ADMIN', 'THERAPIST']);
    await connectToDatabase();

    const body = await req.json();
    const validated = createExerciseSchema.parse(body);

    const exercise = await Exercise.create({
      name: validated.name,
      category: validated.category,
      difficulty: validated.difficulty,
      targetArea: validated.targetArea,
      defaultSets: validated.defaultSets,
      defaultReps: validated.defaultReps,
      defaultHoldDuration: validated.defaultHoldDuration,
      defaultRestDuration: validated.defaultRestDuration,
      description: validated.description,
      instructions: validated.instructions,
      safetyInstructions: validated.safetyInstructions,
      imageUrl: validated.imageUrl,
      createdBy: session.userId,
    });

    return NextResponse.json({ message: 'Exercise created successfully', exercise });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
