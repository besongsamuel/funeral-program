import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useMemorial } from '@/hooks/useMemorial';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { submitTribute, submitStory } from '@/lib/data-service';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Heart, BookOpen, CheckCircle } from 'lucide-react';

interface TributeForm {
  authorName: string;
  relationship: string;
  message: string;
  isGuestbookSignature: boolean;
}

interface StoryForm {
  authorName: string;
  title: string;
  body: string;
}

export function TributesPage() {
  const { data, isLoading } = useMemorial();
  const [tab, setTab] = useState<'tributes' | 'guestbook' | 'story'>('tributes');
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();
  const reduced = useReducedMotion();

  const tributeForm = useForm<TributeForm>({ defaultValues: { isGuestbookSignature: false } });
  const storyForm = useForm<StoryForm>();

  if (isLoading && !data) return null;

  const approvedTributes = data.tributes.filter((t) => t.status === 'approved');
  const guestbook = approvedTributes.filter((t) => t.isGuestbookSignature);
  const tributes = approvedTributes.filter((t) => !t.isGuestbookSignature);

  const onTributeSubmit = async (form: TributeForm) => {
    await submitTribute({
      ...form,
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
      <section className="bg-memorial-900 py-16 text-white">
        <div className="container-memorial px-4 text-center">
          <h1 className="font-serif text-4xl font-bold">Tributes & Condolences</h1>
          <p className="mt-3 text-memorial-200">Share your memories and messages</p>
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
                  tab === t ? 'bg-memorial-700 text-white' : 'bg-memorial-100 text-memorial-700'
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
                <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-memorial-900">
                  <Heart className="h-5 w-5" />
                  {tab === 'guestbook' ? 'Sign the Guestbook' : 'Leave a Tribute'}
                </h3>
                <div>
                  <label className="label">Your Name</label>
                  <input {...tributeForm.register('authorName', { required: true })} className="input-field" />
                </div>
                {tab !== 'guestbook' && (
                  <div>
                    <label className="label">Relationship</label>
                    <input {...tributeForm.register('relationship')} className="input-field" placeholder="Friend, colleague, neighbor..." />
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
          <SectionHeading title="Messages" />
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
