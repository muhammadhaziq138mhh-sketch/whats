import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  }[size];

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl font-extrabold',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative ${dimensions} flex items-center justify-center`}>
        {/* Deep teal gradient background */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#0F534C] via-[#005C4B] to-[#10B981] shadow-md shadow-[#005C4B]/20 transform -rotate-3 transition-transform hover:rotate-0" />
        
        {/* Interlocking modern chat nodes icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative w-3/5 h-3/5 text-white"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M9 10h.01" />
          <path d="M12 10h.01" />
          <path d="M15 10h.01" />
        </svg>

        {/* Small fresh green live indicator dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#25D366] border-2 border-white dark:border-[#111B21]" />
      </div>

      {showText && (
        <span className={`${textSizes} font-bold tracking-tight bg-gradient-to-r from-[#0F534C] to-[#00A884] dark:from-[#25D366] dark:to-[#34D399] bg-clip-text text-transparent font-sans`}>
          Connectly
        </span>
      )}
    </div>
  );
};
