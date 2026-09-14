import { ExternalLink } from 'lucide-react';
import { useMemorial } from '@/hooks/useMemorial';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function DonationsPage() {
  const { data } = useMemorial();
  const reduced = useReducedMotion();

  if (!data) return null;

  const { donationCauses } = data;

  return (
    <div>
      <section className="page-banner">
        <div className="container-memorial px-4 text-center">
          <h1 className="font-serif text-4xl font-bold">In Their Memory</h1>
          <p className="mt-3 text-memorial-200">Honor their legacy through giving</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-memorial">
          {donationCauses[0]?.inLieuOfFlowersNote && (
            <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-gray-700">
              {donationCauses[0].inLieuOfFlowersNote}
            </p>
          )}

          {donationCauses.length === 0 ? (
            <p className="mx-auto max-w-xl text-center text-gray-600">
              The family has not listed a donation cause. Please share a tribute or contact the family on the Funeral page.
            </p>
          ) : (
            <>
          <SectionHeading title="Charitable Causes" />
          <div className="grid gap-6 md:grid-cols-2">
            {donationCauses.map((cause, i) => (
              <motion.div
                key={cause.id}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card"
              >
                {cause.logoUrl && (
                  <img src={cause.logoUrl} alt="" className="mb-4 h-12 object-contain" />
                )}
                <h3 className="font-serif text-xl font-semibold text-memorial-900">{cause.name}</h3>
                {cause.description && (
                  <p className="mt-3 text-gray-700">{cause.description}</p>
                )}
                {cause.donateUrl && (
                  <a
                    href={cause.donateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-6"
                  >
                    Donate <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
