import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, ImagePlus, X } from 'lucide-react';
import { useMemorial } from '@/hooks/useMemorial';
import { submitGalleryPhotos } from '@/lib/data-service';

const ALBUM_CATEGORIES = [
  'childhood',
  'family',
  'friends',
  'career',
  'community',
  'special',
  'funeral',
] as const;

interface SharePhotosForm {
  authorName: string;
  albumName: string;
  category: string;
}

export function SharePhotosPage() {
  const { data } = useMemorial();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<SharePhotosForm>({
    defaultValues: { authorName: '', albumName: '', category: 'family' },
  });

  const previews = useMemo(
    () =>
      files.map((file) => ({
        key: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      for (const preview of previews) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [previews]);

  if (!data) return null;

  const { memorial } = data;

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const next = Array.from(list).filter((file) => file.type.startsWith('image/'));
    if (!next.length) {
      setError('Please choose image files only.');
      return;
    }
    setFiles((current) => {
      const seen = new Set(current.map((f) => `${f.name}-${f.size}-${f.lastModified}`));
      const merged = [...current];
      for (const file of next) {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (!seen.has(key)) merged.push(file);
      }
      return merged;
    });
    setError('');
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: SharePhotosForm) => {
    if (!files.length) {
      setError('Please choose at least one photo.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await submitGalleryPhotos({
        authorName: values.authorName,
        albumName: values.albumName,
        category: values.category,
        files,
      });
      setSubmitted(true);
      form.reset({ authorName: '', albumName: '', category: 'family' });
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await queryClient.invalidateQueries({ queryKey: ['memorial'] });
      await queryClient.invalidateQueries({ queryKey: ['admin'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload photos. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="page-banner">
        <div className="container-memorial px-4 text-center">
          <p className="type-intro-on-dark mb-3 text-xs sm:text-sm">Share photos of</p>
          <h1 className="type-name-on-dark text-3xl leading-tight sm:text-4xl">{memorial.fullName}</h1>
          {memorial.maidenName && (
            <p className="type-maiden-on-dark mt-1 text-base sm:text-lg">née {memorial.maidenName}</p>
          )}
          <p className="mt-4 text-sm text-memorial-200 sm:text-base">
            Photos are reviewed by the family before they appear in the gallery.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="container-memorial">
          <div className="mx-auto w-full max-w-lg">
            {submitted ? (
              <div className="card space-y-4 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="font-serif text-2xl font-semibold text-memorial-900">Thank you</h2>
                <p className="text-gray-600">
                  Your photos were submitted and will appear in the gallery after family review.
                </p>
                <button
                  type="button"
                  className="btn-primary min-h-12 w-full touch-manipulation"
                  onClick={() => setSubmitted(false)}
                >
                  Share more photos
                </button>
              </div>
            ) : (
              <form className="card space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                <div>
                  <h2 className="font-serif text-xl font-semibold text-memorial-900 sm:text-2xl">
                    Upload photos
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    Choose one or more images from your phone or computer. Everything you share stays
                    private until the family approves it for the public gallery.
                  </p>
                </div>

                <div>
                  <label className="label" htmlFor="share-author">Your name</label>
                  <input
                    id="share-author"
                    {...form.register('authorName', { required: true })}
                    className="input-field min-h-12 text-base"
                    autoComplete="name"
                    enterKeyHint="next"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="share-album">Album name</label>
                  <input
                    id="share-album"
                    {...form.register('albumName', { required: true })}
                    className="input-field min-h-12 text-base"
                    enterKeyHint="next"
                    placeholder="e.g. Family reunion, Wedding day"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="share-category">Category</label>
                  <select
                    id="share-category"
                    {...form.register('category', { required: true })}
                    className="input-field min-h-12 text-base capitalize"
                  >
                    {ALBUM_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="label">Photos</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      addFiles(event.target.files);
                      event.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    className="flex min-h-32 w-full touch-manipulation flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold-300 bg-gold-50/50 px-4 py-8 text-center active:bg-gold-100"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-8 w-8 text-memorial-800" />
                    <span className="text-base font-medium text-memorial-900">
                      {files.length ? 'Add more photos' : 'Choose photos'}
                    </span>
                    <span className="max-w-[16rem] text-xs leading-relaxed text-gray-600">
                      Tap to open your camera roll or files. You can select multiple images.
                    </span>
                  </button>

                  {previews.length > 0 && (
                    <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {previews.map((preview, index) => (
                        <li key={preview.key} className="relative aspect-square overflow-hidden rounded-lg bg-gold-50">
                          <img
                            src={preview.url}
                            alt={preview.name}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            aria-label={`Remove ${preview.name}`}
                            className="absolute right-1 top-1 flex h-9 w-9 touch-manipulation items-center justify-center rounded-full bg-memorial-950/80 text-white"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {files.length > 0 && (
                    <p className="mt-2 text-sm text-memorial-700">
                      {files.length} photo{files.length === 1 ? '' : 's'} selected
                    </p>
                  )}
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 px-3 py-3 text-sm text-red-700" role="alert">
                    {error}
                  </p>
                )}

                <p className="rounded-xl border border-gold-200 bg-gold-50/60 px-3 py-3 text-sm leading-relaxed text-memorial-800">
                  Submitted photos will be approved by the family before they are visible on the site.
                </p>

                <button
                  type="submit"
                  className="btn-primary min-h-12 w-full touch-manipulation text-base"
                  disabled={submitting}
                >
                  {submitting ? 'Uploading…' : 'Submit photos'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
