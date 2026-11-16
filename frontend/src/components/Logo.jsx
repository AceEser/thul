export default function Logo({ size = 34 }) {
  return (
    <span className="logo" aria-label="THUL">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="thulg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8b5cf6" /><stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill="url(#thulg)" />
        <path d="M17 21h30M32 21v26" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx="47" cy="47" r="4" fill="#fff" opacity=".85" />
      </svg>
      <span className="logo-text">THUL</span>
    </span>
  );
}
