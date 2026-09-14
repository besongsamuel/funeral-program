import type { Handler } from 'aws-lambda';

interface TributeInput {
  memorialId: string;
  authorName: string;
  relationship?: string;
  message: string;
  photoUrl?: string;
  isGuestbookSignature?: boolean;
  status?: string;
}

interface StoryInput {
  memorialId: string;
  authorName: string;
  title: string;
  body: string;
  mediaUrl?: string;
  status?: string;
}

export const handler: Handler = async (event) => {
  const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  const { type, data } = body as { type: 'tribute' | 'story'; data: TributeInput | StoryInput };

  if (!data?.memorialId || !data?.authorName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' }),
    };
  }

  const sanitized = {
    ...data,
    status: 'pending',
  };

  return {
    statusCode: 200,
    body: JSON.stringify({ type, data: sanitized }),
  };
};
