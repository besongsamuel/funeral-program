import type { Handler } from 'aws-lambda';
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const CODE_PATTERN = /^[A-Z0-9]{4}$/;
const TOKEN_PREFIX = 'modv1';

const INDEX: Record<string, string> = {
  Tribute: 'tributesByMemorialIdAndStatus',
  Story: 'storiesByMemorialIdAndStatus',
  GalleryPhoto: 'galleryPhotosByMemorialIdAndSortOrder',
  GalleryAlbum: 'galleryAlbumsByMemorialIdAndSortOrder',
};

type ModerateType = 'tribute' | 'story' | 'photo';
type ModerateAction = 'approve' | 'reject' | 'delete';

const failedUnlocks = new Map<string, { count: number; until: number }>();

const headers = {
  'Content-Type': 'application/json',
};

function tableName(model: string) {
  return process.env[`TABLE_${model}`];
}

function memorialId() {
  return process.env.MEMORIAL_ID ?? 'mami-christiana-enanga-besong';
}

function sessionSecret() {
  return process.env.MODERATION_SESSION_SECRET ?? '';
}

function moderationCode() {
  return (process.env.MODERATION_CODE ?? '').trim().toUpperCase();
}

function sessionTtlMs() {
  const hours = Number(process.env.SESSION_TTL_HOURS ?? '12');
  return (Number.isFinite(hours) ? hours : 12) * 60 * 60 * 1000;
}

function json(statusCode: number, body: unknown) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

function clientKey(event: { requestContext?: { http?: { sourceIp?: string } }; headers?: Record<string, string | undefined> }) {
  return event.requestContext?.http?.sourceIp
    ?? event.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
    ?? 'unknown';
}

function isThrottled(key: string) {
  const entry = failedUnlocks.get(key);
  if (!entry) return false;
  if (Date.now() > entry.until) {
    failedUnlocks.delete(key);
    return false;
  }
  return entry.count >= 8;
}

function recordFailedUnlock(key: string) {
  const now = Date.now();
  const entry = failedUnlocks.get(key);
  if (!entry || now > entry.until) {
    failedUnlocks.set(key, { count: 1, until: now + 15 * 60 * 1000 });
    return;
  }
  entry.count += 1;
  if (entry.count >= 8) {
    entry.until = now + 15 * 60 * 1000;
  }
}

function normalizeCode(value: unknown) {
  return String(value ?? '').trim().toUpperCase();
}

function safeEqualStrings(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function signToken(expiresAt: number) {
  const secret = sessionSecret();
  if (!secret) throw new Error('Session secret is not configured');
  const nonce = randomBytes(8).toString('hex');
  const payload = `${TOKEN_PREFIX}.${expiresAt}.${nonce}`;
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token: unknown): boolean {
  if (typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 4) return false;
  const [prefix, expiresRaw, nonce, sig] = parts;
  if (prefix !== TOKEN_PREFIX || !expiresRaw || !nonce || !sig) return false;
  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  const secret = sessionSecret();
  if (!secret) return false;
  const payload = `${prefix}.${expiresRaw}.${nonce}`;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  return safeEqualStrings(sig, expected);
}

async function queryByMemorial(model: string) {
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
        ExpressionAttributeValues: { ':id': memorialId() },
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );
    items.push(...((result.Items as Record<string, unknown>[]) ?? []));
    exclusiveStartKey = result.LastEvaluatedKey;
  } while (exclusiveStartKey);
  return items;
}

async function listModerationItems() {
  const [tributes, stories, photos, albums] = await Promise.all([
    queryByMemorial('Tribute'),
    queryByMemorial('Story'),
    queryByMemorial('GalleryPhoto'),
    queryByMemorial('GalleryAlbum'),
  ]);

  const albumNameById = new Map(
    albums.map((album) => [String(album.id), String(album.name ?? 'Album')]),
  );
  const albumCategoryById = new Map(
    albums.map((album) => [String(album.id), String(album.category ?? '')]),
  );

  return {
    tributes,
    stories,
    photos: photos.map((photo) => ({
      ...photo,
      albumName: albumNameById.get(String(photo.albumId)) ?? 'Unknown album',
      albumCategory: albumCategoryById.get(String(photo.albumId)) ?? '',
    })),
  };
}

function modelForType(type: ModerateType) {
  if (type === 'tribute') return 'Tribute';
  if (type === 'story') return 'Story';
  return 'GalleryPhoto';
}

async function moderateItem(type: ModerateType, id: string, action: ModerateAction) {
  const model = modelForType(type);
  const table = tableName(model);
  if (!table) throw new Error(`Table for ${model} is not configured`);

  if (action === 'delete') {
    await doc.send(new DeleteCommand({ TableName: table, Key: { id } }));
    return;
  }

  const status = action === 'approve' ? 'approved' : 'rejected';
  await doc.send(
    new UpdateCommand({
      TableName: table,
      Key: { id },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString(),
      },
    }),
  );
}

export const handler: Handler = async (event) => {
  if (event.requestContext?.http?.method === 'OPTIONS') {
    // Function URL CORS handles preflight; keep a no-op for safety.
    return { statusCode: 204, headers, body: '' };
  }

  if (event.requestContext?.http?.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(event.body || '{}') as Record<string, unknown>;
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const action = String(body.action ?? '');

  try {
    if (action === 'unlock') {
      const key = clientKey(event);
      if (isThrottled(key)) {
        return json(429, { error: 'Too many attempts. Try again later.' });
      }

      const expected = moderationCode();
      const provided = normalizeCode(body.code);
      if (!CODE_PATTERN.test(provided) || !CODE_PATTERN.test(expected) || !safeEqualStrings(provided, expected)) {
        recordFailedUnlock(key);
        return json(401, { error: 'Invalid code' });
      }

      const expiresAt = Date.now() + sessionTtlMs();
      return json(200, { token: signToken(expiresAt), expiresAt });
    }

    if (!verifyToken(body.token)) {
      return json(401, { error: 'Session expired. Enter the code again.' });
    }

    if (action === 'list') {
      const data = await listModerationItems();
      return json(200, data);
    }

    if (action === 'moderate') {
      const type = body.type as ModerateType;
      const moderateAction = body.moderateAction as ModerateAction;
      const id = String(body.id ?? '');
      if (!id || !['tribute', 'story', 'photo'].includes(type)) {
        return json(400, { error: 'Invalid moderation target' });
      }
      if (!['approve', 'reject', 'delete'].includes(moderateAction)) {
        return json(400, { error: 'Invalid moderation action' });
      }
      await moderateItem(type, id, moderateAction);
      return json(200, { ok: true });
    }

    return json(400, { error: 'Unknown action' });
  } catch (error) {
    console.error('moderation-gate error', error);
    return json(500, { error: 'Moderation request failed' });
  }
};

