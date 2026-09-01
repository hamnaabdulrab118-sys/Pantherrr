import React, { useState } from 'react';
import { soundFx } from '../utils/soundEffects';

interface DistanceTopTabProps {
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
  onOpenSettings?: () => void;
}

export const DistanceTopTab: React.FC<DistanceTopTabProps> = ({
  dinoName = 'Dino 🦖',
  pantherName = 'Panther 🐾✈️',
  fromCity = 'Sialkot, Punjab (Pakistan)',
  toCity = 'Ormara, Balochistan (Pakistan)',
  miles = 770,
  fromCoords = { lat: 32.4945, lon: 74.5229 },
  toCoords = { lat: 25.2088, lon: 64.6357 },
  isLocating = false,
  gpsStatusMessage,
  onLocateGps,
  onOpenSettings,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [unit, setUnit] = useState<'miles' | 'km' | 'hours'>('miles');
  const [heartPulsing, setHeartPulsing] = useState<boolean>(false);
  const [signalSent, setSignalSent] = useState<boolean>(false);

  const km = Math.round(miles * 1.60934);
  const flightHours = (miles / 500).toFixed(1); // average commercial cruise speed ~500mph

  const handleToggleExpand = () => {
    soundFx.playButtonClick();
    setIsExpanded(!isExpanded);
  };

  const handleSendLoveSignal = () => {
    soundFx.playSparkle();
    setHeartPulsing(true);
    setSignalSent(true);
    setTimeout(() => {
      setHeartPulsing(false);
    }, 2000);
    setTimeout(() => {
      setSignalSent(false);
    }, 4000);
  };

  return (
    <div className="w-full bg-[#000d20] text-white border-b border-[#ffddb0]/20 shadow-md relative z-40 transition-all duration-300">
      {/* Primary Compact Ribbon */}
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Left: Dino Location */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#3d4b3f] text-white flex items-center justify-center font-bold text-sm shadow-sm border border-[#ffddb0]/30 flex-shrink-0">
            🦖
          </div>
          <div className="truncate">
            <span className="font-quicksand font-bold text-[#ffddb0] block text-xs truncate">
              {dinoName}
            </span>
            <span className="font-comfortaa text-[10px] text-[#b2c8ed] block truncate">
              📍 {fromCity}
            </span>
          </div>
        </div>

        {/* Center: Interactive Distance & Flight Path Badge */}
        <div className="flex items-center gap-2 flex-1 max-w-lg justify-center">
          <button
            onClick={handleToggleExpand}
            className="w-full bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full border border-[#ffddb0]/30 transition-all cursor-pointer group flex items-center justify-center gap-2 sm:gap-3"
            title="Click to view live journey stats, GPS radar & flight connection"
          >
            <span className="font-comfortaa text-[11px] text-[#b2c8ed] hidden sm:inline">
              Connecting Hearts
            </span>

            {/* Animated Flight Path */}
            <div className="relative flex items-center w-20 sm:w-32 h-3">
              <div className="w-full h-0.5 border-t-2 border-dashed border-[#ffddb0]/50" />
              <span className={`material-symbols-outlined absolute left-1/2 -translate-x-1/2 text-xs text-[#ffddb0] transition-transform group-hover:scale-125 ${
                heartPulsing ? 'animate-bounce text-[#fdc7cb]' : 'animate-pulse'
              }`}>
                {heartPulsing ? 'favorite' : 'flight'}
              </span>
            </div>

            {/* Prominent Distance Tag */}
            <div className="bg-[#ffddb0] text-[#000d20] font-quicksand font-bold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
              <span>
                {unit === 'miles' && `${miles.toLocaleString()} miles`}
                {unit === 'km' && `${km.toLocaleString()} km`}
                {unit === 'hours' && `~${flightHours} hrs flight`}
              </span>
            </div>

            <span className="material-symbols-outlined text-xs text-[#ffddb0] transition-transform duration-300">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>

        {/* Right: Panther Location & GPS Quick Status */}
        <div className="flex items-center gap-2 justify-end min-w-0">
          <div className="text-right truncate">
            <span className="font-quicksand font-bold text-[#ffddb0] block text-xs truncate">
              {pantherName}
            </span>
            <span className="font-comfortaa text-[10px] text-[#b2c8ed] block truncate">
              📍 {toCity}
            </span>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#fdc7cb] text-[#795154] flex items-center justify-center font-bold text-sm shadow-sm border border-white/40 flex-shrink-0">
            🐾
          </div>
        </div>
      </div>

      {/* Expanded Flight Radar & Love Connection Details */}
      {isExpanded && (
        <div className="bg-[#000d20]/95 border-t border-white/10 px-4 py-4 sm:p-5 max-w-4xl mx-auto space-y-4 animate-fadeIn">
          {/* Top Info Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#ffddb0]/20 flex items-center justify-center text-[#ffddb0]">
                <span className="material-symbols-outlined text-lg">travel_explore</span>
              </div>
              <div>
                <h4 className="font-quicksand font-bold text-sm text-[#ffddb0] flex items-center gap-2">
                  <span>Panther & Dino GPS Distance Radar</span>
                  {isLocating && (
                    <span className="text-[10px] bg-sky-500/30 text-sky-200 px-2 py-0.5 rounded-full border border-sky-400/40 animate-pulse">
                      📡 Acquiring GPS...
                    </span>
                  )}
                </h4>
                <p className="font-comfortaa text-xs text-[#b2c8ed]">
                  "Miles are just numbers when two hearts beat under the same stars ✨"
                </p>
              </div>
            </div>

            {/* Units Switcher */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  soundFx.playButtonClick();
                  setUnit('miles');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  unit === 'miles' ? 'bg-[#ffddb0] text-[#000d20]' : 'text-white/70 hover:text-white'
                }`}
              >
                Miles
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playButtonClick();
                  setUnit('km');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  unit === 'km' ? 'bg-[#ffddb0] text-[#000d20]' : 'text-white/70 hover:text-white'
                }`}
              >
                Kilometers
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playButtonClick();
                  setUnit('hours');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  unit === 'hours' ? 'bg-[#ffddb0] text-[#000d20]' : 'text-white/70 hover:text-white'
                }`}
              >
                Flight Time
              </button>
            </div>
          </div>

          {/* Visual Journey Corridor & GPS Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-center">
            {/* Origin (Dino) */}
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🦖</span>
                {onLocateGps && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playButtonClick();
                      onLocateGps('dino');
                    }}
                    disabled={isLocating}
                    className="text-[10px] bg-[#3d4b3f] hover:bg-[#4d5e4f] text-[#ffddb0] px-2 py-1 rounded-lg border border-[#ffddb0]/20 flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                    title="Detect Dino's location using your current GPS"
                  >
                    <span className="material-symbols-outlined text-[12px]">my_location</span>
                    <span>Set from GPS</span>
                  </button>
                )}
              </div>
              <div>
                <p className="font-quicksand font-bold text-xs text-[#ffddb0]">{dinoName}</p>
                <p className="font-comfortaa text-[11px] text-[#b2c8ed]">Origin: {fromCity}</p>
                {fromCoords && (
                  <p className="font-mono text-[9px] text-[#b2c8ed]/70 mt-1">
                    {fromCoords.lat.toFixed(3)}°N, {fromCoords.lon.toFixed(3)}°E
                  </p>
                )}
              </div>
            </div>

            {/* Mid Flight Stats */}
            <div className="bg-[#ffddb0]/10 border border-[#ffddb0]/30 p-3.5 rounded-xl space-y-1">
              <span className="material-symbols-outlined text-[#ffddb0] text-xl animate-bounce">
                flight_takeoff
              </span>
              <p className="font-quicksand font-bold text-base text-[#ffddb0]">
                {unit === 'miles' && `${miles.toLocaleString()} mi`}
                {unit === 'km' && `${km.toLocaleString()} km`}
                {unit === 'hours' && `~${flightHours} Flight Hours`}
              </p>
              <p className="font-comfortaa text-[10px] text-[#b2c8ed]">
                Great-Circle GPS Direct Corridor
              </p>
            </div>

            {/* Destination (Panther) */}
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🐾✈️</span>
                {onLocateGps && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playButtonClick();
                      onLocateGps('panther');
                    }}
                    disabled={isLocating}
                    className="text-[10px] bg-[#795154] hover:bg-[#926266] text-[#ffddb0] px-2 py-1 rounded-lg border border-[#ffddb0]/20 flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                    title="Detect Panther's location using your current GPS"
                  >
                    <span className="material-symbols-outlined text-[12px]">my_location</span>
                    <span>Set from GPS</span>
                  </button>
                )}
              </div>
              <div>
                <p className="font-quicksand font-bold text-xs text-[#ffddb0]">{pantherName}</p>
                <p className="font-comfortaa text-[11px] text-[#b2c8ed]">Destination: {toCity}</p>
                {toCoords && (
                  <p className="font-mono text-[9px] text-[#b2c8ed]/70 mt-1">
                    {toCoords.lat.toFixed(3)}°N, {toCoords.lon.toFixed(3)}°E
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* GPS Live Notification Banner */}
          {gpsStatusMessage && (
            <div className="bg-sky-950/60 border border-sky-500/30 rounded-xl px-3 py-2 text-xs flex items-center gap-2 text-sky-200">
              <span className="material-symbols-outlined text-sm text-sky-300">near_me</span>
              <span>{gpsStatusMessage}</span>
            </div>
          )}

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendLoveSignal}
                className="bg-[#fdc7cb] text-[#795154] hover:bg-white font-quicksand font-bold px-3.5 py-1.5 rounded-xl shadow transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                title="Send a shooting star across the distance"
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span>Send Star Signal ✨</span>
              </button>

              {signalSent && (
                <span className="text-[#ffddb0] font-comfortaa text-xs animate-pulse">
                  🌟 Shooting star sent across {miles.toLocaleString()} miles to {pantherName}!
                </span>
              )}
            </div>

            {onOpenSettings && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playButtonClick();
                  onOpenSettings();
                }}
                className="text-[#ffddb0] hover:text-white font-quicksand font-bold flex items-center gap-1 underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">settings_suggest</span>
                <span>GPS & City Preferences</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

