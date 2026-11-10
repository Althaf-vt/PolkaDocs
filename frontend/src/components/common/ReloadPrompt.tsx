import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, WifiOff, X } from 'lucide-react';

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Poll for updates every hour
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('Service Worker registration failed:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-[#D5DBE2] bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F4EAEB] text-[#8C221A] border border-[#8C221A]/20 shadow-xs">
        {offlineReady ? <WifiOff className="h-4 w-4" /> : <RefreshCw className="h-4 w-4 animate-spin" />}
      </div>

      <div className="flex-1 text-xs">
        {offlineReady ? (
          <p className="text-[#34424F] font-medium">App ready to work offline.</p>
        ) : (
          <div>
            <p className="font-bold text-[#121921]">New version available</p>
            <p className="text-[#67788A]">Click reload to update.</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="rounded-xl bg-[#8C221A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#731A13] transition shadow-xs cursor-pointer"
          >
            Reload
          </button>
        )}
        <button
          onClick={close}
          className="rounded-lg p-1 text-[#67788A] hover:bg-[#EAEEF2] hover:text-[#121921] transition cursor-pointer"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}