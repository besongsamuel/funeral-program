import { generateClient } from 'aws-amplify/data';
import { demoContext, MEMORIAL_ID, MEMORIAL_SLUG } from './demo-data';
import { isAmplifyConfigured } from './amplify';
import type {
  MemorialContext,
  Tribute,
  Story,
  Memorial,
  ContentStatus,
} from './types';

let localTributes: Tribute[] = [...demoContext.tributes];
let localStories: Story[] = [...demoContext.stories];

function demoMemorial() {
  return {
    ...demoContext,
    tributes: localTributes.filter((t) => t.status === 'approved'),
    stories: localStories.filter((s) => s.status === 'approved'),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPublicClient(): any {
  if (!isAmplifyConfigured()) return null;
  return generateClient({ authMode: 'apiKey' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAdminClient(): any {
  if (!isAmplifyConfigured()) return null;
  return generateClient({ authMode: 'userPool' });
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Memorial data request timed out')), ms);
    }),
  ]);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function listAll(model: { list: (args: object) => Promise<any> }, filter: object) {
  const items: unknown[] = [];
  let nextToken: string | undefined;
  do {
    const result = await model.list({ filter, nextToken, limit: 1000, authMode: 'apiKey' });
    items.push(...(result.data ?? []));
    nextToken = result.nextToken;
  } while (nextToken);
  return items;
}

export async function getMemorialContext(slug = MEMORIAL_SLUG): Promise<MemorialContext> {
  const client = getPublicClient();
  if (!client) return demoMemorial();

  try {
    return await withTimeout(loadFromAmplify(client, slug), 8000);
  } catch (error) {
    console.warn('Amplify memorial data unavailable — using local content', error);
    return demoMemorial();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadFromAmplify(client: any, slug: string): Promise<MemorialContext> {
  const { data: memorials } = await client.models.Memorial.list({
    filter: { slug: { eq: slug } },
    authMode: 'apiKey',
  });
  const memorial = memorials?.[0];
  if (!memorial) {
    console.warn(`No published memorial found for slug "${slug}" — using local content`);
    return demoMemorial();
  }

  const memorialId = memorial.id;
  const [
    biographySections,
    timelineEvents,
    familyMembers,
    funeralEvents,
    programItems,
    galleryAlbums,
    galleryPhotos,
    tributes,
    stories,
    mediaItems,
    donationCauses,
    familyContacts,
    aiSettingsList,
    aiQuickQuestions,
    aiKnowledgeEntries,
  ] = await Promise.all([
    listAll(client.models.BiographySection, { memorialId: { eq: memorialId } }),
    listAll(client.models.TimelineEvent, { memorialId: { eq: memorialId } }),
    listAll(client.models.FamilyMember, { memorialId: { eq: memorialId } }),
    listAll(client.models.FuneralEvent, { memorialId: { eq: memorialId } }),
    listAll(client.models.ProgramItem, { memorialId: { eq: memorialId } }),
    listAll(client.models.GalleryAlbum, { memorialId: { eq: memorialId } }),
    listAll(client.models.GalleryPhoto, { memorialId: { eq: memorialId } }),
    listAll(client.models.Tribute, { memorialId: { eq: memorialId }, status: { eq: 'approved' } }),
    listAll(client.models.Story, { memorialId: { eq: memorialId }, status: { eq: 'approved' } }),
    listAll(client.models.MediaItem, { memorialId: { eq: memorialId } }),
    listAll(client.models.DonationCause, { memorialId: { eq: memorialId } }),
    listAll(client.models.FamilyContact, { memorialId: { eq: memorialId } }),
    listAll(client.models.AiSettings, { memorialId: { eq: memorialId } }),
    listAll(client.models.AiQuickQuestion, { memorialId: { eq: memorialId } }),
    listAll(client.models.AiKnowledgeEntry, { memorialId: { eq: memorialId } }),
  ]);

  const sortByOrder = <T extends { sortOrder?: number | null }>(arr: T[]) =>
    [...arr].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const sortByStart = <T extends { startsAt?: string | null }>(arr: T[]) =>
    [...arr].sort((a, b) => (a.startsAt ?? '').localeCompare(b.startsAt ?? ''));

  return {
    memorial: memorial as Memorial,
    biographySections: sortByOrder(biographySections as MemorialContext['biographySections']),
    timelineEvents: sortByOrder(timelineEvents as MemorialContext['timelineEvents']),
    familyMembers: sortByOrder(familyMembers as MemorialContext['familyMembers']),
    funeralEvents: sortByStart(funeralEvents as MemorialContext['funeralEvents']),
    programItems: sortByOrder(programItems as MemorialContext['programItems']),
    galleryAlbums: sortByOrder(galleryAlbums as MemorialContext['galleryAlbums']),
    galleryPhotos: sortByOrder(galleryPhotos as MemorialContext['galleryPhotos']),
    tributes: tributes as Tribute[],
    stories: stories as Story[],
    mediaItems: sortByOrder(mediaItems as MemorialContext['mediaItems']),
    donationCauses: sortByOrder(donationCauses as MemorialContext['donationCauses']),
    familyContacts: familyContacts as MemorialContext['familyContacts'],
    aiSettings: ((aiSettingsList[0] as MemorialContext['aiSettings'] | undefined) ?? demoContext.aiSettings),
    aiQuickQuestions: sortByOrder(aiQuickQuestions as MemorialContext['aiQuickQuestions']),
    aiKnowledgeEntries: aiKnowledgeEntries as MemorialContext['aiKnowledgeEntries'],
  };
}

export async function submitTribute(input: {
  authorName: string;
  relationship?: string;
  message: string;
  photoUrl?: string;
  isGuestbookSignature?: boolean;
}): Promise<Tribute> {
  const client = getPublicClient();
  const tribute: Tribute = {
    id: `tr-${Date.now()}`,
    memorialId: MEMORIAL_ID,
    ...input,
    isGuestbookSignature: input.isGuestbookSignature ?? false,
    status: 'pending',
  };

  if (!client) {
    localTributes = [tribute, ...localTributes];
    return tribute;
  }

  const { data } = await client.models.Tribute.create({
    memorialId: MEMORIAL_ID,
    authorName: input.authorName,
    relationship: input.relationship,
    message: input.message,
    photoUrl: input.photoUrl,
    isGuestbookSignature: input.isGuestbookSignature ?? false,
    status: 'pending',
  });
  return data as Tribute;
}

export async function submitStory(input: {
  authorName: string;
  title: string;
  body: string;
  mediaUrl?: string;
}): Promise<Story> {
  const client = getPublicClient();
  const story: Story = {
    id: `st-${Date.now()}`,
    memorialId: MEMORIAL_ID,
    ...input,
    status: 'pending',
  };

  if (!client) {
    localStories = [story, ...localStories];
    return story;
  }

  const { data } = await client.models.Story.create({
    memorialId: MEMORIAL_ID,
    ...input,
    status: 'pending',
  });
  return data as Story;
}

export async function getAdminContext(): Promise<MemorialContext & { pendingTributes: Tribute[]; pendingStories: Story[] }> {
  const client = getAdminClient() ?? getPublicClient();
  if (!client) {
    return {
      ...demoContext,
      tributes: localTributes,
      stories: localStories,
      pendingTributes: localTributes.filter((t) => t.status === 'pending'),
      pendingStories: localStories.filter((s) => s.status === 'pending'),
    };
  }

  const ctx = await getMemorialContext();
  const memorialId = ctx.memorial.id;

  try {
    const [allTributes, allStories] = await withTimeout(
      Promise.all([
        client.models.Tribute.list({ filter: { memorialId: { eq: memorialId } }, authMode: 'userPool' }),
        client.models.Story.list({ filter: { memorialId: { eq: memorialId } }, authMode: 'userPool' }),
      ]),
      8000,
    );

    const tributes = (allTributes.data ?? []) as Tribute[];
    const stories = (allStories.data ?? []) as Story[];

    return {
      ...ctx,
      tributes,
      stories,
      pendingTributes: tributes.filter((t) => t.status === 'pending'),
      pendingStories: stories.filter((s) => s.status === 'pending'),
    };
  } catch (error) {
    console.warn('Admin data request failed — showing public memorial content', error);
    return {
      ...ctx,
      pendingTributes: [],
      pendingStories: [],
    };
  }
}

export async function updateTributeStatus(id: string, status: ContentStatus) {
  const client = getAdminClient();
  if (!client) {
    localTributes = localTributes.map((t) => (t.id === id ? { ...t, status } : t));
    return;
  }
  await client.models.Tribute.update({ id, status }, { authMode: 'userPool' });
}

export async function updateStoryStatus(id: string, status: ContentStatus) {
  const client = getAdminClient();
  if (!client) {
    localStories = localStories.map((s) => (s.id === id ? { ...s, status } : s));
    return;
  }
  await client.models.Story.update({ id, status }, { authMode: 'userPool' });
}

export async function updateMemorial(id: string, updates: Partial<Memorial>) {
  const client = getAdminClient();
  if (!client) {
    Object.assign(demoContext.memorial, updates);
    return;
  }
  await client.models.Memorial.update({ id, ...updates }, { authMode: 'userPool' });
}

export { MEMORIAL_ID, MEMORIAL_SLUG, demoContext };
