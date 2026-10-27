import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isOnline?: boolean;
  hasStory?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  isOnline,
  hasStory = false,
  className = '',
  onClick,
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
  }[size];

  const onlineDotSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-6 h-6',
  }[size];

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Color generator for fallback background
  const getBgColor = (text: string) => {
    const colors = [
      'bg-teal-600',
      'bg-emerald-600',
      'bg-cyan-600',
      'bg-indigo-600',
      'bg-sky-600',
      'bg-slate-600',
    ];
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-block select-none flex-shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div
        className={`rounded-full overflow-hidden flex items-center justify-center font-semibold text-white shadow-sm transition-transform ${
          hasStory
            ? 'p-0.5 ring-2 ring-[#00A884] ring-offset-2 dark:ring-offset-[#111B21]'
            : ''
        } ${sizeClasses}`}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${getBgColor(name)}`}>
            {initials || '?'}
          </div>
        )}
      </div>

      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-[#111B21] ${onlineDotSizes} ${
            isOnline ? 'bg-[#25D366]' : 'bg-gray-400'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};
