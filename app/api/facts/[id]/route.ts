import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const fact = await prisma.fact.findUnique({ where: { id: Number(id) } });
  return Response.json(fact);
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
