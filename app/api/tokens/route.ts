import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
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

    // Retrieve all active tokens for the user
    const tokens = await prisma.apiToken.findMany({
      where: {
        userId: decodedUser.id,
        isRevoked: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      select: {
        id: true,
        token: true,
        name: true,
        createdAt: true,
        expiresAt: true,
        lastUsed: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Mask the tokens for security
    const maskedTokens = tokens.map(token => ({
      ...token,
      token: `${token.token.substring(0, 4)}...${token.token.substring(token.token.length - 4)}`
    }));

    return NextResponse.json({ tokens: maskedTokens });
  } catch (error) {
    console.error('Error retrieving API tokens:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 