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
    return null;
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    const userId = token ? verifyToken(token) : null;

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
    return Response.json({ error: 'Error fetching fact' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { claim, answer } = await req.json();
  const { id } = await params;
  const updated = await prisma.fact.update({
    where: { id: Number(id) },
    data: { claim, answer },
  });
  return Response.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  await prisma.fact.delete({ where: { id: Number(id) } });
  return new Response(null, { status: 204 });
}
