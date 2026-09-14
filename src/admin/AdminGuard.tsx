import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { getCurrentUser, signIn, signOut } from 'aws-amplify/auth';
import { isAmplifyConfigured } from '@/lib/amplify';

const DEMO_ADMIN_PASSWORD = 'memorial-admin';

export function AdminGuard() {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [demoAuth, setDemoAuth] = useState(sessionStorage.getItem('demo-admin') === 'true');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAmplifyConfigured()) {
      setStatus(demoAuth ? 'authenticated' : 'unauthenticated');
      return;
    }
    getCurrentUser()
      .then(() => setStatus('authenticated'))
      .catch(() => setStatus('unauthenticated'));
  }, [demoAuth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isAmplifyConfigured()) {
      if (password === DEMO_ADMIN_PASSWORD) {
        sessionStorage.setItem('demo-admin', 'true');
        setDemoAuth(true);
        setStatus('authenticated');
      } else {
        setError('Invalid password. Use memorial-admin for demo mode.');
      }
      return;
    }

    try {
      await signIn({ username: email, password });
      setStatus('authenticated');
    } catch {
      setError('Invalid credentials');
    }
  };

  const handleLogout = async () => {
    if (isAmplifyConfigured()) {
      await signOut();
    } else {
      sessionStorage.removeItem('demo-admin');
      setDemoAuth(false);
    }
    setStatus('unauthenticated');
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-memorial-200 border-t-memorial-700" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-memorial-50 p-4">
        <form onSubmit={handleLogin} className="card w-full max-w-md space-y-4">
          <h1 className="font-serif text-2xl font-bold text-memorial-900">Admin Login</h1>
          {isAmplifyConfigured() ? (
            <>
              <div>
                <label className="label">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required />
              </div>
            </>
          ) : (
            <div>
              <label className="label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required />
              <p className="mt-2 text-xs text-gray-500">Demo mode password: memorial-admin</p>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full">Sign In</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold text-memorial-900">Memorial Admin</h1>
        <button onClick={handleLogout} className="btn-ghost text-sm">Sign Out</button>
      </header>
      <Outlet context={{ onLogout: handleLogout }} />
    </div>
  );
}
