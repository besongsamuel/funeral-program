/**
 * Seed Amplify Data from src/lib/demo-data.ts.
 *
 * Requires a deployed sandbox (`yarn sandbox`) and amplify_outputs.json.
 *
 *   yarn seed
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { demoContext, MEMORIAL_ID } from '../src/lib/demo-data';

process.env.AWS_PROFILE ??= 'aftermath';
process.env.AWS_REGION ??= 'us-east-1';

const OUTPUTS_PATH = resolve(process.cwd(), 'amplify_outputs.json');

const MODELS = [
  'Memorial',
  'BiographySection',
  'TimelineEvent',
  'FamilyMember',
  'FuneralEvent',
  'ProgramItem',
  'GalleryAlbum',
  'GalleryPhoto',
  'Tribute',
  'Story',
  'MediaItem',
  'DonationCause',
  'FamilyContact',
  'AiSettings',
  'AiQuickQuestion',
  'AiKnowledgeEntry',
] as const;

type ModelName = (typeof MODELS)[number];

function compact(item: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(item).filter(([, value]) => value !== undefined),
  );
}

function withTimestamps(item: Record<string, unknown>, now: string) {
  return compact({
    ...item,
    createdAt: item.createdAt ?? now,
    updatedAt: now,
  });
}

function requireOutputs() {
  if (!existsSync(OUTPUTS_PATH)) {
    throw new Error(
      'amplify_outputs.json not found. Deploy the backend first with `yarn sandbox`.',
    );
  }
  return JSON.parse(readFileSync(OUTPUTS_PATH, 'utf8')) as {
    data?: { aws_region?: string };
  };
}

async function resolveTables(client: DynamoDBClient) {
  const names: string[] = [];
  let ExclusiveStartTableName: string | undefined;
  do {
    const result = await client.send(new ListTablesCommand({ ExclusiveStartTableName }));
    names.push(...(result.TableNames ?? []));
    ExclusiveStartTableName = result.LastEvaluatedTableName;
  } while (ExclusiveStartTableName);

  const tables = {} as Record<ModelName, string>;
  for (const model of MODELS) {
    const match = names.find((name) => name === model || name.startsWith(`${model}-`));
    if (!match) {
      throw new Error(
        `Could not find DynamoDB table for ${model}. Is the sandbox deployed with AWS_PROFILE=aftermath?`,
      );
    }
    tables[model] = match;
  }
  return tables;
}

async function putAll(
  doc: DynamoDBDocumentClient,
  table: string,
  items: Record<string, unknown>[],
  now: string,
) {
  for (const item of items) {
    await doc.send(
      new PutCommand({
        TableName: table,
        Item: withTimestamps(item, now),
      }),
    );
  }
}

async function seed() {
  const outputs = requireOutputs();
  const region = outputs.data?.aws_region ?? process.env.AWS_REGION ?? 'us-east-1';
  const client = new DynamoDBClient({ region });
  const doc = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  });
  const tables = await resolveTables(client);
  const now = new Date().toISOString();
  const { memorial, ...rest } = demoContext;

  await putAll(doc, tables.Memorial, [{ ...memorial, id: MEMORIAL_ID }], now);
  await putAll(doc, tables.BiographySection, rest.biographySections, now);
  await putAll(doc, tables.TimelineEvent, rest.timelineEvents, now);
  await putAll(doc, tables.FamilyMember, rest.familyMembers, now);
  await putAll(doc, tables.FuneralEvent, rest.funeralEvents, now);
  await putAll(doc, tables.ProgramItem, rest.programItems, now);
  await putAll(doc, tables.GalleryAlbum, rest.galleryAlbums, now);
  await putAll(doc, tables.GalleryPhoto, rest.galleryPhotos, now);
  await putAll(doc, tables.Tribute, rest.tributes, now);
  await putAll(doc, tables.Story, rest.stories, now);
  await putAll(doc, tables.MediaItem, rest.mediaItems, now);
  await putAll(doc, tables.DonationCause, rest.donationCauses, now);
  await putAll(doc, tables.FamilyContact, rest.familyContacts, now);
  await putAll(doc, tables.AiSettings, [rest.aiSettings], now);
  await putAll(doc, tables.AiQuickQuestion, rest.aiQuickQuestions, now);
  await putAll(doc, tables.AiKnowledgeEntry, rest.aiKnowledgeEntries, now);

  const counts = [
    ['Memorial', 1],
    ['BiographySection', rest.biographySections.length],
    ['TimelineEvent', rest.timelineEvents.length],
    ['FamilyMember', rest.familyMembers.length],
    ['FuneralEvent', rest.funeralEvents.length],
    ['ProgramItem', rest.programItems.length],
    ['GalleryAlbum', rest.galleryAlbums.length],
    ['GalleryPhoto', rest.galleryPhotos.length],
    ['FamilyContact', rest.familyContacts.length],
    ['AiSettings', 1],
    ['AiQuickQuestion', rest.aiQuickQuestions.length],
    ['AiKnowledgeEntry', rest.aiKnowledgeEntries.length],
  ];

  console.log(`Seeded memorial "${memorial.slug}" (${MEMORIAL_ID})`);
  for (const [name, count] of counts) {
    console.log(`  ${name}: ${count}`);
  }
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
