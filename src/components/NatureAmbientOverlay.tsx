import React, { useMemo } from 'react';

interface NatureAmbientOverlayProps {
  natureElements: string[];
  className?: string;
}

export const NatureAmbientOverlay: React.FC<NatureAmbientOverlayProps> = ({
  natureElements,
  className = '',
}) => {
  if (!natureElements || natureElements.length === 0) return null;

  // Map nature IDs/names to emoji icons and colors
  const getParticleIcons = (idOrName: string): string[] => {
    const key = idOrName.toLowerCase();
    if (key.includes('flower')) return ['🌸', '🌺', '🌼', '🌷'];
    if (key.includes('twinkling') || key.includes('star')) return ['✨', '⭐', '🌟'];
    if (key.includes('shooting')) return ['🌠', '💫', '✨'];
    if (key.includes('paw')) return ['🐾', '🐾', '🐾'];
    if (key.includes('rain')) return ['💧', '🌧️', '💧'];
    if (key.includes('leaf') || key.includes('leaves')) return ['🍃', '🌿', '🍂'];
    if (key.includes('wind')) return ['💨', '🍃', '🎐'];
    if (key.includes('cloud')) return ['☁️', '🌤️', '☁️'];
    if (key.includes('sunset')) return ['🌅', '✨', '🌇'];
    if (key.includes('water')) return ['💧', '🌊', '💧'];
    if (key.includes('rainbow')) return ['🌈', '✨'];
    return ['✨', '🌸'];
  };

  // Generate 16 stable random floating particles
  const particles = useMemo(() => {
    const activeIcons: string[] = [];
    natureElements.forEach((elem) => {
      activeIcons.push(...getParticleIcons(elem));
    });

    if (activeIcons.length === 0) return [];

    return Array.from({ length: 18 }).map((_, i) => {
      const icon = activeIcons[i % activeIcons.length];
      const left = (i * 17 + 5) % 95;
      const top = (i * 23 + 10) % 90;
      const size = 16 + (i % 4) * 6;
      const duration = 6 + (i % 5) * 3;
      const delay = (i % 6) * 0.8;

      return { id: i, icon, left, top, size, duration, delay };
    });
  }, [natureElements]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-20 overflow-hidden ${className}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-float-ambient opacity-75 transition-opacity"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            fontSize: `${p.size}px`,
            animation: `floatAmbient ${p.duration}s ease-in-out infinite alternate`,
            animationDelay: `${p.delay}s`,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        >
          {p.icon}
        </div>
      ))}
    </div>
  );
};
