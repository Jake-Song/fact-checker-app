import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { tavily } from "@tavily/core";

const tvly = tavily();
// Initialize the Anthropic client
const client = new Anthropic();

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

async function chat(messages: Anthropic.MessageParam[], model: string) {
  try {
    const message = await client.messages.create({
      model: model,
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

    const prompt = `
    너는 팩트체커야. 답변은 한국어로 제공해야해.
    주어진 웹사이트의 내용 ${content} 바탕으로 팩트체크를 해야해.
    인터넷 검색도구 실행 후 나온 링크는 반드시 전부 포함해줘.
    응답은 .md 파일로 저장할 수 있게 마크다운 형식으로 제공해줘.
    `
    
    // Create the message
    const response = await chat([{
      role: 'user',
      content: `${prompt}`
    }], model);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing with LLM:', error);
    return NextResponse.json(
      { error: 'Failed to process with LLM' },
      { status: 500 }
    );
  }
} 