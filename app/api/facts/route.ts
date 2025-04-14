import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type FactWithVotes = Prisma.FactGetPayload<{
  include: { votes: true }
}>;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? Number(session.user.id) : null;

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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 401 });
    }

    const { claim, answer } = await request.json();
    
    // Generate slug from claim
    const slug = claim
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, '-')  // Allow Korean characters (가-힣)
      .replace(/(^-|-$)/g, '');

    const fact = await prisma.fact.create({
      data: {
        claim,
        answer,
        slug,
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
