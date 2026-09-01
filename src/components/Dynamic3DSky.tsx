import React from 'react';

interface Dynamic3DSkyProps {
  themeName?: string;
  className?: string;
}

export const Dynamic3DSky: React.FC<Dynamic3DSkyProps> = ({
  themeName = 'Midnight Sky',
  className = '',
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none rounded-3xl z-0 ${className}`}>
      {/* 3D Deep Space Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#03001e] via-[#7303c0] to-[#ec38bc] opacity-40 mix-blend-color-dodge animate-pulse-slow" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#000d20_0%,#02010a_100%)] opacity-90" />

      {/* Floating Glowing Moon */}
      <div className="absolute top-6 right-8 w-24 h-24 rounded-full bg-gradient-to-tr from-[#ffeedd] via-[#ffffff] to-[#fff3b0] shadow-[0_0_50px_rgba(255,238,221,0.8)] border border-white/40 animate-bounce-gentle">
        <div className="absolute top-3 left-4 w-5 h-5 rounded-full bg-[#e8ded2]/30" />
        <div className="absolute bottom-5 right-5 w-7 h-7 rounded-full bg-[#e8ded2]/25" />
      </div>

      {/* Shooting Stars (Animated SVG Lines) */}
      <div className="absolute inset-0">
        <div className="shooting-star top-12 left-1/4 w-32 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent transform -rotate-45 animate-shooting-star" />
        <div className="shooting-star top-28 left-2/3 w-40 h-[2px] bg-gradient-to-r from-transparent via-[#ffd166] to-transparent transform -rotate-45 animate-shooting-star" style={{ animationDelay: '1.8s' }} />
        <div className="shooting-star top-48 left-1/3 w-28 h-[2px] bg-gradient-to-r from-transparent via-[#b2c8ed] to-transparent transform -rotate-45 animate-shooting-star" style={{ animationDelay: '3.4s' }} />
      </div>

      {/* Twinkling Star Field */}
      <div className="absolute inset-0">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              top: `${(i * 17) % 90}%`,
              left: `${(i * 23) % 95}%`,
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              animationDelay: `${(i * 0.3).toFixed(1)}s`,
              boxShadow: i % 2 === 0 ? '0 0 6px rgba(255, 255, 255, 0.9)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Drifting Clouds Layer */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#000d20] to-transparent opacity-80" />
    </div>
  );
};
