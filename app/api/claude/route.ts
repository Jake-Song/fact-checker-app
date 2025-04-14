import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const anthropic = new Anthropic();

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { messages, model = 'claude-3-5-sonnet-20240620' } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    console.log("messages", messages);

    // Create the message
    const response = await anthropic.messages.create({
      model,
      messages,
      max_tokens: 4096,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 