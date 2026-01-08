interface QuillIconProps {
  className?: string;
}

export default function QuillIcon({ className = 'w-full h-full' }: QuillIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Feather quill with golden gradient */}
      <defs>
        <linearGradient id="quillGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8D5A3" />
          <stop offset="50%" stopColor="#C9A961" />
          <stop offset="100%" stopColor="#8B7332" />
        </linearGradient>
        <linearGradient id="quillHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8E7" />
          <stop offset="100%" stopColor="#E8D5A3" />
        </linearGradient>
      </defs>
      
      {/* Main feather body */}
      <path
        d="M52 4C52 4 48 8 44 14C40 20 36 28 32 36C28 44 24 50 20 54C16 58 12 60 12 60L14 58C18 54 24 46 30 36C36 26 42 16 46 10C50 4 52 4 52 4Z"
        fill="url(#quillGold)"
        stroke="#8B7332"
        strokeWidth="0.5"
      />
      
      {/* Feather spine/rachis */}
      <path
        d="M52 4C48 10 40 24 32 38C24 52 16 58 12 60"
        stroke="#8B7332"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Left barbs */}
      <path
        d="M48 8C44 12 40 16 38 20M44 14C40 18 36 24 34 28M40 20C36 26 32 32 30 36M36 28C32 34 28 40 26 44M32 36C28 42 24 48 22 50"
        stroke="url(#quillHighlight)"
        strokeWidth="0.75"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      
      {/* Right barbs */}
      <path
        d="M50 10C52 14 50 20 48 24M46 18C48 24 46 30 44 34M42 26C44 32 42 38 40 42M38 34C40 40 38 46 36 48M34 42C36 46 34 50 32 52"
        stroke="url(#quillHighlight)"
        strokeWidth="0.75"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      
      {/* Quill tip/nib */}
      <path
        d="M12 60L8 62L10 58L12 60Z"
        fill="#C9A961"
        stroke="#8B7332"
        strokeWidth="0.5"
      />
      
      {/* Ink drop hint */}
      <circle
        cx="7"
        cy="61"
        r="1.5"
        fill="#2C1810"
        opacity="0.4"
      />
    </svg>
  );
}
