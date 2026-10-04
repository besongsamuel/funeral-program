import { Amplify } from 'aws-amplify';
import { uploadData } from 'aws-amplify/storage';
import { assertGalleryMedia, isVideoFile, rememberMediaKind, videoMimeType } from '@/lib/media';

function getBucketConfig() {
  const config = Amplify.getConfig().Storage?.S3;
  const bucket = config?.bucket;
  const region = config?.region ?? 'us-east-1';
  if (!bucket) {
    throw new Error('Amplify Storage is not configured. Deploy the sandbox and refresh amplify_outputs.json.');
  }
  return { bucket, region };
}

export function publicObjectUrl(path: string) {
  const { bucket, region } = getBucketConfig();
  const key = path.replace(/^\/+/, '');
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function contentTypeFor(file: File) {
  if (file.type) return file.type;
  if (isVideoFile(file)) return videoMimeType(file.name);
  return 'application/octet-stream';
}

function sanitizeFileName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'media';
}

export async function uploadGalleryImage(file: File, memorialId: string, albumId: string) {
  const safeName = sanitizeFileName(file.name);
  const path = `memorial-media/${memorialId}/gallery/${albumId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;

  await uploadData({
    path,
    data: file,
    options: {
      contentType: contentTypeFor(file),
    },
  }).result;

  return {
    path,
    url: publicObjectUrl(path),
  };
}

export async function uploadGalleryImages(files: FileList | File[], memorialId: string, albumId: string) {
  const list = Array.from(files);
  const uploaded: { path: string; url: string; fileName: string; kind: 'image' | 'video' }[] = [];

  for (const file of list) {
    const kind = assertGalleryMedia(file);
    const result = await uploadGalleryImage(file, memorialId, albumId);
    rememberMediaKind(result.url, kind);
    uploaded.push({ ...result, fileName: file.name, kind });
  }

  return uploaded;
}

export async function uploadGuestGalleryImage(file: File, memorialId: string) {
  const kind = assertGalleryMedia(file);

  const safeName = sanitizeFileName(file.name);
  const path = `gallery-uploads/${memorialId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;

  await uploadData({
    path,
    data: file,
    options: {
      contentType: contentTypeFor(file),
    },
  }).result;

  const url = publicObjectUrl(path);
  rememberMediaKind(url, kind);

  return {
    path,
    url,
    fileName: file.name,
    kind,
  };
}

export async function uploadGuestGalleryImages(files: FileList | File[], memorialId: string) {
  const uploaded: { path: string; url: string; fileName: string }[] = [];
  for (const file of Array.from(files)) {
    uploaded.push(await uploadGuestGalleryImage(file, memorialId));
  }
  return uploaded;
}
