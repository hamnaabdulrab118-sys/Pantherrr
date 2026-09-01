export interface ThemeStyle {
  id: string;
  name: string;
  bgStyle: string;
  cardBgStyle: string;
  textPrimaryStyle: string;
  textAccentStyle: string;
  borderAccentStyle: string;
  headerBgStyle: string;
  accentColor: string;
}

export function getThemeStyle(themeName: string): ThemeStyle {
  const name = themeName ? themeName.toLowerCase() : '';

  if (name.includes('cosmos') || name.includes('nebula')) {
    return {
      id: 'deep-cosmos',
      name: 'Deep Cosmos 3D',
      bgStyle: 'bg-gradient-to-b from-[#0d0221] via-[#1a0836] to-[#050014] text-[#f1e8ff]',
      cardBgStyle: 'bg-[#150a2a]/90 backdrop-blur-md border-[#a259ff]/40 text-[#f1e8ff]',
      textPrimaryStyle: 'text-[#f1e8ff]',
      textAccentStyle: 'text-[#d8b4fe]',
      borderAccentStyle: 'border-[#a259ff]',
      headerBgStyle: 'bg-[#0d0221]/90 text-[#d8b4fe]',
      accentColor: '#a259ff',
    };
  }

  if (name.includes('starlight') || name.includes('lavender')) {
    return {
      id: 'starlight-lavender',
      name: 'Starlight Lavender',
      bgStyle: 'bg-gradient-to-b from-[#1b003a] via-[#2c0054] to-[#120026] text-[#f3e8ff]',
      cardBgStyle: 'bg-[#250244]/90 backdrop-blur-md border-[#c8b6ff]/40 text-[#f3e8ff]',
      textPrimaryStyle: 'text-[#f3e8ff]',
      textAccentStyle: 'text-[#e9d5ff]',
      borderAccentStyle: 'border-[#c8b6ff]',
      headerBgStyle: 'bg-[#1b003a]/90 text-[#e9d5ff]',
      accentColor: '#c8b6ff',
    };
  }

  if (name.includes('eclipse') || name.includes('obsidian') || name.includes('gold')) {
    return {
      id: 'eclipse-obsidian',
      name: 'Eclipse Obsidian & Gold',
      bgStyle: 'bg-gradient-to-b from-[#000d20] via-[#05172e] to-[#000814] text-[#fff8f0]',
      cardBgStyle: 'bg-[#0b2340]/90 backdrop-blur-md border-[#a68553]/50 text-[#fff8f0]',
      textPrimaryStyle: 'text-[#fff8f0]',
      textAccentStyle: 'text-[#e7c08a]',
      borderAccentStyle: 'border-[#a68553]',
      headerBgStyle: 'bg-[#000d20]/90 text-[#ffddb0]',
      accentColor: '#a68553',
    };
  }

  if (name.includes('aurora') || name.includes('pastel')) {
    return {
      id: 'pastel-aurora',
      name: 'Pastel Aurora',
      bgStyle: 'bg-gradient-to-b from-[#051f20] via-[#0b3c3d] to-[#021314] text-[#e6fcf5]',
      cardBgStyle: 'bg-[#0a2e2f]/90 backdrop-blur-md border-[#80ed99]/40 text-[#e6fcf5]',
      textPrimaryStyle: 'text-[#e6fcf5]',
      textAccentStyle: 'text-[#80ed99]',
      borderAccentStyle: 'border-[#80ed99]',
      headerBgStyle: 'bg-[#051f20]/90 text-[#80ed99]',
      accentColor: '#80ed99',
    };
  }

  if (name.includes('blush') || name.includes('romance') || name.includes('pink')) {
    return {
      id: 'blush-romance',
      name: 'Blush Pink Night',
      bgStyle: 'bg-gradient-to-b from-[#2d0f15] via-[#43171e] to-[#1c080b] text-[#ffe6e8]',
      cardBgStyle: 'bg-[#3b151b]/90 backdrop-blur-md border-[#fdc7cb]/40 text-[#ffe6e8]',
      textPrimaryStyle: 'text-[#ffe6e8]',
      textAccentStyle: 'text-[#fecdd3]',
      borderAccentStyle: 'border-[#fdc7cb]',
      headerBgStyle: 'bg-[#2d0f15]/90 text-[#fecdd3]',
      accentColor: '#fdc7cb',
    };
  }

  if (name.includes('sunset') || name.includes('squadron')) {
    return {
      id: 'sunset-squadron',
      name: 'Sunset Squadron',
      bgStyle: 'bg-gradient-to-b from-[#2b0c1e] via-[#4a1828] to-[#1a0512] text-[#fff1e6]',
      cardBgStyle: 'bg-[#3d1323]/90 backdrop-blur-md border-[#e7c08a]/50 text-[#fff1e6]',
      textPrimaryStyle: 'text-[#fff1e6]',
      textAccentStyle: 'text-[#f6bd60]',
      borderAccentStyle: 'border-[#e7c08a]',
      headerBgStyle: 'bg-[#2b0c1e]/90 text-[#f6bd60]',
      accentColor: '#e7c08a',
    };
  }

  if (name.includes('sage') || name.includes('moonlight') || name.includes('garden')) {
    return {
      id: 'sage-moonlight',
      name: 'Sage Garden Moonlight',
      bgStyle: 'bg-gradient-to-b from-[#0f1910] via-[#1a2e1d] to-[#0a120b] text-[#f2f7f2]',
      cardBgStyle: 'bg-[#18291b]/90 backdrop-blur-md border-[#8a9a86]/50 text-[#f2f7f2]',
      textPrimaryStyle: 'text-[#f2f7f2]',
      textAccentStyle: 'text-[#b7e4c7]',
      borderAccentStyle: 'border-[#8a9a86]',
      headerBgStyle: 'bg-[#0f1910]/90 text-[#b7e4c7]',
      accentColor: '#8a9a86',
    };
  }

  // Default: Midnight Sky
  return {
    id: 'midnight-sky',
    name: 'Midnight Sky',
    bgStyle: 'bg-gradient-to-b from-[#031c39] via-[#092b54] to-[#011024] text-[#eef4ff]',
    cardBgStyle: 'bg-[#0a284e]/90 backdrop-blur-md border-[#b2c8ed]/40 text-[#eef4ff]',
    textPrimaryStyle: 'text-[#eef4ff]',
    textAccentStyle: 'text-[#b2c8ed]',
    borderAccentStyle: 'border-[#b2c8ed]',
    headerBgStyle: 'bg-[#031c39]/90 text-[#b2c8ed]',
    accentColor: '#b2c8ed',
  };
}
