import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useSelectedHonoree } from '@/hooks/useSelectedHonoree';
import { HonoreePicker } from '@/components/ui/HonoreePicker';
import { TributePreface } from '@/components/ui/TributePreface';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { FormattedText } from '@/components/ui/FormattedText';
import { submitTribute, submitStory } from '@/lib/data-service';
import { honoreeName, matchesHonoree } from '@/lib/honorees';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Heart, BookOpen, CheckCircle } from 'lucide-react';

const RELATIONSHIP_OPTIONS = [
  'Family',
  'Child',
  'Grandchild',
  'Sibling',
  'Relative',
  'Friend',
  'Colleague',
  'Neighbor',
  'Church family',
] as const;

const OTHER_RELATIONSHIP = 'Other';

interface TributeForm {
  honoreeId: string;
  authorName: string;
  relationship: string;
  otherRelationship: string;
  message: string;
  isGuestbookSignature: boolean;
}

interface StoryForm {
  honoreeId: string;
  authorName: string;
  title: string;
  body: string;
}

export function TributesPage() {
  const { data, honorees, selected, selectPerson } = useSelectedHonoree();
  const [tab, setTab] = useState<'tributes' | 'guestbook' | 'story'>('tributes');
  const [submitted, setSubmitted] = useState(false);
  const [formHonoreeId, setFormHonoreeId] = useState('');
  const queryClient = useQueryClient();
  const reduced = useReducedMotion();

  const tributeForm = useForm<TributeForm>({
    defaultValues: { honoreeId: '', isGuestbookSignature: false, relationship: '', otherRelationship: '' },
  });
  const storyForm = useForm<StoryForm>({ defaultValues: { honoreeId: '' } });
  const selectedRelationship = tributeForm.watch('relationship');

  useEffect(() => {
    if (!selected) return;
    setFormHonoreeId(selected.id);
    tributeForm.setValue('honoreeId', selected.id);
    storyForm.setValue('honoreeId', selected.id);
  }, [selected, tributeForm, storyForm]);

  if (!data) return null;

  const formHonoree = honorees.find((honoree) => honoree.id === formHonoreeId) ?? null;
  const approvedTributes = data.tributes.filter((t) => t.status === 'approved');
  const visibleTributes = selected
    ? approvedTributes.filter((tribute) => matchesHonoree(tribute.honoreeId, selected, honorees))
    : approvedTributes;
  const guestbook = visibleTributes.filter((t) => t.isGuestbookSignature);
  const tributes = visibleTributes.filter((t) => !t.isGuestbookSignature);

  const chooseFormHonoree = (slug: string | null) => {
    const honoree = honorees.find((item) => item.slug === slug);
    const id = honoree?.id ?? '';
    setFormHonoreeId(id);
    tributeForm.setValue('honoreeId', id);
    storyForm.setValue('honoreeId', id);
    if (slug) selectPerson(slug);
  };

  const onTributeSubmit = async (form: TributeForm) => {
    if (!formHonoreeId) return;
    const relationship =
      tab === 'guestbook'
        ? undefined
        : form.relationship === OTHER_RELATIONSHIP
          ? form.otherRelationship.trim()
          : form.relationship || undefined;

    await submitTribute({
      honoreeId: formHonoreeId,
      authorName: form.authorName,
      relationship,
      message: form.message,
      isGuestbookSignature: tab === 'guestbook',
    });
    setSubmitted(true);
    tributeForm.reset({ honoreeId: formHonoreeId, isGuestbookSignature: false, relationship: '', otherRelationship: '', authorName: '', message: '' });
    queryClient.invalidateQueries({ queryKey: ['memorial'] });
  };

  const onStorySubmit = async (form: StoryForm) => {
    if (!formHonoreeId) return;
    await submitStory({ ...form, honoreeId: formHonoreeId });
    setSubmitted(true);
    storyForm.reset({ honoreeId: formHonoreeId, authorName: '', title: '', body: '' });
    queryClient.invalidateQueries({ queryKey: ['memorial'] });
  };

  return (
    <div>
      <section className="page-banner">
        <div className="container-memorial px-4 text-center">
          <p className="type-intro-on-dark mb-3 text-xs sm:text-sm">In loving memory</p>
          <h1 className="type-name-on-dark text-3xl sm:text-4xl">
            {formHonoree ? formHonoree.fullName : 'Tributes & Condolences'}
          </h1>
          {formHonoree?.maidenName && (
            <p className="type-maiden-on-dark mt-1 text-lg">née {formHonoree.maidenName}</p>
          )}
          <p className="mt-4 font-serif text-xl text-white/90">Tributes &amp; Condolences</p>
          <p className="mt-2 text-memorial-200">Choose who you are remembering</p>
          <div className="mt-8">
            <HonoreePicker
              honorees={honorees}
              selectedSlug={selected?.slug ?? null}
              onSelect={selectPerson}
              allowAll
              allLabel="All messages"
            />
          </div>
        </div>
      </section>

      <section className="section-padding pb-0">
        <div className="container-memorial px-4">
          <figure className="scripture-panel">
            <p>
              “Blessed are the dead who die in the Lord from now on. ‘Yes,’ says the Spirit,
              ‘that they may rest from their labor, and their works follow them.’”
            </p>
            <cite>Revelation 14:13</cite>
          </figure>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-memorial">
          {selected && (
            <TributePreface
              text={selected.tributePreface}
              crossHref={`/gallery?person=${selected.slug}`}
              crossLabel="See photos"
            />
          )}
          <div className="mb-8 flex justify-center gap-2">
            {(['tributes', 'guestbook', 'story'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSubmitted(false); }}
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
                  tab === t ? 'bg-gold-400 text-memorial-950' : 'bg-gold-50 text-memorial-800'
                }`}
              >
                {t === 'story' ? 'Share a Story' : t}
              </button>
            ))}
          </div>

          <div className="mx-auto max-w-lg">
            {submitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="card text-center"
              >
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-4 font-serif text-xl font-semibold">Thank You</h3>
                <p className="mt-2 text-gray-600">Your message is now on the memorial.</p>
                <button onClick={() => setSubmitted(false)} className="btn-primary mt-6">Submit Another</button>
              </motion.div>
            ) : tab === 'story' ? (
              <form onSubmit={storyForm.handleSubmit(onStorySubmit)} className="card space-y-4">
                <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-memorial-900">
                  <BookOpen className="h-5 w-5" /> Share a Story
                </h3>
                <PersonField
                  honorees={honorees}
                  selectedSlug={formHonoree?.slug ?? null}
                  onSelect={chooseFormHonoree}
                />
                <p className="text-sm text-memorial-700">
                  A memory of {formHonoree?.fullName ?? 'someone you love'}
                </p>
                <div>
                  <label className="label">Your Name</label>
                  <input {...storyForm.register('authorName', { required: true })} className="input-field" />
                </div>
                <div>
                  <label className="label">Title</label>
                  <input {...storyForm.register('title', { required: true })} className="input-field" placeholder="A memory I'll never forget" />
                </div>
                <div>
                  <label className="label">Your Story</label>
                  <textarea {...storyForm.register('body', { required: true })} rows={8} className="input-field" />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Tip: use *bold* and _italics_. Blank lines start a new paragraph.
                  </p>
                </div>
                <button type="submit" className="btn-primary w-full" disabled={!formHonoreeId}>Submit Story</button>
              </form>
            ) : (
              <form onSubmit={tributeForm.handleSubmit(onTributeSubmit)} className="card space-y-4">
                <h3 className="flex items-center justify-center gap-2 text-center font-serif text-xl font-semibold text-memorial-900 sm:justify-start sm:text-left">
                  <Heart className="h-5 w-5 shrink-0" />
                  {tab === 'guestbook'
                    ? `Sign the Guestbook${formHonoree ? ` for ${formHonoree.fullName}` : ''}`
                    : `Leave a Tribute${formHonoree ? ` for ${formHonoree.fullName}` : ''}`}
                </h3>
                <PersonField
                  honorees={honorees}
                  selectedSlug={formHonoree?.slug ?? null}
                  onSelect={chooseFormHonoree}
                />
                <div>
                  <label className="label">Your Name</label>
                  <input {...tributeForm.register('authorName', { required: true })} className="input-field" />
                </div>
                {tab !== 'guestbook' && (
                  <div className="space-y-3">
                    <div>
                      <label className="label" htmlFor="tribute-relationship">Relationship</label>
                      <select
                        id="tribute-relationship"
                        {...tributeForm.register('relationship')}
                        className="input-field"
                      >
                        <option value="">Select a relationship</option>
                        {RELATIONSHIP_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                        <option value={OTHER_RELATIONSHIP}>{OTHER_RELATIONSHIP}</option>
                      </select>
                    </div>
                    {selectedRelationship === OTHER_RELATIONSHIP && (
                      <div>
                        <label className="label" htmlFor="tribute-other-relationship">Please specify</label>
                        <input
                          id="tribute-other-relationship"
                          {...tributeForm.register('otherRelationship', {
                            required: selectedRelationship === OTHER_RELATIONSHIP,
                          })}
                          className="input-field"
                          placeholder="Your relationship"
                        />
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <label className="label">Message</label>
                  <textarea
                    {...tributeForm.register('message', { required: true })}
                    rows={tab === 'guestbook' ? 4 : 10}
                    className="input-field"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Tip: use *bold* and _italics_. Blank lines start a new paragraph.
                  </p>
                </div>
                <button type="submit" className="btn-primary w-full" disabled={!formHonoreeId}>Submit Message</button>
                <p className="text-xs text-gray-500 text-center">Your message appears on the memorial as soon as you send it.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="section-padding bg-memorial-50">
        <div className="container-memorial">
          <SectionHeading
            title="Messages"
            subtitle={selected ? `Shared in honour of ${selected.fullName}` : 'Shared in honour of Mami and Hilary'}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...tributes, ...guestbook].map((t, i) => {
              const isLong = t.message.length > 320 || t.message.includes('\n');
              return (
                <motion.div
                  key={t.id}
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`card ${isLong ? 'sm:col-span-2 lg:col-span-3' : ''}`}
                >
                  <FormattedText text={t.message} className="leading-relaxed text-gray-700" />
                  <p className="mt-3 text-sm font-medium text-memorial-700">
                    — {t.authorName}{t.relationship ? `, ${t.relationship}` : ''}
                  </p>
                  {honoreeName(honorees, t.honoreeId) && (
                    <p className="mt-1 text-xs uppercase tracking-wide text-memorial-500">
                      In honour of {honoreeName(honorees, t.honoreeId)}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function PersonField({
  honorees,
  selectedSlug,
  onSelect,
}: {
  honorees: ReturnType<typeof useSelectedHonoree>['honorees'];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
}) {
  return (
    <div>
      <p className="label">This message is for</p>
      <HonoreePicker honorees={honorees} selectedSlug={selectedSlug} onSelect={onSelect} />
      {!selectedSlug && (
        <p className="mt-2 text-center text-xs text-gray-500">Choose a person before submitting.</p>
      )}
    </div>
  );
}
