interface CrownIconProps {
  className?: string;
  filled?: boolean;
}

export default function CrownIcon({ className = 'w-5 h-5', filled = true }: CrownIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      className={className}
    >
      <path d="M12 2L15 8L22 9L17 14L18 21H6L7 14L2 9L9 8L12 2Z" />
    </svg>
  );
}

// Crown rating component (replacement for stars)
interface CrownRatingProps {
  count?: number;
  className?: string;
}

export function CrownRating({ count = 5, className = '' }: CrownRatingProps) {
  return (
    <div className={`flex gap-1 text-gold ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CrownIcon key={i} className="w-4 h-4" />
      ))}
    </div>
  );
}
