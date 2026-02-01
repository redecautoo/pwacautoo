import React, { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    console.log('[PWA] Standalone mode:', standalone);
    console.log('[PWA] Display mode:', window.matchMedia("(display-mode: standalone)").matches);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    console.log('[PWA] iOS detected:', iOS);
    console.log('[PWA] User Agent:', navigator.userAgent);

    // Check if already installed via getInstalledRelatedApps (if supported)
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
        console.log('[PWA] Installed related apps:', apps);
        if (apps.length > 0) {
          console.log('[PWA] App already installed!');
        }
      });
    }

    // Check if banner was dismissed recently (1h instead of 24h for easier testing)
    const dismissedAt = localStorage.getItem("pwa_banner_dismissed");
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      console.log('[PWA] Hours since dismissed:', hoursSinceDismissed);
      if (hoursSinceDismissed < 1) {
        console.log('[PWA] Banner dismissed recently, not showing');
        return; // Don't show if dismissed within 1h
      }
    }

    // For Android/Chrome - listen for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      console.log('[PWA] ✅ beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    console.log('[PWA] Listening for beforeinstallprompt...');

    // For iOS - show banner after 1 second if not standalone (faster than 3s)
    if (iOS && !standalone) {
      console.log('[PWA] Setting iOS banner timer (1s)');
      const timer = setTimeout(() => {
        console.log('[PWA] Showing iOS banner');
        setShowBanner(true);
      }, 1000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }

    // For Android - also show after 1 second if no beforeinstallprompt fired
    if (!iOS && !standalone) {
      console.log('[PWA] Setting Android banner timer (1s)');
      const timer = setTimeout(() => {
        console.log('[PWA] Timer fired. deferredPrompt:', deferredPrompt ? 'available' : 'null');
        if (!deferredPrompt) {
          console.log('[PWA] ⚠️ Showing Android banner (no beforeinstallprompt received)');
        }
        setShowBanner(true);
      }, 1000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      console.log('[PWA] Installing via prompt...');
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] User choice:', outcome);
        if (outcome === "accepted") {
          setShowBanner(false);
        }
        setDeferredPrompt(null);
      } catch (error) {
        console.error('[PWA] Install error:', error);
      }
    } else {
      // Tentar forçar o prompt manualmente
      console.log('[PWA] No prompt available, trying alternative methods...');

      // Verificar se já está instalado
      if (window.matchMedia('(display-mode: standalone)').matches) {
        alert('✅ O app já está instalado!\n\nVocê pode encontrá-lo na tela inicial do seu celular.');
        setShowBanner(false);
        return;
      }

      // Para Chrome/Edge - mostrar instruções sem reload
      if (!isIOS) {
        alert(
          '📱 Para instalar o Cautoo:\n\n' +
          '1. Toque nos 3 pontinhos (⋮) no canto superior\n' +
          '2. Selecione "Instalar app" ou "Adicionar à tela inicial"\n' +
          '3. Confirme a instalação\n\n' +
          '✅ O app ficará disponível na sua tela inicial!'
        );
        setShowBanner(false);
      } else {
        // Para iOS - mostrar instruções
        alert(
          '📱 Para instalar no iPhone:\n\n' +
          '1. Toque no ícone Compartilhar (⬆️)\n' +
          '2. Role para baixo\n' +
          '3. Toque em "Adicionar à Tela de Início"\n' +
          '4. Toque em "Adicionar"'
        );
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa_banner_dismissed", Date.now().toString());
  };

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-bottom"
        >
          <div className="max-w-lg mx-auto bg-card border border-border rounded-2xl p-4 shadow-lg shadow-black/20">
            <div className="flex items-start gap-3">
              {/* App Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">
                  Instalar Cautoo
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isIOS
                    ? "Adicione à tela inicial para acesso rápido"
                    : "Instale o app para uma experiência melhor"
                  }
                </p>

                {/* iOS Instructions */}
                {isIOS ? (
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    <span>Toque em</span>
                    <Share className="w-4 h-4 text-primary" />
                    <span>e depois em</span>
                    <span className="font-medium text-foreground">"Adicionar à Tela de Início"</span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="mt-3 h-8 px-4 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleInstall}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Instalar agora
                  </Button>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full hover:bg-muted transition-colors flex-shrink-0"
                aria-label="Fechar"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallBanner;
