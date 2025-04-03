import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // Verify the user is authenticated
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = await verifyAuth(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a secure random token
    const apiToken = crypto.randomBytes(32).toString('hex');

    // TODO: Store the API token in your database associated with the user
    // This is where you would save the token to your database
    // For now, we'll just return it

    return NextResponse.json({ token: apiToken });
  } catch (error) {
    console.error('Error generating API token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 