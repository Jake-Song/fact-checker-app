import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

type FactWithVotes = Prisma.FactGetPayload<{
  include: { votes: true }
}>;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? Number(session.user.id) : null;

    const { id } = await params;
    const fact = await prisma.fact.findUnique({ 
      where: { id: Number(id) }, 
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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { claim, answer } = await req.json();
    const { id } = await params;
    const updated = await prisma.fact.update({
      where: { id: Number(id) },
      data: { claim, answer },
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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.fact.delete({ where: { id: Number(id) } });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting fact:', error);
    return NextResponse.json(
      { error: 'Failed to delete fact' },
      { status: 500 }
    );
  }
}
