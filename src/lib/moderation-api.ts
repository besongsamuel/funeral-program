import { getModerationUrl } from '@/lib/amplify';

const TOKEN_KEY = 'moderation-session-token';
const EXPIRES_KEY = 'moderation-session-expires';

export type ModerationType = 'tribute' | 'story' | 'photo';
export type ModerationAction = 'approve' | 'reject' | 'delete';

export interface ModerationTribute {
  id: string;
  authorName?: string;
  relationship?: string;
  message?: string;
  isGuestbookSignature?: boolean;
  status?: string;
}

export interface ModerationStory {
  id: string;
  authorName?: string;
  title?: string;
  body?: string;
  status?: string;
}

export interface ModerationPhoto {
  id: string;
  authorName?: string;
  url?: string;
  caption?: string;
  status?: string;
  albumName?: string;
  albumCategory?: string;
}

export interface ModerationList {
  tributes: ModerationTribute[];
  stories: ModerationStory[];
  photos: ModerationPhoto[];
}

async function post<T>(payload: Record<string, unknown>): Promise<T> {
  const url = getModerationUrl();
  if (!url) {
    throw new Error('Moderation service is not configured yet.');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || 'Moderation request failed');
  }
  return data;
}

export function getStoredModerationToken() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiresAt = Number(sessionStorage.getItem(EXPIRES_KEY) ?? '0');
  if (!token || !expiresAt || Date.now() > expiresAt) {
    clearModerationSession();
    return null;
  }
  return token;
}

export function clearModerationSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EXPIRES_KEY);
}

export function isModerationAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /session expired|enter the code again|unauthorized/i.test(message);
}

export async function unlockModeration(code: string) {
  const result = await post<{ token: string; expiresAt: number }>({
    action: 'unlock',
    code,
  });
  sessionStorage.setItem(TOKEN_KEY, result.token);
  sessionStorage.setItem(EXPIRES_KEY, String(result.expiresAt));
  return result;
}

export async function listModerationItems() {
  const token = getStoredModerationToken();
  if (!token) throw new Error('Session expired. Enter the code again.');
  return post<ModerationList>({ action: 'list', token });
}

export async function moderateItem(type: ModerationType, id: string, moderateAction: ModerationAction) {
  const token = getStoredModerationToken();
  if (!token) throw new Error('Session expired. Enter the code again.');
  return post<{ ok: boolean }>({
    action: 'moderate',
    token,
    type,
    id,
    moderateAction,
  });
}
