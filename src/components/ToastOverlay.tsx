import { AnimatePresence, motion } from 'motion/react';
import { Bell, Flame, Sparkles, X, Zap } from 'lucide-react';
import type { ThemeTokens, ToastMessage } from '../types/kinetix';

interface ToastOverlayProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  theme: ThemeTokens;
}

export function ToastOverlay({ toasts, onDismiss, theme }: ToastOverlayProps) {
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[406px] z-[10001] pointer-events-none flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon =
            toast.category === 'hype'
              ? Zap
              : toast.category === 'alert'
                ? Bell
                : toast.category === 'success'
                  ? Flame
                  : Sparkles;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto bg-[#12141C]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3"
              style={{ boxShadow: `0 12px 28px rgba(0,0,0,0.5), 0 0 18px ${theme.glow}` }}
            >
              <div
                className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white"
                style={{ background: theme.gradientCss }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{toast.title}</p>
                <p className="text-xs text-white/75 leading-snug mt-0.5">{toast.body}</p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss alert"
                className="min-w-[32px] min-h-[32px] rounded-lg flex items-center justify-center text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
