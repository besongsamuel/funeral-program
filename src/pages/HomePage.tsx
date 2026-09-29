import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, Heart, Flame } from 'lucide-react';
import { useMemorial } from '@/hooks/useMemorial';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FormattedText } from '@/components/ui/FormattedText';
import { Countdown } from '@/components/ui/Countdown';
import { honoreeName } from '@/lib/honorees';
import { formatDate, getFirstName } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePageMeta } from '@/hooks/usePageMeta';
import { HeroBackdrop } from '@/components/ui/HeroBackdrop';

export function HomePage() {
  const { data } = useMemorial();
  const reduced = useReducedMotion();

  usePageMeta(
    data ? `Remembering ${data.honorees.map((honoree) => getFirstName(honoree.fullName)).join(' & ')}` : 'Remembering',
    data?.memorial.tagline,
  );

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-memorial-200 border-t-memorial-700" />
      </div>
    );
  }

  const { memorial, honorees, funeralEvents, tributes, galleryPhotos, donationCauses } = data;
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
            <h1 className="type-intro-on-dark mb-8 text-sm">
              In loving memory
            </h1>

            <div className="mx-auto grid max-w-3xl gap-10 sm:grid-cols-2 sm:grid-rows-[auto_auto_auto_auto_auto_auto] sm:gap-x-10 sm:gap-y-3">
              {honorees.map((honoree) => (
                <div
                  key={honoree.id}
                  className="flex flex-col items-center gap-3 sm:grid sm:grid-rows-subgrid sm:row-span-6 sm:justify-items-center sm:gap-0"
                >
                  {honoree.portraitUrl ? (
                    <img
                      src={honoree.portraitUrl}
                      alt={honoree.fullName}
                      className="portrait-gold-ring h-36 w-36 rounded-full border-4 border-gold-400 object-cover object-top sm:mb-2 sm:h-44 sm:w-44"
                    />
                  ) : (
                    <div className="hidden sm:block" aria-hidden="true" />
                  )}
                  <h2 className="type-name-on-dark text-3xl sm:text-4xl">
                    {honoree.fullName}
                  </h2>
                  {honoree.maidenName ? (
                    <p className="type-maiden-on-dark text-lg">née {honoree.maidenName}</p>
                  ) : (
                    <p className="type-maiden-on-dark hidden text-lg sm:invisible sm:block" aria-hidden="true">
                      &nbsp;
                    </p>
                  )}
                  <p className="type-support text-base text-gold-100 sm:text-lg">
                    Sunrise {formatDate(honoree.bornOn)}
                    <br />
                    Sunset {formatDate(honoree.diedOn)}
                  </p>
                  {honoree.anniversaryLine ? (
                    <p className="type-anniversary-on-dark text-sm uppercase tracking-[0.2em]">
                      {honoree.anniversaryLine}
                    </p>
                  ) : (
                    <p
                      className="type-anniversary-on-dark hidden text-sm uppercase tracking-[0.2em] sm:invisible sm:block"
                      aria-hidden="true"
                    >
                      &nbsp;
                    </p>
                  )}
                  <Link to={`/legacy?person=${honoree.slug}`} className="btn-primary sm:mt-3">
                    <BookOpen className="h-4 w-4" /> {`View ${getFirstName(honoree.fullName)}'s Story`}
                  </Link>
                </div>
              ))}
            </div>

            {memorial.tagline && (
              <p className="type-theme-on-dark mx-auto mt-10 max-w-2xl text-lg italic">
                &ldquo;{memorial.tagline}&rdquo;
              </p>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/funeral" className="btn-secondary-dark">
                <Calendar className="h-4 w-4" /> Funeral Program
              </Link>
              <Link to="/tributes" className="btn-secondary-dark">
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
              <Flame className="h-6 w-6 text-gold-400" />
            </motion.div>
          )}
        </div>
      </section>

      {/* Bio preview */}
      <section className="section-padding bg-memorial-50">
        <div className="container-memorial">
          <SectionHeading title="Lives Well Lived" />
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {honorees.map((honoree) => (
              <motion.div
                key={honoree.id}
                initial={reduced ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="card text-center"
              >
                <h3 className="font-serif text-xl font-semibold text-memorial-900">{honoree.fullName}</h3>
                <p className="type-body mt-3 leading-relaxed">{honoree.shortTribute}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service countdown */}
      {service && (
        <section className="section-padding">
          <div className="container-memorial">
            <div className="card mx-auto max-w-xl text-center">
              <h3 className="type-name font-serif text-2xl font-semibold">Funeral Service</h3>
              <p className="type-support mt-2">{service.title ?? 'Celebration of Life'}</p>
              <p className="type-body mt-1">{service.venueName}</p>
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
              <FormattedText text={featuredTribute.message} className="text-lg italic text-gray-700" />
              <footer className="mt-4 text-sm font-medium text-memorial-700">
                — {featuredTribute.authorName}{featuredTribute.relationship ? `, ${featuredTribute.relationship}` : ''}
                {honoreeName(honorees, featuredTribute.honoreeId) ? ` · for ${honoreeName(honorees, featuredTribute.honoreeId)}` : ''}
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
                <FormattedText text={t.message} className="text-sm text-gray-700" />
                <p className="mt-3 text-xs font-medium text-memorial-600">
                  — {t.authorName}
                  {honoreeName(honorees, t.honoreeId) ? ` · for ${honoreeName(honorees, t.honoreeId)}` : ''}
                </p>
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
