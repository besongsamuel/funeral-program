import type { Handler } from 'aws-lambda';
import {
  BedrockRuntimeClient,
  ConverseCommand,
  type Tool,
  type Message,
  type ContentBlock,
} from '@aws-sdk/client-bedrock-runtime';
import { loadMemorialContext } from './load-context';

const bedrock = new BedrockRuntimeClient({});
const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? 'amazon.nova-lite-v1:0';
const MAX_TOOL_ROUNDS = 4;

const TOOLS: Tool[] = [
  {
    toolSpec: {
      name: 'get_memorial_overview',
      description: 'Get her full name, maiden name, dates, tribute, and obituary. Use for “who was she” and general identity questions.',
      inputSchema: { json: { type: 'object', properties: {} } },
    },
  },
  {
    toolSpec: {
      name: 'get_biography',
      description:
        'Get biography sections entered by the family. Topics: childhood, education, faith, accomplishments, qualities, quotes, career. Omit topic to return every section. Use for who she was, where she grew up, and her life story.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            topic: { type: 'string', description: 'Optional biography kind such as childhood or faith' },
          },
        },
      },
    },
  },
  {
    toolSpec: {
      name: 'get_timeline',
      description: 'Get life milestones such as birth, marriage, and later years.',
      inputSchema: { json: { type: 'object', properties: {} } },
    },
  },
  {
    toolSpec: {
      name: 'get_family',
      description:
        'Get family members from the backend, grouped by relation, with counts of children and grandchildren when those labels are recorded. Use for children, grandchildren, spouse, and relatives.',
      inputSchema: {
        json: {
          type: 'object',
          properties: { relation: { type: 'string', description: 'Optional relation filter such as Daughter or Grandson' } },
        },
      },
    },
  },
  {
    toolSpec: {
      name: 'search_life_story',
      description: 'Search biography, timeline, family bios, obituary, and custom knowledge for a phrase. Use when the question does not fit a single topic.',
      inputSchema: {
        json: {
          type: 'object',
          properties: { query: { type: 'string' } },
          required: ['query'],
        },
      },
    },
  },
  { toolSpec: { name: 'get_funeral_details', description: 'Get funeral service, visitation, reception, burial, and programme events', inputSchema: { json: { type: 'object', properties: { kind: { type: 'string' } } } } } },
  { toolSpec: { name: 'get_program', description: 'Get order of service and programme image or PDF', inputSchema: { json: { type: 'object', properties: {} } } } },
  { toolSpec: { name: 'search_memories', description: 'Search approved stories and tributes', inputSchema: { json: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } } } },
  { toolSpec: { name: 'get_media', description: 'Get videos, music, livestream', inputSchema: { json: { type: 'object', properties: { kind: { type: 'string' }, category: { type: 'string' } } } } } },
  { toolSpec: { name: 'get_donation_info', description: 'Get donation causes and in lieu of flowers note', inputSchema: { json: { type: 'object', properties: {} } } } },
  { toolSpec: { name: 'get_contact_info', description: 'Get family contacts for funeral questions', inputSchema: { json: { type: 'object', properties: {} } } } },
  { toolSpec: { name: 'search_knowledge', description: 'Search custom Q&A knowledge entries entered in admin', inputSchema: { json: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } } } },
];

interface ChatRequest {
  memorialId?: string;
  sessionId: string;
  message: string;
  memorialContext?: Record<string, unknown>;
}

function cleanModelText(text: string) {
  const responseMatch = text.match(/<response>([\s\S]*?)<\/response>/i);
  if (responseMatch) return responseMatch[1].trim();
  return text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
}

function stripHtml(value?: unknown) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function asRecords(value: unknown) {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

function familySummary(members: Record<string, unknown>[], relationFilter?: string) {
  const filtered = relationFilter
    ? members.filter((member) => String(member.relation ?? '').toLowerCase().includes(relationFilter.toLowerCase()))
    : members;
  const isChild = (relation: string) => /\b(son|daughter|child|children)\b/i.test(relation) && !/\bgrand/i.test(relation);
  const isGrandchild = (relation: string) => /\b(grandson|granddaughter|grandchild)/i.test(relation);
  const children = members.filter((member) => isChild(String(member.relation ?? '')));
  const grandchildren = members.filter((member) => isGrandchild(String(member.relation ?? '')));
  const countsByRelation = members.reduce<Record<string, number>>((acc, member) => {
    const key = String(member.relation ?? 'Family').trim() || 'Family';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return {
    members: filtered.map((member) => ({
      fullName: member.fullName,
      relation: member.relation,
      bio: member.bio,
    })),
    countsByRelation,
    childCount: children.length,
    grandchildCount: grandchildren.length,
    children: children.map((member) => ({ fullName: member.fullName, relation: member.relation })),
    grandchildren: grandchildren.map((member) => ({ fullName: member.fullName, relation: member.relation })),
    note:
      children.length || grandchildren.length
        ? undefined
        : 'No family records are labeled as son, daughter, or grandchild. Use the listed relations and biography instead of inventing a count.',
    link: '/family',
  };
}

function searchRecords(query: string, ctx: Record<string, unknown>) {
  const q = query.toLowerCase();
  const hits: Array<{ source: string; title?: string; text: string; link: string }> = [];
  const push = (source: string, title: string | undefined, text: unknown, link: string) => {
    const value = stripHtml(text);
    if (value && `${title ?? ''} ${value}`.toLowerCase().includes(q)) {
      hits.push({ source, title, text: value, link });
    }
  };

  const memorial = ctx.memorial as Record<string, unknown> | undefined;
  push('obituary', 'Obituary', memorial?.obituaryHtml, '/legacy');
  push('tribute', 'Tribute', memorial?.shortTribute, '/');
  for (const section of asRecords(ctx.biographySections)) {
    push('biography', String(section.heading ?? section.kind), `${section.heading} ${section.body}`, '/legacy');
  }
  for (const event of asRecords(ctx.timelineEvents)) {
    push('timeline', String(event.title), `${event.title} ${event.description ?? ''}`, '/legacy');
  }
  for (const member of asRecords(ctx.familyMembers)) {
    push('family', String(member.fullName), `${member.fullName} ${member.relation} ${member.bio ?? ''}`, '/family');
  }
  for (const entry of asRecords(ctx.aiKnowledgeEntries)) {
    push('knowledge', String(entry.question), `${entry.question} ${entry.answer}`, '/legacy');
  }
  return { results: hits.slice(0, 8) };
}

function executeTool(name: string, input: Record<string, unknown>, ctx: Record<string, unknown>) {
  const memorial = ctx.memorial as Record<string, unknown> | undefined;
  switch (name) {
    case 'get_memorial_overview':
      return {
        fullName: memorial?.fullName,
        maidenName: memorial?.maidenName,
        bornOn: memorial?.bornOn,
        diedOn: memorial?.diedOn,
        tagline: memorial?.tagline,
        shortTribute: memorial?.shortTribute,
        obituary: stripHtml(memorial?.obituaryHtml),
        link: '/legacy',
      };
    case 'get_funeral_details': {
      const events = asRecords(ctx.funeralEvents);
      const kind = input.kind as string | undefined;
      return { events: kind ? events.filter((event) => event.kind === kind) : events, link: '/funeral' };
    }
    case 'get_program':
      return { items: ctx.programItems ?? [], pdfUrl: memorial?.programPdfUrl, link: '/funeral' };
    case 'get_biography': {
      const sections = asRecords(ctx.biographySections);
      const topic = (input.topic as string | undefined)?.toLowerCase();
      const filtered = topic
        ? sections.filter((section) => String(section.kind ?? '').toLowerCase() === topic || String(section.heading ?? '').toLowerCase().includes(topic))
        : sections;
      return {
        sections: filtered.map((section) => ({
          kind: section.kind,
          heading: section.heading,
          body: section.body,
        })),
        link: '/legacy',
      };
    }
    case 'get_timeline':
      return { events: ctx.timelineEvents ?? [], link: '/legacy' };
    case 'get_family':
      return familySummary(asRecords(ctx.familyMembers), input.relation as string | undefined);
    case 'search_life_story':
      return searchRecords(String(input.query ?? ''), ctx);
    case 'search_memories': {
      const q = String(input.query ?? '').toLowerCase();
      const matches = [...asRecords(ctx.tributes), ...asRecords(ctx.stories)].filter((item) =>
        JSON.stringify(item).toLowerCase().includes(q),
      );
      return { results: matches.slice(0, 5), link: '/tributes' };
    }
    case 'get_media': {
      const items = asRecords(ctx.mediaItems);
      const kind = input.kind as string | undefined;
      return { items: kind ? items.filter((item) => item.kind === kind) : items, link: '/memories' };
    }
    case 'get_donation_info':
      return { causes: ctx.donationCauses ?? [], link: '/donations' };
    case 'get_contact_info':
      return { contacts: ctx.familyContacts ?? [], link: '/funeral' };
    case 'search_knowledge': {
      const q = String(input.query ?? '').toLowerCase();
      const entries = asRecords(ctx.aiKnowledgeEntries);
      return {
        entries: entries.filter((entry) => `${entry.question} ${entry.answer}`.toLowerCase().includes(q)),
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
    const { message, sessionId } = body;

    if (!message || message.length > 1000) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Invalid message' }) };
    }

    const memorialId =
      body.memorialId ||
      ((body.memorialContext?.memorial as Record<string, unknown> | undefined)?.id as string | undefined);
    const ctx = (await loadMemorialContext(memorialId)) ?? body.memorialContext ?? {};

    const aiSettings = ctx.aiSettings as Record<string, unknown> | undefined;
    if (aiSettings?.isEnabled === false) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: aiSettings.fallbackMessage ?? 'The assistant is currently unavailable.' }),
      };
    }

    const memorial = ctx.memorial as Record<string, unknown> | undefined;
    const systemPrompt = `You are ${aiSettings?.assistantName ?? 'Memorial Guide'}, a warm and respectful assistant for the memorial website of ${memorial?.fullName ?? 'the deceased'}.
${aiSettings?.persona ?? 'Speak with compassion and brevity.'}
You have tools that read live memorial records from the database (biography, family, funeral, knowledge).
Always call tools before answering questions about her life, family, childhood, children, grandchildren, or the funeral.
For “who was she” / tell me about her: call get_memorial_overview and get_biography.
For children or grandchildren: call get_family. Never invent a number. If childCount is 0, say an exact count is not recorded and share what the family list and biography do say.
For where she grew up or childhood: call get_biography with topic childhood and get_timeline.
If those records do not name a town or country of upbringing, say that is not recorded. Do not infer a hometown from where relatives live now.
Only use tool results. If tools return nothing, say so and suggest contacting the family.
Include relevant page links from tool results when helpful. Valid paths are /, /legacy, /funeral, /family, /tributes, /donations, /memories, and /gallery.
Reply in plain text or markdown. Do not use XML tags such as thinking or response.`;

    const messages: Message[] = [{ role: 'user', content: [{ text: message }] }];

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

      const toolUses =
        output.content?.filter((c): c is ContentBlock & { toolUse: NonNullable<ContentBlock['toolUse']> } => !!c.toolUse) ??
        [];

      if (toolUses.length === 0) {
        finalText = cleanModelText(output.content?.find((c) => c.text)?.text ?? '');
        break;
      }

      messages.push({ role: 'assistant', content: output.content ?? [] });

      const toolResults = toolUses.map((tu) => {
        const toolInput = (tu.toolUse.input as Record<string, unknown>) ?? {};
        const result = executeTool(tu.toolUse.name ?? '', toolInput, ctx);
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
      finalText =
        (aiSettings?.fallbackMessage as string) ??
        "I'm sorry, I couldn't find that information. Please contact the family for assistance.";
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
