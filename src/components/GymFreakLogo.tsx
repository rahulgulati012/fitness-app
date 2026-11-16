interface GymFreakLogoProps {
  className?: string;
}

export function GymFreakLogo({ className = 'w-8 h-8' }: GymFreakLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gf-logo-bar" x1="6" y1="32" x2="58" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF2E63" />
          <stop offset="50%" stopColor="#FF5454" />
          <stop offset="100%" stopColor="#FF8C42" />
        </linearGradient>
        <linearGradient id="gf-logo-plate" x1="0" y1="14" x2="0" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#232634" />
          <stop offset="55%" stopColor="#10121A" />
          <stop offset="100%" stopColor="#08090D" />
        </linearGradient>
        <linearGradient id="gf-logo-rim" x1="0" y1="14" x2="0" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF2E63" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FF8C42" />
        </linearGradient>
      </defs>

      <rect width="64" height="64" rx="16" fill="#0B0C12" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="21" fill="#FF2E63" fillOpacity="0.16" />

      {/* Glowing barbell shaft */}
      <rect x="6" y="29.5" width="52" height="5" rx="2.5" fill="url(#gf-logo-bar)" />
      <rect x="23" y="30" width="18" height="4" rx="1" fill="#171923" stroke="url(#gf-logo-bar)" strokeWidth="0.9" />

      {/* Left heavy matte-black plates */}
      <rect x="8.5" y="19" width="5.5" height="26" rx="2.2" fill="url(#gf-logo-plate)" stroke="#2F3347" strokeWidth="1.1" />
      <rect x="15" y="14" width="7" height="36" rx="2.6" fill="url(#gf-logo-plate)" stroke="url(#gf-logo-rim)" strokeWidth="1.2" />
      <rect x="17" y="18" width="1.6" height="28" rx="0.8" fill="#FF2E63" fillOpacity="0.9" />
      <rect x="22.5" y="27" width="2.5" height="10" rx="1" fill="#232635" stroke="#FF2E63" strokeWidth="0.8" />

      {/* Right heavy matte-black plates */}
      <rect x="39" y="27" width="2.5" height="10" rx="1" fill="#232635" stroke="#FF8C42" strokeWidth="0.8" />
      <rect x="42" y="14" width="7" height="36" rx="2.6" fill="url(#gf-logo-plate)" stroke="url(#gf-logo-rim)" strokeWidth="1.2" />
      <rect x="45.4" y="18" width="1.6" height="28" rx="0.8" fill="#FF8C42" fill-opacity="0.9" />
      <rect x="50" y="19" width="5.5" height="26" rx="2.2" fill="url(#gf-logo-plate)" stroke="#2F3347" strokeWidth="1.1" />
    </svg>
  );
}
