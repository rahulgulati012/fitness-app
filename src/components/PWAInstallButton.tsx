import { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { ThemeTokens } from '../types/kinetix';

interface PWAInstallButtonProps {
  theme: ThemeTokens;
  compact?: boolean;
}

export function PWAInstallButton({ theme, compact = false }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`${
          compact ? 'min-h-[40px] px-3.5 text-xs' : 'w-full min-h-[46px] px-4 text-xs'
        } rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98]`}
        style={{
          background: theme.gradientCss,
          boxShadow: `0 6px 18px ${theme.glow}`,
        }}
      >
        <Download className="w-4 h-4" />
        <span>Install Gym Freak App</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuide(true)}
        className={`${
          compact ? 'min-h-[40px] px-3.5 text-xs' : 'w-full min-h-[46px] px-4 text-xs'
        } rounded-2xl bg-[#1A1D28] border border-white/10 hover:border-white/25 font-semibold text-white/90 flex items-center justify-center gap-2 transition-colors`}
      >
        <Smartphone className="w-4 h-4" style={{ color: theme.secondary }} />
        <span>{isIOS ? 'Install on iPhone / iPad' : 'Install as Standalone App'}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-3"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowGuide(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[380px] bg-[#12141C] border border-white/12 rounded-3xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" style={{ color: theme.primary }} />
                <h3 className="text-base font-bold text-white">Install Gym Freak</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close install instructions"
                className="min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-2.5 text-xs text-white/75 leading-relaxed">
                <p>1. Tap the <strong className="text-white inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 inline" /> Share</strong> button in Safari&apos;s bottom toolbar.</p>
                <p>2. Scroll down and select <strong className="text-white">Add to Home Screen</strong>.</p>
                <p>3. Tap <strong className="text-white">Add</strong> to launch Gym Freak full-screen without browser bars.</p>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-white/75 leading-relaxed">
                <p>1. Open your browser menu (<strong className="text-white">⋮</strong> in Chrome or Edge).</p>
                <p>2. Tap <strong className="text-white">Install app</strong> or <strong className="text-white">Add to Home screen</strong>.</p>
                <p>3. Launch Gym Freak directly from your home screen in standalone mode.</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full min-h-[44px] rounded-2xl text-xs font-semibold text-white"
              style={{ background: theme.gradientCss }}
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
