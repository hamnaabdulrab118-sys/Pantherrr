import React from 'react';

interface BouquetVisualizerProps {
  flowers: string[];
  wrapStyle: string;
  miniLetterText?: string;
  className?: string;
}

export const BouquetVisualizer: React.FC<BouquetVisualizerProps> = ({
  flowers,
  wrapStyle,
  miniLetterText,
  className = '',
}) => {
  const speciesMap: Record<
    string,
    { type: string; c1: string; c2: string; c3: string; center?: string }
  > = {
    Roses: { type: 'rose', c1: '#ff4d6d', c2: '#c9184a', c3: '#590d22', center: '#800020' },
    Sunflowers: { type: 'sunflower', c1: '#ffb703', c2: '#fb8500', c3: '#d4a373', center: '#3a1e05' },
    Daisies: { type: 'daisy', c1: '#ffffff', c2: '#f0ebd8', c3: '#e2ece9', center: '#ffb703' },
    Tulips: { type: 'tulip', c1: '#ff758f', c2: '#ff4d6d', c3: '#a4133c', center: '#590d22' },
    Lavender: { type: 'lavender', c1: '#b8c0ff', c2: '#8e9aaf', c3: '#70d6ff', center: '#513b56' },
    Peonies: { type: 'peony', c1: '#ffccd5', c2: '#ffb3c1', c3: '#ff4d6d', center: '#c9184a' },
    Hydrangeas: { type: 'hydrangea', c1: '#a2d2ff', c2: '#bde0fe', c3: '#72efdd', center: '#0077b6' },
    Lilies: { type: 'lily', c1: '#fff0f3', c2: '#ffccd5', c3: '#ff758f', center: '#c9184a' },
    Orchids: { type: 'orchid', c1: '#e0aaff', c2: '#c77dff', c3: '#9d4edd', center: '#5a189a' },
    'Cherry Blossoms': { type: 'cherry', c1: '#ffcad4', c2: '#b5e2fa', c3: '#f72585', center: '#d90429' },
  };

  const selectedSpecies = flowers.length > 0 ? flowers : ['Roses'];

  // Wrap styling configurations
  const getWrapDetails = () => {
    switch (wrapStyle) {
      case 'Navy Ribbon Bundle':
        return { paperColor: '#000d20', foldColor: '#0b2340', ribbonColor: '#e7c08a', highlight: '#1d3557' };
      case 'Wildflower Loose Bunch':
        return { paperColor: '#d4a373', foldColor: '#bc6c25', ribbonColor: '#283618', highlight: '#e9edc9' };
      case 'Minimal Single Stem':
        return { paperColor: '#f4ede4', foldColor: '#e8ded2', ribbonColor: '#7c5357', highlight: '#ffffff' };
      case 'Classic Wrap':
      default:
        return { paperColor: '#e0c9a6', foldColor: '#cdaf83', ribbonColor: '#7c5357', highlight: '#fdf0d5' };
    }
  };

  const wrap = getWrapDetails();

  // Positions up to 12 flowers in a lush arching bouquet arrangement
  const flowerPositions = [
    { x: 150, y: 110, scale: 1.25, rot: 0, z: 10 },
    { x: 105, y: 135, scale: 1.1, rot: -18, z: 8 },
    { x: 195, y: 135, scale: 1.1, rot: 18, z: 8 },
    { x: 70, y: 170, scale: 0.95, rot: -30, z: 6 },
    { x: 230, y: 170, scale: 0.95, rot: 30, z: 6 },
    { x: 150, y: 165, scale: 1.15, rot: 4, z: 9 },
    { x: 115, y: 85, scale: 0.95, rot: -12, z: 7 },
    { x: 185, y: 85, scale: 0.95, rot: 12, z: 7 },
    { x: 80, y: 110, scale: 0.9, rot: -22, z: 5 },
    { x: 220, y: 110, scale: 0.9, rot: 22, z: 5 },
    { x: 150, y: 60, scale: 0.95, rot: -2, z: 8 },
    { x: 135, y: 190, scale: 1.0, rot: -8, z: 9 },
  ];

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 300 390"
        className="w-full h-full max-h-[390px] drop-shadow-2xl overflow-visible"
      >
        <defs>
          {/* Rich Petal & Leaf Gradients */}
          <linearGradient id="roseRedGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff4d6d" />
            <stop offset="45%" stopColor="#c9184a" />
            <stop offset="100%" stopColor="#590d22" />
          </linearGradient>

          <linearGradient id="roseInnerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff758f" />
            <stop offset="100%" stopColor="#a4133c" />
          </linearGradient>

          <linearGradient id="leafGrad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#74c69d" />
            <stop offset="50%" stopColor="#40916c" />
            <stop offset="100%" stopColor="#1b4332" />
          </linearGradient>

          <linearGradient id="leafGrad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#95d5b2" />
            <stop offset="100%" stopColor="#2d6a4f" />
          </linearGradient>

          <linearGradient id="stemGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#52b788" />
            <stop offset="100%" stopColor="#1b4332" />
          </linearGradient>

          <radialGradient id="sunflowerCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2b1704" />
            <stop offset="70%" stopColor="#422006" />
            <stop offset="100%" stopColor="#170d02" />
          </radialGradient>

          <filter id="bloomShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.25" />
          </filter>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* 1. BACK DROP LUSH LEAVES */}
        <g id="lush-leaves">
          <path d="M 150 210 C 80 140 20 160 40 90 C 80 120 130 180 150 210 Z" fill="url(#leafGrad1)" />
          <path d="M 150 210 C 220 140 280 160 260 90 C 220 120 170 180 150 210 Z" fill="url(#leafGrad1)" />
          <path d="M 150 180 C 100 100 50 50 95 20 C 120 50 145 130 150 180 Z" fill="url(#leafGrad2)" opacity="0.9" />
          <path d="M 150 180 C 200 100 250 50 205 20 C 180 50 155 130 150 180 Z" fill="url(#leafGrad2)" opacity="0.9" />
          <path d="M 150 160 C 130 70 120 20 150 5 C 180 20 170 70 150 160 Z" fill="url(#leafGrad1)" opacity="0.85" />
        </g>

        {/* 2. STEM BUNDLE */}
        <g id="stems" stroke="url(#stemGrad)" strokeWidth="5" strokeLinecap="round">
          <path d="M 150 190 Q 142 260 138 330" />
          <path d="M 120 190 Q 132 260 145 330" />
          <path d="M 180 190 Q 168 260 155 330" />
          <path d="M 90 200 Q 125 260 140 320" />
          <path d="M 210 200 Q 175 260 160 320" />
        </g>

        {/* 3. FLOWER HEADS */}
        <g id="flower-heads" filter="url(#bloomShadow)">
          {selectedSpecies.slice(0, 12).map((flowerName, idx) => {
            const pos = flowerPositions[idx % flowerPositions.length];
            const species = speciesMap[flowerName] || speciesMap.Roses;

            return (
              <g
                key={`${flowerName}-${idx}`}
                transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rot}) scale(${pos.scale})`}
              >
                {/* LUSH MULTI-LAYERED GARDEN ROSE */}
                {species.type === 'rose' && (
                  <g className="rose-flower">
                    {/* Outer Deep Red Guard Petals */}
                    <path
                      d="M 0 -32 C 22 -32 36 -14 32 10 C 28 32 10 38 0 36 C -10 38 -28 32 -32 10 C -36 -14 -22 -32 0 -32 Z"
                      fill={species.c3}
                    />
                    <path
                      d="M -28 -14 C -34 10 -18 30 0 28 C 18 30 34 10 28 -14 C 20 -28 -20 -28 -28 -14 Z"
                      fill={species.c2}
                    />

                    {/* Middle Bloom Petals */}
                    <path
                      d="M -22 -18 C -26 -2 -14 20 0 20 C 14 20 26 -2 22 -18 C 14 -26 -14 -26 -22 -18 Z"
                      fill="url(#roseRedGrad)"
                    />
                    <path
                      d="M -18 -8 C -22 8 -8 18 0 16 C 8 18 22 8 18 -8 C 10 -20 -10 -20 -18 -8 Z"
                      fill={species.c1}
                    />

                    {/* Inner Swirl Petal Layer */}
                    <path
                      d="M -12 -12 C -18 2 -6 12 0 12 C 6 12 18 2 12 -12 C 4 -18 -4 -18 -12 -12 Z"
                      fill="url(#roseInnerGrad)"
                    />

                    {/* Rose Heart Center Spiral */}
                    <path
                      d="M -8 -4 Q 0 -14 10 -6 Q 14 6 2 12 Q -10 10 -6 -2 Q -2 -10 6 -6"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      opacity="0.8"
                    />
                    <path
                      d="M -6 -2 Q 0 -10 8 -4 Q 10 4 2 8"
                      fill="none"
                      stroke="#ffccd5"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle cx="0" cy="0" r="4" fill="#590d22" />
                  </g>
                )}

                {/* GOLDEN SUNFLOWER */}
                {species.type === 'sunflower' && (
                  <g className="sunflower">
                    {/* Double Ring Petals */}
                    {Array.from({ length: 16 }).map((_, i) => (
                      <path
                        key={i}
                        d="M 0 0 C -6 -18 0 -30 0 -32 C 0 -30 6 -18 0 0 Z"
                        fill={i % 2 === 0 ? species.c1 : species.c2}
                        transform={`rotate(${i * (360 / 16)})`}
                      />
                    ))}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <path
                        key={`inner-${i}`}
                        d="M 0 0 C -4 -12 0 -22 0 -24 C 0 -22 4 -12 0 0 Z"
                        fill="#ffb703"
                        transform={`rotate(${i * 30 + 15})`}
                      />
                    ))}
                    <circle r="14" fill="url(#sunflowerCore)" />
                    <circle r="10" fill="#210f02" stroke="#ffb703" strokeWidth="1" strokeDasharray="2,2" />
                  </g>
                )}

                {/* PURE DAISY */}
                {species.type === 'daisy' && (
                  <g className="daisy">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <ellipse
                        key={i}
                        rx="5"
                        ry="22"
                        fill="#ffffff"
                        stroke="#e2ece9"
                        strokeWidth="1"
                        transform={`rotate(${i * (360 / 14)}) translate(0, -14)`}
                      />
                    ))}
                    <circle r="11" fill="#ffb703" />
                    <circle r="7" fill="#fb8500" opacity="0.8" />
                  </g>
                )}

                {/* SATIN TULIP */}
                {species.type === 'tulip' && (
                  <g className="tulip">
                    <path
                      d="M -20 12 C -26 -18 -12 -34 0 -34 C 12 -34 26 -18 20 12 C 14 28 -14 28 -20 12 Z"
                      fill={species.c3}
                    />
                    <path
                      d="M -16 8 C -22 -14 0 -30 0 -30 C 0 -30 22 -14 16 8 C 12 24 -12 24 -16 8 Z"
                      fill={species.c1}
                    />
                    <path
                      d="M -8 2 C -12 -12 0 -24 0 -24 C 0 -24 12 -12 8 2 C 5 14 -5 14 -8 2 Z"
                      fill="#ffffff"
                      opacity="0.5"
                    />
                  </g>
                )}

                {/* SPRIG OF LAVENDER */}
                {species.type === 'lavender' && (
                  <g className="lavender">
                    <line x1="0" y1="24" x2="0" y2="-42" stroke="#2d6a4f" strokeWidth="3" />
                    {[-36, -28, -20, -12, -4, 4].map((y, i) => (
                      <g key={i} transform={`translate(0, ${y})`}>
                        <circle cx="-7" cy="0" r="6" fill={species.c1} />
                        <circle cx="7" cy="0" r="6" fill={species.c2} />
                        <circle cx="0" cy="-4" r="5" fill="#5a189a" />
                      </g>
                    ))}
                  </g>
                )}

                {/* RUFFLED PEONY */}
                {species.type === 'peony' && (
                  <g className="peony">
                    <circle r="28" fill={species.c2} />
                    {Array.from({ length: 10 }).map((_, i) => (
                      <path
                        key={i}
                        d="M -16 -16 C -24 0 -6 24 14 18 C 24 8 16 -18 0 -18 Z"
                        fill={species.c1}
                        transform={`rotate(${i * 36})`}
                        opacity="0.85"
                      />
                    ))}
                    <circle r="10" fill="#fff0f3" />
                    <circle r="5" fill="#ff4d6d" />
                  </g>
                )}

                {/* HYDRANGEA BLOOM */}
                {species.type === 'hydrangea' && (
                  <g className="hydrangea">
                    <circle r="26" fill={species.c2} opacity="0.7" />
                    {[-14, 0, 14].map((dx, ix) =>
                      [-14, 0, 14].map((dy, iy) => (
                        <g key={`${ix}-${iy}`} transform={`translate(${dx}, ${dy})`}>
                          <circle cx="0" cy="0" r="6.5" fill={species.c1} />
                          <circle cx="0" cy="0" r="2" fill="#ffffff" />
                        </g>
                      ))
                    )}
                  </g>
                )}

                {/* EASTERN LILY */}
                {species.type === 'lily' && (
                  <g className="lily">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <path
                        key={i}
                        d="M 0 0 C -14 -18 -10 -34 0 -38 C 10 -34 14 -18 0 0 Z"
                        fill={species.c1}
                        stroke={species.c2}
                        strokeWidth="1.2"
                        transform={`rotate(${i * 60})`}
                      />
                    ))}
                    <circle r="7" fill={species.center} />
                    <circle r="3" fill="#ffffff" />
                  </g>
                )}

                {/* ELEGANT ORCHID */}
                {species.type === 'orchid' && (
                  <g className="orchid">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <ellipse
                        key={i}
                        rx="9"
                        ry="20"
                        fill={species.c1}
                        transform={`rotate(${i * 72}) translate(0, -14)`}
                      />
                    ))}
                    <circle r="9" fill={species.center} />
                    <circle r="4" fill="#ffffff" />
                  </g>
                )}

                {/* CHERRY BLOSSOM */}
                {species.type === 'cherry' && (
                  <g className="cherry">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <circle
                        key={i}
                        cx="0"
                        cy="-14"
                        r="10"
                        fill={species.c1}
                        transform={`rotate(${i * 72})`}
                      />
                    ))}
                    <circle r="7" fill={species.center} />
                    <circle r="3" fill="#ffffff" />
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* 4. SILK PAPER WRAP & RIBBON TIE */}
        <g id="bouquet-wrap">
          {/* Main Paper Outer Cone */}
          <path
            d="M 70 205 L 150 365 L 230 205 Q 150 230 70 205 Z"
            fill={wrap.paperColor}
            filter="url(#bloomShadow)"
          />
          {/* Paper Texture Highlight & Inner Folds */}
          <path d="M 60 195 L 150 365 L 110 210 Z" fill={wrap.foldColor} />
          <path d="M 240 195 L 150 365 L 190 210 Z" fill={wrap.foldColor} />
          <path d="M 75 205 L 150 360 L 150 220 Z" fill={wrap.highlight} opacity="0.35" />

          {/* TUCKED MINI LETTER CARD (If present) */}
          {miniLetterText && (
            <g transform="translate(112, 210) rotate(-7)">
              <rect x="0" y="0" width="76" height="52" rx="6" fill="#ffffff" stroke="#e8e2d9" strokeWidth="1.5" />
              <path d="M 0 0 L 38 28 L 76 0 Z" fill="#fdf0d5" stroke="#e8e2d9" strokeWidth="1" />
              <circle cx="38" cy="26" r="8" fill="#7c5357" />
              <text x="38" y="29.5" fontSize="9" textAnchor="middle" fill="#ffffff">💌</text>
            </g>
          )}

          {/* Ribbon Bow Tie */}
          <g transform="translate(150, 285)">
            <circle cx="0" cy="0" r="10" fill={wrap.ribbonColor} />
            <path d="M 0 0 C -28 -22 -38 6 -6 6 Z" fill={wrap.ribbonColor} />
            <path d="M 0 0 C 28 -22 38 6 6 6 Z" fill={wrap.ribbonColor} />
            <path d="M -2 5 Q -14 28 -20 38 Q -11 34 -2 5 Z" fill={wrap.ribbonColor} />
            <path d="M 2 5 Q 14 28 20 38 Q 11 34 2 5 Z" fill={wrap.ribbonColor} />
          </g>
        </g>
      </svg>
    </div>
  );
};
