import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface PasswordCardProps {
  platform: string;
  count: number;
  onClick: () => void;
}

export const PasswordCard: React.FC<PasswordCardProps> = ({
  platform,
  count,
  onClick,
}) => {
  // Using a favicon service for "real" icons
  const iconUrl = (platform || '').toLowerCase() === 'telegram'
    ? 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg'
    : `https://www.google.com/s2/favicons?domain=${(platform || '').toLowerCase()}.com&sz=128`;

  return (
    <div className="flex flex-col items-center gap-2 group relative">
      <div
        className="relative w-20 h-20 md:w-24 md:h-24 rounded-[22%] bg-white/10 border border-white/20 shadow-xl overflow-hidden cursor-pointer flex items-center justify-center group transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95"
        onClick={onClick}
      >
        <img 
          src={iconUrl} 
          alt={platform}
          className="w-12 h-12 md:w-14 md:h-14 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${platform}&background=random&color=fff&size=128`;
          }}
        />
        
        {count > 0 && (
          <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border border-white/20">
            {count}
          </div>
        )}
      </div>
      
      <div className="text-center max-w-[100px]">
        <p className="text-xs font-medium text-slate-800 dark:text-white/90 truncate">{platform}</p>
      </div>
    </div>
  );
};
