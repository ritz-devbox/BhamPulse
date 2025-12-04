import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "BhamPulse",
  description: "Birmingham restaurants and hikes explorer",
};

const navItems = [
  { href: "/restaurants", label: "Restaurants" },
  { href: "/hikes", label: "Hikes" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">
        <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold text-indigo-200">
              BhamPulse
            </Link>
            <nav className="flex gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-sm text-slate-200 transition hover:border-indigo-400 hover:text-indigo-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
