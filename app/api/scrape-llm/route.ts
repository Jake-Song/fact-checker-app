import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const anthropic = new Anthropic();

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { scrapedData, prompt, model = 'claude-3-5-sonnet-20240620' } = body;

    if (!scrapedData) {
      return NextResponse.json(
        { error: 'Scraped data is required' },
        { status: 400 }
      );
    }

    // Prepare the content for the LLM
    const content = `
Title: ${scrapedData.title}
Description: ${scrapedData.description}

Content:
${scrapedData.mainContent}

Key Headings:
${scrapedData.headings.join('\n')}

URL: ${scrapedData.url}
`;

    // Create the message
    const response = await anthropic.messages.create({
      model,
      messages: [
        {
          role: 'user',
          content: `${prompt || 'Analyze the following content and provide a summary of the key points:'}\n\n${content}`
        }
      ],
      max_tokens: 4096,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing with LLM:', error);
    return NextResponse.json(
      { error: 'Failed to process with LLM' },
      { status: 500 }
    );
  }
} 