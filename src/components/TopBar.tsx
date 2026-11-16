import { useState } from 'react';
import { Bell, ChevronDown, Flame, LogOut, Plus, RefreshCw, X } from 'lucide-react';
import type { ThemeTokens, UserProfile } from '../types/kinetix';
import { isSupabaseConfigured } from '../lib/supabase';
import { getShortGoalLabel } from '../services/theme';
import { AthleteAvatar } from './AthleteAvatar';

interface TopBarProps {
  activeUser: UserProfile;
  allUsers: UserProfile[];
  theme: ThemeTokens;
  onSwitchUser: (userId: string) => void;
  onAddNewAthlete: () => void;
  onSignOut: () => void;
  onMarkNotificationsRead: () => void;
}

export function TopBar({
  activeUser,
  allUsers,
  theme,
  onSwitchUser,
  onAddNewAthlete,
  onSignOut,
  onMarkNotificationsRead,
}: TopBarProps) {
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const firstName = activeUser.name.trim().split(/\s+/)[0] || activeUser.name;
  const unreadCount = activeUser.notifications.filter((n) => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-40 px-4 py-2.5 bg-[#090A0F]/85 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Avatar + Greeting + Goal Tag */}
          <div className="flex items-center gap-2.5 min-w-0">
            <AthleteAvatar
              name={activeUser.name}
              avatarUrl={activeUser.avatarUrl}
              gender={activeUser.gender}
              sizeClass="w-9 h-9"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-bold text-white truncate">
                  Hey, {firstName}
                </span>
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

          {/* Right: Quick Switcher (offline demo only) + Streak + Notification Bell */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isSupabaseConfigured() && (
              <button
                type="button"
                onClick={() => {
                  setSwitcherOpen((v) => !v);
                  setNotifOpen(false);
                }}
                aria-label="Switch athlete profile"
                className="min-h-[38px] px-2.5 rounded-xl bg-[#1A1D28] border border-white/10 hover:border-white/25 text-xs font-medium text-white/85 flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" style={{ color: theme.secondary }} />
                <ChevronDown className="w-3 h-3 text-white/50" />
              </button>
            )}

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
                setSwitcherOpen(false);
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
      </header>

      {/* Quick User Switcher Drawer */}
      {switcherOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex justify-center items-start pt-16 px-4">
          <div className="w-full max-w-[398px] bg-[#12141C] border border-white/12 rounded-3xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Switch Athlete</h3>
              <button
                type="button"
                onClick={() => setSwitcherOpen(false)}
                aria-label="Close switcher"
                className="min-w-[36px] min-h-[36px] rounded-xl flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {allUsers.map((u) => {
                const isActive = u.id === activeUser.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      onSwitchUser(u.id);
                      setSwitcherOpen(false);
                    }}
                    className={`w-full min-h-[52px] p-2.5 rounded-2xl flex items-center justify-between border transition-all text-left ${
                      isActive
                        ? 'bg-[#1A1D28] border-white/25'
                        : 'bg-[#1A1D28]/50 border-white/[0.06] hover:border-white/20'
                    }`}
                    style={isActive ? { borderColor: theme.primary } : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AthleteAvatar
                        name={u.name}
                        avatarUrl={u.avatarUrl}
                        gender={u.gender}
                        sizeClass="w-9 h-9"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                        <p className="text-[11px] text-white/55 truncate">
                          {getShortGoalLabel(u.goal)} · {u.streakDays}d streak
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-lg whitespace-nowrap"
                        style={{ backgroundColor: theme.softBg, color: theme.secondary }}
                      >
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setSwitcherOpen(false);
                  onAddNewAthlete();
                }}
                className="min-h-[44px] rounded-2xl bg-[#1A1D28] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 hover:border-white/25"
              >
                <Plus className="w-3.5 h-3.5" style={{ color: theme.secondary }} />
                <span>New Profile</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSwitcherOpen(false);
                  onSignOut();
                }}
                className="min-h-[44px] rounded-2xl bg-[#1A1D28] border border-white/10 text-xs font-semibold text-white/75 flex items-center justify-center gap-1.5 hover:text-white"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Auth Screen</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
