import { prisma } from '@/lib/prisma';

export async function GET() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
  return Response.json(posts);
}

export async function POST(req: Request) {
  const { title, content } = await req.json();
  const post = await prisma.post.create({
    data: { title, content },
  });
  return Response.json(post);
}
