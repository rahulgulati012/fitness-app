import { useState } from 'react';
import { Bell, Flame, X } from 'lucide-react';
import type { ThemeTokens, UserProfile } from '../types/kinetix';
import type { SupabaseConnectionStatus } from '../services/supabaseSync';
import { getShortGoalLabel } from '../services/theme';
import { AthleteAvatar } from './AthleteAvatar';
import { GymFreakLogo } from './GymFreakLogo';

interface TopBarProps {
  activeUser: UserProfile;
  theme: ThemeTokens;
  connectionStatus: SupabaseConnectionStatus;
  onMarkNotificationsRead: () => void;
}

export function TopBar({
  activeUser,
  theme,
  connectionStatus,
  onMarkNotificationsRead,
}: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const firstName = activeUser.name.trim().split(/\s+/)[0] || activeUser.name;
  const unreadCount = activeUser.notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-40 px-4 py-2.5 bg-[#090A0F]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Gym Freak Barbell Logo + Greeting + Cloud Synced Pill + Goal Tag */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative shrink-0">
              <GymFreakLogo className="w-9 h-9" />
              <div className="absolute -bottom-1 -right-1 ring-2 ring-[#090A0F] rounded-full">
                <AthleteAvatar
                  name={activeUser.name}
                  avatarUrl={activeUser.avatarUrl}
                  gender={activeUser.gender}
                  sizeClass="w-4 h-4"
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <span className="text-xs font-extrabold tracking-tight text-white uppercase whitespace-nowrap">
                  Gym Freak
                </span>
                <span className="text-[11px] font-medium text-white/60 truncate">
                  · {firstName}
                </span>
                <button
                  type="button"
                  onClick={() => setStatusOpen((v) => !v)}
                  title={connectionStatus.detail}
                  aria-label={`Sync status: Cloud Synced. ${connectionStatus.detail}`}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold border whitespace-nowrap transition-colors bg-white/[0.05] border-white/15 text-white/85"
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-400" />
                  <span>Cloud Synced</span>
                </button>
              </div>
              <span
                className="inline-block text-[10px] font-semibold tracking-tight whitespace-nowrap px-2 py-0.5 rounded-full mt-0.5"
                style={{
                  backgroundColor: theme.softBg,
                  color: theme.secondary,
                  border: `1px solid ${theme.borderAccent}`,
                }}
              >
                {getShortGoalLabel(activeUser.goal)}
              </span>
            </div>
          </div>

          {/* Right: Streak + Notification Bell */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className="min-h-[38px] px-2.5 rounded-xl bg-[#1A1D28] border border-white/10 flex items-center gap-1 text-xs font-semibold font-mono-tabular whitespace-nowrap shrink-0"
              title="Active training streak"
            >
              <Flame className="w-3.5 h-3.5" style={{ color: theme.primary }} />
              <span className="text-white">{activeUser.streakDays}d</span>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !notifOpen;
                setNotifOpen(next);
                if (next && unreadCount > 0) {
                  onMarkNotificationsRead();
                }
              }}
              aria-label="Notifications"
              className="relative min-w-[38px] min-h-[38px] rounded-xl bg-[#1A1D28] border border-white/10 hover:border-white/25 flex items-center justify-center text-white/85 transition-colors shrink-0"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                />
              )}
            </button>
          </div>
        </div>
        {statusOpen && (
          <div className="mt-2 px-3 py-2 rounded-xl bg-[#1A1D28] border border-white/10 flex items-start justify-between gap-2 text-[11px] text-white/80">
            <span className="leading-snug">{connectionStatus.detail}</span>
            <button
              type="button"
              onClick={() => setStatusOpen(false)}
              aria-label="Dismiss sync status"
              className="text-white/50 hover:text-white shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </header>

      {/* Notifications Drawer */}
      {notifOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex justify-center items-start pt-16 px-4">
          <div className="w-full max-w-[398px] bg-[#12141C] border border-white/12 rounded-3xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Athlete Alerts & Hype</h3>
              <button
                type="button"
                onClick={() => setNotifOpen(false)}
                aria-label="Close notifications"
                className="min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeUser.notifications.length === 0 ? (
              <p className="text-xs text-white/55 py-6 text-center">
                All caught up. Trigger smart pings in Profile to preview alerts.
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {activeUser.notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-2xl bg-[#1A1D28]/80 border border-white/[0.06] space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                      <span className="text-[10px] text-white/45 whitespace-nowrap">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
