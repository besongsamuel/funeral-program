import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAmplifyConfigured } from '@/lib/amplify';
import { adminRemove, adminSave, isDraftId, newDraftId } from '@/lib/admin-api';
import { uploadGalleryImages } from '@/lib/storage';
import type {
  BiographySection,
  DonationCause,
  FamilyContact,
  FamilyMember,
  FuneralEvent,
  GalleryAlbum,
  GalleryPhoto,
  MediaItem,
  MemorialContext,
  ProgramItem,
  TimelineEvent,
} from '@/lib/types';
import {
  Field,
  SaveBar,
  SelectInput,
  TextArea,
  TextInput,
  fromDateTimeLocal,
  toDateTimeLocal,
  useRecordForm,
} from './form-controls';

type Section = 'biography' | 'timeline' | 'family' | 'funeral' | 'gallery' | 'media' | 'donations';

const sections: { id: Section; label: string; publicPath: string }[] = [
  { id: 'biography', label: 'Biography', publicPath: '/legacy' },
  { id: 'timeline', label: 'Timeline', publicPath: '/legacy' },
  { id: 'family', label: 'Family', publicPath: '/family' },
  { id: 'funeral', label: 'Funeral', publicPath: '/funeral' },
  { id: 'gallery', label: 'Gallery', publicPath: '/gallery' },
  { id: 'media', label: 'Media', publicPath: '/memories' },
  { id: 'donations', label: 'Donations', publicPath: '/donations' },
];

const BIO_KINDS = ['childhood', 'education', 'faith', 'accomplishments', 'qualities', 'quotes', 'career'];
const FUNERAL_KINDS = ['service', 'visitation', 'reception', 'burial'] as const;
const PROGRAM_KINDS = ['hymn', 'scripture', 'speaker', 'eulogy', 'prayer', 'music'];
const ALBUM_CATEGORIES = ['childhood', 'family', 'friends', 'career', 'community', 'special', 'funeral'];
const MEDIA_KINDS = ['video', 'audio', 'livestream'] as const;
const MEDIA_PROVIDERS = ['youtube', 'vimeo', 'upload'];

function AddButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button type="button" onClick={onClick} className="btn-secondary text-xs">
      {children}
    </button>
  );
}

export function AdminContent({ data, onChanged }: { data: MemorialContext; onChanged: () => Promise<void> | void }) {
  const [section, setSection] = useState<Section>('biography');
  const [bioDrafts, setBioDrafts] = useState<BiographySection[]>([]);
  const [timelineDrafts, setTimelineDrafts] = useState<TimelineEvent[]>([]);
  const [memberDrafts, setMemberDrafts] = useState<FamilyMember[]>([]);
  const [contactDrafts, setContactDrafts] = useState<FamilyContact[]>([]);
  const [funeralDrafts, setFuneralDrafts] = useState<FuneralEvent[]>([]);
  const [programDrafts, setProgramDrafts] = useState<ProgramItem[]>([]);
  const [albumDrafts, setAlbumDrafts] = useState<GalleryAlbum[]>([]);
  const [photoDrafts, setPhotoDrafts] = useState<GalleryPhoto[]>([]);
  const [mediaDrafts, setMediaDrafts] = useState<MediaItem[]>([]);
  const [donationDrafts, setDonationDrafts] = useState<DonationCause[]>([]);
  const connected = isAmplifyConfigured();
  const current = sections.find((item) => item.id === section)!;
  const memorialId = data.memorial.id;

  const refresh = async (drop?: () => void) => {
    drop?.();
    await onChanged();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Site content</h2>
          <p className="mt-1 text-sm text-gray-600">
            Edit records in {connected ? 'Amplify Data' : 'local demo data'} for{' '}
            <span className="font-medium text-memorial-800">{data.memorial.fullName}</span>.
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
        {sections.map((item) => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              section === item.id ? 'bg-gold-400 text-memorial-950' : 'bg-gold-50 text-memorial-800 hover:bg-gold-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <h3 className="font-serif text-xl font-semibold">{current.label}</h3>
        <Link to={current.publicPath} className="text-sm text-memorial-700 underline hover:text-memorial-900">
          View on site
        </Link>
      </div>

      {section === 'biography' && (
        <div className="space-y-3">
          {[...data.biographySections, ...bioDrafts].map((item) => (
            <BiographyForm
              key={item.id}
              item={item}
              onChanged={() => refresh(() => setBioDrafts((items) => items.filter((row) => row.id !== item.id)))}
            />
          ))}
          <AddButton
            onClick={() =>
              setBioDrafts((items) => [
                ...items,
                {
                  id: newDraftId(),
                  memorialId,
                  kind: 'qualities',
                  heading: '',
                  body: '',
                  sortOrder: data.biographySections.length + items.length + 1,
                },
              ])
            }
          >
            Add biography section
          </AddButton>
        </div>
      )}

      {section === 'timeline' && (
        <div className="space-y-3">
          {[...data.timelineEvents, ...timelineDrafts].map((item) => (
            <TimelineForm
              key={item.id}
              item={item}
              onChanged={() => refresh(() => setTimelineDrafts((items) => items.filter((row) => row.id !== item.id)))}
            />
          ))}
          <AddButton
            onClick={() =>
              setTimelineDrafts((items) => [
                ...items,
                {
                  id: newDraftId(),
                  memorialId,
                  eventDate: '',
                  title: '',
                  description: '',
                  sortOrder: data.timelineEvents.length + items.length + 1,
                },
              ])
            }
          >
            Add timeline event
          </AddButton>
        </div>
      )}

      {section === 'family' && (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500">Family members</h4>
            {[...data.familyMembers, ...memberDrafts].map((item) => (
              <MemberForm
                key={item.id}
                item={item}
                onChanged={() => refresh(() => setMemberDrafts((items) => items.filter((row) => row.id !== item.id)))}
              />
            ))}
            <AddButton
              onClick={() =>
                setMemberDrafts((items) => [
                  ...items,
                  {
                    id: newDraftId(),
                    memorialId,
                    fullName: '',
                    relation: '',
                    bio: '',
                    sortOrder: data.familyMembers.length + items.length + 1,
                  },
                ])
              }
            >
              Add family member
            </AddButton>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500">Contacts</h4>
            {[...data.familyContacts, ...contactDrafts].map((item) => (
              <ContactForm
                key={item.id}
                item={item}
                onChanged={() => refresh(() => setContactDrafts((items) => items.filter((row) => row.id !== item.id)))}
              />
            ))}
            <AddButton
              onClick={() =>
                setContactDrafts((items) => [
                  ...items,
                  { id: newDraftId(), memorialId, name: '', relation: '', phone: '', email: '' },
                ])
              }
            >
              Add contact
            </AddButton>
          </div>
        </div>
      )}

      {section === 'funeral' && (
        <div className="space-y-6">
          <div className="space-y-3">
            {[...data.funeralEvents, ...funeralDrafts].map((item) => (
              <FuneralForm
                key={item.id}
                item={item}
                onChanged={() => refresh(() => setFuneralDrafts((items) => items.filter((row) => row.id !== item.id)))}
              />
            ))}
            <AddButton
              onClick={() =>
                setFuneralDrafts((items) => [
                  ...items,
                  {
                    id: newDraftId(),
                    memorialId,
                    kind: 'visitation',
                    title: '',
                    startsAt: '',
                    timeLabel: '',
                    venueName: '',
                    address: '',
                    notes: '',
                  },
                ])
              }
            >
              Add funeral event
            </AddButton>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500">Program items</h4>
            {[...data.programItems, ...programDrafts].map((item) => (
              <ProgramForm
                key={item.id}
                item={item}
                onChanged={() => refresh(() => setProgramDrafts((items) => items.filter((row) => row.id !== item.id)))}
              />
            ))}
            <AddButton
              onClick={() =>
                setProgramDrafts((items) => [
                  ...items,
                  {
                    id: newDraftId(),
                    memorialId,
                    kind: 'speaker',
                    title: '',
                    person: '',
                    reference: '',
                    sortOrder: data.programItems.length + items.length + 1,
                  },
                ])
              }
            >
              Add program item
            </AddButton>
          </div>
        </div>
      )}

      {section === 'gallery' && (
        <div className="space-y-6">
          {[...data.galleryAlbums, ...albumDrafts].map((album) => {
            const albumPhotos = data.galleryPhotos
              .filter((photo) => photo.albumId === album.id)
              .concat(photoDrafts.filter((photo) => photo.albumId === album.id));
            return (
              <div key={album.id} className="space-y-3">
                <AlbumForm
                  item={album}
                  onChanged={() => refresh(() => setAlbumDrafts((items) => items.filter((row) => row.id !== album.id)))}
                />
                {!isDraftId(album.id) && (
                  <div className="ml-4 space-y-3 border-l border-gold-200 pl-4">
                    <AlbumPhotoUploader
                      memorialId={memorialId}
                      albumId={album.id}
                      nextSortOrder={albumPhotos.length + 1}
                      connected={connected}
                      onUploaded={async () => {
                        await refresh();
                      }}
                    />
                    {albumPhotos.map((photo) => (
                      <PhotoForm
                        key={photo.id}
                        item={photo}
                        onChanged={() => refresh(() => setPhotoDrafts((items) => items.filter((row) => row.id !== photo.id)))}
                      />
                    ))}
                    <AddButton
                      onClick={() =>
                        setPhotoDrafts((items) => [
                          ...items,
                          {
                            id: newDraftId(),
                            memorialId,
                            albumId: album.id,
                            url: '',
                            caption: '',
                            sortOrder: albumPhotos.length + items.filter((photo) => photo.albumId === album.id).length + 1,
                          },
                        ])
                      }
                    >
                      Add photo by URL
                    </AddButton>
                  </div>
                )}
              </div>
            );
          })}
          <AddButton
            onClick={() =>
              setAlbumDrafts((items) => [
                ...items,
                {
                  id: newDraftId(),
                  memorialId,
                  name: '',
                  category: 'family',
                  sortOrder: data.galleryAlbums.length + items.length + 1,
                },
              ])
            }
          >
            Add album
          </AddButton>
        </div>
      )}

      {section === 'media' && (
        <div className="space-y-3">
          {[...data.mediaItems, ...mediaDrafts].map((item) => (
            <MediaForm
              key={item.id}
              item={item}
              onChanged={() => refresh(() => setMediaDrafts((items) => items.filter((row) => row.id !== item.id)))}
            />
          ))}
          <AddButton
            onClick={() =>
              setMediaDrafts((items) => [
                ...items,
                {
                  id: newDraftId(),
                  memorialId,
                  kind: 'video',
                  provider: 'youtube',
                  url: '',
                  title: '',
                  category: '',
                  sortOrder: data.mediaItems.length + items.length + 1,
                },
              ])
            }
          >
            Add media item
          </AddButton>
        </div>
      )}

      {section === 'donations' && (
        <div className="space-y-3">
          {[...data.donationCauses, ...donationDrafts].map((item) => (
            <DonationForm
              key={item.id}
              item={item}
              onChanged={() => refresh(() => setDonationDrafts((items) => items.filter((row) => row.id !== item.id)))}
            />
          ))}
          <AddButton
            onClick={() =>
              setDonationDrafts((items) => [
                ...items,
                {
                  id: newDraftId(),
                  memorialId,
                  name: '',
                  description: '',
                  donateUrl: '',
                  inLieuOfFlowersNote: '',
                  sortOrder: data.donationCauses.length + items.length + 1,
                },
              ])
            }
          >
            Add donation cause
          </AddButton>
        </div>
      )}
    </div>
  );
}

function BiographyForm({ item, onChanged }: { item: BiographySection; onChanged: () => Promise<void> | void }) {
  const form = useRecordForm(item);
  return (
    <form className="card space-y-3" onSubmit={(event) => form.submit(event, async (values) => {
      await adminSave('BiographySection', values);
      await onChanged();
    })}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Kind">
          <SelectInput value={form.draft.kind} onChange={(e) => form.set('kind', e.target.value)}>
            {BIO_KINDS.map((kind) => (
              <option key={kind} value={kind}>{kind}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Order">
          <TextInput type="number" value={form.draft.sortOrder} onChange={(e) => form.set('sortOrder', Number(e.target.value))} />
        </Field>
      </div>
      <Field label="Heading">
        <TextInput value={form.draft.heading} onChange={(e) => form.set('heading', e.target.value)} required />
      </Field>
      <Field label="Body">
        <TextArea rows={4} value={form.draft.body} onChange={(e) => form.set('body', e.target.value)} required />
      </Field>
      <Field label="Image URL">
        <TextInput value={form.draft.imageUrl ?? ''} onChange={(e) => form.set('imageUrl', e.target.value)} />
      </Field>
      <SaveBar
        saving={form.saving}
        message={form.message}
        isNew={isDraftId(item.id)}
        onDelete={() => form.remove(async () => {
          await adminRemove('BiographySection', item.id);
          await onChanged();
        })}
      />
    </form>
  );
}

function TimelineForm({ item, onChanged }: { item: TimelineEvent; onChanged: () => Promise<void> | void }) {
  const form = useRecordForm(item);
  return (
    <form className="card space-y-3" onSubmit={(event) => form.submit(event, async (values) => {
      await adminSave('TimelineEvent', values);
      await onChanged();
    })}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date">
          <TextInput type="date" value={form.draft.eventDate} onChange={(e) => form.set('eventDate', e.target.value)} required />
        </Field>
        <Field label="Order">
          <TextInput type="number" value={form.draft.sortOrder} onChange={(e) => form.set('sortOrder', Number(e.target.value))} />
        </Field>
      </div>
      <Field label="Title">
        <TextInput value={form.draft.title} onChange={(e) => form.set('title', e.target.value)} required />
      </Field>
      <Field label="Description">
        <TextArea rows={3} value={form.draft.description ?? ''} onChange={(e) => form.set('description', e.target.value)} />
      </Field>
      <SaveBar
        saving={form.saving}
        message={form.message}
        isNew={isDraftId(item.id)}
        onDelete={() => form.remove(async () => {
          await adminRemove('TimelineEvent', item.id);
          await onChanged();
        })}
      />
    </form>
  );
}

function MemberForm({ item, onChanged }: { item: FamilyMember; onChanged: () => Promise<void> | void }) {
  const form = useRecordForm(item);
  return (
    <form className="card space-y-3" onSubmit={(event) => form.submit(event, async (values) => {
      await adminSave('FamilyMember', values);
      await onChanged();
    })}>
      <Field label="Full name">
        <TextInput value={form.draft.fullName} onChange={(e) => form.set('fullName', e.target.value)} required />
      </Field>
      <Field label="Relation / region">
        <TextInput value={form.draft.relation} onChange={(e) => form.set('relation', e.target.value)} required />
      </Field>
      <Field label="Bio">
        <TextArea rows={2} value={form.draft.bio ?? ''} onChange={(e) => form.set('bio', e.target.value)} />
      </Field>
      <SaveBar
        saving={form.saving}
        message={form.message}
        isNew={isDraftId(item.id)}
        onDelete={() => form.remove(async () => {
          await adminRemove('FamilyMember', item.id);
          await onChanged();
        })}
      />
    </form>
  );
}

function ContactForm({ item, onChanged }: { item: FamilyContact; onChanged: () => Promise<void> | void }) {
  const form = useRecordForm(item);
  return (
    <form className="card space-y-3" onSubmit={(event) => form.submit(event, async (values) => {
      await adminSave('FamilyContact', values);
      await onChanged();
    })}>
      <Field label="Name">
        <TextInput value={form.draft.name} onChange={(e) => form.set('name', e.target.value)} required />
      </Field>
      <Field label="Relation / region">
        <TextInput value={form.draft.relation ?? ''} onChange={(e) => form.set('relation', e.target.value)} />
      </Field>
      <Field label="Phone">
        <TextInput value={form.draft.phone ?? ''} onChange={(e) => form.set('phone', e.target.value)} />
      </Field>
      <Field label="Email">
        <TextInput type="email" value={form.draft.email ?? ''} onChange={(e) => form.set('email', e.target.value)} />
      </Field>
      <SaveBar
        saving={form.saving}
        message={form.message}
        isNew={isDraftId(item.id)}
        onDelete={() => form.remove(async () => {
          await adminRemove('FamilyContact', item.id);
          await onChanged();
        })}
      />
    </form>
  );
}

function FuneralForm({ item, onChanged }: { item: FuneralEvent; onChanged: () => Promise<void> | void }) {
  const form = useRecordForm({
    ...item,
    startsAt: toDateTimeLocal(item.startsAt),
    endsAt: toDateTimeLocal(item.endsAt),
  });
  return (
    <form className="card space-y-3" onSubmit={(event) => form.submit(event, async (values) => {
      await adminSave('FuneralEvent', {
        ...values,
        startsAt: fromDateTimeLocal(String(values.startsAt)),
        endsAt: values.endsAt ? fromDateTimeLocal(String(values.endsAt)) : null,
      });
      await onChanged();
    })}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Kind">
          <SelectInput value={form.draft.kind} onChange={(e) => form.set('kind', e.target.value)}>
            {FUNERAL_KINDS.map((kind) => (
              <option key={kind} value={kind}>{kind}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Time label">
          <TextInput value={form.draft.timeLabel ?? ''} onChange={(e) => form.set('timeLabel', e.target.value)} />
        </Field>
      </div>
      <Field label="Title">
        <TextInput value={form.draft.title ?? ''} onChange={(e) => form.set('title', e.target.value)} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Starts">
          <TextInput type="datetime-local" value={form.draft.startsAt} onChange={(e) => form.set('startsAt', e.target.value)} required />
        </Field>
        <Field label="Ends">
          <TextInput type="datetime-local" value={form.draft.endsAt ?? ''} onChange={(e) => form.set('endsAt', e.target.value)} />
        </Field>
      </div>
      <Field label="Venue">
        <TextInput value={form.draft.venueName} onChange={(e) => form.set('venueName', e.target.value)} required />
      </Field>
      <Field label="Address">
        <TextInput value={form.draft.address ?? ''} onChange={(e) => form.set('address', e.target.value)} />
      </Field>
      <Field label="Notes">
        <TextArea rows={2} value={form.draft.notes ?? ''} onChange={(e) => form.set('notes', e.target.value)} />
      </Field>
      <SaveBar
        saving={form.saving}
        message={form.message}
        isNew={isDraftId(item.id)}
        onDelete={() => form.remove(async () => {
          await adminRemove('FuneralEvent', item.id);
          await onChanged();
        })}
      />
    </form>
  );
}

function ProgramForm({ item, onChanged }: { item: ProgramItem; onChanged: () => Promise<void> | void }) {
  const form = useRecordForm(item);
  return (
    <form className="card space-y-3" onSubmit={(event) => form.submit(event, async (values) => {
      await adminSave('ProgramItem', values);
      await onChanged();
    })}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Kind">
          <SelectInput value={form.draft.kind} onChange={(e) => form.set('kind', e.target.value)}>
            {PROGRAM_KINDS.map((kind) => (
              <option key={kind} value={kind}>{kind}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Order">
          <TextInput type="number" value={form.draft.sortOrder} onChange={(e) => form.set('sortOrder', Number(e.target.value))} />
        </Field>
      </div>
      <Field label="Title">
        <TextInput value={form.draft.title} onChange={(e) => form.set('title', e.target.value)} required />
      </Field>
      <Field label="Person">
        <TextInput value={form.draft.person ?? ''} onChange={(e) => form.set('person', e.target.value)} />
      </Field>
      <Field label="Reference">
        <TextInput value={form.draft.reference ?? ''} onChange={(e) => form.set('reference', e.target.value)} />
      </Field>
      <SaveBar
        saving={form.saving}
        message={form.message}
        isNew={isDraftId(item.id)}
        onDelete={() => form.remove(async () => {
          await adminRemove('ProgramItem', item.id);
          await onChanged();
        })}
      />
    </form>
  );
}

function AlbumPhotoUploader({
  memorialId,
  albumId,
  nextSortOrder,
  connected,
  onUploaded,
}: {
  memorialId: string;
  albumId: string;
  nextSortOrder: number;
  connected: boolean;
  onUploaded: () => Promise<void> | void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState('');

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    if (!connected) {
      setMessage('Connect Amplify Storage to upload images.');
      return;
    }

    setUploading(true);
    setMessage('');
    setProgress(`Uploading 0 of ${fileList.length}…`);

    try {
      const files = Array.from(fileList);
      const uploaded: { url: string }[] = [];
      for (const [index, file] of files.entries()) {
        setProgress(`Uploading ${index + 1} of ${files.length}…`);
        const [item] = await uploadGalleryImages([file], memorialId, albumId);
        uploaded.push(item);
      }
      let saved = 0;
      for (const [index, item] of uploaded.entries()) {
        setProgress(`Saving ${index + 1} of ${uploaded.length}…`);
        await adminSave('GalleryPhoto', {
          id: newDraftId(),
          memorialId,
          albumId,
          url: item.url,
          caption: '',
          sortOrder: nextSortOrder + index,
        });
        saved += 1;
      }
      setMessage(`Uploaded ${saved} image${saved === 1 ? '' : 's'}.`);
      setProgress('');
      if (inputRef.current) inputRef.current.value = '';
      await onUploaded();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed.');
      setProgress('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-gold-300 bg-gold-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-memorial-900">Upload images to S3</p>
          <p className="mt-1 text-xs text-gray-600">
            Select one or many photos. They are stored under <code>memorial-media/</code> and saved to this album.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary text-xs"
          disabled={uploading || !connected}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Uploading…' : 'Choose images'}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          void handleFiles(event.target.files);
        }}
      />
      {progress && <p className="mt-2 text-xs text-memorial-700">{progress}</p>}
      {message && <p className="mt-2 text-xs text-gray-700">{message}</p>}
    </div>
  );
}

function AlbumForm({ item, onChanged }: { item: GalleryAlbum; onChanged: () => Promise<void> | void }) {
  const form = useRecordForm(item);
  return (
    <form className="card space-y-3" onSubmit={(event) => form.submit(event, async (values) => {
      await adminSave('GalleryAlbum', values);
      await onChanged();
    })}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name">
          <TextInput value={form.draft.name} onChange={(e) => form.set('name', e.target.value)} required />
        </Field>
        <Field label="Category">
          <SelectInput value={form.draft.category} onChange={(e) => form.set('category', e.target.value)}>
            {ALBUM_CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </SelectInput>
        </Field>
      </div>
      <SaveBar
        saving={form.saving}
        message={form.message}
        isNew={isDraftId(item.id)}
        onDelete={() => form.remove(async () => {
          await adminRemove('GalleryAlbum', item.id);
          await onChanged();
        })}
      />
    </form>
  );
}

function PhotoForm({ item, onChanged }: { item: GalleryPhoto; onChanged: () => Promise<void> | void }) {
  const form = useRecordForm(item);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const connected = isAmplifyConfigured();

  const replaceImage = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMessage('');
    try {
      const [uploaded] = await uploadGalleryImages([file], item.memorialId, item.albumId);
      form.set('url', uploaded.url);
      setUploadMessage('Image uploaded. Save to keep this URL.');
      if (fileRef.current) fileRef.current.value = '';
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="card space-y-3" onSubmit={(event) => form.submit(event, async (values) => {
      await adminSave('GalleryPhoto', values);
      await onChanged();
    })}>
      <Field label="Image URL">
        <TextInput value={form.draft.url} onChange={(e) => form.set('url', e.target.value)} required />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn-secondary text-xs"
          disabled={uploading || !connected}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? 'Uploading…' : 'Replace from computer'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            void replaceImage(event.target.files);
          }}
        />
        {uploadMessage && <span className="text-xs text-gray-600">{uploadMessage}</span>}
      </div>
      <Field label="Caption">
        <TextInput value={form.draft.caption ?? ''} onChange={(e) => form.set('caption', e.target.value)} />
      </Field>
      {form.draft.url && <img src={form.draft.url} alt="" className="h-24 rounded-lg object-cover" />}
      <SaveBar
        saving={form.saving}
        message={form.message}
        isNew={isDraftId(item.id)}
        onDelete={() => form.remove(async () => {
          await adminRemove('GalleryPhoto', item.id);
          await onChanged();
        })}
      />
    </form>
  );
}

function MediaForm({ item, onChanged }: { item: MediaItem; onChanged: () => Promise<void> | void }) {
  const form = useRecordForm(item);
  return (
    <form className="card space-y-3" onSubmit={(event) => form.submit(event, async (values) => {
      await adminSave('MediaItem', values);
      await onChanged();
    })}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Kind">
          <SelectInput value={form.draft.kind} onChange={(e) => form.set('kind', e.target.value)}>
            {MEDIA_KINDS.map((kind) => (
              <option key={kind} value={kind}>{kind}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Provider">
          <SelectInput value={form.draft.provider} onChange={(e) => form.set('provider', e.target.value)}>
            {MEDIA_PROVIDERS.map((provider) => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </SelectInput>
        </Field>
      </div>
      <Field label="Title">
        <TextInput value={form.draft.title} onChange={(e) => form.set('title', e.target.value)} required />
      </Field>
      <Field label="URL">
        <TextInput value={form.draft.url} onChange={(e) => form.set('url', e.target.value)} required />
      </Field>
      <SaveBar
        saving={form.saving}
        message={form.message}
        isNew={isDraftId(item.id)}
        onDelete={() => form.remove(async () => {
          await adminRemove('MediaItem', item.id);
          await onChanged();
        })}
      />
    </form>
  );
}

function DonationForm({ item, onChanged }: { item: DonationCause; onChanged: () => Promise<void> | void }) {
  const form = useRecordForm(item);
  return (
    <form className="card space-y-3" onSubmit={(event) => form.submit(event, async (values) => {
      await adminSave('DonationCause', values);
      await onChanged();
    })}>
      <Field label="Name">
        <TextInput value={form.draft.name} onChange={(e) => form.set('name', e.target.value)} required />
      </Field>
      <Field label="Description">
        <TextArea rows={3} value={form.draft.description ?? ''} onChange={(e) => form.set('description', e.target.value)} />
      </Field>
      <Field label="Donate URL">
        <TextInput value={form.draft.donateUrl ?? ''} onChange={(e) => form.set('donateUrl', e.target.value)} />
      </Field>
      <Field label="In lieu of flowers">
        <TextArea rows={2} value={form.draft.inLieuOfFlowersNote ?? ''} onChange={(e) => form.set('inLieuOfFlowersNote', e.target.value)} />
      </Field>
      <SaveBar
        saving={form.saving}
        message={form.message}
        isNew={isDraftId(item.id)}
        onDelete={() => form.remove(async () => {
          await adminRemove('DonationCause', item.id);
          await onChanged();
        })}
      />
    </form>
  );
}
