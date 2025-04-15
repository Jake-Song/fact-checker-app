import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
// import { tavily } from "@tavily/core";

// const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// const tools = [
//   {
//       "name": "search",
//       "description": "A tool that searches the web for information.",
//       "input_schema": {
//           "type": "object",
//           "properties": {
//               "query": {
//                   "type": "string",
//                   "description": "The query to search the web for."
//               }
//           },
//           "required": ["query"]
//       }
//   }
// ]

// async function processToolCall(toolName: string, toolInput: any) {
//   if (toolName === "search") {
//     const response = await tvly.search(toolInput.query, {
//       max_results: 5,
//     });
//     return response;
//   }
// }

// Initialize the Anthropic client
const anthropic = new Anthropic();
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { scrapedData, model = 'claude-3-5-sonnet-20240620' } = body;

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

        URL: ${scrapedData.url}
    `;

    // Create the message
    const response = await anthropic.messages.create({
      model,
      system: "너는 팩트체커야. 주어진 url의 웹사이트에 대해 사용자의 질문에 대한 답변을 제공해야해. 답변은 한국어로 제공해야해.",
      messages: [
        {
          role: 'user',
          content: `${content}`
        }
      ],
      // tools: tools as Anthropic.ToolUnion[],
      max_tokens: 1024,
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