import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Get the session using NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a secure random token
    const apiToken = crypto.randomBytes(32).toString('hex');

    // Store the token in the database
    const storedToken = await prisma.apiToken.create({
      data: {
        token: apiToken,
        userId: Number(session.user.id),
        // Set expiration to 1 year from now
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ 
      token: apiToken,
      expiresAt: storedToken.expiresAt,
    });
  } catch (error) {
    console.error('Error generating API token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 