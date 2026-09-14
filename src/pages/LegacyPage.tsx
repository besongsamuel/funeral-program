import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemorial } from '@/hooks/useMemorial';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { formatDate } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function LegacyPage() {
  const { data } = useMemorial();
  const reduced = useReducedMotion();

  if (!data) return null;

  const { biographySections, timelineEvents } = data;

  return (
    <div>
      <section className="bg-memorial-900 py-16 text-white">
        <div className="container-memorial px-4 text-center">
          <h1 className="font-serif text-4xl font-bold">Life & Legacy</h1>
          <p className="mt-3 text-memorial-200">The story of {data.memorial.fullName}</p>
          <Link to="/legacy/obituary" className="btn-secondary mt-6 border-memorial-300 text-memorial-100">
            View Obituary
          </Link>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-memorial">
          <SectionHeading title="Biography" />
          <div className="space-y-8">
            {biographySections.map((section, i) => (
              <motion.div
                key={section.id}
                initial={reduced ? false : { opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5 }}
                className="card flex flex-col gap-6 md:flex-row md:items-start"
              >
                {section.imageUrl && (
                  <img src={section.imageUrl} alt="" className="h-48 w-full rounded-xl object-cover md:h-40 md:w-48" />
                )}
                <div>
                  <h3 className="font-serif text-xl font-semibold text-memorial-900">{section.heading}</h3>
                  <p className="mt-3 leading-relaxed text-gray-700">{section.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-memorial-50">
        <div className="container-memorial">
          <SectionHeading title="Timeline" subtitle="Milestones through the years" />
          <div className="relative mx-auto max-w-2xl">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-memorial-300 md:left-1/2" />
            {timelineEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={reduced ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative mb-8 flex ${i % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}
              >
                <div className="ml-10 w-full max-w-sm md:ml-0 md:w-[calc(50%-2rem)]">
                  <div className="card">
                    <p className="text-xs font-medium text-memorial-600">{formatDate(event.eventDate)}</p>
                    <h4 className="mt-1 font-serif text-lg font-semibold text-memorial-900">{event.title}</h4>
                    {event.description && <p className="mt-2 text-sm text-gray-600">{event.description}</p>}
                  </div>
                </div>
                <div className="absolute left-2.5 top-4 h-4 w-4 rounded-full border-4 border-memorial-500 bg-white md:left-1/2 md:-translate-x-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
