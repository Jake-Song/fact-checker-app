import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to verify JWT token
function verifyToken(token: string) {
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id: Number(id) } });
  return Response.json(post);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const updates = await request.json();
    const { id } = await params;

    // Check if post belongs to user
    const existingPost = await prisma.post.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPost || existingPost.authorId !== userId) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        title: updates.title ?? existingPost.title,
        content: updates.content ?? existingPost.content,
        status: updates.status ?? existingPost.status,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = verifyToken(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;

    // Check if post belongs to user
    const existingPost = await prisma.post.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPost || existingPost.authorId !== userId) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
