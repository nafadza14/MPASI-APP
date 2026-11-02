/** Ilustrasi orisinal: mangkuk MPASI dengan sendok, uap, dan daun. */
export function BowlIllustration({ className = "w-64" }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 220" className={className} role="img" aria-label="Mangkuk MPASI">
      <circle cx="130" cy="112" r="96" fill="#e9f8f4" />
      <circle cx="56" cy="52" r="10" fill="#fff4e6" />
      <circle cx="214" cy="70" r="7" fill="#fff4e6" />
      <path d="M96 52c-8-10 8-16 0-28M130 46c-8-10 8-16 0-28M164 52c-8-10 8-16 0-28" stroke="#3cc7aa" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".5" />
      <path d="M190 108c18-30 44-26 50-18-14 2-26 10-34 26z" fill="#3cc7aa" />
      <path d="M70 110c-18-30-44-26-50-18 14 2 26 10 34 26z" fill="#23b496" />
      <ellipse cx="130" cy="98" rx="78" ry="16" fill="#ffad3b" />
      <circle cx="104" cy="94" r="9" fill="#fb9a1b" />
      <circle cx="148" cy="92" r="11" fill="#fff" opacity=".85" />
      <circle cx="126" cy="100" r="6" fill="#23b496" />
      <circle cx="166" cy="102" r="5" fill="#e8850a" />
      <path d="M52 100h156c0 50-36 82-78 82s-78-32-78-82z" fill="#23b496" />
      <path d="M52 100h156c-1 8-3 15-6 22H58c-3-7-5-14-6-22z" fill="#1b9a80" />
      <rect x="98" y="178" width="64" height="12" rx="6" fill="#1b9a80" />
      <path d="M86 140c10 8 26 12 44 12" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".5" />
      <rect x="168" y="40" width="12" height="80" rx="6" transform="rotate(28 174 80)" fill="#fff" stroke="#edf0f3" strokeWidth="2" />
      <ellipse cx="196" cy="40" rx="14" ry="20" transform="rotate(28 196 40)" fill="#fff" stroke="#edf0f3" strokeWidth="2" />
    </svg>
  );
}
