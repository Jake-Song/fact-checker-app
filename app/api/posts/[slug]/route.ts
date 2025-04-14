import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  return Response.json(post);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : session.user.id;

    const updates = await request.json();
    const { slug } = await params;

    // Check if post belongs to user
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (!existingPost || existingPost.authorId !== userId) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Generate new slug if title is being updated
    let newSlug = existingPost.slug;
    if (updates.title && updates.title !== existingPost.title) {
      newSlug = updates.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const post = await prisma.post.update({
      where: { slug },
      data: {
        title: updates.title ?? existingPost.title,
        content: updates.content ?? existingPost.content,
        status: updates.status ?? existingPost.status,
        slug: newSlug,
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id) : session.user.id;

    const { slug } = await params;

    // Check if post belongs to user
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (!existingPost || existingPost.authorId !== userId) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.post.delete({
      where: { slug },
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
