import { useState } from 'react';
import type { Gender } from '../types/kinetix';
import { resolveTheme } from '../services/theme';

interface AthleteAvatarProps {
  name: string;
  avatarUrl: string;
  gender: Gender;
  sizeClass?: string;
  ring?: boolean;
}

export function AthleteAvatar({
  name,
  avatarUrl,
  gender,
  sizeClass = 'w-10 h-10',
  ring = true,
}: AthleteAvatarProps) {
  const [failed, setFailed] = useState(false);
  const theme = resolveTheme(gender);
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className={`${sizeClass} rounded-full overflow-hidden shrink-0 flex items-center justify-center relative bg-[#1A1D28]`}
      style={
        ring
          ? {
              boxShadow: `0 0 0 1.5px ${theme.primary}, 0 0 14px ${theme.glow}`,
            }
          : undefined
      }
    >
      {!failed && avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${name} athletic portrait`}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover object-top"
        />
      ) : (
        <span
          className="text-xs font-semibold tracking-wide text-white"
          style={{
            background: theme.gradientCss,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {initials || 'KX'}
        </span>
      )}
    </div>
  );
}
