import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/soundEffects';
import { DistanceTopTab } from './DistanceTopTab';
import dinoPantherLogo from '../assets/images/dino_panther_same_size_1788091439765.jpg';

interface TopBarProps {
  onOpenSettings: () => void;
  title?: string;
  dinoName?: string;
  pantherName?: string;
  fromCity?: string;
  toCity?: string;
  miles?: number;
  fromCoords?: { lat: number; lon: number };
  toCoords?: { lat: number; lon: number };
  isLocating?: boolean;
  gpsStatusMessage?: string | null;
  onLocateGps?: (role: 'dino' | 'panther') => Promise<void>;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSettings,
  title = "For Panther 🐾✈️",
  dinoName = "Dino 🦖",
  pantherName = "Panther 🐾✈️",
  fromCity = "Sialkot, Punjab (Pakistan)",
  toCity = "Ormara, Balochistan (Pakistan)",
  miles = 770,
  fromCoords,
  toCoords,
  isLocating,
  gpsStatusMessage,
  onLocateGps,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    setIsMuted(soundFx.isSoundMuted());
  }, []);

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundFx.playSparkle();
    }
  };

  return (
    <div className="docked full-width top-0 sticky z-50 transition-all shadow-sm">
      {/* Top Distance Tab */}
      <DistanceTopTab
        dinoName={dinoName}
        pantherName={pantherName}
        fromCity={fromCity}
        toCity={toCity}
        miles={miles}
        fromCoords={fromCoords}
        toCoords={toCoords}
        isLocating={isLocating}
        gpsStatusMessage={gpsStatusMessage}
        onLocateGps={onLocateGps}
        onOpenSettings={onOpenSettings}
      />

      {/* Main Top App Header */}
      <header className="backdrop-blur-md bg-[#fff8f0]/90 border-b border-[#e8e2d9]/60">
        <div className="flex items-center justify-between px-6 py-2.5 w-full max-w-7xl mx-auto">
          <div className="font-quicksand text-lg sm:text-xl font-bold text-[#000d20] flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#fdc7cb] flex items-center justify-center text-[#795154] font-bold text-sm border-2 border-white shadow-md overflow-hidden flex-shrink-0">
              <img 
                src={dinoPantherLogo}
                alt="Dino & Panther Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="truncate">{title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
                isMuted
                  ? 'text-[#74777e] hover:bg-[#e8e2d9]'
                  : 'text-[#3d4b3f] bg-[#eef3ee] hover:bg-[#e0ece0]'
              }`}
              title={isMuted ? 'Unmute Sound Effects & Music' : 'Mute Sound Effects & Music'}
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
                {isMuted ? 'volume_off' : 'volume_up'}
              </span>
            </button>
            <button 
              onClick={onOpenSettings}
              className="text-[#44474d] hover:text-[#000d20] transition-colors p-2 rounded-full hover:bg-[#f4ede4] flex items-center justify-center cursor-pointer"
              title="Settings & Customization"
            >
              <span className="material-symbols-outlined text-[22px] sm:text-[24px]">settings</span>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};


