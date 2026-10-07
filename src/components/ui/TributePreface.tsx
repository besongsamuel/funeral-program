import { Link } from 'react-router-dom';
import { FormattedText } from '@/components/ui/FormattedText';

interface TributePrefaceProps {
  text?: string | null;
  crossHref: string;
  crossLabel: string;
}

/** Reads a stored honoree preface. Renders nothing when the field is empty. */
export function TributePreface({ text, crossHref, crossLabel }: TributePrefaceProps) {
  const preface = text?.trim();
  if (!preface) return null;

  return (
    <div className="card mx-auto mb-10 max-w-2xl text-center">
      <FormattedText text={preface} className="font-serif text-lg leading-relaxed text-gray-700" />
      <Link
        to={crossHref}
        className="mt-6 inline-flex text-sm font-medium text-memorial-800 underline decoration-gold-400 underline-offset-2"
      >
        {crossLabel}
      </Link>
    </div>
  );
}
