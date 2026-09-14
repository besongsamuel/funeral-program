import { Link } from 'react-router-dom';
import { useMemorial } from '@/hooks/useMemorial';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { FuneralEvent } from '@/lib/types';
import { MapPin, Clock, Car, Shirt, Download, Video } from 'lucide-react';

const kindLabels: Record<string, string> = {
  service: 'Celebration of Life',
  visitation: 'Visitation',
  reception: 'Reception',
  burial: 'Burial / Interment',
};

function groupEventsByDay(events: FuneralEvent[]) {
  const groups = new Map<string, FuneralEvent[]>();
  for (const event of events) {
    const day = event.startsAt.slice(0, 10);
    const list = groups.get(day) ?? [];
    list.push(event);
    list.sort((x, y) => x.startsAt.localeCompare(y.startsAt));
    groups.set(day, list);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function FuneralPage() {
  const { data } = useMemorial();
  if (!data) return null;

  const { funeralEvents, programItems, memorial, familyContacts } = data;
  const days = groupEventsByDay(funeralEvents);
  const contactsByRegion = familyContacts.reduce<Record<string, typeof familyContacts>>((acc, contact) => {
    const key = contact.relation ?? 'Family';
    (acc[key] ??= []).push(contact);
    return acc;
  }, {});

  return (
    <div>
      <section className="bg-memorial-900 py-16 text-white">
        <div className="container-memorial px-4 text-center">
          <h1 className="font-serif text-4xl font-bold">Funeral &amp; Thanksgiving Programme</h1>
          <p className="mt-3 text-memorial-200">Honoring {memorial.fullName}</p>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-memorial-300">
            07 – 19 November 2026
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/funeral/livestream" className="btn-secondary border-memorial-300 text-memorial-100">
              <Video className="h-4 w-4" /> Watch Livestream
            </Link>
            {memorial.programPdfUrl && (
              <a
                href={memorial.programPdfUrl}
                className="btn-secondary border-memorial-300 text-memorial-100"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" /> View Programme Poster
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-memorial space-y-10">
          <SectionHeading title="Programme of Events" subtitle="All times are local to Limbe, Cameroon" />
          {days.map(([day, events]) => (
            <div key={day}>
              <h3 className="mb-4 font-serif text-2xl font-semibold text-memorial-900">
                {formatDate(day)}
              </h3>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="card">
                    <h4 className="font-serif text-xl font-semibold text-memorial-900">
                      {event.title ?? kindLabels[event.kind] ?? event.kind}
                    </h4>
                    <div className="mt-4 grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-memorial-600" />
                        <span>{event.timeLabel ? event.timeLabel : formatDateTime(event.startsAt)}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-memorial-600" />
                        <span>{event.venueName}{event.address ? ` — ${event.address}` : ''}</span>
                      </div>
                      {event.parkingNotes && (
                        <div className="flex items-start gap-2">
                          <Car className="mt-0.5 h-4 w-4 shrink-0 text-memorial-600" />
                          <span>{event.parkingNotes}</span>
                        </div>
                      )}
                      {event.dressCode && (
                        <div className="flex items-start gap-2">
                          <Shirt className="mt-0.5 h-4 w-4 shrink-0 text-memorial-600" />
                          <span>{event.dressCode}</span>
                        </div>
                      )}
                    </div>
                    {event.notes && <p className="mt-3 text-sm italic text-gray-600">{event.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {programItems.length > 0 && (
        <section className="section-padding bg-memorial-50">
          <div className="container-memorial">
            <SectionHeading title="Order of Service" />
            <div className="mx-auto max-w-xl space-y-3">
              {programItems.map((item, i) => (
                <div key={item.id} className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-memorial-100 text-sm font-medium text-memorial-700">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-memorial-900">{item.title}</p>
                    {item.person && <p className="text-sm text-gray-600">{item.person}</p>}
                    {item.reference && <p className="text-sm italic text-gray-500">{item.reference}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {familyContacts.length > 0 && (
        <section className="section-padding bg-memorial-50">
          <div className="container-memorial">
            <SectionHeading title="Family Contacts" subtitle="Reach the family in Cameroon, Germany, the USA, and Canada" />
            <div className="space-y-8">
              {Object.entries(contactsByRegion).map(([region, contacts]) => (
                <div key={region}>
                  <h3 className="mb-4 font-serif text-xl font-semibold text-memorial-800">{region}</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {contacts.map((c) => (
                      <div key={c.id} className="card">
                        <h4 className="font-medium text-memorial-900">{c.name}</h4>
                        {c.phone && (
                          <p className="mt-2 text-sm">
                            <a href={`tel:${c.phone.replace(/\s+/g, '')}`} className="text-memorial-700 hover:underline">
                              {c.phone}
                            </a>
                          </p>
                        )}
                        {c.email && <p className="text-sm text-memorial-600">{c.email}</p>}
                        {c.note && <p className="mt-2 text-sm italic text-gray-600">{c.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
