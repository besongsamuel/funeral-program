import { useMemorial } from '@/hooks/useMemorial';
import { formatDate } from '@/lib/utils';
import { Printer } from 'lucide-react';

export function ObituaryPage() {
  const { data } = useMemorial();
  if (!data) return null;

  const { memorial } = data;

  return (
    <div className="print-content">
      <section className="bg-memorial-900 py-12 text-white no-print">
        <div className="container-memorial px-4 text-center">
          <h1 className="font-serif text-3xl font-bold">Obituary</h1>
          <button onClick={() => window.print()} className="btn-secondary mt-4 border-white text-white">
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </section>

      <article className="section-padding">
        <div className="container-memorial mx-auto max-w-3xl">
          <header className="mb-8 text-center">
            <h1 className="font-serif text-3xl font-bold text-memorial-900">{memorial.fullName}</h1>
            {memorial.maidenName && (
              <p className="mt-1 italic text-gray-500">née {memorial.maidenName}</p>
            )}
            <p className="mt-2 text-gray-600">
              Sunrise {formatDate(memorial.bornOn)} – Sunset {formatDate(memorial.diedOn)}
            </p>
          </header>
          <div
            className="prose prose-lg max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: memorial.obituaryHtml ?? '' }}
          />
        </div>
      </article>
    </div>
  );
}
