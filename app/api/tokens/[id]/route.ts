import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify the user is authenticated
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decodedUser = await verifyAuth(token);
    
    if (!decodedUser || !decodedUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const tokenId = Number(id);
    if (isNaN(tokenId)) {
      return NextResponse.json({ error: 'Invalid token ID' }, { status: 400 });
    }

    // Find the token and verify it belongs to the user
    const apiToken = await prisma.apiToken.findUnique({
      where: { id: tokenId },
    });

    if (!apiToken) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    if (apiToken.userId !== decodedUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Revoke the token instead of deleting it (for audit purposes)
    await prisma.apiToken.update({
      where: { id: tokenId },
      data: { isRevoked: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking API token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 