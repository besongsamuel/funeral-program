const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogv', 'ogg', '3gp', 'mpeg', 'mpg']);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp', 'avif']);

/** Phone videos are often large; keep guest and admin uploads within a practical limit. */
export const MAX_GALLERY_VIDEO_BYTES = 200 * 1024 * 1024;

const kindByUrl = new Map<string, 'image' | 'video'>();

function extensionOf(name: string) {
  const base = name.split('?')[0]?.split('#')[0] ?? name;
  const ext = base.split('.').pop()?.toLowerCase() ?? '';
  return ext === base.toLowerCase() ? '' : ext;
}

export function isVideoFile(file: File) {
  if (file.type.startsWith('video/')) return true;
  return VIDEO_EXTENSIONS.has(extensionOf(file.name));
}

export function isImageFile(file: File) {
  if (file.type.startsWith('image/')) return true;
  return IMAGE_EXTENSIONS.has(extensionOf(file.name));
}

export function assertGalleryMedia(file: File) {
  if (isVideoFile(file)) {
    if (file.size > MAX_GALLERY_VIDEO_BYTES) {
      const limitMb = Math.round(MAX_GALLERY_VIDEO_BYTES / (1024 * 1024));
      throw new Error(`"${file.name}" is larger than ${limitMb} MB. Choose a shorter or smaller video.`);
    }
    return 'video' as const;
  }
  if (isImageFile(file)) return 'image' as const;
  throw new Error(`"${file.name}" is not a photo or video.`);
}

export function rememberMediaKind(url: string, kind: 'image' | 'video') {
  kindByUrl.set(url, kind);
}

export function isVideoUrl(url: string) {
  if (kindByUrl.get(url) === 'video') return true;
  try {
    const path = new URL(url, 'https://example.com').pathname;
    return VIDEO_EXTENSIONS.has(extensionOf(path));
  } catch {
    return VIDEO_EXTENSIONS.has(extensionOf(url));
  }
}

export function videoMimeType(url: string) {
  const ext = extensionOf(url);
  switch (ext) {
    case 'webm':
      return 'video/webm';
    case 'ogv':
    case 'ogg':
      return 'video/ogg';
    case 'mov':
      return 'video/quicktime';
    case '3gp':
      return 'video/3gpp';
    case 'mpeg':
    case 'mpg':
      return 'video/mpeg';
    default:
      return 'video/mp4';
  }
}
