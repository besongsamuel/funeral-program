import { useMemorial } from '@/hooks/useMemorial';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FormattedText } from '@/components/ui/FormattedText';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Music } from 'lucide-react';

export function MemoriesPage() {
  const { data } = useMemorial();
  const reduced = useReducedMotion();

  if (!data) return null;

  const videos = data.mediaItems.filter((m) => m.kind === 'video');
  const music = data.mediaItems.filter((m) => m.kind === 'audio');
  const stories = data.stories;

  return (
    <div>
      <section className="page-banner">
        <div className="container-memorial px-4 text-center">
          <h1 className="font-serif text-4xl font-bold">Memories</h1>
          <p className="mt-3 text-memorial-200">Stories, videos, and music</p>
        </div>
      </section>

      {stories.length > 0 && (
        <section className="section-padding">
          <div className="container-memorial">
            <SectionHeading title="Stories" subtitle="A memory I'll never forget" />
            <div className="grid gap-6 md:grid-cols-2">
              {stories.map((story, i) => (
                <motion.article
                  key={story.id}
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card"
                >
                  <h3 className="font-serif text-xl font-semibold text-memorial-900">{story.title}</h3>
                  <p className="mt-1 text-sm text-memorial-600">by {story.authorName}</p>
                  <FormattedText text={story.body} className="mt-4 leading-relaxed text-gray-700" />
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section className="section-padding bg-memorial-50">
          <div className="container-memorial">
            <SectionHeading title="Videos" />
            <div className="grid gap-6 md:grid-cols-2">
              {videos.map((video) => (
                <div key={video.id} className="overflow-hidden rounded-2xl shadow-lg">
                  <div className="aspect-video">
                    <iframe src={video.url} title={video.title} className="h-full w-full" allowFullScreen />
                  </div>
                  <p className="bg-white p-4 text-center font-medium text-memorial-900">{video.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {music.length > 0 && (
        <section className="section-padding">
          <div className="container-memorial">
            <SectionHeading title="Music" subtitle="Favorite songs and hymns" />
            <div className="mx-auto max-w-md space-y-3">
              {music.map((track) => (
                <div key={track.id} className="card flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-memorial-100">
                    <Music className="h-5 w-5 text-memorial-700" />
                  </div>
                  <div>
                    <p className="font-medium text-memorial-900">{track.title}</p>
                    {track.category && <p className="text-sm text-gray-500">{track.category}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
