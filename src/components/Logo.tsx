/** Logo MPASI APP: huruf m yang kaki terakhirnya menjadi sendok bayi. */
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="24 34 208 196" className={className} aria-hidden="true">
      <g transform="translate(12 -28)">
        <path fill="#1b9a80" d="M31 206V128A45 45 0 0 1 108 96.4A45 45 0 0 1 185 128V172H159V128A19 19 0 0 0 121 128V206A13 13 0 0 1 95 206V128A19 19 0 0 0 57 128V206A13 13 0 0 1 31 206Z" />
        <ellipse fill="#fb9a1b" cx="172" cy="188" rx="30" ry="36" />
      </g>
    </svg>
  );
}

export function Logo({ size = 30, sub = true }: { size?: number; sub?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label="MPASI APP by Flourish Care">
      <LogoMark size={size} />
      <span className="leading-none">
        <span className="block text-[18px] font-bold tracking-tight text-teal-600">mpasi</span>
        {sub && <span className="block text-[10px] font-medium text-muted">by Flourish Care</span>}
      </span>
    </span>
  );
}
