import { getAssetUrl } from '../services/api.ts';
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  customLogoUrl?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  customLogoUrl,
  onClick,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-16 h-16 rounded-3xl',
    xl: 'w-24 h-24 rounded-3xl',
  };

  if (customLogoUrl) {
    return (
      <div
        onClick={onClick}
        className={`relative overflow-hidden shrink-0 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 flex items-center justify-center bg-slate-900 ${sizeClasses[size]} ${className}`}
      >
        <img
          src={getAssetUrl(customLogoUrl)}
          alt="Site Logo"
          className="w-full h-full object-contain p-1"
        />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative shrink-0 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300 ${sizeClasses[size]} ${className}`}
    >
      <img
        src="/logo.svg"
        alt="Eng. Moaz El Shazly"
        className="w-full h-full object-contain drop-shadow-md"
      />
    </div>
  );
};
