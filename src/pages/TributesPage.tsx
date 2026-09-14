import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useMemorial } from '@/hooks/useMemorial';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { submitTribute, submitStory } from '@/lib/data-service';
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
  authorName: string;
  relationship: string;
  otherRelationship: string;
  message: string;
  isGuestbookSignature: boolean;
}

interface StoryForm {
  authorName: string;
  title: string;
  body: string;
}

export function TributesPage() {
  const { data } = useMemorial();
  const [tab, setTab] = useState<'tributes' | 'guestbook' | 'story'>('tributes');
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();
  const reduced = useReducedMotion();

  const tributeForm = useForm<TributeForm>({
    defaultValues: { isGuestbookSignature: false, relationship: '', otherRelationship: '' },
  });
  const storyForm = useForm<StoryForm>();
  const selectedRelationship = tributeForm.watch('relationship');

  if (!data) return null;

  const { memorial } = data;
  const approvedTributes = data.tributes.filter((t) => t.status === 'approved');
  const guestbook = approvedTributes.filter((t) => t.isGuestbookSignature);
  const tributes = approvedTributes.filter((t) => !t.isGuestbookSignature);

  const onTributeSubmit = async (form: TributeForm) => {
    const relationship =
      tab === 'guestbook'
        ? undefined
        : form.relationship === OTHER_RELATIONSHIP
          ? form.otherRelationship.trim()
          : form.relationship || undefined;

    await submitTribute({
      authorName: form.authorName,
      relationship,
      message: form.message,
      isGuestbookSignature: tab === 'guestbook',
    });
    setSubmitted(true);
    tributeForm.reset();
    queryClient.invalidateQueries({ queryKey: ['memorial'] });
  };

  const onStorySubmit = async (form: StoryForm) => {
    await submitStory(form);
    setSubmitted(true);
    storyForm.reset();
    queryClient.invalidateQueries({ queryKey: ['memorial'] });
  };

  return (
    <div>
      <section className="page-banner">
        <div className="container-memorial px-4 text-center">
          <p className="type-intro-on-dark mb-3 text-xs sm:text-sm">In loving memory of</p>
          <h1 className="type-name-on-dark text-3xl sm:text-4xl">{memorial.fullName}</h1>
          {memorial.maidenName && (
            <p className="type-maiden-on-dark mt-1 text-lg">née {memorial.maidenName}</p>
          )}
          <p className="mt-4 font-serif text-xl text-white/90">Tributes &amp; Condolences</p>
          <p className="mt-2 text-memorial-200">Share your memories and messages</p>
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
                <p className="mt-2 text-gray-600">Your message has been submitted and will appear after family review.</p>
                <button onClick={() => setSubmitted(false)} className="btn-primary mt-6">Submit Another</button>
              </motion.div>
            ) : tab === 'story' ? (
              <form onSubmit={storyForm.handleSubmit(onStorySubmit)} className="card space-y-4">
                <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-memorial-900">
                  <BookOpen className="h-5 w-5" /> Share a Story
                </h3>
                <p className="text-sm text-memorial-700">
                  A memory of {memorial.fullName}
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
                  <textarea {...storyForm.register('body', { required: true })} rows={6} className="input-field" />
                </div>
                <button type="submit" className="btn-primary w-full">Submit Story</button>
              </form>
            ) : (
              <form onSubmit={tributeForm.handleSubmit(onTributeSubmit)} className="card space-y-4">
                <h3 className="flex items-center justify-center gap-2 text-center font-serif text-xl font-semibold text-memorial-900 sm:justify-start sm:text-left">
                  <Heart className="h-5 w-5 shrink-0" />
                  {tab === 'guestbook'
                    ? `Sign the Guestbook for ${memorial.fullName}`
                    : `Leave a Tribute for ${memorial.fullName}`}
                </h3>
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
                  <textarea {...tributeForm.register('message', { required: true })} rows={4} className="input-field" />
                </div>
                <button type="submit" className="btn-primary w-full">Submit Message</button>
                <p className="text-xs text-gray-500 text-center">Messages are reviewed by the family before publication.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="section-padding bg-memorial-50">
        <div className="container-memorial">
          <SectionHeading title="Messages" subtitle={`Shared in honour of ${memorial.fullName}`} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...tributes, ...guestbook].map((t, i) => (
              <motion.div
                key={t.id}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card"
              >
                <p className="text-gray-700">{t.message}</p>
                <p className="mt-3 text-sm font-medium text-memorial-700">
                  — {t.authorName}{t.relationship ? `, ${t.relationship}` : ''}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
