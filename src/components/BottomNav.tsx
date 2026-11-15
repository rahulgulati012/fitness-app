import { BarChart3, Dumbbell, Home, User, Users } from 'lucide-react';
import type { TabKey, ThemeTokens } from '../types/kinetix';

interface BottomNavProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  theme: ThemeTokens;
}

const NAV_ITEMS: { key: TabKey; label: string; Icon: typeof Home }[] = [
  { key: 'home', label: 'Home', Icon: Home },
  { key: 'workout', label: 'Workout', Icon: Dumbbell },
  { key: 'progress', label: 'Progress', Icon: BarChart3 },
  { key: 'squad', label: 'Squad', Icon: Users },
  { key: 'profile', label: 'Profile', Icon: User },
];

export function BottomNav({ activeTab, onSelectTab, theme }: BottomNavProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-4 left-3 right-3 z-50 max-w-[406px] mx-auto bg-[#12141C]/92 backdrop-blur-xl border border-white/[0.1] rounded-3xl px-1.5 py-1.5 shadow-2xl"
      style={{ boxShadow: '0 14px 36px rgba(0, 0, 0, 0.65)' }}
    >
      <div className="grid grid-cols-5 items-center gap-0.5">
        {NAV_ITEMS.map(({ key, label, Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectTab(key)}
              className="relative min-h-[48px] rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-[0.96]"
            >
              {isActive && (
                <span
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    backgroundColor: theme.softBg,
                    border: `1px solid ${theme.borderAccent}`,
                    boxShadow: `0 0 18px ${theme.glow}`,
                  }}
                />
              )}
              <Icon
                className="w-[18px] h-[18px] relative z-10 transition-colors"
                style={{ color: isActive ? theme.secondary : 'rgba(255,255,255,0.55)' }}
              />
              <span
                className="text-[10px] font-semibold tracking-tight relative z-10 whitespace-nowrap"
                style={{ color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)' }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
