import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { rating } = await request.json();
    const { slug } = await params;

    // Validate rating
    if (!['helpful', 'somewhat_helpful', 'not_helpful'].includes(rating)) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    // Check if fact exists
    const fact = await prisma.fact.findUnique({
      where: { slug },
    });

    if (!fact) {
      return NextResponse.json({ error: 'Fact not found' }, { status: 404 });
    }

    // Create or update vote
    const vote = await prisma.vote.upsert({
      where: {
        factId_userId: {
          factId: fact.id,
          userId,
        },
      },
      update: {
        rating,
      },
      create: {
        factId: fact.id,
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
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { slug } = await params;

    // Get fact by slug
    const fact = await prisma.fact.findUnique({
      where: { slug },
    });

    if (!fact) {
      return NextResponse.json({ error: 'Fact not found' }, { status: 404 });
    }

    // Get user's vote for this fact
    const vote = await prisma.vote.findUnique({
      where: {
        factId_userId: {
          factId: fact.id,
          userId,
        },
      },
    });

    return NextResponse.json(vote);
  } catch (error) {
    console.error('Error fetching vote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { slug } = await params;

    // Get fact by slug
    const fact = await prisma.fact.findUnique({
      where: { slug },
    });

    if (!fact) {
      return NextResponse.json({ error: 'Fact not found' }, { status: 404 });
    }

    // Remove user's vote for this fact
    const vote = await prisma.vote.delete({
      where: {
        factId_userId: {
          factId: fact.id,
          userId,
        },
      },
    });

    return NextResponse.json(vote);
  } catch (error) {
    console.error('Error removing vote:', error);
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    );
  }
} 