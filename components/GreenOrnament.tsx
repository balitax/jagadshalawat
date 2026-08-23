export function GreenOrnament({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <rect x="30" y="30" width="40" height="40" rx="1" />
      <rect x="30" y="30" width="40" height="40" rx="1" transform="rotate(45 50 50)" />
      <circle cx="50" cy="50" r="22" />
      <circle cx="50" cy="50" r="5" />
    </svg>
  );
}
