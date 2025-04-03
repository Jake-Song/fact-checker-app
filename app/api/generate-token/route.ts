import { NextResponse } from 'next/server';
import { verifyAuth } from "@/lib/auth";
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
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

    // Generate a secure random token
    const apiToken = crypto.randomBytes(32).toString('hex');

    // Store the token in the database
    const storedToken = await prisma.apiToken.create({
      data: {
        token: apiToken,
        userId: decodedUser.id,
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