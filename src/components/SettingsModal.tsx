import React, { useState } from 'react';
import { FAMOUS_CITIES, calculateDistanceMiles, getCoordinatesForCity } from '../utils/geoUtils';
import { soundFx } from '../utils/soundEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pin: string;
  onUpdatePin: (newPin: string) => void;
  dinoName: string;
  pantherName: string;
  onUpdateNames: (dino: string, panther: string) => void;
  fromCity: string;
  toCity: string;
  miles: number;
  fromCoords?: { lat: number; lon: number };
  toCoords?: { lat: number; lon: number };
  autoGpsOnStart?: boolean;
  onToggleAutoGps?: (enabled: boolean) => void;
  onLocateGps?: (role: 'dino' | 'panther') => Promise<void>;
  onUpdateTrip: (from: string, to: string, miles: number, fromCoord?: { lat: number; lon: number }, toCoord?: { lat: number; lon: number }) => void;
  onLockApp: () => void;
  onResetData: () => void;
}

const POPULAR_CITY_PAIRS = [
  { from: 'Sialkot, Punjab (Dino 🦖)', to: 'Ormara, Balochistan (Panther 🐾)', fromCityKey: 'Sialkot', toCityKey: 'Ormara' },
  { from: 'Sialkot, Pakistan', to: 'Gwadar, Balochistan', fromCityKey: 'Sialkot', toCityKey: 'Gwadar' },
  { from: 'Lahore, Pakistan', to: 'Ormara, Balochistan', fromCityKey: 'Lahore', toCityKey: 'Ormara' },
  { from: 'Islamabad, Pakistan', to: 'Ormara, Balochistan', fromCityKey: 'Islamabad', toCityKey: 'Ormara' },
  { from: 'Karachi, Pakistan', to: 'Ormara, Balochistan', fromCityKey: 'Karachi', toCityKey: 'Ormara' },
  { from: 'New York (JFK)', to: 'Paris (CDG)', fromCityKey: 'New York', toCityKey: 'Paris' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  pin,
  onUpdatePin,
  dinoName,
  pantherName,
  onUpdateNames,
  fromCity,
  toCity,
  miles,
  fromCoords,
  toCoords,
  autoGpsOnStart = true,
  onToggleAutoGps,
  onLocateGps,
  onUpdateTrip,
  onLockApp,
  onResetData,
}) => {
  const [currentPin, setCurrentPin] = useState(pin);
  const [dino, setDino] = useState(dinoName);
  const [panther, setPanther] = useState(pantherName);
  const [from, setFrom] = useState(fromCity);
  const [to, setTo] = useState(toCity);
  const [dist, setDist] = useState(miles);
  const [localFromCoord, setLocalFromCoord] = useState(fromCoords);
  const [localToCoord, setLocalToCoord] = useState(toCoords);
  const [autoGps, setAutoGps] = useState(autoGpsOnStart);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectCityPair = (pair: typeof POPULAR_CITY_PAIRS[0]) => {
    soundFx.playButtonClick();
    const c1 = FAMOUS_CITIES[pair.fromCityKey];
    const c2 = FAMOUS_CITIES[pair.toCityKey];
    const calculatedDist = calculateDistanceMiles(c1.lat, c1.lon, c2.lat, c2.lon);
    
    setFrom(pair.from);
    setTo(pair.to);
    setDist(calculatedDist);
    setLocalFromCoord({ lat: c1.lat, lon: c1.lon });
    setLocalToCoord({ lat: c2.lat, lon: c2.lon });
  };

  const handleGpsDetect = async (role: 'dino' | 'panther') => {
    if (!onLocateGps) return;
    try {
      setIsGpsLoading(true);
      soundFx.playSparkle();
      await onLocateGps(role);
      setSavedMsg(`📍 Successfully detected GPS location for ${role === 'dino' ? dino : panther}!`);
    } catch {
      setSavedMsg('⚠️ Could not acquire GPS location. Please check browser permissions.');
    } finally {
      setIsGpsLoading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPin.length === 4) {
      onUpdatePin(currentPin);
    }
    onUpdateNames(dino, panther);
    
    // Compute distance if manually entered or coordinate-based
    const finalFromCoord = localFromCoord || getCoordinatesForCity(from);
    const finalToCoord = localToCoord || getCoordinatesForCity(to);
    const finalMiles = dist || calculateDistanceMiles(finalFromCoord.lat, finalFromCoord.lon, finalToCoord.lat, finalToCoord.lon);

    onUpdateTrip(from, to, Number(finalMiles), finalFromCoord, finalToCoord);
    if (onToggleAutoGps) {
      onToggleAutoGps(autoGps);
    }

    setSavedMsg('Settings saved successfully!');
    setTimeout(() => {
      setSavedMsg('');
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000d20]/60 backdrop-blur-sm p-4">
      <div className="bg-[#fff8f0] border border-[#e8e2d9] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8e2d9] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c5357]">settings</span>
            <h2 className="font-quicksand font-bold text-2xl text-[#000d20]">Settings & GPS Preferences</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-[#74777e] hover:text-[#000d20] p-1 rounded-full hover:bg-[#e8e2d9] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Automatic GPS Geolocation Section */}
          <div className="bg-[#eef3ee] p-4 rounded-xl border border-[#3d4b3f]/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3d4b3f]">near_me</span>
                <span className="font-quicksand font-bold text-sm text-[#000d20]">
                  GPS Live Location Auto-Detection
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoGps}
                  onChange={(e) => setAutoGps(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3d4b3f]"></div>
              </label>
            </div>
            <p className="font-comfortaa text-xs text-[#526054]">
              When enabled, opening the website will automatically ask for location permission and calculate the live distance between Dino and Panther in real-time.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleGpsDetect('dino')}
                disabled={isGpsLoading}
                className="bg-white border border-[#3d4b3f]/30 hover:bg-[#3d4b3f] hover:text-white text-[#3d4b3f] text-xs font-quicksand font-bold py-2 px-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">my_location</span>
                <span>Set Dino via GPS 🦖</span>
              </button>
              <button
                type="button"
                onClick={() => handleGpsDetect('panther')}
                disabled={isGpsLoading}
                className="bg-white border border-[#795154]/30 hover:bg-[#795154] hover:text-white text-[#795154] text-xs font-quicksand font-bold py-2 px-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">my_location</span>
                <span>Set Panther via GPS 🐾</span>
              </button>
            </div>
          </div>

          {/* PIN Access Code */}
          <div className="bg-[#f9f3ea] p-4 rounded-xl border border-[#c4c6ce]/40 space-y-2">
            <label className="font-archivo text-xs text-[#74777e] uppercase tracking-wider block font-bold">
              Access Code (4 digits)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                maxLength={4}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                className="w-32 bg-white border border-[#c4c6ce] rounded-lg px-3 py-2 text-center font-quicksand font-bold text-xl text-[#000d20] focus:outline-none focus:border-[#a68553]"
              />
              <span className="text-xs text-[#74777e] font-quicksand">
                Default: 5425. Used to unlock memories on startup.
              </span>
            </div>
          </div>

          {/* Person Names */}
          <div className="bg-[#f9f3ea] p-4 rounded-xl border border-[#c4c6ce]/40 space-y-3">
            <label className="font-archivo text-xs text-[#74777e] uppercase tracking-wider block font-bold">
              Journey Names
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-[#74777e] block mb-1">Creator Name</span>
                <input
                  type="text"
                  value={dino}
                  onChange={(e) => setDino(e.target.value)}
                  className="w-full bg-white border border-[#c4c6ce] rounded-lg px-3 py-2 font-quicksand text-sm text-[#000d20]"
                />
              </div>
              <div>
                <span className="text-xs text-[#74777e] block mb-1">Loved One Name</span>
                <input
                  type="text"
                  value={panther}
                  onChange={(e) => setPanther(e.target.value)}
                  className="w-full bg-white border border-[#c4c6ce] rounded-lg px-3 py-2 font-quicksand text-sm text-[#000d20]"
                />
              </div>
            </div>
          </div>

          {/* Distance & Flight Locations */}
          <div className="bg-[#f9f3ea] p-4 rounded-xl border border-[#c4c6ce]/40 space-y-3">
            <label className="font-archivo text-xs text-[#74777e] uppercase tracking-wider block font-bold">
              Flight & Distance Setup
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-xs text-[#74777e] block mb-1">From City</span>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full bg-white border border-[#c4c6ce] rounded-lg px-3 py-2 font-quicksand text-sm text-[#000d20]"
                />
              </div>
              <div>
                <span className="text-xs text-[#74777e] block mb-1">To City</span>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full bg-white border border-[#c4c6ce] rounded-lg px-3 py-2 font-quicksand text-sm text-[#000d20]"
                />
              </div>
              <div>
                <span className="text-xs text-[#74777e] block mb-1">Miles Apart</span>
                <input
                  type="number"
                  value={dist}
                  onChange={(e) => setDist(Number(e.target.value))}
                  className="w-full bg-white border border-[#c4c6ce] rounded-lg px-3 py-2 font-quicksand text-sm text-[#000d20]"
                />
              </div>
            </div>

            {/* Quick City Pairs */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#74777e] block mb-1.5 font-quicksand">
                Quick Distance Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CITY_PAIRS.map((pair, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectCityPair(pair)}
                    className="text-[10px] bg-white border border-[#c4c6ce] hover:border-[#a68553] px-2 py-1 rounded-md text-[#44474d] hover:text-[#000d20] transition-colors cursor-pointer"
                  >
                    {pair.fromCityKey} ✈️ {pair.toCityKey}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lock App / Reset Data */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLockApp();
              }}
              className="flex-1 bg-[#f4ede4] border border-[#c4c6ce] text-[#000d20] font-quicksand text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-[#e8e2d9] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              Lock App Now
            </button>
            <button
              type="button"
              onClick={onResetData}
              className="flex-1 bg-[#ffdad6] text-[#93000a] font-quicksand text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-[#ffdad6]/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              Reset Sample Gifts
            </button>
          </div>

          {savedMsg && (
            <p className="text-center font-quicksand text-sm text-[#a68553] font-bold">
              {savedMsg}
            </p>
          )}

          {/* Action Footer */}
          <div className="flex justify-end gap-3 border-t border-[#e8e2d9] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#c4c6ce] font-quicksand text-sm text-[#44474d] hover:bg-[#e8e2d9] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#000d20] text-[#ffddb0] font-quicksand font-bold text-sm hover:bg-[#0b2340] transition-all cursor-pointer shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

