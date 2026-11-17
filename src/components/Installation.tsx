"use client";
// Enregistre le service worker et propose d'installer l'application sur l'écran d'accueil.
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Plateforme = "android" | "ios" | null;

const CLE_MASQUE = "actefacile.installation.masquee";

function estInstallee() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function estIOS() {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
}

export function useInstallation() {
  const [evenement, setEvenement] = useState<BeforeInstallPromptEvent | null>(null);
  const [plateforme, setPlateforme] = useState<Plateforme>(null);
  const [installee, setInstallee] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    if (estInstallee()) {
      setInstallee(true);
      return;
    }
    if (estIOS()) setPlateforme("ios");
    const surPrompt = (e: Event) => {
      e.preventDefault();
      setEvenement(e as BeforeInstallPromptEvent);
      setPlateforme("android");
    };
    const surInstall = () => {
      setInstallee(true);
      setEvenement(null);
    };
    window.addEventListener("beforeinstallprompt", surPrompt);
    window.addEventListener("appinstalled", surInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", surPrompt);
      window.removeEventListener("appinstalled", surInstall);
    };
  }, []);

  const installer = async () => {
    if (!evenement) return false;
    await evenement.prompt();
    const { outcome } = await evenement.userChoice;
    setEvenement(null);
    if (outcome === "accepted") setInstallee(true);
    return outcome === "accepted";
  };

  return { plateforme: installee ? null : plateforme, installer };
}

/** Bouton discret dans l'en-tête. */
export function BoutonInstaller() {
  const { plateforme, installer } = useInstallation();
  const [aideIOS, setAideIOS] = useState(false);
  if (!plateforme) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => (plateforme === "android" ? installer() : setAideIOS(true))}
        className="ml-auto flex items-center gap-1.5 rounded-full bg-accent-500 px-3 py-1.5 text-sm font-semibold text-marine-900 hover:bg-accent-400"
      >
        <span aria-hidden>📲</span> Installer l&apos;app
      </button>
      {aideIOS && <AideIOS onFermer={() => setAideIOS(false)} />}
    </>
  );
}

/** Bandeau sur la page d'accueil, masquable. */
export function BandeauInstallation() {
  const { plateforme, installer } = useInstallation();
  const [masque, setMasque] = useState(true);
  const [aideIOS, setAideIOS] = useState(false);

  useEffect(() => {
    try {
      setMasque(localStorage.getItem(CLE_MASQUE) === "1");
    } catch {
      setMasque(false);
    }
  }, []);

  if (!plateforme || masque) return null;
  const fermer = () => {
    setMasque(true);
    try {
      localStorage.setItem(CLE_MASQUE, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="border-b border-marine-200 bg-marine-50">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icones/icone-192.png" alt="" width={40} height={40} className="h-10 w-10 rounded-xl" />
        <div className="min-w-0 flex-1 text-sm">
          <div className="font-semibold text-marine-900">Installez ActeFacile sur votre téléphone</div>
          <div className="text-slate-600">Gratuit, sans passer par un store. Retrouvez vos documents en un geste.</div>
        </div>
        <button type="button" onClick={() => (plateforme === "android" ? installer() : setAideIOS(true))} className="shrink-0 rounded-lg bg-marine-800 px-3 py-2 text-sm font-medium text-white hover:bg-marine-700">
          Installer
        </button>
        <button type="button" onClick={fermer} aria-label="Masquer" className="shrink-0 rounded p-1 text-slate-400 hover:text-slate-700">✕</button>
      </div>
      {aideIOS && <AideIOS onFermer={() => setAideIOS(false)} />}
    </div>
  );
}

function AideIOS({ onFermer }: { onFermer: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="aide-ios-titre" className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onFermer}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-slate-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 id="aide-ios-titre" className="text-lg font-semibold text-marine-900">Installer sur iPhone</h2>
        <ol className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3"><span className="font-bold text-marine-700">1.</span><span>Ouvrez ce site dans <strong>Safari</strong>.</span></li>
          <li className="flex gap-3"><span className="font-bold text-marine-700">2.</span><span>Touchez le bouton <strong>Partager</strong> <span aria-hidden>⬆️</span> en bas de l&apos;écran.</span></li>
          <li className="flex gap-3"><span className="font-bold text-marine-700">3.</span><span>Choisissez <strong>« Sur l&apos;écran d&apos;accueil »</strong>, puis <strong>Ajouter</strong>.</span></li>
        </ol>
        <button type="button" onClick={onFermer} className="mt-6 w-full rounded-lg bg-marine-800 py-2.5 font-medium text-white">J&apos;ai compris</button>
      </div>
    </div>
  );
}
