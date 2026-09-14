import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { confirmSignIn, getCurrentUser, signIn, signOut } from 'aws-amplify/auth';
import { isAmplifyConfigured } from '@/lib/amplify';

const DEMO_ADMIN_PASSWORD = 'memorial-admin';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'new-password';

function passwordMeetsPolicy(value: string) {
  return (
    value.length >= 8 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Auth check timed out')), ms);
    }),
  ]);
}

export function AdminGuard() {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [demoAuth, setDemoAuth] = useState(sessionStorage.getItem('demo-admin') === 'true');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAmplifyConfigured()) {
      setStatus(demoAuth ? 'authenticated' : 'unauthenticated');
      return;
    }
    withTimeout(getCurrentUser(), 5000)
      .then(() => setStatus('authenticated'))
      .catch(() => setStatus('unauthenticated'));
  }, [demoAuth]);

  const finishSignedIn = () => {
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setStatus('authenticated');
  };

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

    setSubmitting(true);
    try {
      const result = await signIn({ username: email, password });
      if (result.isSignedIn) {
        finishSignedIn();
        return;
      }

      if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setStatus('new-password');
        return;
      }

      setError('This account needs another sign-in step that is not supported yet. Please contact the site owner.');
    } catch (err) {
      const name = err && typeof err === 'object' && 'name' in err ? String(err.name) : '';
      if (name === 'UserAlreadyAuthenticatedException') {
        finishSignedIn();
        return;
      }
      setError('Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('The two passwords do not match.');
      return;
    }
    if (!passwordMeetsPolicy(newPassword)) {
      setError('Use at least 8 characters, with upper and lower case, a number, and a symbol.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await confirmSignIn({ challengeResponse: newPassword });
      if (result.isSignedIn) {
        finishSignedIn();
        return;
      }
      setError('Password was saved, but sign-in is not complete yet. Try signing in again.');
      setStatus('unauthenticated');
    } catch {
      setError('Could not set the new password. Check the requirements and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (isAmplifyConfigured()) {
      try {
        await signOut();
      } catch {
        // A half-finished Cognito challenge can leave no session to clear.
      }
    } else {
      sessionStorage.removeItem('demo-admin');
      setDemoAuth(false);
    }
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setStatus('unauthenticated');
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-memorial-200 border-t-memorial-700" />
      </div>
    );
  }

  if (status === 'new-password') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-memorial-50 p-4">
        <form onSubmit={handleNewPassword} className="card w-full max-w-md space-y-4">
          <h1 className="font-serif text-2xl font-bold text-memorial-900">Set a new password</h1>
          <p className="text-sm text-gray-600">
            Cognito requires a new password the first time this admin signs in.
          </p>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              autoComplete="new-password"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              At least 8 characters, with upper and lower case, a number, and a symbol.
            </p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save password and continue'}
          </button>
          <button type="button" onClick={handleLogout} className="btn-ghost w-full text-sm">
            Back to sign in
          </button>
        </form>
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
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  autoComplete="current-password"
                  required
                />
              </div>
            </>
          ) : (
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
              />
              <p className="mt-2 text-xs text-gray-500">Demo mode password: memorial-admin</p>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b-2 border-gold-400 bg-white px-6 py-4">
        <h1 className="font-serif text-xl font-semibold text-memorial-900">Memorial Admin</h1>
        <button onClick={handleLogout} className="btn-ghost text-sm">Sign Out</button>
      </header>
      <Outlet context={{ onLogout: handleLogout }} />
    </div>
  );
}
