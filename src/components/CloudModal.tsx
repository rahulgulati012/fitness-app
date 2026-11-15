import { useState } from 'react';
import { Check, Copy, Database, X } from 'lucide-react';
import { SUPABASE_SCHEMA_SQL } from '../services/db';
import type { ThemeTokens } from '../types/kinetix';

interface CloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeTokens;
}

export function CloudModal({ isOpen, onClose, theme }: CloudModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cloud-modal-title"
    >
      <div className="w-full max-w-[406px] bg-[#12141C] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: theme.softBg, color: theme.primary }}
            >
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 id="cloud-modal-title" className="text-base font-semibold text-white">
                Cloud & Supabase Setup
              </h2>
              <p className="text-xs text-white/55">PostgreSQL schema & RLS policies</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-xs leading-relaxed text-white/70">
            KINETIX runs zero-config locally with multi-user persistence. To connect a live Supabase
            project in production, execute this schema in the Supabase SQL Editor.
          </p>

          <div className="bg-[#090A0F] border border-white/10 rounded-2xl p-3.5 max-h-[300px] overflow-auto">
            <pre className="text-[11px] leading-relaxed font-mono text-white/80 whitespace-pre">
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/[0.08] flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 min-h-[44px] rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            style={{
              background: theme.gradientCss,
              boxShadow: `0 6px 20px ${theme.glow}`,
            }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>SQL Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy SQL Schema</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 rounded-2xl bg-[#1A1D28] border border-white/10 text-sm font-medium text-white/80 hover:text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
