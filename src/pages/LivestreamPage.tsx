import { useMemorial } from '@/hooks/useMemorial';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function LivestreamPage() {
  const { data } = useMemorial();
  if (!data) return null;

  const livestream = data.mediaItems.find((m) => m.kind === 'livestream');

  return (
    <div>
      <section className="page-banner">
        <div className="container-memorial px-4 text-center">
          <h1 className="font-serif text-4xl font-bold">Service Livestream</h1>
          <p className="mt-3 text-memorial-200">Join us virtually to honor {data.memorial.fullName}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-memorial">
          {livestream ? (
            <div className="mx-auto max-w-4xl">
              <div className="aspect-video overflow-hidden rounded-2xl shadow-lg">
                <iframe
                  src={livestream.url}
                  title={livestream.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="mt-4 text-center text-gray-600">{livestream.title}</p>
            </div>
          ) : (
            <SectionHeading title="Livestream Not Available" subtitle="Please check back closer to the service date." />
          )}
        </div>
      </section>
    </div>
  );
}
