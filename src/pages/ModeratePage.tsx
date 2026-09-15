import { useCallback, useEffect, useState } from 'react';
import {
  clearModerationSession,
  getStoredModerationToken,
  isModerationAuthError,
  listModerationItems,
  moderateItem,
  unlockModeration,
  type ModerationAction,
  type ModerationList,
  type ModerationPhoto,
  type ModerationStory,
  type ModerationTribute,
  type ModerationType,
} from '@/lib/moderation-api';
import { getModerationUrl } from '@/lib/amplify';

const CODE_PATTERN = /^[A-Z0-9]{4}$/;

function byStatus<T extends { status?: string }>(items: T[], status: string) {
  return items.filter((item) => item.status === status);
}

export function ModeratePage() {
  const [token, setToken] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<ModerationList | null>(null);
  const [section, setSection] = useState<'messages' | 'photos'>('messages');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const next = await listModerationItems();
      setData(next);
    } catch (err) {
      if (isModerationAuthError(err)) {
        clearModerationSession();
        setToken(null);
        setData(null);
      }
      setError(err instanceof Error ? err.message : 'Could not load moderation queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const existing = getStoredModerationToken();
    if (!existing) return;
    setToken(existing);
  }, []);

  useEffect(() => {
    if (!token) return;
    void refresh();
  }, [token, refresh]);

  const handleUnlock = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!CODE_PATTERN.test(normalized)) {
      setError('Enter a 4-character code using letters and numbers.');
      return;
    }
    if (!getModerationUrl()) {
      setError('Moderation service is not available yet. Try again after the backend deploys.');
      return;
    }

    setUnlocking(true);
    setError('');
    try {
      const result = await unlockModeration(normalized);
      setToken(result.token);
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setUnlocking(false);
    }
  };

  const handleModerate = async (
    type: ModerationType,
    id: string,
    action: ModerationAction,
    label: string,
  ) => {
    if (action === 'delete' && !confirm(`Remove this ${label} from the site? You can restore it later.`)) return;
    setError('');
    try {
      await moderateItem(type, id, action);
      await refresh();
    } catch (err) {
      if (isModerationAuthError(err)) {
        clearModerationSession();
        setToken(null);
        setData(null);
      }
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const signOut = () => {
    clearModerationSession();
    setToken(null);
    setData(null);
    setError('');
  };

  if (!token) {
    return (
      <div>
        <section className="page-banner">
          <div className="container-memorial px-4 text-center">
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">Family moderation</h1>
            <p className="mt-3 text-sm text-memorial-200 sm:text-base">
              Enter the 4-character family code to review messages and photos.
            </p>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 lg:px-8">
          <form
            onSubmit={handleUnlock}
            className="card mx-auto w-full max-w-sm space-y-5"
          >
            <div>
              <label className="label" htmlFor="moderation-code">Family code</label>
              <input
                id="moderation-code"
                value={code}
                onChange={(event) => {
                  const next = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
                  setCode(next);
                }}
                className="input-field min-h-14 text-center font-mono text-2xl tracking-[0.35em] uppercase"
                inputMode="text"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                maxLength={4}
                pattern="[A-Z0-9]{4}"
                placeholder="••••"
                autoComplete="one-time-code"
                required
              />
            </div>
            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-3 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="btn-primary min-h-12 w-full touch-manipulation text-base"
              disabled={unlocking || code.length !== 4}
            >
              {unlocking ? 'Checking…' : 'Unlock'}
            </button>
          </form>
        </section>
      </div>
    );
  }

  const tributes = data?.tributes ?? [];
  const stories = data?.stories ?? [];
  const photos = data?.photos ?? [];

  const pendingTributes = byStatus(tributes, 'pending');
  const approvedTributes = byStatus(tributes, 'approved');
  const rejectedTributes = byStatus(tributes, 'rejected');
  const deletedTributes = byStatus(tributes, 'deleted');
  const pendingStories = byStatus(stories, 'pending');
  const approvedStories = byStatus(stories, 'approved');
  const rejectedStories = byStatus(stories, 'rejected');
  const deletedStories = byStatus(stories, 'deleted');
  const pendingPhotos = byStatus(photos, 'pending');
  const approvedPhotos = byStatus(photos, 'approved');
  const rejectedPhotos = byStatus(photos, 'rejected');
  const deletedPhotos = byStatus(photos, 'deleted');

  type ItemMode = 'pending' | 'published' | 'rejected' | 'deleted';

  const renderTribute = (item: ModerationTribute, mode: ItemMode) => (
    <div key={item.id} className={`card ${mode === 'rejected' || mode === 'deleted' ? 'opacity-80' : ''}`}>
      <p className="text-sm font-medium text-memorial-700">
        Tribute from {item.authorName || 'Anonymous'}
        {item.isGuestbookSignature ? ' (guestbook)' : ''}
        {item.relationship ? ` · ${item.relationship}` : ''}
      </p>
      <p className="mt-2 text-gray-700">{item.message}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(mode === 'pending' || mode === 'rejected' || mode === 'deleted') && (
          <button
            type="button"
            className="btn-primary text-xs"
            onClick={() => handleModerate('tribute', item.id, 'approve', 'tribute')}
          >
            Approve
          </button>
        )}
        {(mode === 'rejected' || mode === 'deleted') && (
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => handleModerate('tribute', item.id, 'restore', 'tribute')}
          >
            {mode === 'deleted' ? 'Undelete' : 'Unreject'}
          </button>
        )}
        {mode === 'pending' && (
          <button
            type="button"
            className="btn-ghost text-xs text-red-600"
            onClick={() => handleModerate('tribute', item.id, 'reject', 'tribute')}
          >
            Reject
          </button>
        )}
        {mode !== 'deleted' && (
          <button
            type="button"
            className="btn-ghost text-xs text-red-600"
            onClick={() => handleModerate('tribute', item.id, 'delete', 'tribute')}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );

  const renderStory = (item: ModerationStory, mode: ItemMode) => (
    <div key={item.id} className={`card ${mode === 'rejected' || mode === 'deleted' ? 'opacity-80' : ''}`}>
      <p className="text-sm font-medium text-memorial-700">
        Story: {item.title} by {item.authorName || 'Anonymous'}
      </p>
      <p className="mt-2 text-gray-700">{item.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(mode === 'pending' || mode === 'rejected' || mode === 'deleted') && (
          <button
            type="button"
            className="btn-primary text-xs"
            onClick={() => handleModerate('story', item.id, 'approve', 'story')}
          >
            Approve
          </button>
        )}
        {(mode === 'rejected' || mode === 'deleted') && (
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => handleModerate('story', item.id, 'restore', 'story')}
          >
            {mode === 'deleted' ? 'Undelete' : 'Unreject'}
          </button>
        )}
        {mode === 'pending' && (
          <button
            type="button"
            className="btn-ghost text-xs text-red-600"
            onClick={() => handleModerate('story', item.id, 'reject', 'story')}
          >
            Reject
          </button>
        )}
        {mode !== 'deleted' && (
          <button
            type="button"
            className="btn-ghost text-xs text-red-600"
            onClick={() => handleModerate('story', item.id, 'delete', 'story')}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );

  const renderPhoto = (item: ModerationPhoto, mode: ItemMode) => (
    <div key={item.id} className={`card ${mode === 'rejected' || mode === 'deleted' ? 'opacity-80' : ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row">
        {item.url && (
          <img
            src={item.url}
            alt={item.caption ?? 'Submitted photo'}
            className="h-44 w-full rounded-xl object-cover sm:h-28 sm:w-28 sm:shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-memorial-700">
            {item.authorName ? `From ${item.authorName}` : 'Guest submission'}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {item.albumName}
            {item.albumCategory ? ` · ${item.albumCategory}` : ''}
          </p>
          {item.caption && <p className="mt-2 text-sm text-gray-700">{item.caption}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {(mode === 'pending' || mode === 'rejected' || mode === 'deleted') && (
              <button
                type="button"
                className="btn-primary text-xs"
                onClick={() => handleModerate('photo', item.id, 'approve', 'photo')}
              >
                Approve
              </button>
            )}
            {(mode === 'rejected' || mode === 'deleted') && (
              <button
                type="button"
                className="btn-secondary text-xs"
                onClick={() => handleModerate('photo', item.id, 'restore', 'photo')}
              >
                {mode === 'deleted' ? 'Undelete' : 'Unreject'}
              </button>
            )}
            {mode === 'pending' && (
              <button
                type="button"
                className="btn-ghost text-xs text-red-600"
                onClick={() => handleModerate('photo', item.id, 'reject', 'photo')}
              >
                Reject
              </button>
            )}
            {mode !== 'deleted' && (
              <button
                type="button"
                className="btn-ghost text-xs text-red-600"
                onClick={() => handleModerate('photo', item.id, 'delete', 'photo')}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <section className="page-banner">
        <div className="container-memorial flex flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">Family moderation</h1>
            <p className="mt-2 text-sm text-memorial-200">
              Review tributes, stories, and shared photos
            </p>
          </div>
          <button type="button" className="btn-secondary-dark min-h-11 touch-manipulation" onClick={signOut}>
            Lock
          </button>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="container-memorial space-y-8">
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setSection('messages')}
              className={`min-h-11 rounded-full px-4 py-2 text-sm font-medium touch-manipulation ${
                section === 'messages' ? 'bg-gold-400 text-memorial-950' : 'bg-gold-50 text-memorial-800'
              }`}
            >
              Messages
              {pendingTributes.length + pendingStories.length > 0
                ? ` (${pendingTributes.length + pendingStories.length})`
                : ''}
            </button>
            <button
              type="button"
              onClick={() => setSection('photos')}
              className={`min-h-11 rounded-full px-4 py-2 text-sm font-medium touch-manipulation ${
                section === 'photos' ? 'bg-gold-400 text-memorial-950' : 'bg-gold-50 text-memorial-800'
              }`}
            >
              Photos{pendingPhotos.length > 0 ? ` (${pendingPhotos.length})` : ''}
            </button>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          {loading && !data ? (
            <p className="text-center text-gray-500">Loading…</p>
          ) : section === 'messages' ? (
            <div className="space-y-10">
              <section className="space-y-4">
                <h2 className="font-serif text-xl font-semibold">Pending</h2>
                {pendingTributes.length === 0 && pendingStories.length === 0 ? (
                  <p className="text-gray-500">No pending messages.</p>
                ) : (
                  <>
                    {pendingTributes.map((item) => renderTribute(item, 'pending'))}
                    {pendingStories.map((item) => renderStory(item, 'pending'))}
                  </>
                )}
              </section>

              <section className="space-y-4">
                <h2 className="font-serif text-xl font-semibold">Published</h2>
                {approvedTributes.length === 0 && approvedStories.length === 0 ? (
                  <p className="text-gray-500">No published messages.</p>
                ) : (
                  <>
                    {approvedTributes.map((item) => renderTribute(item, 'published'))}
                    {approvedStories.map((item) => renderStory(item, 'published'))}
                  </>
                )}
              </section>

              {(rejectedTributes.length > 0 || rejectedStories.length > 0) && (
                <section className="space-y-4">
                  <h2 className="font-serif text-xl font-semibold">Rejected</h2>
                  {rejectedTributes.map((item) => renderTribute(item, 'rejected'))}
                  {rejectedStories.map((item) => renderStory(item, 'rejected'))}
                </section>
              )}

              {(deletedTributes.length > 0 || deletedStories.length > 0) && (
                <section className="space-y-4">
                  <h2 className="font-serif text-xl font-semibold">Deleted</h2>
                  {deletedTributes.map((item) => renderTribute(item, 'deleted'))}
                  {deletedStories.map((item) => renderStory(item, 'deleted'))}
                </section>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              <section className="space-y-4">
                <h2 className="font-serif text-xl font-semibold">Pending</h2>
                {pendingPhotos.length === 0 ? (
                  <p className="text-gray-500">No pending photos.</p>
                ) : (
                  pendingPhotos.map((item) => renderPhoto(item, 'pending'))
                )}
              </section>

              <section className="space-y-4">
                <h2 className="font-serif text-xl font-semibold">Published</h2>
                {approvedPhotos.length === 0 ? (
                  <p className="text-gray-500">No published photos.</p>
                ) : (
                  approvedPhotos.map((item) => renderPhoto(item, 'published'))
                )}
              </section>

              {rejectedPhotos.length > 0 && (
                <section className="space-y-4">
                  <h2 className="font-serif text-xl font-semibold">Rejected</h2>
                  {rejectedPhotos.map((item) => renderPhoto(item, 'rejected'))}
                </section>
              )}

              {deletedPhotos.length > 0 && (
                <section className="space-y-4">
                  <h2 className="font-serif text-xl font-semibold">Deleted</h2>
                  {deletedPhotos.map((item) => renderPhoto(item, 'deleted'))}
                </section>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
