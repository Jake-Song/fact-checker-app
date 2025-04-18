import { prisma } from '@/lib/prisma';

export async function GET() {
  const facts = await prisma.fact.findMany({
    where: { status: 'published' },
    orderBy: { createdAt: 'desc' }
  });
  return Response.json(facts);
}