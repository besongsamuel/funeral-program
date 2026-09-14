import type { Handler } from 'aws-lambda';
import {
  BedrockRuntimeClient,
  ConverseCommand,
  type Tool,
  type Message,
  type ContentBlock,
} from '@aws-sdk/client-bedrock-runtime';

const bedrock = new BedrockRuntimeClient({});
const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? 'amazon.nova-lite-v1:0';
const MAX_TOOL_ROUNDS = 4;

const TOOLS: Tool[] = [
  { toolSpec: { name: 'get_memorial_overview', description: 'Get name, dates, tagline, tribute, obituary summary', inputSchema: { json: { type: 'object', properties: {} } } } },
  { toolSpec: { name: 'get_funeral_details', description: 'Get funeral service, visitation, reception, burial details', inputSchema: { json: { type: 'object', properties: { kind: { type: 'string' } } } } } },
  { toolSpec: { name: 'get_program', description: 'Get order of service and program PDF', inputSchema: { json: { type: 'object', properties: {} } } } },
  { toolSpec: { name: 'get_biography', description: 'Get biography sections by topic', inputSchema: { json: { type: 'object', properties: { topic: { type: 'string' } } } } } },
  { toolSpec: { name: 'get_timeline', description: 'Get life milestones', inputSchema: { json: { type: 'object', properties: {} } } } },
  { toolSpec: { name: 'get_family', description: 'Get family members', inputSchema: { json: { type: 'object', properties: { relation: { type: 'string' } } } } } },
  { toolSpec: { name: 'search_memories', description: 'Search approved stories and tributes', inputSchema: { json: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } } } },
  { toolSpec: { name: 'get_media', description: 'Get videos, music, livestream', inputSchema: { json: { type: 'object', properties: { kind: { type: 'string' }, category: { type: 'string' } } } } } },
  { toolSpec: { name: 'get_donation_info', description: 'Get donation causes and in lieu of flowers note', inputSchema: { json: { type: 'object', properties: {} } } } },
  { toolSpec: { name: 'get_contact_info', description: 'Get family contacts for funeral questions', inputSchema: { json: { type: 'object', properties: {} } } } },
  { toolSpec: { name: 'search_knowledge', description: 'Search custom Q&A knowledge entries', inputSchema: { json: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } } } },
];

interface ChatRequest {
  memorialId: string;
  sessionId: string;
  message: string;
  memorialContext: Record<string, unknown>;
}

function executeTool(name: string, input: Record<string, unknown>, ctx: Record<string, unknown>) {
  const memorial = ctx.memorial as Record<string, unknown> | undefined;
  switch (name) {
    case 'get_memorial_overview':
      return {
        fullName: memorial?.fullName,
        bornOn: memorial?.bornOn,
        diedOn: memorial?.diedOn,
        tagline: memorial?.tagline,
        shortTribute: memorial?.shortTribute,
        obituarySummary: (memorial?.obituaryHtml as string)?.slice(0, 500),
        link: '/',
      };
    case 'get_funeral_details': {
      const events = (ctx.funeralEvents as Array<Record<string, unknown>>) ?? [];
      const kind = input.kind as string | undefined;
      const filtered = kind ? events.filter((e) => e.kind === kind) : events;
      return { events: filtered, link: '/funeral' };
    }
    case 'get_program':
      return { items: ctx.programItems ?? [], pdfUrl: memorial?.programPdfUrl, link: '/funeral' };
    case 'get_biography': {
      const sections = (ctx.biographySections as Array<Record<string, unknown>>) ?? [];
      const topic = input.topic as string | undefined;
      return { sections: topic ? sections.filter((s) => s.kind === topic) : sections, link: '/legacy' };
    }
    case 'get_timeline':
      return { events: ctx.timelineEvents ?? [], link: '/legacy' };
    case 'get_family': {
      const members = (ctx.familyMembers as Array<Record<string, unknown>>) ?? [];
      const relation = input.relation as string | undefined;
      return { members: relation ? members.filter((m) => m.relation === relation) : members, link: '/family' };
    }
    case 'search_memories': {
      const q = ((input.query as string) ?? '').toLowerCase();
      const tributes = ((ctx.tributes as Array<Record<string, unknown>>) ?? []).filter((t) => t.status === 'approved');
      const stories = ((ctx.stories as Array<Record<string, unknown>>) ?? []).filter((s) => s.status === 'approved');
      const matches = [...tributes, ...stories].filter((item) =>
        JSON.stringify(item).toLowerCase().includes(q),
      );
      return { results: matches.slice(0, 5), link: '/tributes' };
    }
    case 'get_media': {
      const items = (ctx.mediaItems as Array<Record<string, unknown>>) ?? [];
      const kind = input.kind as string | undefined;
      return { items: kind ? items.filter((i) => i.kind === kind) : items, link: '/memories' };
    }
    case 'get_donation_info':
      return { causes: ctx.donationCauses ?? [], link: '/donations' };
    case 'get_contact_info':
      return { contacts: ctx.familyContacts ?? [], link: '/funeral' };
    case 'search_knowledge': {
      const q = ((input.query as string) ?? '').toLowerCase();
      const entries = (ctx.aiKnowledgeEntries as Array<Record<string, unknown>>) ?? [];
      return {
        entries: entries.filter((e) =>
          `${e.question} ${e.answer}`.toLowerCase().includes(q),
        ),
      };
    }
    default:
      return { error: 'Unknown tool' };
  }
}

export const handler: Handler = async (event) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body: ChatRequest = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { message, memorialContext, sessionId } = body;

    if (!message || message.length > 1000) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid message' }) };
    }

    const aiSettings = memorialContext.aiSettings as Record<string, unknown> | undefined;
    if (aiSettings?.isEnabled === false) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: aiSettings.fallbackMessage ?? 'The assistant is currently unavailable.' }),
      };
    }

    const memorial = memorialContext.memorial as Record<string, unknown> | undefined;
    const systemPrompt = `You are ${aiSettings?.assistantName ?? 'Memorial Guide'}, a warm and respectful assistant for the memorial website of ${memorial?.fullName ?? 'the deceased'}.
${aiSettings?.persona ?? 'Speak with compassion and brevity.'}
Only answer using information from tool results. Never invent facts. If you don't know, say so and suggest contacting the family.
Include relevant page links from tool results when helpful.`;

    const messages: Message[] = [
      { role: 'user', content: [{ text: message }] },
    ];

    let rounds = 0;
    let finalText = '';

    while (rounds < MAX_TOOL_ROUNDS) {
      const response = await bedrock.send(
        new ConverseCommand({
          modelId: MODEL_ID,
          system: [{ text: systemPrompt }],
          messages,
          toolConfig: { tools: TOOLS },
        }),
      );

      const output = response.output?.message;
      if (!output) break;

      const toolUses = output.content?.filter((c): c is ContentBlock & { toolUse: NonNullable<ContentBlock['toolUse']> } => !!c.toolUse) ?? [];

      if (toolUses.length === 0) {
        finalText = output.content?.find((c) => c.text)?.text ?? '';
        break;
      }

      messages.push({ role: 'assistant', content: output.content ?? [] });

      const toolResults = toolUses.map((tu) => {
        const toolInput = (tu.toolUse.input as Record<string, unknown>) ?? {};
        const result = executeTool(tu.toolUse.name ?? '', toolInput, memorialContext);
        return {
          toolResult: {
            toolUseId: tu.toolUse.toolUseId!,
            content: [{ json: result as Record<string, unknown> }],
          },
        } as ContentBlock;
      });

      messages.push({ role: 'user', content: toolResults });
      rounds++;
    }

    if (!finalText && rounds >= MAX_TOOL_ROUNDS) {
      finalText = (aiSettings?.fallbackMessage as string) ?? "I'm sorry, I couldn't find that information. Please contact the family for assistance.";
    }

    const sseBody = `data: ${JSON.stringify({ reply: finalText, sessionId })}\n\ndata: [DONE]\n\n`;

    return { statusCode: 200, headers, body: sseBody };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Assistant unavailable' }),
    };
  }
};
