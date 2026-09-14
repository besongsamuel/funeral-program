import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const INDEX: Record<string, string> = {
  BiographySection: 'biographySectionsByMemorialIdAndSortOrder',
  TimelineEvent: 'timelineEventsByMemorialIdAndSortOrder',
  FamilyMember: 'familyMembersByMemorialIdAndSortOrder',
  FuneralEvent: 'funeralEventsByMemorialId',
  ProgramItem: 'programItemsByMemorialIdAndSortOrder',
  Tribute: 'tributesByMemorialIdAndStatus',
  Story: 'storiesByMemorialIdAndStatus',
  MediaItem: 'mediaItemsByMemorialIdAndSortOrder',
  DonationCause: 'donationCausesByMemorialIdAndSortOrder',
  FamilyContact: 'familyContactsByMemorialId',
  AiSettings: 'aiSettingsByMemorialId',
  AiQuickQuestion: 'aiQuickQuestionsByMemorialIdAndSortOrder',
  AiKnowledgeEntry: 'aiKnowledgeEntriesByMemorialId',
};

function tableName(model: string) {
  return process.env[`TABLE_${model}`];
}

async function queryByMemorial(model: string, memorialId: string) {
  const table = tableName(model);
  const index = INDEX[model];
  if (!table || !index) return [];

  const items: Record<string, unknown>[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const result = await doc.send(
      new QueryCommand({
        TableName: table,
        IndexName: index,
        KeyConditionExpression: 'memorialId = :id',
        ExpressionAttributeValues: { ':id': memorialId },
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );
    items.push(...((result.Items as Record<string, unknown>[]) ?? []));
    exclusiveStartKey = result.LastEvaluatedKey;
  } while (exclusiveStartKey);
  return items;
}

export async function loadMemorialContext(memorialId?: string) {
  if (!memorialId || !tableName('Memorial')) return null;

  const memorial = await doc.send(
    new GetCommand({
      TableName: tableName('Memorial'),
      Key: { id: memorialId },
    }),
  );
  if (!memorial.Item) return null;

  const [
    biographySections,
    timelineEvents,
    familyMembers,
    funeralEvents,
    programItems,
    tributes,
    stories,
    mediaItems,
    donationCauses,
    familyContacts,
    aiSettings,
    aiKnowledgeEntries,
  ] = await Promise.all([
    queryByMemorial('BiographySection', memorialId),
    queryByMemorial('TimelineEvent', memorialId),
    queryByMemorial('FamilyMember', memorialId),
    queryByMemorial('FuneralEvent', memorialId),
    queryByMemorial('ProgramItem', memorialId),
    queryByMemorial('Tribute', memorialId),
    queryByMemorial('Story', memorialId),
    queryByMemorial('MediaItem', memorialId),
    queryByMemorial('DonationCause', memorialId),
    queryByMemorial('FamilyContact', memorialId),
    queryByMemorial('AiSettings', memorialId),
    queryByMemorial('AiKnowledgeEntry', memorialId),
  ]);

  return {
    memorial: memorial.Item,
    biographySections,
    timelineEvents,
    familyMembers,
    funeralEvents,
    programItems,
    tributes: tributes.filter((item) => item.status === 'approved'),
    stories: stories.filter((item) => item.status === 'approved'),
    mediaItems,
    donationCauses,
    familyContacts,
    aiSettings: aiSettings[0],
    aiKnowledgeEntries,
  } as Record<string, unknown>;
}
