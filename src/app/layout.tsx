import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { BoutonInstaller } from "@/components/Installation";

export const viewport: Viewport = {
  themeColor: "#0f1f3a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  applicationName: "ActeFacile",
  appleWebApp: { capable: true, title: "ActeFacile", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  title: "ActeFacile — Vos actes juridiques, simplement",
  description: "Trouvez et rédigez le bon contrat ou acte juridique en quelques minutes, conforme au droit ivoirien : bail, reconnaissance de dette, mise en demeure…",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CI">
      <body className="min-h-screen flex flex-col antialiased">
        <header className="bg-marine-900 pt-[env(safe-area-inset-top)] text-white">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Acte<span className="text-accent-400">Facile</span>
            </Link>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-marine-100">
              <Link href="/actes" className="hover:text-white">Catalogue</Link>
              <Link href="/orientation" className="hover:text-white">Trouver mon acte</Link>
              <Link href="/mes-documents" className="hover:text-white">Mes documents</Link>
            </div>
            <BoutonInstaller />
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white text-sm text-slate-500">
          <div className="mx-auto max-w-6xl px-4 py-6 space-y-2">
            <p>
              ActeFacile met à votre disposition des modèles d&apos;actes et un outil d&apos;aide à la rédaction.
              Ce service ne constitue pas une consultation juridique et ne remplace pas le conseil d&apos;un avocat ou d&apos;un notaire.
            </p>
            <p className="flex flex-wrap gap-4">
              <Link href="/mentions-legales" className="underline">Mentions légales et CGU</Link>
              <span>Droit ivoirien et OHADA — modèles mis à jour en novembre 2026</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
