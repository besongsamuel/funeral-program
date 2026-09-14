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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getClient(): any {
  if (!isAmplifyConfigured()) return null;
  return generateClient();
}

export async function getMemorialContext(slug = MEMORIAL_SLUG): Promise<MemorialContext> {
  const client = getClient();
  if (!client) {
    return {
      ...demoContext,
      tributes: localTributes.filter((t) => t.status === 'approved'),
      stories: localStories.filter((s) => s.status === 'approved'),
    };
  }

  const { data: memorials } = await client.models.Memorial.list({
    filter: { slug: { eq: slug } },
  });
  const memorial = memorials?.[0];
  if (!memorial) return demoContext;

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
    client.models.BiographySection.list({ filter: { memorialId: { eq: memorialId } } }),
    client.models.TimelineEvent.list({ filter: { memorialId: { eq: memorialId } } }),
    client.models.FamilyMember.list({ filter: { memorialId: { eq: memorialId } } }),
    client.models.FuneralEvent.list({ filter: { memorialId: { eq: memorialId } } }),
    client.models.ProgramItem.list({ filter: { memorialId: { eq: memorialId } } }),
    client.models.GalleryAlbum.list({ filter: { memorialId: { eq: memorialId } } }),
    client.models.GalleryPhoto.list({ filter: { memorialId: { eq: memorialId } } }),
    client.models.Tribute.list({ filter: { memorialId: { eq: memorialId }, status: { eq: 'approved' } } }),
    client.models.Story.list({ filter: { memorialId: { eq: memorialId }, status: { eq: 'approved' } } }),
    client.models.MediaItem.list({ filter: { memorialId: { eq: memorialId } } }),
    client.models.DonationCause.list({ filter: { memorialId: { eq: memorialId } } }),
    client.models.FamilyContact.list({ filter: { memorialId: { eq: memorialId } } }),
    client.models.AiSettings.list({ filter: { memorialId: { eq: memorialId } } }),
    client.models.AiQuickQuestion.list({ filter: { memorialId: { eq: memorialId } } }),
    client.models.AiKnowledgeEntry.list({ filter: { memorialId: { eq: memorialId } } }),
  ]);

  const sortByOrder = <T extends { sortOrder?: number | null }>(arr: T[]) =>
    [...arr].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return {
    memorial: memorial as Memorial,
    biographySections: sortByOrder(biographySections.data ?? []) as MemorialContext['biographySections'],
    timelineEvents: sortByOrder(timelineEvents.data ?? []) as MemorialContext['timelineEvents'],
    familyMembers: sortByOrder(familyMembers.data ?? []) as MemorialContext['familyMembers'],
    funeralEvents: (funeralEvents.data ?? []) as MemorialContext['funeralEvents'],
    programItems: sortByOrder(programItems.data ?? []) as MemorialContext['programItems'],
    galleryAlbums: sortByOrder(galleryAlbums.data ?? []) as MemorialContext['galleryAlbums'],
    galleryPhotos: sortByOrder(galleryPhotos.data ?? []) as MemorialContext['galleryPhotos'],
    tributes: (tributes.data ?? []) as Tribute[],
    stories: (stories.data ?? []) as Story[],
    mediaItems: sortByOrder(mediaItems.data ?? []) as MemorialContext['mediaItems'],
    donationCauses: sortByOrder(donationCauses.data ?? []) as MemorialContext['donationCauses'],
    familyContacts: (familyContacts.data ?? []) as MemorialContext['familyContacts'],
    aiSettings: (aiSettingsList.data?.[0] ?? demoContext.aiSettings) as MemorialContext['aiSettings'],
    aiQuickQuestions: sortByOrder(aiQuickQuestions.data ?? []) as MemorialContext['aiQuickQuestions'],
    aiKnowledgeEntries: (aiKnowledgeEntries.data ?? []) as MemorialContext['aiKnowledgeEntries'],
  };
}

export async function submitTribute(input: {
  authorName: string;
  relationship?: string;
  message: string;
  photoUrl?: string;
  isGuestbookSignature?: boolean;
}): Promise<Tribute> {
  const client = getClient();
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
  const client = getClient();
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
  const client = getClient();
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
  const [allTributes, allStories] = await Promise.all([
    client.models.Tribute.list({ filter: { memorialId: { eq: memorialId } } }),
    client.models.Story.list({ filter: { memorialId: { eq: memorialId } } }),
  ]);

  const tributes = (allTributes.data ?? []) as Tribute[];
  const stories = (allStories.data ?? []) as Story[];

  return {
    ...ctx,
    tributes,
    stories,
    pendingTributes: tributes.filter((t) => t.status === 'pending'),
    pendingStories: stories.filter((s) => s.status === 'pending'),
  };
}

export async function updateTributeStatus(id: string, status: ContentStatus) {
  const client = getClient();
  if (!client) {
    localTributes = localTributes.map((t) => (t.id === id ? { ...t, status } : t));
    return;
  }
  await client.models.Tribute.update({ id, status });
}

export async function updateStoryStatus(id: string, status: ContentStatus) {
  const client = getClient();
  if (!client) {
    localStories = localStories.map((s) => (s.id === id ? { ...s, status } : s));
    return;
  }
  await client.models.Story.update({ id, status });
}

export async function updateMemorial(id: string, updates: Partial<Memorial>) {
  const client = getClient();
  if (!client) {
    Object.assign(demoContext.memorial, updates);
    return;
  }
  await client.models.Memorial.update({ id, ...updates });
}

export { MEMORIAL_ID, MEMORIAL_SLUG, demoContext };
