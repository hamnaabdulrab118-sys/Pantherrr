import React, { useState, useEffect, useCallback } from 'react';
import { GiftData, ActiveTab } from './types';
import { parseGiftFromUrl, getShareableUrl } from './utils/shareUtils';
import {
  saveGiftToServer,
  fetchGiftWithDiagnostics,
  FetchGiftDiagnostics,
  fetchAllServerGifts,
  deleteGiftFromServer,
} from './utils/storageApi';
import {
  calculateDistanceMiles,
  getCurrentBrowserGps,
  reverseGeocode,
  getCoordinatesForCity,
} from './utils/geoUtils';
import { soundFx } from './utils/soundEffects';
import { LockScreen } from './components/LockScreen';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { CoverScreen } from './components/CoverScreen';
import { GiftBuilder } from './components/GiftBuilder';
import { OurCollection } from './components/OurCollection';
import { LettersView } from './components/LettersView';
import { GiftViewer } from './components/GiftViewer';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // ─── STEP 1: Parse URL FIRST, synchronously, before anything else ───
  // This is the single source of truth for whether this is a shared link.
  const getUrlShareCode = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return (
        urlParams.get('gift') ||
        urlParams.get('letter') ||
        urlParams.get('id') ||
        urlParams.get('giftId') ||
        urlParams.get('code') ||
        urlParams.get('share') ||
        urlParams.get('view') ||
        null
      );
    } catch {
      return null;
    }
  };

  const initialShareCode = getUrlShareCode();
  const isSharedLink = Boolean(initialShareCode);

  // ─── STEP 2: Recipient mode is determined ONLY by the URL, never by login state ───
  const [isRecipientMode, setIsRecipientMode] = useState<boolean>(isSharedLink);

  // ─── STEP 3: Security state ───
  // Owner studio access requires PIN at base URL only. Share links NEVER grant owner access.
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('5425');
  const [showAdminUnlockModal, setShowAdminUnlockModal] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [adminPinError, setAdminPinError] = useState<boolean>(false);

  // ─── Location & Distance State ───
  const [dinoName, setDinoName] = useState<string>('Dino 🦖');
  const [pantherName, setPantherName] = useState<string>('Panther 🐾✈️');
  const [fromCity, setFromCity] = useState<string>('Sialkot, Punjab (Pakistan)');
  const [toCity, setToCity] = useState<string>('Ormara, Balochistan (Pakistan)');
  const [miles, setMiles] = useState<number>(770);
  const [fromCoords, setFromCoords] = useState<{ lat: number; lon: number }>(() =>
    getCoordinatesForCity('Sialkot')
  );
  const [toCoords, setToCoords] = useState<{ lat: number; lon: number }>(() =>
    getCoordinatesForCity('Ormara')
  );
  const [autoGpsOnStart, setAutoGpsOnStart] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('panther_dino_auto_gps');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);

  // ─── Navigation & Data State ───
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [editingGift, setEditingGift] = useState<GiftData | null>(null);

  // Recipient loading states — only used when isSharedLink is true
  const [isLoadingSharedGift, setIsLoadingSharedGift] = useState<boolean>(isSharedLink);
  const [selectedGift, setSelectedGift] = useState<GiftData | null>(null);
  const [giftNotFoundCode, setGiftNotFoundCode] = useState<string | null>(null);
  const [fetchDiagnostics, setFetchDiagnostics] = useState<FetchGiftDiagnostics | null>(null);

  // ─── CRITICAL: Collection NEVER loads from localStorage when this is a shared link ───
  // This prevents stale local data from bleeding into the recipient view.
  const [collection, setCollection] = useState<GiftData[]>(() => {
    if (isSharedLink) return []; // recipients never get local data
    try {
      const saved = localStorage.getItem('panther_dino_collection');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading localStorage collection:', e);
    }
    return [];
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [sharedLinkBanner, setSharedLinkBanner] = useState<string | null>(null);

  // ─── Sync collection to localStorage for OWNER only ───
  useEffect(() => {
    if (isSharedLink) return; // never write to localStorage in recipient mode
    try {
      localStorage.setItem('panther_dino_collection', JSON.stringify(collection));
    } catch (e) {
      console.error('Error saving localStorage collection:', e);
    }
  }, [collection, isSharedLink]);

  // ─── STEP 4: When this is a shared link, load from Firestore IMMEDIATELY ───
  // This is the ONLY thing that runs for recipients. fetchAllServerGifts is never called.
  useEffect(() => {
    if (!isSharedLink || !initialShareCode) return;

    const loadSharedGift = async () => {
      setIsLoadingSharedGift(true);
      setGiftNotFoundCode(null);
      setFetchDiagnostics(null);

      console.log('🔗 [Recipient Mode] Loading gift from Firestore for share code:', initialShareCode);

      try {
        const diag = await fetchGiftWithDiagnostics(initialShareCode);
        setFetchDiagnostics(diag);

        if (diag.gift) {
          console.log('✅ [Recipient Mode] Gift loaded successfully:', diag.gift.title);
          setSelectedGift(diag.gift);
          setIsLoadingSharedGift(false);
          setGiftNotFoundCode(null);
        } else {
          console.warn('⚠️ [Recipient Mode] Gift not found for code:', initialShareCode);
          setIsLoadingSharedGift(false);
          setGiftNotFoundCode(initialShareCode);
        }
      } catch (e) {
        console.error('❌ [Recipient Mode] Error fetching gift:', e);
        setIsLoadingSharedGift(false);
        setGiftNotFoundCode(initialShareCode);
      }
    };

    loadSharedGift();
  }, []); // runs once on mount only

  // ─── STEP 5: Owner mode — load collection from Firestore ───
  useEffect(() => {
    if (isSharedLink) return; // never runs for recipients

    fetchAllServerGifts().then((serverGifts) => {
      if (serverGifts && serverGifts.length > 0) {
        setCollection((prev) => {
          const combined = [...serverGifts];
          prev.forEach((p) => {
            if (!combined.some((c) => c.id === p.id)) {
              combined.push(p);
            }
          });
          return combined;
        });
      }
    });
  }, []); // runs once on mount, only for owner

  // ─── GPS Handler ───
  const handleLocateGps = useCallback(
    async (role: 'dino' | 'panther' = 'dino') => {
      try {
        setIsLocating(true);
        setGpsStatusMessage('Acquiring precise GPS coordinates...');
        const coords = await getCurrentBrowserGps();
        const { cityName } = await reverseGeocode(coords.lat, coords.lon);

        if (role === 'dino') {
          setFromCity(cityName);
          setFromCoords({ lat: coords.lat, lon: coords.lon });
          const newDist = calculateDistanceMiles(coords.lat, coords.lon, toCoords.lat, toCoords.lon);
          setMiles(newDist);
          setGpsStatusMessage(`📍 GPS Located Dino: ${cityName}! Distance to ${pantherName}: ${newDist.toLocaleString()} mi.`);
        } else {
          setToCity(cityName);
          setToCoords({ lat: coords.lat, lon: coords.lon });
          const newDist = calculateDistanceMiles(fromCoords.lat, fromCoords.lon, coords.lat, coords.lon);
          setMiles(newDist);
          setGpsStatusMessage(`🐾 GPS Located Panther: ${cityName}! Distance from ${dinoName}: ${newDist.toLocaleString()} mi.`);
        }

        soundFx.playSparkle();
        setTimeout(() => setGpsStatusMessage(null), 6000);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Unable to access GPS location.';
        setGpsStatusMessage(`⚠️ ${errorMsg}`);
        setTimeout(() => setGpsStatusMessage(null), 5000);
      } finally {
        setIsLocating(false);
      }
    },
    [toCoords, fromCoords, pantherName, dinoName]
  );

  // ─── Auto-GPS on Start (owner only) ───
  useEffect(() => {
    if (isSharedLink) return;
    if (autoGpsOnStart && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const { cityName } = await reverseGeocode(latitude, longitude);
            setFromCity(cityName);
            setFromCoords({ lat: latitude, lon: longitude });
            const newDist = calculateDistanceMiles(latitude, longitude, toCoords.lat, toCoords.lon);
            setMiles(newDist);
            setGpsStatusMessage(`📍 Auto-GPS Active: ${cityName} (${newDist.toLocaleString()} mi from ${pantherName})`);
            setTimeout(() => setGpsStatusMessage(null), 5000);
          } catch {
            // Silently fallback
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 }
      );
    }
  }, [autoGpsOnStart, toCoords, pantherName, isSharedLink]);

  // ─── Owner Actions ───
  const handlePublishGift = async (newGift: GiftData) => {
    await saveGiftToServer(newGift);
    setCollection((prev) => {
      const index = prev.findIndex((g) => g.id === newGift.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = newGift;
        return updated;
      }
      return [newGift, ...prev];
    });
    setEditingGift(null);
    setSelectedGift(newGift);
    if (typeof window !== 'undefined') {
      const shareUrl = getShareableUrl(newGift);
      window.history.pushState({ gift: newGift.id }, '', shareUrl);
    }
  };

  const handleStartNewGift = () => {
    setEditingGift(null);
    setActiveTab('builder');
  };

  const handleEditGift = (gift: GiftData) => {
    setEditingGift(gift);
    setIsRecipientMode(false);
    setActiveTab('builder');
  };

  const handleUpdatePantherLocation = (city: string, coords: { lat: number; lon: number }, distance: number) => {
    setToCity(city);
    setToCoords(coords);
    setMiles(distance);
    if (selectedGift) {
      const updated = { ...selectedGift, toCity: city, toCoords: coords, distanceMiles: distance };
      setSelectedGift(updated);
      setCollection((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    }
  };

  const handleOpenGiftViewer = (gift: GiftData) => {
    setSelectedGift(gift);
    setIsRecipientMode(false);
    setActiveTab('viewer');
    if (typeof window !== 'undefined') {
      const shareUrl = getShareableUrl(gift);
      window.history.pushState({ gift: gift.id }, '', shareUrl);
    }
  };

  const handlePreviewPantherView = (gift: GiftData) => {
    soundFx.playSparkle();
    setSelectedGift(gift);
    setIsRecipientMode(true);
    setActiveTab('viewer');
  };

  const handleDeleteGift = async (id: string) => {
    soundFx.playButtonClick();
    setCollection((prev) => prev.filter((item) => item.id !== id));
    await deleteGiftFromServer(id);
    if (selectedGift?.id === id) {
      setSelectedGift(null);
      setActiveTab('gallery');
    }
  };

  const handleDeleteLetter = async (id: string) => {
    soundFx.playButtonClick();
    setCollection((prev) => prev.filter((item) => item.id !== id));
    await deleteGiftFromServer(id);
    if (selectedGift?.id === id) setSelectedGift(null);
  };

  const handleSaveNewLetter = async (letterText: string) => {
    const newEntry: GiftData = {
      id: `letter-${Date.now()}`,
      title: `Love Letter for ${pantherName}`,
      fromPerson: dinoName,
      toPerson: pantherName,
      theme: 'Love Letter 💌',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      letter: letterText,
      coverImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      fromCity,
      toCity,
      distanceMiles: miles,
      flowers: ['Rose', 'Tulip'],
      wrapStyle: 'Kraft Ribbon',
      natureElements: ['Autumn Leaves'],
      charms: ['Silver Heart'],
      photoUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      photoCaption: 'A sweet letter for you',
      captainsLog: 'Loving you from afar...',
      locketPhoto: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      locketCaption: 'Forever in my heart',
      songTitle: 'Dedicated Melody',
      songArtist: dinoName,
      backgroundMusic: 'lullaby',
      published: true,
      enabledSlides: [0, 1, 7],
      shareCode: Math.random().toString(36).substring(2, 8),
    };
    await saveGiftToServer(newEntry);
    setCollection((prev) => [newEntry, ...prev]);
  };

  const handleResetData = () => {
    setCollection([]);
    try { localStorage.removeItem('panther_dino_collection'); } catch (e) { console.error(e); }
    setIsSettingsOpen(false);
  };

  const handleAdminUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput.trim() === pin.trim()) {
      soundFx.playSparkle();
      setIsUnlocked(true);
      setIsRecipientMode(false);
      setShowAdminUnlockModal(false);
      setAdminPinInput('');
      setAdminPinError(false);
      setActiveTab('gallery');
    } else {
      soundFx.playButtonClick();
      setAdminPinError(true);
    }
  };

  // ════════════════════════════════════════════════════════════
  // RENDER TREE
  // ════════════════════════════════════════════════════════════

  // ── A: RECIPIENT / PANTHER VIEW ──
  // Shown whenever URL has a gift share code. Login state is irrelevant.
  if (isRecipientMode) {

    // Loading from Firestore
    if (isLoadingSharedGift) {
      return (
        <div className="min-h-screen bg-[#000d20] text-white flex flex-col items-center justify-center p-6 text-center font-quicksand">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/20 animate-pulse text-center">
            <div className="text-4xl mb-4 flex justify-center items-center gap-3">
              <span>🦖</span>
              <span className="text-[#ffddb0] text-2xl animate-bounce">💌</span>
              <span>🐾</span>
            </div>
            <h2 className="font-quicksand font-bold text-2xl text-white mb-2">Opening Dino's Letter</h2>
            <p className="font-comfortaa text-sm text-[#b2c8ed] mb-4">
              Looking up memory across the miles from Sialkot to Ormara...
            </p>
            <div className="w-12 h-1 bg-[#ffddb0] rounded-full mx-auto animate-pulse" />
          </div>
        </div>
      );
    }

    // Gift loaded — show clean recipient view
    if (selectedGift) {
      return (
        <div className="min-h-screen bg-[#000d20] relative">
          <GiftViewer
            gift={selectedGift}
            fromCoords={fromCoords}
            toCoords={toCoords}
            isRecipientMode={true}
            onBack={() => setShowAdminUnlockModal(true)}
            onAdminUnlockRequest={() => setShowAdminUnlockModal(true)}
            onUpdatePantherLocation={handleUpdatePantherLocation}
          />

          {/* Discreet creator login modal — only Dino knows about the 🗝️ */}
          {showAdminUnlockModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-[#e8e2d9]">
                <div className="w-12 h-12 rounded-full bg-[#000d20] text-[#ffddb0] mx-auto flex items-center justify-center font-bold text-xl mb-3 shadow">🗝️</div>
                <h3 className="font-quicksand font-bold text-xl text-[#000d20] mb-1">Dino's Creator Login</h3>
                <p className="font-comfortaa text-xs text-[#74777e] mb-4">Enter your secret PIN to open the Creator Studio.</p>
                <form onSubmit={handleAdminUnlockSubmit} className="space-y-4">
                  <input
                    type="password"
                    maxLength={6}
                    value={adminPinInput}
                    onChange={(e) => { setAdminPinInput(e.target.value); setAdminPinError(false); }}
                    placeholder="Enter PIN"
                    className="w-full text-center text-2xl tracking-[0.3em] font-mono py-2.5 rounded-xl border border-[#000d20]/30 focus:border-[#000d20] outline-none"
                    autoFocus
                  />
                  {adminPinError && <p className="font-quicksand font-bold text-xs text-red-600">Incorrect PIN. Please try again.</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setShowAdminUnlockModal(false); setAdminPinInput(''); setAdminPinError(false); }} className="flex-1 py-2.5 rounded-xl border border-[#c4c6ce] text-[#000d20] font-quicksand font-bold text-xs cursor-pointer hover:bg-[#eee7de]">Cancel</button>
                    <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#000d20] text-[#ffddb0] font-quicksand font-bold text-xs cursor-pointer hover:bg-[#0b2340]">Unlock Studio</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Gift not found
    return (
      <div className="min-h-screen bg-[#000d20] text-white flex flex-col items-center justify-center p-6 text-center font-quicksand">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20">
          <div className="w-14 h-14 rounded-full bg-[#ffddb0]/20 text-[#ffddb0] mx-auto flex items-center justify-center text-3xl mb-4 border border-[#e7c08a]/40">
            {fetchDiagnostics?.status === 'permission_denied' ? '🔒' : '💌'}
          </div>
          <h2 className="font-quicksand font-bold text-2xl text-white mb-2">
            {fetchDiagnostics?.status === 'permission_denied' ? 'Permission Notice' : 'Memory Not Found'}
          </h2>
          <p className="font-comfortaa text-sm text-[#b2c8ed] mb-4 leading-relaxed">
            {fetchDiagnostics?.errorMessage || (giftNotFoundCode ? `Memory ID "${giftNotFoundCode}" was not found in the cloud database.` : 'No memory ID was provided in the share link.')}
          </p>
          <div className="bg-[#000d20]/80 rounded-2xl p-4 border border-white/10 text-left mb-6 space-y-1.5 font-mono text-xs">
            <div className="text-[#a68553] font-bold text-[10px] uppercase tracking-wider">Lookup Diagnostics:</div>
            <div className="text-white truncate"><span className="text-[#74777e]">Attempted ID:</span> <span className="text-[#ffddb0] font-bold">{giftNotFoundCode || 'None'}</span></div>
            <div className="text-white"><span className="text-[#74777e]">Status:</span> <span className={fetchDiagnostics?.status === 'permission_denied' ? 'text-rose-400 font-bold' : 'text-amber-300'}>{fetchDiagnostics?.status || 'not_found'}</span></div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                if (giftNotFoundCode) {
                  setIsLoadingSharedGift(true);
                  fetchGiftWithDiagnostics(giftNotFoundCode).then((diag) => {
                    setFetchDiagnostics(diag);
                    if (diag.gift) { setSelectedGift(diag.gift); }
                    setIsLoadingSharedGift(false);
                  });
                }
              }}
              className="w-full bg-[#ffddb0] text-[#000d20] py-3 rounded-xl font-quicksand font-bold text-sm hover:bg-[#e7c08a] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              <span>Retry Looking Up Memory</span>
            </button>
            <button onClick={() => setShowAdminUnlockModal(true)} className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-quicksand font-bold text-sm border border-white/20 transition-colors cursor-pointer">
              Dino's Creator Login 🗝️
            </button>
          </div>
        </div>

        {showAdminUnlockModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-[#e8e2d9]">
              <div className="w-12 h-12 rounded-full bg-[#000d20] text-[#ffddb0] mx-auto flex items-center justify-center font-bold text-xl mb-3 shadow">🗝️</div>
              <h3 className="font-quicksand font-bold text-xl text-[#000d20] mb-1">Dino's Creator Login</h3>
              <p className="font-comfortaa text-xs text-[#74777e] mb-4">Enter your secret PIN to open the Creator Studio.</p>
              <form onSubmit={handleAdminUnlockSubmit} className="space-y-4">
                <input
                  type="password"
                  maxLength={6}
                  value={adminPinInput}
                  onChange={(e) => { setAdminPinInput(e.target.value); setAdminPinError(false); }}
                  placeholder="Enter PIN"
                  className="w-full text-center text-2xl tracking-[0.3em] font-mono py-2.5 rounded-xl border border-[#000d20]/30 focus:border-[#000d20] outline-none"
                  autoFocus
                />
                {adminPinError && <p className="font-quicksand font-bold text-xs text-red-600">Incorrect PIN. Please try again.</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setShowAdminUnlockModal(false); setAdminPinInput(''); setAdminPinError(false); }} className="flex-1 py-2.5 rounded-xl border border-[#c4c6ce] text-[#000d20] font-quicksand font-bold text-xs cursor-pointer hover:bg-[#eee7de]">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#000d20] text-[#ffddb0] font-quicksand font-bold text-xs cursor-pointer hover:bg-[#0b2340]">Unlock Studio</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── B: OWNER PIN GATE ──
  // Only shown at the base URL with no gift parameter
  if (!isUnlocked) {
    return <LockScreen correctPin={pin} onUnlock={() => setIsUnlocked(true)} />;
  }

  // ── C: OWNER CREATOR STUDIO ──
  return (
    <div className="min-h-screen bg-[#fff8f0] text-[#1e1b16] font-sans antialiased selection:bg-[#fdc7cb] selection:text-[#795154] relative">
      {sharedLinkBanner && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-[#000d20] text-[#ffddb0] px-6 py-2.5 rounded-full shadow-2xl font-quicksand font-bold text-sm flex items-center gap-2 border border-[#e7c08a]/30 animate-bounce">
          <span className="material-symbols-outlined text-base">card_giftcard</span>
          <span>{sharedLinkBanner}</span>
        </div>
      )}

      <TopBar
        title={`For ${pantherName}`}
        dinoName={dinoName}
        pantherName={pantherName}
        fromCity={fromCity}
        toCity={toCity}
        miles={miles}
        fromCoords={fromCoords}
        toCoords={toCoords}
        isLocating={isLocating}
        gpsStatusMessage={gpsStatusMessage}
        onLocateGps={handleLocateGps}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="pb-16">
        {activeTab === 'home' && (
          <CoverScreen
            pantherName={pantherName}
            dinoName={dinoName}
            onStartNewGift={handleStartNewGift}
            onViewCollection={() => setActiveTab('gallery')}
          />
        )}

        {activeTab === 'builder' && (
          <GiftBuilder
            initialGift={editingGift}
            dinoName={dinoName}
            pantherName={pantherName}
            fromCity={fromCity}
            toCity={toCity}
            miles={miles}
            fromCoords={fromCoords}
            toCoords={toCoords}
            onPublishGift={handlePublishGift}
            onCancel={() => { setEditingGift(null); setActiveTab('gallery'); }}
          />
        )}

        {activeTab === 'gallery' && (
          <OurCollection
            collection={collection}
            onStartNewGift={handleStartNewGift}
            onOpenGift={handleOpenGiftViewer}
            onPreviewPantherView={handlePreviewPantherView}
            onEditGift={handleEditGift}
            onDeleteGift={handleDeleteGift}
          />
        )}

        {activeTab === 'letters' && (
          <LettersView
            collection={collection}
            onOpenGift={handleOpenGiftViewer}
            onDeleteLetter={handleDeleteLetter}
            onSaveNewLetter={handleSaveNewLetter}
            dinoName={dinoName}
            pantherName={pantherName}
          />
        )}

        {activeTab === 'viewer' && selectedGift && (
          <GiftViewer
            gift={selectedGift}
            fromCoords={fromCoords}
            toCoords={toCoords}
            isRecipientMode={false}
            onBack={() => setActiveTab('gallery')}
            onEdit={handleEditGift}
            onUpdatePantherLocation={handleUpdatePantherLocation}
          />
        )}

        {activeTab === 'settings' && (
          <div className="p-8 max-w-2xl mx-auto text-center py-20">
            <h1 className="font-quicksand font-bold text-3xl text-[#000d20] mb-4">App Preferences</h1>
            <p className="font-comfortaa text-base text-[#44474d] mb-8">
              Manage your access code, GPS live coordinates, flight distances, and journey names.
            </p>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="bg-[#000d20] text-[#ffddb0] font-quicksand font-bold px-8 py-3.5 rounded-xl shadow-md hover:bg-[#0b2340] transition-all cursor-pointer"
            >
              Open Settings Modal
            </button>
          </div>
        )}
      </div>

      {activeTab !== 'builder' && activeTab !== 'viewer' && (
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => {
            if (tab === 'settings') {
              setIsSettingsOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        pin={pin}
        onUpdatePin={(newPin) => setPin(newPin)}
        dinoName={dinoName}
        pantherName={pantherName}
        onUpdateNames={(dino, panther) => { setDinoName(dino); setPantherName(panther); }}
        fromCity={fromCity}
        toCity={toCity}
        miles={miles}
        fromCoords={fromCoords}
        toCoords={toCoords}
        autoGpsOnStart={autoGpsOnStart}
        onToggleAutoGps={(enabled) => {
          setAutoGpsOnStart(enabled);
          try { localStorage.setItem('panther_dino_auto_gps', JSON.stringify(enabled)); } catch (e) { console.error(e); }
        }}
        onLocateGps={handleLocateGps}
        onUpdateTrip={(from, to, m, fCoord, tCoord) => {
          setFromCity(from);
          setToCity(to);
          setMiles(m);
          if (fCoord) setFromCoords(fCoord);
          if (tCoord) setToCoords(tCoord);
        }}
        onLockApp={() => setIsUnlocked(false)}
        onResetData={handleResetData}
      />
    </div>
  );
}
