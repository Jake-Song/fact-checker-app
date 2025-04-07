import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import { Prisma } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

type FactWithVotes = Prisma.FactGetPayload<{
  include: { votes: true }
}>;

// Helper function to verify JWT token
function verifyToken(token: string) {
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const userId = token ? verifyToken(token) : null;

    const facts = await prisma.fact.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        votes: true,
      },
    }) as FactWithVotes[];

    // Filter votes for authenticated user and calculate vote counts
    const factsWithFilteredVotes = facts.map(fact => {
      const userVotes = userId ? fact.votes.filter(vote => vote.userId === userId) : [];
      const voteCounts = {
        helpful: fact.votes.filter(vote => vote.rating === 'helpful').length,
        somewhat_helpful: fact.votes.filter(vote => vote.rating === 'somewhat_helpful').length,
        not_helpful: fact.votes.filter(vote => vote.rating === 'not_helpful').length,
      };

      return {
        ...fact,
        votes: userVotes,
        voteCounts,
      };
    });

    return NextResponse.json(factsWithFilteredVotes);
  } catch (error) {
    console.error('Error fetching facts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { claim, answer } = await request.json();

    const fact = await prisma.fact.create({
      data: {
        claim,
        answer,
      },
    });

    return NextResponse.json(fact, { status: 201 });
  } catch (error) {
    console.error('Error creating fact:', error);
    return NextResponse.json(
      { error: 'Failed to create fact' },
      { status: 500 }
    );
  }
}
