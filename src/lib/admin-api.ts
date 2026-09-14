import { generateClient } from 'aws-amplify/data';
import { demoContext } from './demo-data';
import { isAmplifyConfigured } from './amplify';
import type { MemorialContext } from './types';

export type AdminModel =
  | 'Memorial'
  | 'BiographySection'
  | 'TimelineEvent'
  | 'FamilyMember'
  | 'FuneralEvent'
  | 'ProgramItem'
  | 'GalleryAlbum'
  | 'GalleryPhoto'
  | 'MediaItem'
  | 'DonationCause'
  | 'FamilyContact'
  | 'AiSettings'
  | 'AiQuickQuestion'
  | 'AiKnowledgeEntry';

const LIST_KEYS: Partial<Record<AdminModel, keyof MemorialContext>> = {
  BiographySection: 'biographySections',
  TimelineEvent: 'timelineEvents',
  FamilyMember: 'familyMembers',
  FuneralEvent: 'funeralEvents',
  ProgramItem: 'programItems',
  GalleryAlbum: 'galleryAlbums',
  GalleryPhoto: 'galleryPhotos',
  MediaItem: 'mediaItems',
  DonationCause: 'donationCauses',
  FamilyContact: 'familyContacts',
  AiQuickQuestion: 'aiQuickQuestions',
  AiKnowledgeEntry: 'aiKnowledgeEntries',
};

const USER_POOL = { authMode: 'userPool' as const };
const META_KEYS = new Set(['createdAt', 'updatedAt', '__typename']);

export function isDraftId(id?: string) {
  return !id || id.startsWith('draft-');
}

export function newDraftId() {
  return `draft-${crypto.randomUUID()}`;
}

function getAdminClient() {
  if (!isAmplifyConfigured()) return null;
  return generateClient({ authMode: 'userPool' }) as {
    models: Record<
      string,
      {
        create: (
          input: object,
          options?: typeof USER_POOL,
        ) => Promise<{ data?: unknown; errors?: { message?: string }[] }>;
        update: (
          input: object,
          options?: typeof USER_POOL,
        ) => Promise<{ data?: unknown; errors?: { message?: string }[] }>;
        delete: (input: object, options?: typeof USER_POOL) => Promise<{ errors?: { message?: string }[] }>;
      }
    >;
  };
}

function cleanPayload(input: Record<string, unknown>, forCreate: boolean) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (META_KEYS.has(key)) continue;
    if (forCreate && key === 'id' && isDraftId(String(value ?? ''))) continue;
    if (value === undefined) continue;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') {
        if (key === 'id' || key === 'memorialId' || key === 'albumId') continue;
        out[key] = null;
        continue;
      }
      if (key === 'sortOrder') {
        out[key] = Number(trimmed);
        continue;
      }
      out[key] = trimmed;
      continue;
    }
    out[key] = value;
  }
  return out;
}

function throwIfErrors(errors: { message?: string }[] | undefined, action: string) {
  if (!errors?.length) return;
  throw new Error(errors[0]?.message ?? `Could not ${action} record`);
}

function mutateLocal(model: AdminModel, action: 'create' | 'update' | 'delete', record: Record<string, unknown>) {
  if (model === 'Memorial') {
    Object.assign(demoContext.memorial, record);
    return;
  }
  if (model === 'AiSettings') {
    Object.assign(demoContext.aiSettings, record);
    return;
  }
  const key = LIST_KEYS[model];
  if (!key) return;
  const list = demoContext[key] as unknown as Array<Record<string, unknown> & { id: string }>;
  if (action === 'delete') {
    const index = list.findIndex((item) => item.id === record.id);
    if (index >= 0) list.splice(index, 1);
    return;
  }
  if (action === 'update') {
    const index = list.findIndex((item) => item.id === record.id);
    if (index >= 0) list[index] = { ...list[index], ...record };
    return;
  }
  list.push({ ...record, id: String(record.id ?? newDraftId()) });
}

export async function adminSave(model: AdminModel, input: object) {
  const creating = isDraftId(String((input as { id?: string }).id ?? ''));
  const payload = cleanPayload(input as Record<string, unknown>, creating);
  const client = getAdminClient();

  if (!client) {
    if (creating) payload.id = newDraftId();
    mutateLocal(model, creating ? 'create' : 'update', payload);
    return payload;
  }

  if (creating) {
    const { data, errors } = await client.models[model].create(payload, USER_POOL);
    throwIfErrors(errors, 'create');
    return data as Record<string, unknown>;
  }

  const { data, errors } = await client.models[model].update(payload, USER_POOL);
  throwIfErrors(errors, 'update');
  return data as Record<string, unknown>;
}

export async function adminRemove(model: AdminModel, id: string) {
  if (isDraftId(id)) return;
  const client = getAdminClient();
  if (!client) {
    mutateLocal(model, 'delete', { id });
    return;
  }
  const { errors } = await client.models[model].delete({ id }, USER_POOL);
  throwIfErrors(errors, 'delete');
}
