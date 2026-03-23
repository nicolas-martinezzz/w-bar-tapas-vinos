'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Armchair, CalendarHeart, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-zinc-950 to-stone-950">
      <nav className="sticky top-0 z-40 border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-lg sm:text-xl font-bold text-amber-400 hover:text-amber-300 transition-colors shrink-0"
            >
              <span className="rounded-lg bg-amber-500/10 p-1.5">
                <Armchair className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
              </span>
              <span className="truncate">W Bar</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1 text-sm">
              <Link
                href="/admin/dashboard#sala"
                className="rounded-lg px-3 py-2 text-stone-300 hover:text-amber-400 hover:bg-stone-800/80 transition-colors flex items-center gap-1.5"
              >
                <Armchair className="h-4 w-4 opacity-70" aria-hidden />
                Mesas
              </Link>
              <Link
                href="/admin/dashboard#reservas"
                className="rounded-lg px-3 py-2 text-stone-300 hover:text-amber-400 hover:bg-stone-800/80 transition-colors flex items-center gap-1.5"
              >
                <CalendarHeart className="h-4 w-4 opacity-70" aria-hidden />
                Lista del día
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-600 bg-stone-800/80 px-3 py-2 text-sm font-medium text-stone-200 hover:bg-stone-700 transition-colors"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Salir
          </button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </div>
  );
}
