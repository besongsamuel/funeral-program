import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAdminContext,
  updateTributeStatus,
  updateStoryStatus,
  deleteTribute,
  deleteStory,
  updateMemorial,
} from '@/lib/data-service';
import type { ContentStatus } from '@/lib/types';
import { demoContext } from '@/lib/demo-data';
import { AdminContent } from './AdminContent';
import { AdminAi, AdminProfile } from './AdminSettings';

type Tab = 'profile' | 'content' | 'moderation' | 'ai' | 'publish';
type ModeratedType = 'tribute' | 'story';

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

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin'] });
    await queryClient.invalidateQueries({ queryKey: ['memorial'] });
  };

  const handleModerate = async (type: ModeratedType, id: string, status: ContentStatus) => {
    if (type === 'tribute') await updateTributeStatus(id, status);
    else await updateStoryStatus(id, status);
    await refresh();
  };

  const handleDelete = async (type: ModeratedType, id: string, label: string) => {
    if (!confirm(`Delete this ${label}? This cannot be undone.`)) return;
    if (type === 'tribute') await deleteTribute(id);
    else await deleteStory(id);
    await refresh();
  };

  const approvedTributes = data.tributes.filter((t) => t.status === 'approved');
  const approvedStories = data.stories.filter((s) => s.status === 'approved');
  const rejectedTributes = data.tributes.filter((t) => t.status === 'rejected');
  const rejectedStories = data.stories.filter((s) => s.status === 'rejected');

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
              tab === t.id ? 'bg-gold-100 text-memorial-900' : 'text-gray-600 hover:bg-gold-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-8">
        {tab === 'profile' && <AdminProfile memorial={data.memorial} onChanged={refresh} />}

        {tab === 'content' && <AdminContent data={data} onChanged={refresh} />}

        {tab === 'moderation' && (
          <div className="space-y-10">
            <section className="space-y-6">
              <h2 className="font-serif text-2xl font-semibold">Moderation Queue</h2>
              {data.pendingTributes.length === 0 && data.pendingStories.length === 0 && (
                <p className="text-gray-500">No pending items.</p>
              )}
              {data.pendingTributes.map((t) => (
                <div key={t.id} className="card">
                  <p className="text-sm font-medium text-memorial-700">
                    Tribute from {t.authorName}
                    {t.isGuestbookSignature ? ' (guestbook)' : ''}
                  </p>
                  <p className="mt-2 text-gray-700">{t.message}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => handleModerate('tribute', t.id, 'approved')} className="btn-primary text-xs">Approve</button>
                    <button onClick={() => handleModerate('tribute', t.id, 'rejected')} className="btn-ghost text-xs text-red-600">Reject</button>
                    <button onClick={() => handleDelete('tribute', t.id, 'tribute')} className="btn-ghost text-xs text-red-600">Delete</button>
                  </div>
                </div>
              ))}
              {data.pendingStories.map((s) => (
                <div key={s.id} className="card">
                  <p className="text-sm font-medium text-memorial-700">Story: {s.title} by {s.authorName}</p>
                  <p className="mt-2 text-gray-700">{s.body}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => handleModerate('story', s.id, 'approved')} className="btn-primary text-xs">Approve</button>
                    <button onClick={() => handleModerate('story', s.id, 'rejected')} className="btn-ghost text-xs text-red-600">Reject</button>
                    <button onClick={() => handleDelete('story', s.id, 'story')} className="btn-ghost text-xs text-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </section>

            <section className="space-y-6">
              <h2 className="font-serif text-2xl font-semibold">Published</h2>
              {approvedTributes.length === 0 && approvedStories.length === 0 && (
                <p className="text-gray-500">No published tributes or stories.</p>
              )}
              {approvedTributes.map((t) => (
                <div key={t.id} className="card">
                  <p className="text-sm font-medium text-memorial-700">
                    Tribute from {t.authorName}
                    {t.relationship ? ` · ${t.relationship}` : ''}
                    {t.isGuestbookSignature ? ' (guestbook)' : ''}
                  </p>
                  <p className="mt-2 text-gray-700">{t.message}</p>
                  <div className="mt-4">
                    <button onClick={() => handleDelete('tribute', t.id, 'tribute')} className="btn-ghost text-xs text-red-600">Delete</button>
                  </div>
                </div>
              ))}
              {approvedStories.map((s) => (
                <div key={s.id} className="card">
                  <p className="text-sm font-medium text-memorial-700">Story: {s.title} by {s.authorName}</p>
                  <p className="mt-2 text-gray-700">{s.body}</p>
                  <div className="mt-4">
                    <button onClick={() => handleDelete('story', s.id, 'story')} className="btn-ghost text-xs text-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </section>

            {(rejectedTributes.length > 0 || rejectedStories.length > 0) && (
              <section className="space-y-6">
                <h2 className="font-serif text-2xl font-semibold">Rejected</h2>
                {rejectedTributes.map((t) => (
                  <div key={t.id} className="card opacity-80">
                    <p className="text-sm font-medium text-memorial-700">Tribute from {t.authorName}</p>
                    <p className="mt-2 text-gray-700">{t.message}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => handleModerate('tribute', t.id, 'approved')} className="btn-primary text-xs">Approve</button>
                      <button onClick={() => handleDelete('tribute', t.id, 'tribute')} className="btn-ghost text-xs text-red-600">Delete</button>
                    </div>
                  </div>
                ))}
                {rejectedStories.map((s) => (
                  <div key={s.id} className="card opacity-80">
                    <p className="text-sm font-medium text-memorial-700">Story: {s.title} by {s.authorName}</p>
                    <p className="mt-2 text-gray-700">{s.body}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => handleModerate('story', s.id, 'approved')} className="btn-primary text-xs">Approve</button>
                      <button onClick={() => handleDelete('story', s.id, 'story')} className="btn-ghost text-xs text-red-600">Delete</button>
                    </div>
                  </div>
                ))}
              </section>
            )}
          </div>
        )}

        {tab === 'ai' && (
          <AdminAi
            settings={data.aiSettings}
            questions={data.aiQuickQuestions}
            knowledge={data.aiKnowledgeEntries}
            memorialId={data.memorial.id}
            onChanged={refresh}
          />
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
