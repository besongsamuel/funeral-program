import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isAmplifyConfigured } from '@/lib/amplify';
import { formatDate } from '@/lib/utils';
import type { MemorialContext } from '@/lib/types';

type Section =
  | 'biography'
  | 'timeline'
  | 'family'
  | 'funeral'
  | 'gallery'
  | 'media'
  | 'donations';

const sections: { id: Section; label: string; publicPath: string }[] = [
  { id: 'biography', label: 'Biography', publicPath: '/legacy' },
  { id: 'timeline', label: 'Timeline', publicPath: '/legacy' },
  { id: 'family', label: 'Family', publicPath: '/family' },
  { id: 'funeral', label: 'Funeral', publicPath: '/funeral' },
  { id: 'gallery', label: 'Gallery', publicPath: '/gallery' },
  { id: 'media', label: 'Media', publicPath: '/memories' },
  { id: 'donations', label: 'Donations', publicPath: '/donations' },
];

const kindLabels: Record<string, string> = {
  service: 'Service',
  visitation: 'Visitation',
  reception: 'Reception',
  burial: 'Burial',
};

function Empty({ children }: { children: string }) {
  return <p className="rounded-xl border border-dashed border-memorial-200 bg-memorial-50 px-4 py-6 text-sm text-gray-600">{children}</p>;
}

export function AdminContent({ data }: { data: MemorialContext }) {
  const [section, setSection] = useState<Section>('biography');
  const connected = isAmplifyConfigured();
  const current = sections.find((s) => s.id === section)!;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Site content</h2>
          <p className="mt-1 text-sm text-gray-600">
            Records loaded from {connected ? 'Amplify Data' : 'local demo data'} for{' '}
            <span className="font-medium text-memorial-800">{data.memorial.fullName}</span>
            {' '}({data.memorial.slug}).
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            connected ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
          }`}
        >
          {connected ? 'Amplify connected' : 'Demo mode'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              section === s.id ? 'bg-memorial-700 text-white' : 'bg-memorial-50 text-memorial-800 hover:bg-memorial-100'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-semibold">{current.label}</h3>
        <Link to={current.publicPath} className="text-sm text-memorial-700 underline hover:text-memorial-900">
          View on site
        </Link>
      </div>

      {section === 'biography' && (
        <div className="space-y-3">
          {data.biographySections.length === 0 && <Empty>No biography sections in Amplify Data yet.</Empty>}
          {data.biographySections.map((item) => (
            <article key={item.id} className="card space-y-2">
              <p className="text-xs uppercase tracking-wide text-memorial-600">{item.kind}</p>
              <h4 className="font-serif text-lg font-semibold text-memorial-900">{item.heading}</h4>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{item.body}</p>
            </article>
          ))}
        </div>
      )}

      {section === 'timeline' && (
        <div className="space-y-3">
          {data.timelineEvents.length === 0 && <Empty>No timeline events in Amplify Data yet.</Empty>}
          {data.timelineEvents.map((item) => (
            <article key={item.id} className="card">
              <p className="text-xs font-medium text-memorial-600">{formatDate(item.eventDate)}</p>
              <h4 className="mt-1 font-serif text-lg font-semibold text-memorial-900">{item.title}</h4>
              {item.description && <p className="mt-2 text-sm text-gray-600">{item.description}</p>}
            </article>
          ))}
        </div>
      )}

      {section === 'family' && (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500">Family members ({data.familyMembers.length})</h4>
            {data.familyMembers.length === 0 && <Empty>No family members in Amplify Data yet.</Empty>}
            {data.familyMembers.map((member) => (
              <article key={member.id} className="card text-sm">
                <p className="font-medium text-memorial-900">{member.fullName}</p>
                <p className="text-gray-600">{member.relation}</p>
                {member.bio && <p className="mt-2 text-gray-600">{member.bio}</p>}
              </article>
            ))}
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500">Contacts ({data.familyContacts.length})</h4>
            {data.familyContacts.length === 0 && <Empty>No family contacts in Amplify Data yet.</Empty>}
            {data.familyContacts.map((contact) => (
              <article key={contact.id} className="card text-sm">
                <p className="font-medium text-memorial-900">{contact.name}</p>
                <p className="text-gray-600">{contact.relation}</p>
                {contact.phone && <p className="mt-1 text-gray-700">{contact.phone}</p>}
                {contact.email && <p className="text-gray-700">{contact.email}</p>}
              </article>
            ))}
          </div>
        </div>
      )}

      {section === 'funeral' && (
        <div className="space-y-3">
          {data.funeralEvents.length === 0 && <Empty>No funeral events in Amplify Data yet.</Empty>}
          {data.funeralEvents.map((event) => (
            <article key={event.id} className="card space-y-1">
              <p className="text-xs uppercase tracking-wide text-memorial-600">
                {kindLabels[event.kind] ?? event.kind}
              </p>
              <h4 className="font-serif text-lg font-semibold text-memorial-900">
                {event.title ?? kindLabels[event.kind] ?? event.kind}
              </h4>
              <p className="text-sm text-gray-700">{event.timeLabel ?? formatDate(event.startsAt)}</p>
              <p className="text-sm text-gray-600">
                {event.venueName}
                {event.address ? ` — ${event.address}` : ''}
              </p>
              {event.notes && <p className="pt-2 text-sm text-gray-600">{event.notes}</p>}
            </article>
          ))}
          {data.programItems.length > 0 && (
            <div className="pt-4">
              <h4 className="mb-3 text-sm font-medium text-gray-500">Program items</h4>
              {data.programItems.map((item) => (
                <article key={item.id} className="card mb-2 text-sm">
                  <p className="font-medium text-memorial-900">{item.title}</p>
                  <p className="text-gray-600">
                    {[item.kind, item.person, item.reference].filter(Boolean).join(' · ')}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {section === 'gallery' && (
        <div className="space-y-6">
          {data.galleryAlbums.length === 0 && <Empty>No gallery albums in Amplify Data yet.</Empty>}
          {data.galleryAlbums.map((album) => {
            const photos = data.galleryPhotos.filter((photo) => photo.albumId === album.id);
            return (
              <section key={album.id} className="space-y-3">
                <h4 className="font-serif text-lg font-semibold text-memorial-900">
                  {album.name} <span className="text-sm font-normal text-gray-500">({album.category})</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {photos.map((photo) => (
                    <figure key={photo.id} className="overflow-hidden rounded-xl border border-memorial-100 bg-white">
                      <img src={photo.url} alt={photo.caption ?? album.name} className="h-32 w-full object-cover" />
                      {photo.caption && <figcaption className="p-2 text-xs text-gray-600">{photo.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {section === 'media' && (
        <div className="space-y-3">
          {data.mediaItems.length === 0 && (
            <Empty>No videos, audio, or livestream items in Amplify Data yet.</Empty>
          )}
          {data.mediaItems.map((item) => (
            <article key={item.id} className="card text-sm">
              <p className="text-xs uppercase tracking-wide text-memorial-600">{item.kind}</p>
              <h4 className="mt-1 font-medium text-memorial-900">{item.title}</h4>
              <p className="mt-1 break-all text-gray-600">{item.url}</p>
            </article>
          ))}
        </div>
      )}

      {section === 'donations' && (
        <div className="space-y-3">
          {data.donationCauses.length === 0 && <Empty>No donation causes in Amplify Data yet.</Empty>}
          {data.donationCauses.map((cause) => (
            <article key={cause.id} className="card space-y-2">
              <h4 className="font-serif text-lg font-semibold text-memorial-900">{cause.name}</h4>
              {cause.description && <p className="text-sm text-gray-700">{cause.description}</p>}
              {cause.inLieuOfFlowersNote && <p className="text-sm text-gray-600">{cause.inLieuOfFlowersNote}</p>}
              {cause.donateUrl && (
                <a href={cause.donateUrl} className="text-sm text-memorial-700 underline" target="_blank" rel="noreferrer">
                  {cause.donateUrl}
                </a>
              )}
            </article>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        To change this content, edit <code className="rounded bg-gray-100 px-1">src/lib/demo-data.ts</code> and run{' '}
        <code className="rounded bg-gray-100 px-1">yarn seed</code>.
      </p>
    </div>
  );
}
