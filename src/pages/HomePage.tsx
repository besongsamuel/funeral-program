import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Heart, Flame } from 'lucide-react';
import { useMemorial } from '@/hooks/useMemorial';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Countdown } from '@/components/ui/Countdown';
import { formatDate } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePageMeta } from '@/hooks/usePageMeta';
import { HeroBackdrop } from '@/components/ui/HeroBackdrop';

export function HomePage() {
  const { data } = useMemorial();
  const reduced = useReducedMotion();

  usePageMeta(
    data ? `Remembering ${data.memorial.fullName}` : 'Remembering',
    data?.memorial.tagline,
  );

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-memorial-200 border-t-memorial-700" />
      </div>
    );
  }

  const { memorial, funeralEvents, tributes, galleryPhotos, donationCauses } = data;
  const service = funeralEvents.find((e) => e.kind === 'service');
  const featuredTribute = tributes[0];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-memorial-950 via-memorial-900 to-memorial-950">
        <HeroBackdrop reduced={reduced} />

        <div className="relative z-10 container-memorial px-4 py-20 text-center text-white">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-memorial-200">
              Celebrating a Life of Love &amp; Legacy
            </p>

            {memorial.portraitUrl && (
              <motion.img
                src={memorial.portraitUrl}
                alt={memorial.fullName}
                className="mx-auto mb-8 h-40 w-40 rounded-full border-4 border-amber-100/50 object-cover object-top shadow-[0_0_40px_rgba(253,230,138,0.35)] sm:h-48 sm:w-48"
                initial={reduced ? false : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              />
            )}

            <h1 className="font-serif text-4xl font-bold sm:text-5xl lg:text-6xl">
              {memorial.fullName}
            </h1>
            {memorial.maidenName && (
              <p className="mt-2 text-lg italic text-memorial-200">née {memorial.maidenName}</p>
            )}
            <p className="mt-4 text-lg text-memorial-200 sm:text-xl">
              Sunrise {formatDate(memorial.bornOn)} &nbsp;|&nbsp; Sunset {formatDate(memorial.diedOn)}
            </p>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-memorial-300">
              90 Years of Grace, Love &amp; Legacy
            </p>
            {memorial.tagline && (
              <p className="mx-auto mt-6 max-w-2xl text-lg italic text-memorial-100">
                &ldquo;{memorial.tagline}&rdquo;
              </p>
            )}

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/legacy" className="btn-primary bg-white text-memorial-800 hover:bg-memorial-50">
                <BookOpen className="h-4 w-4" /> View Their Story
              </Link>
              <Link to="/funeral" className="btn-secondary border-white text-white hover:bg-white/10">
                <Calendar className="h-4 w-4" /> Funeral Program
              </Link>
              <Link to="/tributes" className="btn-secondary border-white text-white hover:bg-white/10">
                <Heart className="h-4 w-4" /> Share a Memory
              </Link>
            </div>
          </motion.div>

          {!reduced && (
            <motion.div
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Flame className="h-6 w-6 text-memorial-300" />
            </motion.div>
          )}
        </div>
      </section>

      {/* Bio preview */}
      <section className="section-padding bg-memorial-50">
        <div className="container-memorial">
          <SectionHeading title="A Life Well Lived" />
          <motion.p
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-gray-700"
          >
            {memorial.shortTribute}
          </motion.p>
        </div>
      </section>

      {/* Service countdown */}
      {service && (
        <section className="section-padding">
          <div className="container-memorial">
            <div className="card mx-auto max-w-xl text-center">
              <h3 className="font-serif text-2xl font-semibold text-memorial-900">Funeral Service</h3>
              <p className="mt-2 text-gray-600">{service.title ?? 'Celebration of Life'}</p>
              <p className="mt-1 text-gray-600">{service.venueName}</p>
              <div className="mt-6 flex justify-center">
                <Countdown targetDate={service.startsAt} />
              </div>
              <Link to="/funeral" className="btn-primary mt-6">View Details</Link>
            </div>
          </div>
        </section>
      )}

      {/* Photo highlights */}
      <section className="section-padding bg-memorial-50">
        <div className="container-memorial">
          <SectionHeading title="Photo Highlights" />
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3">
            {galleryPhotos.slice(0, 6).map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="aspect-square overflow-hidden rounded-xl"
              >
                <img src={photo.url} alt={photo.caption ?? ''} className="h-full w-full object-cover transition-transform hover:scale-110" />
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/gallery" className="btn-secondary">View Full Gallery</Link>
          </div>
        </div>
      </section>

      {/* Featured tribute */}
      {featuredTribute && (
        <section className="section-padding">
          <div className="container-memorial">
            <SectionHeading title="Words from the Family" />
            <motion.blockquote
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card mx-auto max-w-2xl text-center"
            >
              <p className="text-lg italic text-gray-700">&ldquo;{featuredTribute.message}&rdquo;</p>
              <footer className="mt-4 text-sm font-medium text-memorial-700">
                — {featuredTribute.authorName}{featuredTribute.relationship ? `, ${featuredTribute.relationship}` : ''}
              </footer>
            </motion.blockquote>
          </div>
        </section>
      )}

      {/* Condolences feed */}
      {tributes.length > 0 && (
      <section className="section-padding bg-memorial-50">
        <div className="container-memorial">
          <SectionHeading title="Condolences" subtitle="Messages from family and friends" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tributes.slice(0, 3).map((t, i) => (
              <motion.div
                key={t.id}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card"
              >
                <p className="text-sm text-gray-700">{t.message}</p>
                <p className="mt-3 text-xs font-medium text-memorial-600">— {t.authorName}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/tributes" className="btn-primary">Leave a Message</Link>
          </div>
        </div>
      </section>
      )}

      {/* Donations */}
      {donationCauses.length > 0 && (
        <section className="section-padding">
          <div className="container-memorial text-center">
            <SectionHeading title="In Their Memory" />
            <p className="mx-auto mb-6 max-w-xl text-gray-600">
              {donationCauses[0].inLieuOfFlowersNote}
            </p>
            <Link to="/donations" className="btn-primary">Make a Donation</Link>
          </div>
        </section>
      )}
    </div>
  );
}
