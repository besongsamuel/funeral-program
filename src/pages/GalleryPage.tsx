import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { motion } from 'framer-motion';
import { useMemorial } from '@/hooks/useMemorial';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function GalleryPage() {
  const { data, isLoading } = useMemorial();
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const reduced = useReducedMotion();

  if (isLoading && !data) return null;

  const { galleryAlbums, galleryPhotos } = data;
  const filtered = activeAlbum
    ? galleryPhotos.filter((p) => p.albumId === activeAlbum)
    : galleryPhotos;

  const slides = filtered.map((p) => ({ src: p.url, title: p.caption }));

  return (
    <div>
      <section className="bg-memorial-900 py-16 text-white">
        <div className="container-memorial px-4 text-center">
          <h1 className="font-serif text-4xl font-bold">Gallery</h1>
          <p className="mt-3 text-memorial-200">Moments captured through the years</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-memorial">
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveAlbum(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !activeAlbum ? 'bg-memorial-700 text-white' : 'bg-memorial-100 text-memorial-700 hover:bg-memorial-200'
              }`}
            >
              All
            </button>
            {galleryAlbums.map((album) => (
              <button
                key={album.id}
                onClick={() => setActiveAlbum(album.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeAlbum === album.id ? 'bg-memorial-700 text-white' : 'bg-memorial-100 text-memorial-700 hover:bg-memorial-200'
                }`}
              >
                {album.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((photo, i) => (
              <motion.button
                key={photo.id}
                initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setLightboxIndex(i)}
                className="group aspect-square overflow-hidden rounded-xl"
              >
                <img
                  src={photo.url}
                  alt={photo.caption ?? ''}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
      />
    </div>
  );
}
