import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

type FactWithVotes = Prisma.FactGetPayload<{
  include: { votes: true }
}>;

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? Number(session.user.id) : null;

    const { slug } = await params;
    const fact = await prisma.fact.findUnique({ 
      where: { slug }, 
      include: {
        votes: true,
      },
    }) as FactWithVotes;
    
    const userVotes = userId ? fact.votes.filter(vote => vote.userId === userId) : [];
    const voteCounts = {
      helpful: fact.votes.filter(vote => vote.rating === 'helpful').length,
      somewhat_helpful: fact.votes.filter(vote => vote.rating === 'somewhat_helpful').length,
      not_helpful: fact.votes.filter(vote => vote.rating === 'not_helpful').length,
    };

    return Response.json({
      ...fact,
      votes: userVotes,
      voteCounts,
    });
  } catch (error) {
    console.error('Error fetching fact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fact' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { claim, answer } = await req.json();
    const { slug } = await params;
    
    // Generate new slug if claim is being updated
    let newSlug = slug;
    if (claim) {
      newSlug = claim
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    const updated = await prisma.fact.update({
      where: { slug },
      data: { 
        claim, 
        answer,
        slug: newSlug,
      },
    });
    return Response.json(updated);
  } catch (error) {
    console.error('Error updating fact:', error);
    return NextResponse.json(
      { error: 'Failed to update fact' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    await prisma.fact.delete({ where: { slug } });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting fact:', error);
    return NextResponse.json(
      { error: 'Failed to delete fact' },
      { status: 500 }
    );
  }
}
