import { useState } from 'react';
import { Link } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import Video from 'yet-another-react-lightbox/plugins/video';
import 'yet-another-react-lightbox/styles.css';
import { motion } from 'framer-motion';
import { HonoreePicker } from '@/components/ui/HonoreePicker';
import { MediaPreview } from '@/components/ui/MediaPreview';
import { TributePreface } from '@/components/ui/TributePreface';
import { useSelectedHonoree } from '@/hooks/useSelectedHonoree';
import { honoreeName, matchesHonoree } from '@/lib/honorees';
import { isVideoUrl, videoMimeType } from '@/lib/media';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function GalleryPage() {
  const { data, honorees, selected, selectPerson } = useSelectedHonoree();
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const reduced = useReducedMotion();

  if (!data) return null;

  const { galleryAlbums, galleryPhotos } = data;
  const personPhotos = selected
    ? galleryPhotos.filter((photo) => matchesHonoree(photo.honoreeId, selected, honorees))
    : galleryPhotos;
  const albumsWithPhotos = galleryAlbums.filter((album) =>
    personPhotos.some((photo) => photo.albumId === album.id),
  );
  const albumIsVisible = albumsWithPhotos.some((album) => album.id === activeAlbum);
  const filtered = activeAlbum && albumIsVisible
    ? personPhotos.filter((photo) => photo.albumId === activeAlbum)
    : personPhotos;

  const slides = filtered.map((p) =>
    isVideoUrl(p.url)
      ? {
          type: 'video' as const,
          title: p.caption,
          autoPlay: true,
          controls: true,
          playsInline: true,
          sources: [{ src: p.url, type: videoMimeType(p.url) }],
        }
      : { src: p.url, title: p.caption },
  );

  return (
    <div>
      <section className="page-banner">
        <div className="container-memorial px-4 text-center">
          <h1 className="font-serif text-4xl font-bold">Gallery</h1>
          <p className="mt-3 text-memorial-200">Moments captured through the years</p>
          <div className="mt-8">
            <HonoreePicker
              honorees={honorees}
              selectedSlug={selected?.slug ?? null}
              onSelect={selectPerson}
              allowAll
              allLabel="All photos"
            />
          </div>
          <Link to="/share-photos" className="btn-secondary-dark mt-6 inline-flex min-h-11 touch-manipulation">
            Share a photo or video
          </Link>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-memorial">
          {selected && (
            <TributePreface
              text={selected.tributePreface}
              crossHref={`/tributes?person=${selected.slug}`}
              crossLabel="Read tributes"
            />
          )}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveAlbum(null)}
              className={`min-h-10 rounded-full px-4 py-2 text-sm font-medium transition-colors touch-manipulation ${
                !activeAlbum ? 'bg-gold-400 text-memorial-950' : 'bg-gold-50 text-memorial-800 hover:bg-gold-100'
              }`}
            >
              All
            </button>
            {albumsWithPhotos.map((album) => (
              <button
                key={album.id}
                onClick={() => setActiveAlbum(album.id)}
                className={`min-h-10 rounded-full px-4 py-2 text-sm font-medium transition-colors touch-manipulation ${
                  activeAlbum === album.id ? 'bg-gold-400 text-memorial-950' : 'bg-gold-50 text-memorial-800 hover:bg-gold-100'
                }`}
              >
                {album.name}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-gray-600">
              No photos or videos yet.{' '}
              <Link to="/share-photos" className="text-memorial-800 underline decoration-gold-400 underline-offset-2">
                Be the first to share one
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((photo, i) => (
                <motion.button
                  key={photo.id}
                  initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setLightboxIndex(i)}
                  aria-label={isVideoUrl(photo.url) ? `Play ${photo.caption || 'video'}` : photo.caption || 'View photo'}
                  className="group relative aspect-square overflow-hidden rounded-xl touch-manipulation"
                >
                  <MediaPreview
                    url={photo.url}
                    alt={photo.caption ?? ''}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {honoreeName(honorees, photo.honoreeId) && (
                    <span className="absolute inset-x-0 bottom-0 bg-memorial-950/70 px-2 py-1 text-left text-xs text-white">
                      {honoreeName(honorees, photo.honoreeId)}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      <Lightbox
        plugins={[Video]}
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
        video={{ autoPlay: true, controls: true, playsInline: true }}
      />
    </div>
  );
}
