import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to verify JWT token
function verifyToken(token: string) {
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { rating } = await request.json();
    const { id } = await params;
    const factId = Number(id);

    // Validate rating
    if (!['helpful', 'somewhat_helpful', 'not_helpful'].includes(rating)) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    // Check if fact exists
    const fact = await prisma.fact.findUnique({
      where: { id: factId },
    });

    if (!fact) {
      return NextResponse.json({ error: 'Fact not found' }, { status: 404 });
    }

    // Create or update vote
    const vote = await prisma.vote.upsert({
      where: {
        factId_userId: {
          factId,
          userId,
        },
      },
      update: {
        rating,
      },
      create: {
        factId,
        userId,
        rating,
      },
      include: {
        fact: {
          include: {
            votes: true,
          },
        },
        user: true,
      },
    });

    // Calculate vote counts
    const voteCounts = {
      helpful: vote.fact.votes.filter(v => v.rating === 'helpful').length,
      somewhat_helpful: vote.fact.votes.filter(v => v.rating === 'somewhat_helpful').length,
      not_helpful: vote.fact.votes.filter(v => v.rating === 'not_helpful').length,
    };

    return NextResponse.json({
      ...vote,
      voteCounts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error processing vote' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;
    const factId = Number(id);

    // Get user's vote for this fact
    const vote = await prisma.vote.findUnique({
      where: {
        factId_userId: {
          factId,
          userId,
        },
      },
    });

    return NextResponse.json(vote);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching vote' },
      { status: 500 }
    );
  }
} 