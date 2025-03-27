import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: Number(params.id) } });
  return Response.json(post);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { title, content } = await req.json();
  const updated = await prisma.post.update({
    where: { id: Number(params.id) },
    data: { title, content },
  });
  return Response.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.post.delete({ where: { id: Number(params.id) } });
  return new Response(null, { status: 204 });
}
