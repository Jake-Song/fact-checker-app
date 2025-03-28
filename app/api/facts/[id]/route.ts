import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const fact = await prisma.fact.findUnique({ where: { id: Number(params.id) } });
  return Response.json(fact);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { claim, answer } = await req.json();
  const updated = await prisma.fact.update({
    where: { id: Number(params.id) },
    data: { claim, answer },
  });
  return Response.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.fact.delete({ where: { id: Number(params.id) } });
  return new Response(null, { status: 204 });
}
