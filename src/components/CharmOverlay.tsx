import React from 'react';

interface CharmOverlayProps {
  charms: string[];
  className?: string;
}

export const CharmOverlay: React.FC<CharmOverlayProps> = ({ charms, className = '' }) => {
  if (!charms || charms.length === 0) return null;

  const getCharmEmoji = (charmName: string): string => {
    const key = charmName.toLowerCase();
    if (key.includes('kiss')) return '💋';
    if (key.includes('hug')) return '🫂';
    if (key.includes('flower')) return '🌸';
    if (key.includes('ice') || key.includes('cream')) return '🍦';
    if (key.includes('coffee')) return '☕';
    if (key.includes('star')) return '⭐';
    if (key.includes('paw')) return '🐾';
    if (key.includes('flight') || key.includes('fly')) return '✈️';
    if (key.includes('note') || key.includes('mail')) return '💌';
    return '✨';
  };

  return (
    <div className={`flex flex-wrap gap-2 items-center justify-center ${className}`}>
      {charms.map((charm, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-[#e8e2d9] shadow-sm font-quicksand font-bold text-xs text-[#000d20] animate-bounce-gentle"
          style={{ animationDelay: `${idx * 0.15}s` }}
        >
          <span className="text-base">{getCharmEmoji(charm)}</span>
          <span>{charm}</span>
        </span>
      ))}
    </div>
  );
};
