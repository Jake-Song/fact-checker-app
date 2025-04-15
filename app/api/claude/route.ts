import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { tavily } from "@tavily/core";

// Initialize the Anthropic client
const client = new Anthropic();
const tvly = tavily()

const tools: Anthropic.Tool[] = [
  {
    name: "search",
    description: "Search the web for information",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The query to search the web for"
        }
      },
      required: ["query"]
    }
  }
];

async function processToolCall(toolName: string, toolInput: any) {
  if (toolName === "search") {
    const result = await searchWeb(toolInput.query);
    return result;
  }
}

async function searchWeb(query: string) {
  const result = await tvly.search(query, {
    max_results: 5,   
  });
  return result;
}

async function chatWithClaude(messages: Anthropic.MessageParam[], model: string) {
  try {
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20240620",
      messages: messages,
      tools: tools,
      max_tokens: 4096,
  });
  console.log('Initial response:');
  console.dir(message, { depth: 4 });

  let tool;
  if (message.stop_reason === "tool_use") {
      tool = message.content.find(
        (content): content is Anthropic.ToolUseBlock => content.type === 'tool_use',
      );

      if (!tool) {
        throw new Error("Tool use block not found");
      }
    
  } else {
    return message;
  }
  const toolResult = await processToolCall(tool.name, tool.input);
  const result = await client.messages.create({
    model: model,
    max_tokens: 1024,
    messages: [
      ...messages,
      { role: message.role, content: message.content },
      {
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: tool.id,
            content: [{ type: 'text', text: JSON.stringify(toolResult) }],
          },
        ],
      },
    ],
    tools,
  });
  console.log('\nFinal response');
  console.dir(result, { depth: 4 });
  return result;
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}


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
    const response = await chatWithClaude(messages, model);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 