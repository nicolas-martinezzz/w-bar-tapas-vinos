'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <nav className="bg-zinc-800 border-b border-zinc-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin/dashboard" className="text-xl font-bold text-amber-500">
              W Bar Admin
            </Link>
            <div className="flex gap-6">
              <Link
                href="/admin/dashboard#sala"
                className="text-zinc-300 hover:text-amber-500 transition-colors"
              >
                Sala
              </Link>
              <Link
                href="/admin/dashboard#reservas"
                className="text-zinc-300 hover:text-amber-500 transition-colors"
              >
                Reservas
              </Link>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}