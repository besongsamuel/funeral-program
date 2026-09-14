import { Link } from 'react-router-dom';
import { useMemorial } from '@/hooks/useMemorial';
import { formatDate } from '@/lib/utils';
import { Printer } from 'lucide-react';

const NINETIETH_BIRTHDAY = '2026-05-24';

export function ObituaryPage() {
  const { data } = useMemorial();
  if (!data) return null;

  const { memorial } = data;

  return (
    <div className="print-content">
      <section className="page-banner-compact no-print">
        <div className="container-memorial px-4 text-center">
          <h1 className="font-serif text-3xl font-bold">Obituary</h1>
          <button onClick={() => window.print()} className="btn-secondary-dark mt-4">
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </section>

      <article className="section-padding">
        <div className="container-memorial mx-auto max-w-3xl">
          <header className="mb-10 text-center">
            {memorial.portraitUrl && (
              <img
                src={memorial.portraitUrl}
                alt={memorial.fullName}
                className="portrait-gold-ring mx-auto mb-6 h-36 w-36 rounded-full border-4 border-gold-400 object-cover object-top sm:h-44 sm:w-44"
              />
            )}
            <p className="type-intro mb-4 text-sm">Celebrating a Life of Love &amp; Legacy</p>
            <h1 className="type-name text-3xl sm:text-4xl">
              {memorial.fullName}
            </h1>
            {memorial.maidenName && (
              <p className="type-maiden mt-1 text-lg">née {memorial.maidenName}</p>
            )}
            <p className="type-anniversary mt-4 text-sm uppercase tracking-[0.2em]">
              90 Years of Grace
            </p>
            <p className="type-theme mt-2 text-sm uppercase tracking-[0.15em]">
              Faith • Family • Culture • Love • Legacy
            </p>
            <dl className="mt-6 grid gap-3 font-sans text-sm sm:grid-cols-3">
              <div className="rounded-xl border border-gold-200 bg-white px-3 py-3">
                <dt className="type-intro text-[10px]">Sunrise</dt>
                <dd className="type-name mt-1 text-base font-semibold">{formatDate(memorial.bornOn)}</dd>
              </div>
              <div className="rounded-xl border border-gold-200 bg-white px-3 py-3">
                <dt className="type-intro text-[10px]">90th Birthday</dt>
                <dd className="type-anniversary mt-1 text-base">{formatDate(NINETIETH_BIRTHDAY)}</dd>
              </div>
              <div className="rounded-xl border border-gold-200 bg-white px-3 py-3">
                <dt className="type-intro text-[10px]">Called to Glory</dt>
                <dd className="type-name mt-1 text-base font-semibold">{formatDate(memorial.diedOn)}</dd>
              </div>
            </dl>
          </header>

          {memorial.obituaryHtml ? (
            <div
              className="obituary-body space-y-5 text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: memorial.obituaryHtml }}
            />
          ) : (
            <p className="type-support text-center">The obituary will appear here once the family publishes it.</p>
          )}

          <div className="mt-10 text-center no-print">
            <Link to="/funeral" className="btn-primary">
              View Funeral Programme
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
