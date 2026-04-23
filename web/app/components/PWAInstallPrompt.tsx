import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone } from 'lucide-react';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 10 seconds if not dismissed
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (!dismissed && !standalone) {
          setShowPrompt(true);
        }
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt after delay if not standalone
    if (iOS && !standalone) {
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 10000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // For iOS, just show instructions
      if (isIOS) {
        return;
      }
      return;
    }

    // Show install prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <div className="bg-gradient-to-r from-red-500 to-amber-500 rounded-2xl shadow-2xl p-4 text-white">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="size-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="size-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="size-6" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">
                Установить приложение
              </h3>
              
              {isIOS ? (
                <div className="text-sm text-white/90 mb-3">
                  <p className="mb-2">Установите для лучшего опыта:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Нажмите <span className="font-semibold">кнопку "Поделиться"</span> внизу</li>
                    <li>Выберите <span className="font-semibold">"На экран Домой"</span></li>
                    <li>Нажмите <span className="font-semibold">"Добавить"</span></li>
                  </ol>
                </div>
              ) : (
                <p className="text-sm text-white/90 mb-3">
                  Установите приложение на главный экран для быстрого доступа и работы офлайн
                </p>
              )}

              {!isIOS && (
                <button
                  onClick={handleInstall}
                  className="w-full px-4 py-2 bg-white text-red-600 rounded-xl font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="size-4" />
                  Установить
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
