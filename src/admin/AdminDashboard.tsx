import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAdminContext,
  updateTributeStatus,
  updateStoryStatus,
  updateMemorial,
} from '@/lib/data-service';
import type { ContentStatus } from '@/lib/types';
import { demoContext } from '@/lib/demo-data';
import { AdminContent } from './AdminContent';

type Tab = 'profile' | 'content' | 'moderation' | 'ai' | 'publish';

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('profile');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin'],
    queryFn: getAdminContext,
  });

  if (isLoading || !data) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const handleModerate = async (type: 'tribute' | 'story', id: string, status: ContentStatus) => {
    if (type === 'tribute') await updateTributeStatus(id, status);
    else await updateStoryStatus(id, status);
    queryClient.invalidateQueries({ queryKey: ['admin'] });
    queryClient.invalidateQueries({ queryKey: ['memorial'] });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'content', label: 'Content' },
    { id: 'moderation', label: 'Moderation' },
    { id: 'ai', label: 'AI Assistant' },
    { id: 'publish', label: 'Publish' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-65px)]">
      <nav className="w-56 shrink-0 border-r bg-white p-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`mb-1 w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium ${
              tab === t.id ? 'bg-memorial-100 text-memorial-800' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-8">
        {tab === 'profile' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="font-serif text-2xl font-semibold">Profile & Theme</h2>
            <div className="card space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" value={data.memorial.fullName} readOnly />
              </div>
              <div>
                <label className="label">Tagline</label>
                <input className="input-field" value={data.memorial.tagline ?? ''} readOnly />
              </div>
              <div>
                <label className="label">Short Tribute</label>
                <textarea className="input-field" rows={4} value={data.memorial.shortTribute ?? ''} readOnly />
              </div>
              <p className="text-sm text-gray-500">
                Edit these fields via Amplify sandbox or the seed script. Full inline editing requires Amplify Data connection.
              </p>
            </div>
          </div>
        )}

        {tab === 'content' && <AdminContent data={data} />}

        {tab === 'moderation' && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-semibold">Moderation Queue</h2>
            {data.pendingTributes.length === 0 && data.pendingStories.length === 0 && (
              <p className="text-gray-500">No pending items.</p>
            )}
            {data.pendingTributes.map((t) => (
              <div key={t.id} className="card">
                <p className="text-sm font-medium text-memorial-700">Tribute from {t.authorName}</p>
                <p className="mt-2 text-gray-700">{t.message}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleModerate('tribute', t.id, 'approved')} className="btn-primary text-xs">Approve</button>
                  <button onClick={() => handleModerate('tribute', t.id, 'rejected')} className="btn-ghost text-xs text-red-600">Reject</button>
                </div>
              </div>
            ))}
            {data.pendingStories.map((s) => (
              <div key={s.id} className="card">
                <p className="text-sm font-medium text-memorial-700">Story: {s.title} by {s.authorName}</p>
                <p className="mt-2 text-gray-700">{s.body}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleModerate('story', s.id, 'approved')} className="btn-primary text-xs">Approve</button>
                  <button onClick={() => handleModerate('story', s.id, 'rejected')} className="btn-ghost text-xs text-red-600">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'ai' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="font-serif text-2xl font-semibold">AI Assistant</h2>
            <div className="card space-y-4">
              <div>
                <label className="label">Assistant Name</label>
                <input className="input-field" value={data.aiSettings.assistantName} readOnly />
              </div>
              <div>
                <label className="label">Greeting</label>
                <textarea className="input-field" rows={3} value={data.aiSettings.greeting ?? ''} readOnly />
              </div>
              <div>
                <label className="label">Persona / Tone</label>
                <textarea className="input-field" rows={3} value={data.aiSettings.persona ?? ''} readOnly />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={data.aiSettings.isEnabled} readOnly />
                <span className="text-sm">Assistant enabled</span>
              </div>
            </div>

            <h3 className="font-serif text-xl font-semibold">Quick Questions</h3>
            <div className="space-y-2">
              {data.aiQuickQuestions.map((q) => (
                <div key={q.id} className="card flex justify-between text-sm">
                  <span className="font-medium">{q.label}</span>
                  <span className="text-gray-500">{q.questionText}</span>
                </div>
              ))}
            </div>

            <h3 className="font-serif text-xl font-semibold">Custom Knowledge</h3>
            <div className="space-y-2">
              {data.aiKnowledgeEntries.map((k) => (
                <div key={k.id} className="card text-sm">
                  <p className="font-medium text-memorial-800">Q: {k.question}</p>
                  <p className="mt-1 text-gray-600">A: {k.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'publish' && (
          <div className="max-w-md space-y-6">
            <h2 className="font-serif text-2xl font-semibold">Publish Site</h2>
            <div className="card">
              <p className="text-sm text-gray-600 mb-4">
                When published, the memorial site is visible to all visitors.
              </p>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Status: {data.memorial.isPublished ? 'Published' : 'Draft'}
                </span>
                <button
                  onClick={async () => {
                    await updateMemorial(data.memorial.id, { isPublished: !data.memorial.isPublished });
                    demoContext.memorial.isPublished = !data.memorial.isPublished;
                    queryClient.invalidateQueries({ queryKey: ['admin'] });
                    queryClient.invalidateQueries({ queryKey: ['memorial'] });
                  }}
                  className="btn-primary"
                >
                  {data.memorial.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
