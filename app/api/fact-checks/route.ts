import { prisma } from '@/lib/prisma';

export async function GET() {
  const factChecks = await prisma.fact.findMany({ orderBy: { createdAt: 'desc' } });
  return Response.json(factChecks);
}

export async function POST(req: Request) {
  const { claim, answer } = await req.json();
  const factCheck = await prisma.fact.create({
    data: { claim, answer },
  });
  return Response.json(factCheck);
}
