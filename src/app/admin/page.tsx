'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session', { method: 'GET' });
        if (!response.ok) {
          setCheckingSession(false);
          return;
        }

        const data = (await response.json()) as { authenticated?: boolean };
        if (data.authenticated) {
          router.push('/admin/dashboard');
          return;
        }
      } catch {
        // Ignore network errors and let user authenticate manually.
      }

      setCheckingSession(false);
    };

    void checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          setError(
            retryAfter
              ? `Demasiados intentos. Probá de nuevo en ${retryAfter} segundos.`
              : payload.message || 'Demasiados intentos. Probá más tarde.'
          );
        } else {
          setError(payload.message || 'No se pudo iniciar sesión');
        }
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      setError('No se pudo iniciar sesión');
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"
          role="status"
          aria-label="Comprobando sesión"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-500 mb-2">W Bar</h1>
          <p className="text-zinc-400">Panel de Administración</p>
        </div>

        <form onSubmit={handleLogin} className="bg-zinc-800 rounded-lg p-6 space-y-4">
          <div>
            <label htmlFor="admin-password" className="block text-zinc-300 mb-2">
              Contraseña
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-sm mt-4">
          <a href="/" className="hover:text-amber-500">
            ← Volver al sitio
          </a>
        </p>
      </div>
    </div>
  );
}
