import type { Honoree } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface HonoreePickerProps {
  honorees: Honoree[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
  allowAll?: boolean;
  allLabel?: string;
}

export function HonoreePicker({
  honorees,
  selectedSlug,
  onSelect,
  allowAll = false,
  allLabel = 'All',
}: HonoreePickerProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-4">
      {allowAll && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`min-w-28 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
            selectedSlug
              ? 'border-gold-200 bg-white text-memorial-800 hover:border-gold-400'
              : 'border-gold-400 bg-gold-50 text-memorial-950 ring-2 ring-gold-400'
          }`}
        >
          {allLabel}
        </button>
      )}
      {honorees.map((honoree) => {
        const selected = selectedSlug === honoree.slug;
        return (
          <button
            key={honoree.id}
            type="button"
            onClick={() => onSelect(honoree.slug)}
            className={`w-44 rounded-2xl border bg-white p-4 text-center transition ${
              selected
                ? 'border-gold-400 ring-2 ring-gold-400'
                : 'border-gold-200 hover:border-gold-400'
            }`}
          >
            {honoree.portraitUrl && (
              <img
                src={honoree.portraitUrl}
                alt=""
                className="portrait-gold-ring mx-auto mb-3 h-20 w-20 rounded-full border-2 border-gold-400 object-cover object-top"
              />
            )}
            <span className="block font-serif text-sm font-semibold leading-snug text-memorial-900">
              {honoree.fullName}
            </span>
            <span className="mt-1 block text-xs text-memorial-600">
              {formatDate(honoree.bornOn)} – {formatDate(honoree.diedOn)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
