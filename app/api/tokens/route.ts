import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Get the session using NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve all active tokens for the user
    const tokens = await prisma.apiToken.findMany({
      where: {
        userId: Number(session.user.id),
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