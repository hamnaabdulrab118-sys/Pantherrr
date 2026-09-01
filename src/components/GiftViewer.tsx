import React, { useState, useEffect } from 'react';
import { GiftData } from '../types';
import { getShareableUrl, copyToClipboard } from '../utils/shareUtils';
import { soundFx } from '../utils/soundEffects';
import {
  calculateDistanceMiles,
  getCurrentBrowserGps,
  reverseGeocode,
  watchBrowserGps,
} from '../utils/geoUtils';
import { BouquetVisualizer } from './BouquetVisualizer';
import { NatureAmbientOverlay } from './NatureAmbientOverlay';
import { CharmOverlay } from './CharmOverlay';
import { Dynamic3DSky } from './Dynamic3DSky';
import { MiniDinoCompanion } from './MiniDinoCompanion';
import { MusicPlayerBar } from './MusicPlayerBar';
import { DistanceTopTab } from './DistanceTopTab';
import { getThemeStyle } from '../utils/themeUtils';

interface GiftViewerProps {
  gift: GiftData;
  fromCoords?: { lat: number; lon: number };
  toCoords?: { lat: number; lon: number };
  onBack?: () => void;
  onEdit?: (gift: GiftData) => void;
  onUpdatePantherLocation?: (city: string, coords: { lat: number; lon: number }, distance: number) => void;
  isRecipientMode?: boolean;
  onAdminUnlockRequest?: () => void;
}

interface FloatingHeart {
  id: number;
  emoji: string;
  x: number;
}

export const GiftViewer: React.FC<GiftViewerProps> = ({
  gift,
  fromCoords,
  toCoords,
  onBack,
  onEdit,
  onUpdatePantherLocation,
  isRecipientMode = false,
  onAdminUnlockRequest,
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [hasOpenedLetter, setHasOpenedLetter] = useState<boolean>(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [reactionNotification, setReactionNotification] = useState<string | null>(null);

  // Live GPS tracking state for Panther
  const [liveToCity, setLiveToCity] = useState<string>(gift.toCity || 'Ormara, Balochistan (Pakistan)');
  const [liveToCoords, setLiveToCoords] = useState<{ lat: number; lon: number } | undefined>(
    toCoords || gift.toCoords || { lat: 25.2088, lon: 64.6357 }
  );
  const [liveDistance, setLiveDistance] = useState<number>(gift.distanceMiles || 770);
  const [isAcquiringGps, setIsAcquiringGps] = useState<boolean>(false);

  // Active slide indices for slideshow mode
  const activeSlideIndices =
    gift.enabledSlides && gift.enabledSlides.length > 0
      ? gift.enabledSlides
      : [0, 1, 2, 3, 4, 5, 6, 7];

  const totalSlides = activeSlideIndices.length;
  const actualSlideId = activeSlideIndices[currentSlide] ?? 0;
  const currentThemeStyle = getThemeStyle(gift.theme);

  // Auto-acquire receiver GPS on open
  useEffect(() => {
    let watchId: number | null = null;

    const autoTrackPantherGps = async () => {
      if (!navigator.geolocation) return;
      setIsAcquiringGps(true);
      try {
        const coords = await getCurrentBrowserGps();
        const geoInfo = await reverseGeocode(coords.lat, coords.lon);
        const newCity = geoInfo.cityName || 'Ormara, Balochistan (Pakistan)';
        const originCoord = fromCoords || gift.fromCoords || { lat: 32.4945, lon: 74.5229 };
        const dist = calculateDistanceMiles(originCoord.lat, originCoord.lon, coords.lat, coords.lon);

        setLiveToCity(newCity);
        setLiveToCoords({ lat: coords.lat, lon: coords.lon });
        setLiveDistance(dist);

        if (onUpdatePantherLocation) {
          onUpdatePantherLocation(newCity, { lat: coords.lat, lon: coords.lon }, dist);
        }
      } catch {
        // Keep default coordinates
      } finally {
        setIsAcquiringGps(false);
      }

      watchId = watchBrowserGps(async (coords) => {
        const geoInfo = await reverseGeocode(coords.lat, coords.lon);
        const newCity = geoInfo.cityName || 'Ormara, Balochistan (Pakistan)';
        const originCoord = fromCoords || gift.fromCoords || { lat: 32.4945, lon: 74.5229 };
        const dist = calculateDistanceMiles(originCoord.lat, originCoord.lon, coords.lat, coords.lon);

        setLiveToCity(newCity);
        setLiveToCoords({ lat: coords.lat, lon: coords.lon });
        setLiveDistance(dist);

        if (onUpdatePantherLocation) {
          onUpdatePantherLocation(newCity, { lat: coords.lat, lon: coords.lon }, dist);
        }
      });
    };

    autoTrackPantherGps();

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const handleSendReaction = (emoji: string, label: string) => {
    soundFx.playSparkle();
    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      emoji,
      x: 20 + Math.random() * 60,
    };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setReactionNotification(`Sent ${emoji} to Dino in Sialkot! 💚`);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 2200);

    setTimeout(() => {
      setReactionNotification(null);
    }, 3500);
  };

  const handleCopyShareLink = async () => {
    soundFx.playSparkle();
    const url = getShareableUrl(gift);
    const success = await copyToClipboard(url);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const defaultSailboatUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDoWCovh9i61yXaZtDy9vVd6rzT5VAL4J67fpXMcELIjNS8KURCtEWMnR7DnCnawwNDMK-TRz7THJVcc95-sD0LsxMIJE4Ox44DkCfJFHkyArer_Lw6ZW0XxUSweCc5QA76k2Nc2vPDz6IlxCezAxz3Jvq2R4X-k_h8rXnK1Frm1jlpJaGbEvunoup5og8Xglnnpc5xrqhg1OH58oUk0aKxnnMG-7GvOmf3lbQDsdNsR3mdb4HpD5Mz1w';

  // =========================================================================
  // 1. DEDICATED RECIPIENT VIEW (Pristine, Single, Night-Sky Reading Experience)
  // =========================================================================
  if (isRecipientMode) {
    return (
      <div className="min-h-screen bg-[#000d20] text-white flex flex-col justify-between relative overflow-x-hidden font-quicksand selection:bg-[#e7c08a] selection:text-[#000d20]">
        {/* Night-Sky Ambient Stars & Celestial Overlay */}
        <Dynamic3DSky themeName="Starry Night" />
        <NatureAmbientOverlay natureElements={gift.natureElements || []} />
        <MiniDinoCompanion />

        {/* Floating Heart Reactions */}
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            style={{ left: `${heart.x}%` }}
            className="fixed bottom-24 text-4xl pointer-events-none z-50 animate-floatUp"
          >
            {heart.emoji}
          </div>
        ))}

        {/* Reaction Toast */}
        {reactionNotification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#000d20]/95 backdrop-blur-md text-[#ffddb0] px-5 py-2.5 rounded-full shadow-2xl font-quicksand font-bold text-xs border border-[#e7c08a]/60 animate-bounce flex items-center gap-2">
            <span>💖</span>
            <span>{reactionNotification}</span>
          </div>
        )}

        {/* Top Minimalist Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md sticky top-0 z-30 bg-[#000d20]/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-quicksand font-bold text-xs text-[#ffddb0] tracking-wide">
              For {gift.toPerson || 'Panther 🐾✈️'}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-[#b2c8ed]">
            <span className="material-symbols-outlined text-xs text-[#e7c08a]">flight_takeoff</span>
            <span>Sialkot ✈️ Ormara ({liveDistance} mi)</span>
          </div>
        </header>

        {/* Main Reading Experience */}
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 z-10 space-y-8 animate-fadeIn">
          {/* Decorative Top Stamp */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffddb0]/15 border border-[#e7c08a]/40 text-[#ffddb0] text-xs font-bold font-archivo tracking-wider uppercase shadow-sm">
              <span>💌</span>
              <span>Handwritten Letter from {gift.fromPerson || 'Dino 🦖'}</span>
            </div>
            <h1 className="font-quicksand font-bold text-3xl sm:text-4xl text-white tracking-tight">
              {gift.title || `A Letter for ${gift.toPerson || 'Panther'}`}
            </h1>
            <div className="flex items-center justify-center gap-2 text-xs font-comfortaa text-[#b2c8ed]">
              <span>📅 {gift.date || 'Romantic Memory'}</span>
              <span>•</span>
              <span>🌌 Written under the same night sky</span>
            </div>
          </div>

          {/* THE LETTER PARCHMENT CARD */}
          <div className="bg-[#fff8f0] text-[#1e1b16] rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-[#e7c08a]/40 relative transform rotate-0 hover:scale-[1.005] transition-transform overflow-hidden">
            {/* Washi Tape Header Decoration */}
            <div className="washi-tape" />

            {/* Letter Header Bar */}
            <div className="flex items-center justify-between border-b border-[#ebdccd] pb-4 mb-6 text-xs">
              <span className="font-archivo text-[#74777e] uppercase tracking-widest font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#a68553]">mark_email_read</span>
                <span>ORIGINAL LETTER</span>
              </span>
              <span className="font-quicksand font-bold text-[#000d20] bg-[#f4ede4] px-3 py-1 rounded-full border border-[#e8e2d9]">
                📍 Sialkot ➔ Ormara
              </span>
            </div>

            {/* Salutation */}
            <div className="font-comfortaa font-bold text-lg text-[#000d20] mb-4">
              My Dearest {gift.toPerson || 'Panther 🐾'},
            </div>

            {/* Body of the Letter */}
            <div className="font-comfortaa text-base sm:text-lg leading-relaxed sm:leading-loose text-[#1e1b16] whitespace-pre-wrap mb-8">
              {gift.letter && gift.letter.trim().length > 0 ? (
                gift.letter
              ) : (
                <span className="italic text-[#7c5357]">
                  No matter how many miles lie between Sialkot and Ormara, my heart is always right beside you.
                </span>
              )}
            </div>

            {/* Sign-off */}
            <div className="border-t border-[#ebdccd] pt-4 text-right space-y-1">
              <p className="font-comfortaa text-sm text-[#7c5357] italic">Forever and always yours,</p>
              <p className="font-quicksand font-bold text-xl text-[#000d20]">
                {gift.fromPerson || 'Dino 🦖'}
              </p>
              <p className="font-archivo text-[11px] text-[#a68553] uppercase tracking-widest font-bold">
                Sialkot, Punjab (Pakistan)
              </p>
            </div>
          </div>

          {/* ATTACHED MEMORIES & KEEPSAKES (Only rendered if actually present) */}
          <div className="space-y-6">
            {/* Photo Keepsake if present */}
            {gift.photoUrl && gift.photoUrl !== defaultSailboatUrl && (
              <div className="bg-[#fff8f0] text-[#1e1b16] rounded-3xl p-6 shadow-xl border border-[#e7c08a]/30 relative transform -rotate-1">
                <div className="washi-tape" />
                <div className="text-center mb-4">
                  <span className="font-archivo text-xs text-[#74777e] uppercase tracking-widest font-bold">
                    📸 Memory Snapshot
                  </span>
                </div>
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#eee7de] shadow-inner mb-3">
                  <img
                    src={gift.photoUrl}
                    alt={gift.photoCaption || 'Memory'}
                    className="w-full h-full object-cover"
                  />
                </div>
                {gift.photoCaption && (
                  <p className="font-comfortaa text-center text-sm text-[#44474d] italic">
                    "{gift.photoCaption}"
                  </p>
                )}
              </div>
            )}

            {/* Voice Memo if present */}
            {gift.voiceNoteUrl && (
              <div className="bg-[#0b2340] border border-[#ffddb0]/30 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#ffddb0] text-[#000d20] flex items-center justify-center font-bold shadow-md">
                    <span className="material-symbols-outlined text-2xl">mic</span>
                  </div>
                  <div>
                    <p className="font-quicksand font-bold text-base text-[#ffddb0]">
                      Voice Note from {gift.fromPerson || 'Dino'}
                    </p>
                    <p className="font-comfortaa text-xs text-[#b2c8ed]">
                      {gift.voiceNoteDuration ? `${gift.voiceNoteDuration} seconds` : 'Listen to voice memo'}
                    </p>
                  </div>
                </div>
                <audio src={gift.voiceNoteUrl} controls className="w-full sm:w-auto h-10" />
              </div>
            )}

            {/* Dedicated Song if present */}
            {gift.songTitle && (
              <div className="bg-[#0b2340] border border-[#e7c08a]/40 text-white p-5 rounded-3xl flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-full bg-[#ffddb0]/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#e7c08a] icon-filled text-2xl">
                    music_note
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-archivo uppercase tracking-widest text-[#a68553] font-bold block">
                    Song Dedication
                  </span>
                  <p className="font-quicksand font-bold text-lg text-[#ffddb0] truncate">
                    {gift.songTitle}
                  </p>
                  <p className="font-comfortaa text-xs text-[#b2c8ed] truncate">
                    {gift.songArtist || 'Dedicated Song'}
                  </p>
                </div>
              </div>
            )}

            {/* Video Clip if present */}
            {gift.videoUrl && (
              <div className="bg-[#000d20] border border-white/20 rounded-3xl p-6 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#ffddb0] uppercase tracking-wider">
                  <span className="material-symbols-outlined text-base text-[#e7c08a]">videocam</span>
                  <span>Memory Video Clip</span>
                </div>
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                  {gift.videoUrl.includes('youtube.com') || gift.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={gift.videoUrl
                        .replace('watch?v=', 'embed/')
                        .replace('youtu.be/', 'www.youtube.com/embed/')}
                      title="Memory video"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={gift.videoUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                {gift.videoCaption && (
                  <p className="font-comfortaa text-center text-xs text-[#b2c8ed] italic">
                    {gift.videoCaption}
                  </p>
                )}
              </div>
            )}

            {/* Moon Dialogue if present */}
            {gift.chatMessages && gift.chatMessages.length > 0 && (
              <div className="bg-[#0b2340]/90 border border-white/20 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌙</span>
                    <span className="font-quicksand font-bold text-base text-white">
                      Moonlight Dialogue
                    </span>
                  </div>
                  <span className="text-xs text-[#b2c8ed] font-comfortaa">
                    Over Sialkot & Ormara ✨
                  </span>
                </div>
                <div className="space-y-3">
                  {gift.chatMessages.map((msg, idx) => {
                    const isDino = msg.sender === 'dino';
                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex gap-3 max-w-[90%] ${
                          isDino ? 'self-start' : 'self-end flex-row-reverse ml-auto'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md ${
                            isDino
                              ? 'bg-[#3d4b3f] text-white border border-white/30'
                              : 'bg-[#e7c08a] text-[#000d20] border border-white/40'
                          }`}
                        >
                          {isDino ? '🦖' : '🌙'}
                        </div>
                        <div
                          className={`p-3.5 rounded-2xl text-xs relative ${
                            isDino
                              ? 'bg-white text-[#1e1b16] rounded-tl-none shadow'
                              : 'bg-gradient-to-r from-[#ffddb0] to-[#fae2c6] text-[#000d20] rounded-tr-none shadow font-medium'
                          }`}
                        >
                          <div className="text-[10px] opacity-70 mb-1 font-bold">
                            {isDino ? `🦖 ${gift.fromPerson || 'Dino'}` : '🌙 The Moon'}
                          </div>
                          <p className="font-comfortaa leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Interactive Floating Reactions for Panther */}
        <footer className="z-20 px-6 py-4 bg-[#000d20]/90 backdrop-blur-md border-t border-white/10 max-w-3xl mx-auto w-full flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-[#b2c8ed] uppercase tracking-wider font-archivo">
              React to Dino:
            </span>
            <div className="flex gap-2">
              {[
                { emoji: '💖', label: 'Love' },
                { emoji: '💋', label: 'Kiss' },
                { emoji: '🦖', label: 'Rawr' },
                { emoji: '☕', label: 'Warm Hug' },
                { emoji: '✨', label: 'Starlight' },
              ].map((item) => (
                <button
                  key={item.emoji}
                  onClick={() => handleSendReaction(item.emoji, item.label)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 hover:scale-125 active:scale-95 transition-all text-lg flex items-center justify-center cursor-pointer shadow-md"
                  title={item.label}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Discreet Creator PIN button */}
          {onAdminUnlockRequest && (
            <button
              type="button"
              onClick={onAdminUnlockRequest}
              className="text-[11px] font-comfortaa text-white/40 hover:text-[#ffddb0] transition-colors underline cursor-pointer pt-1"
            >
              Dino's Creator Login 🗝️
            </button>
          )}
        </footer>

        {/* Persistent Background Music Bar */}
        <MusicPlayerBar
          currentPreset={gift.musicPreset || gift.backgroundMusic || 'lullaby'}
          songTitle={gift.songTitle}
          songArtist={gift.songArtist}
          voiceNoteUrl={gift.voiceNoteUrl}
          customAudioUrl={gift.musicAudioUrl}
        />
      </div>
    );
  }

  // =========================================================================
  // 2. CREATOR / SLIDESHOW PRESENTATION VIEW
  // =========================================================================
  return (
    <div className={`min-h-screen ${currentThemeStyle.bgStyle} transition-colors duration-500 flex flex-col justify-between pb-20 relative overflow-x-hidden font-quicksand`}>
      <NatureAmbientOverlay natureElements={gift.natureElements || []} />
      <MiniDinoCompanion />

      {/* Top Distance Tab */}
      <DistanceTopTab
        dinoName={gift.fromPerson || 'Dino 🦖'}
        pantherName={gift.toPerson || 'Panther 🐾✈️'}
        fromCity={gift.fromCity || 'Sialkot, Punjab (Pakistan)'}
        toCity={liveToCity}
        miles={liveDistance}
        fromCoords={fromCoords || gift.fromCoords || { lat: 32.4945, lon: 74.5229 }}
        toCoords={liveToCoords}
        isLocating={isAcquiringGps}
      />

      {/* Top Header */}
      <header className={`px-6 py-3 flex items-center justify-between border-b border-[#e8e2d9]/40 backdrop-blur-md sticky top-0 z-30 ${currentThemeStyle.headerBgStyle}`}>
        <button
          onClick={() => {
            soundFx.playButtonClick();
            if (onBack) onBack();
          }}
          className="flex items-center gap-2 font-quicksand font-bold text-sm text-[#000d20] hover:text-[#7c5357] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="hidden sm:inline">Back to Collection</span>
        </button>

        <div className="font-archivo text-xs text-[#74777e] uppercase tracking-widest font-bold truncate max-w-[160px] sm:max-w-xs">
          {gift.title}
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => {
                soundFx.playButtonClick();
                onEdit(gift);
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-quicksand font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Edit this gift"
            >
              <span className="material-symbols-outlined text-base text-amber-700">edit</span>
              <span className="hidden sm:inline">Edit Gift</span>
            </button>
          )}

          <button
            onClick={handleCopyShareLink}
            className={`px-3 py-1.5 rounded-lg font-quicksand font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isCopied
                ? 'bg-[#3d4b3f] text-white'
                : 'bg-[#eee7de] text-[#000d20] hover:bg-[#000d20] hover:text-[#ffddb0]'
            }`}
            title="Copy shareable link for this gift"
          >
            <span className="material-symbols-outlined text-base">
              {isCopied ? 'check' : 'share'}
            </span>
            <span className="hidden sm:inline">{isCopied ? 'Copied Link!' : 'Share Link'}</span>
          </button>

          <div className="font-archivo text-xs text-[#a68553] font-bold pl-2 bg-[#eee7de]/70 px-2.5 py-1 rounded-full border border-[#c4c6ce]">
            {currentSlide + 1} / {totalSlides}
          </div>
        </div>
      </header>

      {/* Main Slide Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-2 z-10">
        <div className="w-full max-w-2xl animate-fadeIn">
          {/* SLIDE 0: Cover Image */}
          {actualSlideId === 0 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden border border-[#e8e2d9] transform rotate-1">
              <div className="washi-tape" />
              <div className="w-full aspect-square max-w-md mx-auto rounded-2xl overflow-hidden mb-6 bg-[#eee7de] shadow-inner relative">
                <img
                  src={gift.coverImage || gift.photoUrl || defaultSailboatUrl}
                  alt="Dino and Panther Cover"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="font-quicksand font-bold text-3xl md:text-4xl text-[#000d20] mb-2">
                For My {gift.toPerson} 💕
              </h1>
              <div className="flex items-center justify-center gap-2 flex-wrap text-sm text-[#7c5357] mb-2">
                <span className="font-comfortaa italic">From {gift.fromPerson}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5 bg-[#f4ede4] border border-[#e8e2d9] px-3 py-1 rounded-full text-xs font-quicksand font-bold text-[#000d20] shadow-sm">
                  <span className="material-symbols-outlined text-sm text-[#a68553]">calendar_month</span>
                  <span>Memory Date: {gift.date}</span>
                </span>
              </div>
            </div>
          )}

          {/* SLIDE 1: Theme & Bouquet */}
          {actualSlideId === 1 && (
            <div className="bg-white rounded-2xl p-8 scrapbook-shadow border border-[#e8e2d9] relative transform rotate-1">
              <div className="washi-tape" />
              <div className="text-center mb-6">
                <span className="font-archivo text-xs text-[#74777e] uppercase tracking-wider block font-bold mb-1">
                  Bouquet & Theme
                </span>
                <h2 className="font-quicksand font-bold text-3xl text-[#000d20]">
                  {gift.theme} Theme
                </h2>
              </div>

              <div className="w-full aspect-[4/3] bg-[#f4ede4] rounded-xl overflow-hidden mb-4 relative flex items-center justify-center p-2">
                <BouquetVisualizer
                  flowers={gift.flowers || []}
                  wrapStyle={gift.wrapStyle || 'Classic Wrap'}
                  miniLetterText={gift.bouquetLetter}
                />
              </div>

              {gift.bouquetLetter && (
                <div className="bg-[#f9f3ea] p-3 rounded-xl border border-dashed border-[#c4c6ce] mb-4 text-center">
                  <span className="font-comfortaa text-xs text-[#7c5357] italic">
                    💌 Mini Note: "{gift.bouquetLetter}"
                  </span>
                </div>
              )}
            </div>
          )}

          {/* SLIDE 2: Nature & Charms Tray */}
          {actualSlideId === 2 && (
            <div className="bg-white rounded-2xl p-8 scrapbook-shadow border border-[#e8e2d9] relative transform -rotate-1">
              <div className="washi-tape" />
              <div className="text-center mb-6">
                <span className="font-archivo text-xs text-[#74777e] uppercase tracking-wider block font-bold mb-1">
                  Little Gifts & Charms
                </span>
                <h2 className="font-quicksand font-bold text-2xl text-[#000d20]">
                  Charms for the Journey
                </h2>
              </div>

              <div className="bg-[#f9f3ea] p-6 rounded-xl border border-dashed border-[#c4c6ce] mb-6 flex flex-wrap gap-3 justify-center min-h-[140px] items-center">
                <CharmOverlay charms={gift.charms || []} />
              </div>
            </div>
          )}

          {/* SLIDE 3: Photo, Video, Voice & Soundtrack */}
          {actualSlideId === 3 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 scrapbook-shadow border border-[#e8e2d9] relative transform rotate-1 space-y-5">
              <div className="washi-tape" />
              <div className="flex items-center justify-between border-b border-[#eee7de] pb-2 text-xs">
                <span className="font-archivo text-[#74777e] uppercase tracking-wider font-bold">
                  MEDIA & KEEPSAKES
                </span>
                <span className="inline-flex items-center gap-1 font-quicksand font-bold text-[#000d20] bg-[#f4ede4] px-2.5 py-0.5 rounded-full border border-[#e8e2d9]">
                  <span className="material-symbols-outlined text-xs text-[#a68553]">calendar_today</span>
                  <span>{gift.date}</span>
                </span>
              </div>

              {gift.photoUrl && (
                <div className="space-y-2">
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#f4ede4] shadow-inner">
                    <img
                      src={gift.photoUrl}
                      alt={gift.photoCaption || 'Memory Photo'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {gift.photoCaption && (
                    <p className="font-comfortaa text-center text-sm text-[#1e1b16] italic">
                      "{gift.photoCaption}"
                    </p>
                  )}
                </div>
              )}

              {gift.voiceNoteUrl && (
                <div className="bg-[#fdc7cb]/20 border border-[#fdc7cb] rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#fdc7cb] text-[#795154] flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-lg">mic</span>
                    </div>
                    <div>
                      <p className="font-quicksand font-bold text-xs text-[#000d20]">Voice Note</p>
                    </div>
                  </div>
                  <audio src={gift.voiceNoteUrl} controls className="h-8 max-w-[140px] sm:max-w-[200px]" />
                </div>
              )}
            </div>
          )}

          {/* SLIDE 4: Captain's Log */}
          {actualSlideId === 4 && (
            <div className="bg-white rounded-2xl p-8 scrapbook-shadow border border-[#e8e2d9] relative transform -rotate-1 text-center">
              <div className="washi-tape" />
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-[#b2c8ed]">
                <img
                  src={gift.captainsLogImage || defaultSailboatUrl}
                  alt="Captain's Log"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-comfortaa text-xl text-[#000d20] italic">
                "{gift.captainsLog || 'Sailing across the sea to you...'}"
              </p>
            </div>
          )}

          {/* SLIDE 5: That Smile */}
          {actualSlideId === 5 && (
            <div className="bg-white rounded-2xl p-8 scrapbook-shadow border border-[#e8e2d9] relative text-center">
              <div className="washi-tape" />
              <h2 className="font-quicksand font-bold text-3xl text-[#000d20] mb-1">
                That Smile
              </h2>
              <div className="w-44 h-44 mx-auto rounded-full border-4 border-[#eee7de] shadow-md overflow-hidden mb-6 my-4">
                <img
                  src={gift.locketPhoto || gift.photoUrl || defaultSailboatUrl}
                  alt="Locket Photo"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-comfortaa text-xl text-[#795154]">
                {gift.locketCaption || 'Forever shining in my heart'}
              </p>
            </div>
          )}

          {/* SLIDE 6: Dino & Moon Conversation */}
          {actualSlideId === 6 && (
            <div className="relative bg-[#000d20] text-white rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden border border-white/20 min-h-[440px] flex flex-col justify-between">
              <Dynamic3DSky themeName={gift.theme} />
              <div className="relative z-10 mb-4 flex justify-between items-center">
                <h2 className="font-quicksand font-bold text-2xl text-white flex items-center gap-2">
                  <span>Moonlight Dialogue</span>
                  <span className="text-xl">🌙</span>
                </h2>
              </div>
              <div className="relative z-10 space-y-3 max-h-[300px] overflow-y-auto pr-2 my-2">
                {(gift.chatMessages || []).map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    className={`p-3 rounded-2xl text-xs ${
                      msg.sender === 'dino' ? 'bg-white text-[#1e1b16]' : 'bg-[#ffddb0] text-[#000d20]'
                    }`}
                  >
                    <p className="font-comfortaa">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SLIDE 7: Personal Love Letter */}
          {actualSlideId === 7 && (
            <div className="bg-[#0b2340] text-white rounded-2xl p-6 md:p-8 shadow-2xl relative border border-white/10">
              <div className="bg-[#fff8f0] text-[#1e1b16] rounded-xl p-6 md:p-8 shadow-md relative transform -rotate-1">
                <div className="washi-tape" />
                <div className="flex items-center justify-between mb-4 border-b border-[#f4ede4] pb-2">
                  <span className="font-archivo text-xs text-[#a68553] uppercase tracking-widest font-bold">
                    THE PERSONAL NOTE
                  </span>
                  <span className="inline-flex items-center gap-1 font-quicksand font-bold text-xs text-[#795154] bg-[#f4ede4] px-2.5 py-0.5 rounded-full border border-[#e8e2d9]">
                    <span>{gift.date}</span>
                  </span>
                </div>
                <p className="font-comfortaa text-lg leading-relaxed mb-6 italic whitespace-pre-wrap">
                  "{gift.letter || 'No matter how many miles lie between us, my heart is always with you.'}"
                </p>
                <div className="text-right font-comfortaa text-base text-[#44474d] font-bold">
                  — {gift.fromPerson || 'Dino 🦖'}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="px-6 flex justify-between items-center max-w-2xl mx-auto w-full mb-8">
        <button
          onClick={() => {
            soundFx.playPageTurn();
            if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
          }}
          disabled={currentSlide === 0}
          className={`px-5 py-2.5 rounded-xl font-quicksand font-bold text-sm flex items-center gap-2 transition-all ${
            currentSlide === 0
              ? 'opacity-40 cursor-not-allowed text-[#74777e]'
              : 'bg-white border border-[#c4c6ce] text-[#000d20] hover:bg-[#e8e2d9] cursor-pointer shadow-sm'
          }`}
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span>Previous</span>
        </button>

        <div className="flex gap-1.5 items-center">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                soundFx.playPageTurn();
                setCurrentSlide(i);
              }}
              className={`h-2.5 rounded-full cursor-pointer transition-all ${
                currentSlide === i ? 'bg-[#000d20] w-6' : 'bg-[#c4c6ce] w-2.5 hover:bg-[#a68553]'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            soundFx.playPageTurn();
            if (currentSlide < totalSlides - 1) {
              setCurrentSlide(currentSlide + 1);
            } else {
              soundFx.playSparkle();
              setCurrentSlide(0);
            }
          }}
          className="px-6 py-2.5 rounded-xl font-quicksand font-bold text-sm flex items-center gap-2 transition-all bg-[#000d20] text-[#ffddb0] hover:bg-[#0b2340] cursor-pointer shadow-md"
        >
          <span>{currentSlide < totalSlides - 1 ? 'Next' : 'Replay ↺'}</span>
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </footer>

      <MusicPlayerBar
        currentPreset={gift.musicPreset || gift.backgroundMusic || 'lullaby'}
        songTitle={gift.songTitle}
        songArtist={gift.songArtist}
        voiceNoteUrl={gift.voiceNoteUrl}
        customAudioUrl={gift.musicAudioUrl}
      />
    </div>
  );
};
