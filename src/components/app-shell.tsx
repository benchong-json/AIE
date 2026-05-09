import Link from "next/link";
import { navigationItems } from "@/lib/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <Link href="/" className="text-base font-semibold tracking-tight">
              Personal Recruiter
            </Link>
            <p className="mt-1 text-sm text-slate-500">
              Opportunity intelligence and application case workspace
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-slate-200 px-3 py-2 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
