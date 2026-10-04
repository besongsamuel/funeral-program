import { Play } from 'lucide-react';
import { isVideoUrl } from '@/lib/media';

export function MediaPreview({
  url,
  alt,
  className,
  controls = false,
}: {
  url: string;
  alt: string;
  className?: string;
  controls?: boolean;
}) {
  if (isVideoUrl(url)) {
    return (
      <span className="relative block h-full w-full">
        <video
          src={url}
          muted={!controls}
          playsInline
          preload="metadata"
          controls={controls}
          className={className ?? 'h-full w-full object-cover'}
        />
        {!controls && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-memorial-950/25">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-memorial-950/80 text-white shadow-lg">
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          </span>
        )}
      </span>
    );
  }

  return <img src={url} alt={alt} className={className ?? 'h-full w-full object-cover'} />;
}
