"use client";

interface QuillifyLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function QuillifyLogo({ size = 36, showText = true, className = "" }: QuillifyLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="relative flex-shrink-0"
      >
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
          <rect width="36" height="36" rx="9" fill="#6366F1" />
          <path
            d="M27 6C27 6 20 8.5 15.5 15C11 21.5 11 29.5 11 29.5C11 29.5 13.5 26 17 23.5C17 23.5 14.5 24.5 13.5 27C13.5 27 18 22.5 20.5 19C18.5 20 16 21.5 16 21.5C16 21.5 19.5 17 23.5 13.5C23.5 13.5 21 14.5 19 16C19 16 22.5 11.5 27 6Z"
            fill="white"
          />
          <path d="M11 29.5L12.5 25L15 27.5L11 29.5Z" fill="#F59E0B" />
          <circle cx="29" cy="7" r="2.5" fill="#F59E0B" opacity="0.85" />
        </svg>
      </div>
      {showText && (
        <span
          style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: size * 0.72, lineHeight: 1 }}
          className="font-semibold text-indigo-900 tracking-tight"
        >
          Quillify
        </span>
      )}
    </div>
  );
}
