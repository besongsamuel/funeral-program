import { Link } from 'react-router-dom';
import { Bird } from 'lucide-react';
import { useMemorial } from '@/hooks/useMemorial';
import { formatDate } from '@/lib/utils';

export function Footer() {
  const { data } = useMemorial();
  if (!data) return null;

  const { memorial } = data;

  return (
    <footer className="border-t border-memorial-100 bg-memorial-950 text-memorial-100">
      <div className="container-memorial section-padding">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Bird className="h-5 w-5" />
              <span className="font-serif text-lg font-semibold text-white">
                {memorial.fullName}
              </span>
            </div>
            <p className="text-sm text-memorial-300">
              {formatDate(memorial.bornOn)} – {formatDate(memorial.diedOn)}
            </p>
            {memorial.tagline && (
              <p className="mt-2 text-sm italic text-memorial-400">{memorial.tagline}</p>
            )}
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-white">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/legacy/obituary" className="text-memorial-300 hover:text-white">Obituary</Link>
              <Link to="/funeral" className="text-memorial-300 hover:text-white">Funeral Details</Link>
              <Link to="/donations" className="text-memorial-300 hover:text-white">In Their Memory</Link>
              <Link to="/tributes" className="text-memorial-300 hover:text-white">Share a Tribute</Link>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-white">Contact</h4>
            <p className="text-sm text-memorial-300">
              Family contacts in Cameroon, Germany, the USA, and Canada.
            </p>
            <Link to="/funeral" className="mt-2 inline-block text-sm text-memorial-200 hover:text-white">
              View phone numbers
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-memorial-800 pt-8 text-center text-xs text-memorial-500">
          <p>In loving memory of {memorial.fullName}</p>
        </div>
      </div>
    </footer>
  );
}
