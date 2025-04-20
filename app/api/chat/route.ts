import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body;
    if (!messages) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }
    console.log("messages #1", messages);
    messages[0].content = `
      ${messages[0].content} 팩트체크 해줘.
      답변은 .md 파일로 저장할 수 있게 마크다운 형식으로 제공해줘. 
      답변은 최대한 상세하게 제공해줘.
    `
    console.log("messages #2", messages);
    const instructions = `
      팩트 체크 외의 요청은 "수행할 수 없습니다"고 답변해줘.
    `
    const response = await client.responses.create({
      model: "gpt-4.1",
      instructions: instructions,
      input: messages,
      tools: [ { type: "web_search_preview" } ],
    });
    console.log("response", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 