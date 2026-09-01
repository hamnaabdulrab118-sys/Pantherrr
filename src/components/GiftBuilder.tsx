import React, { useState } from 'react';
import { GiftData, ChatMessage } from '../types';
import { THEME_OPTIONS, FLOWER_OPTIONS, WRAP_STYLES, NATURE_ELEMENTS, CHARM_OPTIONS } from '../data';
import { getShareableUrl, copyToClipboard, optimizeImage } from '../utils/shareUtils';
import { saveGiftToServer } from '../utils/storageApi';
import { soundFx, MUSIC_PRESETS } from '../utils/soundEffects';
import { BouquetVisualizer } from './BouquetVisualizer';
import { NatureAmbientOverlay } from './NatureAmbientOverlay';
import { CharmOverlay } from './CharmOverlay';
import { Dynamic3DSky } from './Dynamic3DSky';
import { MiniDinoCompanion } from './MiniDinoCompanion';
import { VoiceRecorder } from './VoiceRecorder';
import { DistanceTopTab } from './DistanceTopTab';
import { getThemeStyle } from '../utils/themeUtils';
import dinoPantherLogo from '../assets/images/dino_panther_same_size_1788091439765.jpg';

interface GiftBuilderProps {
  onPublishGift: (gift: GiftData) => void;
  onCancel: () => void;
  initialGift?: GiftData | null;
  dinoName?: string;
  pantherName?: string;
  fromCity?: string;
  toCity?: string;
  miles?: number;
  fromCoords?: { lat: number; lon: number };
  toCoords?: { lat: number; lon: number };
}

const SLIDE_INFO = [
  { id: 0, title: 'Cover Page', shortTitle: 'Cover', icon: 'photo_library', desc: 'Dino & Panther cover illustration' },
  { id: 1, title: 'Bouquet & Theme', shortTitle: 'Bouquet', icon: 'local_florist', desc: 'Handcrafted floral bouquet and sky theme' },
  { id: 2, title: 'Charms & Nature', shortTitle: 'Charms', icon: 'magic_button', desc: 'Keepsake charms and ambient nature effects' },
  { id: 3, title: 'Photo, Video & Music', shortTitle: 'Media Studio', icon: 'perm_media', desc: 'Photos, videos, voice note and background melody' },
  { id: 4, title: "Captain's Log", shortTitle: 'Log', icon: 'sailing', desc: 'Sailboat memory and travel journal' },
  { id: 5, title: 'That Smile Locket', shortTitle: 'Locket', icon: 'favorite', desc: 'Sweet smile portrait with caption' },
  { id: 6, title: 'Dino & Moon Chat', shortTitle: 'Sky Chat', icon: 'nightlight', desc: '3D starlit conversation between Dino & Moon' },
  { id: 7, title: 'Personal Note', shortTitle: 'Letter', icon: 'mail', desc: 'Heartfelt personal letter' },
];

const COVER_PRESETS = [
  {
    id: 'dino_panther_logo',
    name: 'Dino & Panther Hearts (Official Logo)',
    url: dinoPantherLogo,
  },
  {
    id: 'dino_panther_stars',
    name: 'Dino & Panther Under Stars',
    url: '/src/assets/images/dino_panther_cover_1786116019800.jpg',
  },
  {
    id: 'cozy_couple',
    name: 'Cozy Couple Journey',
    url: '/src/assets/images/cozy_couple_cover_1786014485925.jpg',
  },
  {
    id: 'ocean_sailboat',
    name: 'Sailboat Sunset Ocean',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoWCovh9i61yXaZtDy9vVd6rzT5VAL4J67fpXMcELIjNS8KURCtEWMnR7DnCnawwNDMK-TRz7THJVcc95-sD0LsxMIJE4Ox44DkCfJFHkyArer_Lw6ZW0XxUSweCc5QA76k2Nc2vPDz6IlxCezAxz3Jvq2R4X-k_h8rXnK1Frm1jlpJaGbEvunoup5og8Xglnnpc5xrqhg1OH58oUk0aKxnnMG-7GvOmf3lbQDsdNsR3mdb4HpD5Mz1w',
  },
  {
    id: 'flower_picnic',
    name: 'Picnic in the Meadow',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAu0MfJAug78lQNrAHPEo1RSLro-JI3vLIRie3aazDfXJ5moeF4ZyHUmRqe_vvHvCQjEVc-IEFyhV7SwjeKJM9kY3DLi1r0z4RvfQQHqFkp1-We3F5HMxi7NxrJ0qGyxUitDhEHArBW89DfsAjVtssmuO8duUlH0ZC3EmJ431jG9jluwEsQ2p-UFSrTBD1PNUHKE8JexWdnAwpYEOKU5gu8FpN8QvZqHJCaZUpJwbLY22KdoS6pTiePQ',
  },
];

export const GiftBuilder: React.FC<GiftBuilderProps> = ({
  onPublishGift,
  onCancel,
  initialGift,
  dinoName = 'Dino 🦖',
  pantherName = 'Panther 🐾✈️',
  fromCity = 'Sialkot, Punjab (Pakistan)',
  toCity = 'Ormara, Balochistan (Pakistan)',
  miles = 770,
  fromCoords = { lat: 32.4945, lon: 74.5229 },
  toCoords = { lat: 25.2088, lon: 64.6357 },
}) => {
  const isEditMode = Boolean(initialGift);
  const [step, setStep] = useState<number>(1);
  const [theme, setTheme] = useState<string>(initialGift?.theme || 'Midnight Sky');
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>(
    initialGift?.flowers && initialGift.flowers.length > 0
      ? initialGift.flowers
      : ['Roses', 'Peonies', 'Lavender', 'Tulips', 'Cherry Blossoms']
  );
  const [wrapStyle, setWrapStyle] = useState<string>(initialGift?.wrapStyle || 'Classic Wrap');
  const [bouquetLetter, setBouquetLetter] = useState<string>(
    initialGift?.bouquetLetter || 'Tucked inside with love & roses... 🌹'
  );
  const [selectedNature, setSelectedNature] = useState<string[]>(initialGift?.natureElements || []);
  const [selectedCharms, setSelectedCharms] = useState<string[]>(
    initialGift?.charms && initialGift.charms.length > 0
      ? initialGift.charms
      : ['Kiss', 'Coffee', 'Safe Flight', 'Star']
  );
  const [enabledSlides, setEnabledSlides] = useState<number[]>(
    initialGift?.enabledSlides || [0, 1, 2, 3, 4, 5, 6, 7]
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Media, Video, Voice Over, Music
  const [coverImage, setCoverImage] = useState<string>(initialGift?.coverImage || dinoPantherLogo);
  const [photoUrl, setPhotoUrl] = useState<string>(initialGift?.photoUrl || dinoPantherLogo);
  const [photoCaption, setPhotoCaption] = useState<string>(
    initialGift?.photoCaption || 'Looking at the exact same moon from Sialkot to Ormara.'
  );
  const [videoUrl, setVideoUrl] = useState<string>(initialGift?.videoUrl || '');
  const [videoCaption, setVideoCaption] = useState<string>(
    initialGift?.videoCaption || 'Our favorite memory in motion 📹'
  );
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | undefined>(initialGift?.voiceNoteUrl);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState<number>(initialGift?.voiceNoteDuration || 0);
  const [musicPreset, setMusicPreset] = useState<string>(
    initialGift?.musicPreset || initialGift?.backgroundMusic || 'lullaby'
  );
  const [musicAudioUrl, setMusicAudioUrl] = useState<string | undefined>(initialGift?.musicAudioUrl);
  const [songTitle, setSongTitle] = useState<string>(initialGift?.songTitle || 'Moon River');
  const [songArtist, setSongArtist] = useState<string>(initialGift?.songArtist || 'Frank Ocean');
  const [moodTag, setMoodTag] = useState<string>(initialGift?.moodTag || 'Romantic');
  const [activeMediaTab, setActiveMediaTab] = useState<'photo' | 'video' | 'voice' | 'music'>('photo');

  // Dino & Moon Chat Conversation
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    initialGift?.chatMessages && initialGift.chatMessages.length > 0
      ? initialGift.chatMessages
      : [
          {
            id: 'msg-1',
            sender: 'dino',
            text: `Hey Moon! 🌙 The stars look extra bright over Sialkot tonight. Makes me think of my favorite ${pantherName} in Ormara...`,
            time: '9:45 PM',
          },
          {
            id: 'msg-2',
            sender: 'moon',
            text: 'Rawr! 🦕 I can see both of you from up here! Sending shooting stars across Balochistan and Punjab right now ✨',
            time: '9:46 PM',
          },
          {
            id: 'msg-3',
            sender: 'dino',
            text: 'Thank you Moon! Count down the days until we stare at the sky together again! 💚',
            time: '9:47 PM',
          },
        ]
  );
  const [chatSender, setChatSender] = useState<'dino' | 'moon'>('dino');
  const [newChatInput, setNewChatInput] = useState<string>('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatText, setEditingChatText] = useState<string>('');

  // Keepsakes
  const [captainsLog, setCaptainsLog] = useState<string>(
    initialGift?.captainsLog || 'Sending love across the skies from Sialkot to Ormara, Balochistan...'
  );
  const [captainsLogImage, setCaptainsLogImage] = useState<string>(
    initialGift?.captainsLogImage ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDoWCovh9i61yXaZtDy9vVd6rzT5VAL4J67fpXMcELIjNS8KURCtEWMnR7DnCnawwNDMK-TRz7THJVcc95-sD0LsxMIJE4Ox44DkCfJFHkyArer_Lw6ZW0XxUSweCc5QA76k2Nc2vPDz6IlxCezAxz3Jvq2R4X-k_h8rXnK1Frm1jlpJaGbEvunoup5og8Xglnnpc5xrqhg1OH58oUk0aKxnnMG-7GvOmf3lbQDsdNsR3mdb4HpD5Mz1w'
  );
  const [locketPhoto, setLocketPhoto] = useState<string>(initialGift?.locketPhoto || dinoPantherLogo);
  const [locketCaption, setLocketCaption] = useState<string>(
    initialGift?.locketCaption || 'The prettiest smile under the stars 🥹'
  );
  const [personalLetter, setPersonalLetter] = useState<string>(
    initialGift?.letter ||
      "From Sialkot with all my heart to my man in Ormara, Balochistan. No matter how many miles lie between us, every heartbeat and every prayer belongs to you. Can't wait until we're together again 💚"
  );

  // Memory Date Picker State & Helpers
  const [memoryDate, setMemoryDate] = useState<string>(
    initialGift?.date ||
      new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );

  // Convert string date (or formatted date) to YYYY-MM-DD for <input type="date">
  const getIsoDateValue = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch {
      // fallback
    }
    return new Date().toISOString().split('T')[0];
  };

  // Convert YYYY-MM-DD from calendar picker to readable string format (e.g. August 10, 2026)
  const handleCalendarDatePick = (isoString: string) => {
    if (!isoString) return;
    try {
      const [year, month, day] = isoString.split('-').map(Number);
      if (year && month && day) {
        const d = new Date(year, month - 1, day);
        const formatted = d.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
        setMemoryDate(formatted);
        soundFx.playSparkle();
        showToast(`Memory date set to ${formatted} 📅`);
        return;
      }
    } catch {
      // fallback
    }
    setMemoryDate(isoString);
  };

  // Quick Date presets
  const setQuickDate = (type: 'today' | 'yesterday' | 'oneWeekAgo' | 'custom', customStr?: string) => {
    soundFx.playSparkle();
    const d = new Date();
    if (type === 'today') {
      const formatted = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      setMemoryDate(formatted);
      showToast(`Memory date set to Today (${formatted}) 📅`);
    } else if (type === 'yesterday') {
      d.setDate(d.getDate() - 1);
      const formatted = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      setMemoryDate(formatted);
      showToast(`Memory date set to Yesterday (${formatted}) 📅`);
    } else if (type === 'oneWeekAgo') {
      d.setDate(d.getDate() - 7);
      const formatted = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      setMemoryDate(formatted);
      showToast(`Memory date set to One Week Ago (${formatted}) 📅`);
    } else if (customStr) {
      setMemoryDate(customStr);
      showToast(`Memory date set to ${customStr} 📅`);
    }
  };

  // Helper for file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playSparkle();
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const rawUrl = event.target.result as string;
          // Automatically resize and optimize image to keep URL share links lightweight
          const optimized = await optimizeImage(rawUrl);
          setter(optimized);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper for video file upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playSparkle();
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setVideoUrl(event.target.result as string);
          showToast('Video uploaded successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper for audio file upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playSparkle();
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          setMusicAudioUrl(url);
          if (!songTitle || songTitle === 'Moon River') {
            setSongTitle(file.name.replace(/\.[^/.]+$/, ''));
          }
          showToast('Custom song/audio uploaded for background music! 🎵');
          soundFx.playCustomAudio(url);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasteAudioFromClipboard = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setMusicAudioUrl(text.trim());
          showToast('Audio URL pasted! 🎶');
          soundFx.playCustomAudio(text.trim());
        }
      }
    } catch {
      showToast('Please paste the URL directly into the input box.');
    }
  };

  // Publishing
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [publishedShareCode, setPublishedShareCode] = useState<string>('');
  const [publishedGift, setPublishedGift] = useState<GiftData | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const totalSteps = 8;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const nextStep = () => {
    soundFx.playPageTurn();
    const currentIdx = step - 1;
    if (!enabledSlides.includes(currentIdx)) {
      setEnabledSlides((prev) => [...prev, currentIdx].sort((a, b) => a - b));
    }
    if (step < totalSteps) setStep(step + 1);
  };

  const skipCurrentStep = () => {
    soundFx.playPageTurn();
    const currentIdx = step - 1;
    if (enabledSlides.includes(currentIdx)) {
      if (enabledSlides.length === 1) {
        showToast('Your gift needs at least 1 slide!');
      } else {
        setEnabledSlides((prev) => prev.filter((id) => id !== currentIdx));
        showToast(`Skipped ${SLIDE_INFO[currentIdx]?.shortTitle} (Excluded from final gift)`);
      }
    }
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    soundFx.playPageTurn();
    if (step > 1) setStep(step - 1);
  };

  const addFlowerStem = (flowerName: string) => {
    if (selectedFlowers.length >= 12) {
      alert('Your bouquet already has 12 stems! Remove a stem or clear to add more.');
      return;
    }
    soundFx.playFlowerPop(selectedFlowers.length);
    setSelectedFlowers([...selectedFlowers, flowerName]);
  };

  const removeFlowerStem = (flowerName: string) => {
    soundFx.playButtonClick();
    const lastIdx = selectedFlowers.lastIndexOf(flowerName);
    if (lastIdx !== -1) {
      const updated = [...selectedFlowers];
      updated.splice(lastIdx, 1);
      setSelectedFlowers(updated);
    }
  };

  const removeStemAtIndex = (index: number) => {
    soundFx.playButtonClick();
    const updated = [...selectedFlowers];
    updated.splice(index, 1);
    setSelectedFlowers(updated);
  };

  const fillAllWith = (flowerName: string) => {
    soundFx.playSparkle();
    setSelectedFlowers(Array(12).fill(flowerName));
  };

  const clearBouquet = () => {
    soundFx.playButtonClick();
    setSelectedFlowers([]);
  };

  const fillMixedGarden = () => {
    soundFx.playSparkle();
    const mixed = ['Roses', 'Peonies', 'Lavender', 'Tulips', 'Sunflowers', 'Daisies', 'Cherry Blossoms', 'Hydrangeas', 'Lilies', 'Orchids', 'Roses', 'Peonies'];
    setSelectedFlowers(mixed);
  };

  const toggleNature = (id: string) => {
    soundFx.playSparkle();
    if (selectedNature.includes(id)) {
      setSelectedNature(selectedNature.filter((n) => n !== id));
    } else {
      setSelectedNature([...selectedNature, id]);
    }
  };

  const toggleCharm = (charmName: string) => {
    soundFx.playKissHeart();
    if (selectedCharms.includes(charmName)) {
      setSelectedCharms(selectedCharms.filter((c) => c !== charmName));
    } else {
      setSelectedCharms([...selectedCharms, charmName]);
    }
  };

  const CHAT_PRESETS = [
    {
      id: 'stargazing',
      title: '✨ Stargazing Love',
      dinoText: `Hey Moon! 🌙 The stars look extra bright over Sialkot tonight. Please shine gently over my favorite ${pantherName} in Ormara...`,
      moonText: 'Rawr! 🦕 I can see both of you from up here! Sending shooting stars across Balochistan and Punjab right now ✨',
    },
    {
      id: 'distance',
      title: '✈️ Sialkot to Ormara',
      dinoText: `Even across ${miles} miles from Sialkot to Ormara, Balochistan, are we looking at the exact same moon tonight? 🌍💚`,
      moonText: 'Always! Under the same celestial sky, our hearts are connected and beating together 💖',
    },
    {
      id: 'morning_coffee',
      title: '☕ Warm Chai & Coffee',
      dinoText: `Good morning Moon! Please send a warm hug and coastal breeze to ${pantherName} in Ormara for me ☕🌸`,
      moonText: `Delivered! Wrapping ${pantherName} in the warmest morning glow and love today 🌤️✨`,
    },
    {
      id: 'playful_rawr',
      title: '🦕 Playful Dino Rawr',
      dinoText: 'Sending a million dinosaur rawrs and 100 kisses from Sialkot straight to my man in Ormara! 🦖💋',
      moonText: 'Catching every single kiss and sprinkling them like stardust across Balochistan! 🌟💖',
    },
  ];

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatInput.trim()) return;
    soundFx.playSparkle();
    const msg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: chatSender,
      text: newChatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages([...chatMessages, msg]);
    setNewChatInput('');
    showToast(`Added message as ${chatSender === 'dino' ? 'Dino 🦖' : 'Moon 🌙'}! ✨`);
  };

  const handleUpdateDinoMainText = (text: string) => {
    const dinoIdx = chatMessages.findIndex((m) => m.sender === 'dino');
    if (dinoIdx !== -1) {
      const updated = [...chatMessages];
      updated[dinoIdx] = { ...updated[dinoIdx], text };
      setChatMessages(updated);
    } else {
      setChatMessages([
        {
          id: `chat-${Date.now()}`,
          sender: 'dino',
          text,
          time: '9:45 PM',
        },
        ...chatMessages,
      ]);
    }
  };

  const handleUpdateMoonMainText = (text: string) => {
    const moonIdx = chatMessages.findIndex((m) => m.sender === 'moon');
    if (moonIdx !== -1) {
      const updated = [...chatMessages];
      updated[moonIdx] = { ...updated[moonIdx], text };
      setChatMessages(updated);
    } else {
      setChatMessages([
        ...chatMessages,
        {
          id: `chat-${Date.now()}`,
          sender: 'moon',
          text,
          time: '9:46 PM',
        },
      ]);
    }
  };

  const handleToggleMessageSender = (id: string) => {
    soundFx.playButtonClick();
    setChatMessages((prev) =>
      prev.map((msg) =>
        msg.id === id
          ? { ...msg, sender: msg.sender === 'dino' ? 'moon' : 'dino' }
          : msg
      )
    );
  };

  const handleDeleteChatMessage = (id: string) => {
    soundFx.playButtonClick();
    setChatMessages((prev) => prev.filter((msg) => msg.id !== id));
    showToast('Message deleted');
  };

  const handleStartEditChatMessage = (msg: ChatMessage) => {
    setEditingChatId(msg.id);
    setEditingChatText(msg.text);
  };

  const handleSaveEditChatMessage = (id: string) => {
    if (!editingChatText.trim()) return;
    soundFx.playSparkle();
    setChatMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, text: editingChatText.trim() } : msg
      )
    );
    setEditingChatId(null);
    setEditingChatText('');
    showToast('Message updated ✨');
  };

  const handleLoadChatPreset = (preset: (typeof CHAT_PRESETS)[0]) => {
    soundFx.playSparkle();
    setChatMessages([
      {
        id: `preset-dino-${Date.now()}`,
        sender: 'dino',
        text: preset.dinoText,
        time: '9:45 PM',
      },
      {
        id: `preset-moon-${Date.now() + 1}`,
        sender: 'moon',
        text: preset.moonText,
        time: '9:46 PM',
      },
    ]);
    showToast(`Loaded "${preset.title}" conversation! ✨`);
  };

  const toggleScreenInclusion = (slideIdx: number) => {
    soundFx.playButtonClick();
    if (enabledSlides.includes(slideIdx)) {
      if (enabledSlides.length === 1) {
        showToast('Your gift must include at least 1 screen!');
        return;
      }
      setEnabledSlides(enabledSlides.filter((id) => id !== slideIdx));
      showToast(`Excluded ${SLIDE_INFO[slideIdx]?.shortTitle} from final gift`);
    } else {
      setEnabledSlides([...enabledSlides, slideIdx].sort((a, b) => a - b));
      showToast(`Included ${SLIDE_INFO[slideIdx]?.shortTitle} in final gift`);
    }
  };

  const handleSelectAllSlides = () => {
    soundFx.playSparkle();
    setEnabledSlides([0, 1, 2, 3, 4, 5, 6, 7]);
    showToast('All 8 slides included in gift!');
  };

  const handlePublish = async () => {
    if (enabledSlides.length === 0) {
      showToast('Please select at least 1 slide to include in your gift!');
      return;
    }

    soundFx.playSuccessChime();
    setIsPublishing(true);

    const code = initialGift?.shareCode || Math.random().toString(36).substring(2, 8);
    const finalGift: GiftData = {
      id: initialGift?.id || `gift-${Date.now()}`,
      title: initialGift?.title || `A Journey for ${pantherName}`,
      theme,
      flowers: selectedFlowers,
      wrapStyle,
      bouquetLetter,
      natureElements: selectedNature,
      charms: selectedCharms,
      coverImage,
      photoUrl,
      photoCaption,
      videoUrl,
      videoCaption,
      voiceNoteUrl,
      voiceNoteDuration,
      songTitle,
      songArtist,
      backgroundMusic: musicPreset,
      musicPreset,
      musicAudioUrl,
      moodTag,
      captainsLog,
      captainsLogImage,
      locketPhoto,
      locketCaption,
      distanceMiles: miles,
      fromCity,
      toCity,
      fromCoords,
      toCoords,
      fromPerson: dinoName,
      toPerson: pantherName,
      letter: personalLetter,
      chatMessages,
      date: memoryDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      lastEditedDate: isEditMode
        ? new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : undefined,
      published: true,
      shareCode: code,
      enabledSlides: [...enabledSlides].sort((a, b) => a - b),
    };

    // Save full gift (with 3-4 min audio, video, HD photos) to server database
    await saveGiftToServer(finalGift);

    setPublishedShareCode(code);
    setIsPublishing(false);
    setIsPublished(true);
    setPublishedGift(finalGift);
    onPublishGift(finalGift);
  };

  const currentThemeStyle = getThemeStyle(theme);

  return (
    <div className={`min-h-screen ${currentThemeStyle.bgStyle} transition-colors duration-500 pb-28 font-quicksand relative`}>
      {/* Floating Nature Overlay & Companions */}
      <NatureAmbientOverlay natureElements={selectedNature} />
      <MiniDinoCompanion />

      {/* Top Distance Tab */}
      <DistanceTopTab
        dinoName={dinoName}
        pantherName={pantherName}
        fromCity={fromCity}
        toCity={toCity}
        miles={miles}
        fromCoords={fromCoords}
        toCoords={toCoords}
      />

      {/* Edit Mode Banner */}
      {isEditMode && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-bold text-amber-900 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm text-amber-700">edit_note</span>
          <span>Editing Published Scrapbook: <strong>"{initialGift?.title}"</strong> — any changes you make will update your live saved gift! ✨</span>
        </div>
      )}

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#000d20] text-[#ffddb0] px-5 py-2.5 rounded-full font-quicksand font-bold text-xs shadow-2xl border border-white/20 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-sm">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Interactive Stepper */}
      <header className={`sticky top-0 z-40 backdrop-blur-md px-6 py-3 border-b border-[#e8e2d9]/40 flex flex-col sm:flex-row justify-between items-center gap-3 max-w-7xl mx-auto ${currentThemeStyle.headerBgStyle}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[#eee7de] hover:bg-[#e8e2d9] transition-colors cursor-pointer"
            title="Return to home"
          >
            <span className="material-symbols-outlined text-[#000d20] text-lg">arrow_back</span>
          </button>
          <div>
            <h1 className="font-quicksand font-bold text-base md:text-lg text-[#000d20] leading-tight">
              {isEditMode ? `Edit: ${initialGift?.title}` : `Gift for ${pantherName}`}
            </h1>
            <p className="font-comfortaa text-[11px] text-[#74777e]">
              Step {step} of {totalSteps}: {SLIDE_INFO[step - 1]?.title} •{' '}
              <span className="font-bold text-[#3d4b3f]">
                {enabledSlides.length} of {totalSteps} slides included
              </span>
            </p>
          </div>
        </div>

        {/* Step Jump Pills & Skip Button */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const isIncluded = enabledSlides.includes(i);
            const isCurrent = step === i + 1;
            return (
              <button
                key={i}
                onClick={() => {
                  soundFx.playPageTurn();
                  setStep(i + 1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isCurrent
                    ? 'bg-[#000d20] text-[#ffddb0] scale-105 shadow-md'
                    : isIncluded
                    ? 'bg-white/90 text-[#000d20] border border-[#000d20]/20 hover:bg-white'
                    : 'bg-[#eee7de]/70 text-[#74777e] line-through opacity-50 hover:opacity-90'
                }`}
                title={`Screen ${i + 1} (${SLIDE_INFO[i]?.shortTitle}): ${isIncluded ? 'Included in gift' : 'Skipped & Excluded'}`}
              >
                <span>{i + 1}</span>
                <span className="text-[10px] hidden md:inline">{isIncluded ? '✓' : '✕'}</span>
              </button>
            );
          })}

          <button
            onClick={skipCurrentStep}
            className="ml-2 px-3 py-1.5 rounded-xl bg-[#eee7de] text-[#7c5357] hover:bg-[#7c5357] hover:text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            title="Skip this slide and exclude it from the final published gift"
          >
            <span>Skip & Exclude</span>
            <span className="material-symbols-outlined text-sm">skip_next</span>
          </button>

          <button
            onClick={() => {
              soundFx.playPageTurn();
              setStep(totalSteps);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#000d20] text-[#ffddb0] hover:bg-[#0b2340] font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow"
          >
            <span>{isEditMode ? 'Save & Review' : 'Publish'}</span>
            <span className="material-symbols-outlined text-sm">{isEditMode ? 'check' : 'send'}</span>
          </button>
        </div>
      </header>

      {/* Main Screen Content */}
      <main className="max-w-[1100px] mx-auto px-6 pt-6">

        {/* Screen Inclusion Toggle Banner */}
        <div className="mb-6 max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl p-3 px-5 border border-[#e8e2d9] shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#000d20] text-lg">
              {SLIDE_INFO[step - 1]?.icon || 'view_carousel'}
            </span>
            <div>
              <span className="font-quicksand font-bold text-sm text-[#000d20] block">
                Slide {step}: {SLIDE_INFO[step - 1]?.title}
              </span>
              <span className="font-comfortaa text-xs text-[#74777e]">
                {enabledSlides.includes(step - 1)
                  ? 'This slide will be shown in the final letter'
                  : 'This slide is skipped and will NOT be shown'}
              </span>
            </div>
          </div>

          <button
            onClick={() => toggleScreenInclusion(step - 1)}
            className={`px-4 py-1.5 rounded-xl font-quicksand font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              enabledSlides.includes(step - 1)
                ? 'bg-[#3d4b3f] text-white hover:bg-[#2c372e]'
                : 'bg-[#eee7de] text-[#74777e] hover:bg-[#e8e2d9]'
            }`}
            title="Click to toggle whether this slide is included in the gift"
          >
            <span className="material-symbols-outlined text-base">
              {enabledSlides.includes(step - 1) ? 'check_circle' : 'cancel'}
            </span>
            <span>{enabledSlides.includes(step - 1) ? 'Included in Gift ✓' : 'Skipped / Excluded ✕'}</span>
          </button>
        </div>

        {/* SCREEN 1: COVER IMAGE & PICTURE CUSTOMIZER */}
        {step === 1 && (
          <div className="animate-fadeIn max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <span className="inline-block px-4 py-1 bg-[#eee7de] text-[#44474d] font-archivo text-xs rounded-full mb-2 uppercase tracking-wider font-bold">
                SLIDE 1: COVER IMAGE STUDIO
              </span>
              <h1 className="font-quicksand font-bold text-4xl text-[#000d20] mb-2">Change Gift Cover Picture</h1>
              <p className="font-comfortaa text-base text-[#44474d]">
                Pick a cute Dino & Panther artwork preset, upload your own photo, or enter a picture URL!
              </p>
            </div>

            {/* Current Selected Cover Preview Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl scrapbook-shadow border-2 border-[#e8e2d9] relative transform rotate-1 text-center">
              <div className="washi-tape" />
              <div className="w-full aspect-square max-w-md mx-auto rounded-2xl overflow-hidden mb-6 bg-[#f4ede4] relative group shadow-inner">
                <img src={coverImage} alt="Cover Artwork" className="w-full h-full object-cover" />
                
                {/* Upload overlay button */}
                <label className="absolute bottom-4 right-4 bg-[#000d20] hover:bg-[#0b2340] text-[#ffddb0] px-4 py-2 rounded-xl text-xs font-quicksand font-bold flex items-center gap-2 cursor-pointer shadow-xl transition-transform hover:scale-105 border border-[#ffddb0]/30">
                  <span className="material-symbols-outlined text-base">add_a_photo</span>
                  <span>Upload Your Picture</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setCoverImage)}
                  />
                </label>
              </div>

              <h2 className="font-quicksand font-bold text-2xl md:text-3xl text-[#000d20] mb-1">
                For My {pantherName} 💕
              </h2>
              <div className="flex items-center justify-center gap-2 flex-wrap text-sm text-[#795154] mb-1">
                <span className="font-comfortaa italic">From {dinoName}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-bold bg-[#f4ede4] px-2.5 py-0.5 rounded-full text-xs text-[#000d20] border border-[#e8e2d9]">
                  📅 {memoryDate}
                </span>
              </div>
            </div>

            {/* MEMORY DATE PICKER CARD */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border-2 border-[#e8e2d9] shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f4ede4]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#000d20] text-[#ffddb0] flex items-center justify-center font-bold text-lg shadow-sm">
                    📅
                  </div>
                  <div>
                    <h3 className="font-quicksand font-bold text-base text-[#000d20]">
                      Memory Date & Calendar Entry
                    </h3>
                    <p className="font-comfortaa text-xs text-[#74777e]">
                      Set the calendar date of this memory for the scrapbook timeline
                    </p>
                  </div>
                </div>

                {/* Formatted Date Pill */}
                <div className="inline-flex items-center gap-1.5 bg-[#f4ede4] border border-[#d8cbbd] px-3.5 py-1.5 rounded-xl text-xs font-quicksand font-bold text-[#000d20] shadow-inner">
                  <span className="material-symbols-outlined text-sm text-[#a68553]">calendar_today</span>
                  <span>{memoryDate}</span>
                </div>
              </div>

              {/* Date Input Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-quicksand text-xs font-bold text-[#74777e] uppercase block mb-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">edit_calendar</span>
                    <span>Select Calendar Date:</span>
                  </label>
                  <input
                    type="date"
                    value={getIsoDateValue(memoryDate)}
                    onChange={(e) => handleCalendarDatePick(e.target.value)}
                    className="w-full bg-[#f9f3ea] border border-[#c4c6ce] focus:border-[#000d20] rounded-xl px-4 py-2.5 font-quicksand text-sm text-[#000d20] outline-none shadow-inner cursor-pointer"
                  />
                </div>

                <div>
                  <label className="font-quicksand text-xs font-bold text-[#74777e] uppercase block mb-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">label</span>
                    <span>Or Custom Date / Occasion Text:</span>
                  </label>
                  <input
                    type="text"
                    value={memoryDate}
                    onChange={(e) => setMemoryDate(e.target.value)}
                    placeholder="e.g. August 10, 2026 or Our 1st Anniversary"
                    className="w-full bg-[#f9f3ea] border border-[#c4c6ce] focus:border-[#000d20] rounded-xl px-4 py-2.5 font-quicksand text-xs text-[#000d20] outline-none shadow-inner"
                  />
                </div>
              </div>

              {/* Quick Date Presets Chips */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-archivo font-bold text-[#74777e] uppercase tracking-wider block">
                  Quick Date Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickDate('today')}
                    className="px-3 py-1 bg-[#eee7de] hover:bg-[#000d20] hover:text-[#ffddb0] text-[#000d20] text-xs font-quicksand font-bold rounded-lg transition-colors cursor-pointer border border-[#c4c6ce]"
                  >
                    ✨ Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate('yesterday')}
                    className="px-3 py-1 bg-[#eee7de] hover:bg-[#000d20] hover:text-[#ffddb0] text-[#000d20] text-xs font-quicksand font-bold rounded-lg transition-colors cursor-pointer border border-[#c4c6ce]"
                  >
                    ⏮️ Yesterday
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate('oneWeekAgo')}
                    className="px-3 py-1 bg-[#eee7de] hover:bg-[#000d20] hover:text-[#ffddb0] text-[#000d20] text-xs font-quicksand font-bold rounded-lg transition-colors cursor-pointer border border-[#c4c6ce]"
                  >
                    📅 1 Week Ago
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate('custom', 'August 10, 2026')}
                    className="px-3 py-1 bg-[#fff8f0] hover:bg-[#e7c08a] text-[#795154] text-xs font-quicksand font-bold rounded-lg transition-colors cursor-pointer border border-[#e7c08a]"
                  >
                    💕 August 10, 2026
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate('custom', 'June 15, 2026')}
                    className="px-3 py-1 bg-[#fff8f0] hover:bg-[#e7c08a] text-[#795154] text-xs font-quicksand font-bold rounded-lg transition-colors cursor-pointer border border-[#e7c08a]"
                  >
                    ✈️ June 15, 2026
                  </button>
                </div>
              </div>
            </div>

            {/* Preset Illustration Gallery */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-[#e8e2d9] shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c5357]">palette</span>
                <h3 className="font-quicksand font-bold text-sm text-[#000d20] uppercase tracking-wider">
                  Preset Cover Art Options:
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COVER_PRESETS.map((preset) => {
                  const isSelected = coverImage === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        soundFx.playSparkle();
                        setCoverImage(preset.url);
                      }}
                      className={`p-2 rounded-xl text-left border-2 transition-all cursor-pointer flex flex-col ${
                        isSelected
                          ? 'border-[#000d20] bg-[#f4ede4] shadow-md scale-105'
                          : 'border-transparent bg-white hover:bg-[#f9f3ea]'
                      }`}
                    >
                      <div className="w-full aspect-square rounded-lg overflow-hidden mb-2 bg-[#eee7de] shadow-inner">
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-quicksand font-bold text-xs text-[#000d20] truncate">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Image URL Option */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-[#e8e2d9] shadow-sm space-y-2">
              <label className="font-quicksand text-xs font-bold text-[#74777e] uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">link</span>
                <span>Or Paste Custom Picture URL:</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://example.com/our-photo.jpg"
                  className="flex-1 bg-[#f9f3ea] border border-[#c4c6ce] rounded-xl px-4 py-2.5 font-quicksand text-xs text-[#000d20]"
                />
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playSparkle();
                    showToast('Cover picture updated!');
                  }}
                  className="bg-[#000d20] hover:bg-[#0b2340] text-[#ffddb0] px-4 py-2 rounded-xl text-xs font-bold font-quicksand cursor-pointer shadow"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: THEME & BOUQUET */}
        {step === 2 && (
          <div className="animate-fadeIn space-y-8">
            <div className="text-center mb-6">
              <span className="inline-block px-4 py-1 bg-[#eee7de] text-[#44474d] font-archivo text-xs rounded-full mb-2 uppercase tracking-wider font-bold">
                SLIDE 2: THEME & BOUQUET
              </span>
              <h1 className="font-quicksand font-bold text-4xl text-[#000d20] mb-1">
                Choose Sky Theme & Build Bouquet
              </h1>
              <p className="font-comfortaa text-base text-[#44474d]">
                Select a visual atmosphere and craft a custom 12-stem bouquet with a tucked mini letter 🌹
              </p>
            </div>

            {/* Sky Theme Selector */}
            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-[#e8e2d9] shadow-sm">
              <h2 className="font-quicksand font-bold text-base text-[#000d20] mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c5357]">palette</span>
                Select Sky Theme (Current: {theme})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {THEME_OPTIONS.map((t) => {
                  const isSelected = theme === t.name;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        soundFx.playSparkle();
                        setTheme(t.name);
                      }}
                      className={`p-2 rounded-xl text-center border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#000d20] bg-[#f4ede4] shadow-md scale-105'
                          : 'border-transparent bg-white hover:bg-[#eee7de]'
                      }`}
                    >
                      <div className="w-full h-10 rounded-lg mb-1.5 flex overflow-hidden shadow-inner">
                        {t.colors.map((c, i) => (
                          <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <span className="font-quicksand font-bold text-xs text-[#000d20] truncate block">
                        {t.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Presets Bar */}
            <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-[#e8e2d9] flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c5357]">bolt</span>
                <span className="font-quicksand font-bold text-xs text-[#000d20] uppercase tracking-wider">Quick Presets:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => fillAllWith('Roses')}
                  className="px-3 py-1.5 rounded-xl bg-[#e63946] text-white hover:bg-[#c9184a] font-quicksand font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer transition-all hover:scale-105"
                  title="Fill all 12 slots with Red Roses"
                >
                  <span>🌹 12 Full Roses</span>
                </button>

                <button
                  onClick={() => fillAllWith('Peonies')}
                  className="px-3 py-1.5 rounded-xl bg-[#ffb5a7] text-[#000d20] hover:bg-[#f8ad9d] font-quicksand font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer transition-all hover:scale-105"
                  title="Fill all 12 slots with Soft Peonies"
                >
                  <span>🌸 12 Full Peonies</span>
                </button>

                <button
                  onClick={fillMixedGarden}
                  className="px-3 py-1.5 rounded-xl bg-[#a8dadc] text-[#000d20] hover:bg-[#90c9cb] font-quicksand font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer transition-all hover:scale-105"
                  title="Fill with colorful mixed blooms"
                >
                  <span>💐 Wild Mix</span>
                </button>

                <button
                  onClick={clearBouquet}
                  className="px-3 py-1.5 rounded-xl bg-[#eee7de] text-[#74777e] hover:bg-[#e8e2d9] font-quicksand font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Bouquet Visualizer & Flower Tray Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Interactive Bouquet Canvas */}
              <div className="lg:col-span-6 bg-white p-6 rounded-3xl scrapbook-shadow border border-[#e8e2d9] flex flex-col items-center">
                <div className="w-full aspect-[4/3] bg-[#f4ede4] rounded-2xl overflow-hidden relative mb-4 flex items-center justify-center p-2">
                  <BouquetVisualizer
                    flowers={selectedFlowers}
                    wrapStyle={wrapStyle}
                    miniLetterText={bouquetLetter}
                  />
                </div>

                <div className="w-full flex justify-between items-center px-2">
                  <span className="font-archivo text-xs text-[#74777e] uppercase font-bold tracking-wider">
                    STEM COUNT: {selectedFlowers.length} / 12
                  </span>
                  <span className="font-quicksand text-xs text-[#3d4b3f] font-bold">
                    {selectedFlowers.length === 12 ? '✨ Full Bouquet!' : `Add ${12 - selectedFlowers.length} more`}
                  </span>
                </div>
              </div>

              {/* Flower Selection Tray & Wrap Styles */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-white p-6 rounded-3xl scrapbook-shadow border border-[#e8e2d9] space-y-4">
                  <h3 className="font-quicksand font-bold text-lg text-[#000d20] flex items-center justify-between">
                    <span>Tap Blooms to Add to Bouquet</span>
                    <span className="text-xs text-[#7c5357] font-semibold">Max 12 stems</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {FLOWER_OPTIONS.map((f) => {
                      const count = selectedFlowers.filter((name) => name === f.name).length;
                      return (
                        <div
                          key={f.id}
                          className="p-3 rounded-2xl border border-[#eee7de] bg-[#fffbf6] flex flex-col justify-between hover:border-[#a68553] transition-all"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#eee7de]">
                              <img src={f.imageUrl} alt={f.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="truncate">
                              <span className="font-quicksand font-bold text-xs text-[#000d20] block truncate">
                                {f.name}
                              </span>
                              <span className="font-comfortaa text-[10px] text-[#74777e] block truncate">
                                {f.tagline}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => removeFlowerStem(f.name)}
                                disabled={count === 0}
                                className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                                  count > 0 ? 'bg-[#eee7de] text-[#000d20] hover:bg-[#e8e2d9]' : 'opacity-30 cursor-not-allowed'
                                }`}
                              >
                                -
                              </button>
                              <span className="font-quicksand font-bold text-xs w-5 text-center text-[#000d20]">
                                {count}
                              </span>
                              <button
                                onClick={() => addFlowerStem(f.name)}
                                disabled={selectedFlowers.length >= 12}
                                className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                                  selectedFlowers.length < 12 ? 'bg-[#000d20] text-[#ffddb0] hover:bg-[#0b2340]' : 'opacity-30 cursor-not-allowed'
                                }`}
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => fillAllWith(f.name)}
                              className="text-[10px] text-[#a68553] hover:underline font-bold"
                            >
                              Fill 12
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Wrap Style & Mini Note */}
                <div className="bg-white p-6 rounded-3xl scrapbook-shadow border border-[#e8e2d9] space-y-4">
                  <div>
                    <label className="font-quicksand font-bold text-xs text-[#74777e] uppercase block mb-2">
                      Bouquet Wrapping Paper:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {WRAP_STYLES.map((wName, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            soundFx.playButtonClick();
                            setWrapStyle(wName);
                          }}
                          className={`p-2.5 rounded-xl text-xs font-quicksand font-bold text-center border-2 transition-all cursor-pointer ${
                            wrapStyle === wName
                              ? 'border-[#000d20] bg-[#f4ede4] shadow'
                              : 'border-transparent bg-[#f9f3ea] text-[#44474d] hover:bg-[#eee7de]'
                          }`}
                        >
                          {wName}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-quicksand font-bold text-xs text-[#74777e] uppercase block mb-1">
                      💌 Mini Note Tucked into Flowers:
                    </label>
                    <input
                      type="text"
                      value={bouquetLetter}
                      onChange={(e) => setBouquetLetter(e.target.value)}
                      placeholder="e.g. Tucked inside with love & roses..."
                      className="w-full bg-[#f9f3ea] border border-[#c4c6ce] rounded-xl px-4 py-2 font-comfortaa text-xs text-[#000d20]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 3: CHARMS & NATURE */}
        {step === 3 && (
          <div className="animate-fadeIn max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <span className="inline-block px-4 py-1 bg-[#eee7de] text-[#44474d] font-archivo text-xs rounded-full mb-2 uppercase tracking-wider font-bold">
                SLIDE 3: CHARMS & NATURE
              </span>
              <h1 className="font-quicksand font-bold text-4xl text-[#000d20] mb-2">Keepsake Charms & Nature</h1>
              <p className="font-comfortaa text-base text-[#44474d]">
                Pick tokens of love and ambient floating environmental effects!
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl scrapbook-shadow border border-[#e8e2d9]">
              <h3 className="font-quicksand font-bold text-lg text-[#000d20] mb-3">Keepsake Charms</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {CHARM_OPTIONS.map((charm) => {
                  const isSelected = selectedCharms.includes(charm.name);
                  return (
                    <button
                      key={charm.id}
                      onClick={() => toggleCharm(charm.name)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#000d20] bg-[#f4ede4] shadow-md scale-105'
                          : 'border-[#eee7de] bg-white hover:bg-[#f4ede4]'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-2xl ${charm.color} icon-filled`}>
                        {charm.icon}
                      </span>
                      <span className="font-quicksand font-bold text-xs">{charm.name}</span>
                    </button>
                  );
                })}
              </div>

              <h3 className="font-quicksand font-bold text-lg text-[#000d20] mb-3">Floating Nature Effects</h3>
              <div className="flex flex-wrap gap-2">
                {NATURE_ELEMENTS.map((item) => {
                  const isSelected = selectedNature.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleNature(item.id)}
                      className={`px-3 py-1.5 rounded-full font-quicksand text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#000d20] text-[#ffddb0] font-bold shadow'
                          : 'bg-[#f4ede4] border border-[#c4c6ce] text-[#1e1b16]'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-sm ${item.color}`}>{item.icon}</span>
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 4: PHOTO, VIDEO, VOICEOVER & BACKGROUND MUSIC STUDIO */}
        {step === 4 && (
          <div className="animate-fadeIn max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <span className="inline-block px-4 py-1 bg-[#eee7de] text-[#44474d] font-archivo text-xs rounded-full mb-2 uppercase tracking-wider font-bold">
                SLIDE 4: MEDIA, VIDEO, VOICEOVER & MUSIC
              </span>
              <h1 className="font-quicksand font-bold text-4xl text-[#000d20] mb-2">
                Memory Media Studio
              </h1>
              <p className="font-comfortaa text-base text-[#44474d]">
                Customize your memory photo, add video clips, record a real voice message, and choose romantic background music!
              </p>
            </div>

            {/* Media Studio Tabs */}
            <div className="flex justify-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-[#e8e2d9] shadow-sm max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  soundFx.playButtonClick();
                  setActiveMediaTab('photo');
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-quicksand font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeMediaTab === 'photo'
                    ? 'bg-[#000d20] text-[#ffddb0] shadow'
                    : 'text-[#44474d] hover:bg-[#f4ede4]'
                }`}
              >
                <span className="material-symbols-outlined text-base">photo</span>
                <span>Photo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playButtonClick();
                  setActiveMediaTab('video');
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-quicksand font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeMediaTab === 'video'
                    ? 'bg-[#000d20] text-[#ffddb0] shadow'
                    : 'text-[#44474d] hover:bg-[#f4ede4]'
                }`}
              >
                <span className="material-symbols-outlined text-base">videocam</span>
                <span>Video {videoUrl ? '✓' : ''}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playButtonClick();
                  setActiveMediaTab('voice');
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-quicksand font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeMediaTab === 'voice'
                    ? 'bg-[#000d20] text-[#ffddb0] shadow'
                    : 'text-[#44474d] hover:bg-[#f4ede4]'
                }`}
              >
                <span className="material-symbols-outlined text-base">mic</span>
                <span>Voice {voiceNoteUrl ? '✓' : ''}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFx.playButtonClick();
                  setActiveMediaTab('music');
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-quicksand font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeMediaTab === 'music'
                    ? 'bg-[#000d20] text-[#ffddb0] shadow'
                    : 'text-[#44474d] hover:bg-[#f4ede4]'
                }`}
              >
                <span className="material-symbols-outlined text-base">music_note</span>
                <span>Music</span>
              </button>
            </div>

            {/* TAB 1: MEMORY PHOTO */}
            {activeMediaTab === 'photo' && (
              <div className="bg-white p-6 md:p-8 rounded-3xl scrapbook-shadow border border-[#e8e2d9] relative transform rotate-1 space-y-4">
                <div className="washi-tape" />
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#f4ede4] relative group shadow-inner">
                  <img src={photoUrl} alt="Memory Photo" className="w-full h-full object-cover" />
                  <label className="absolute bottom-3 right-3 bg-[#000d20]/80 hover:bg-[#000d20] text-white px-4 py-2 rounded-xl text-xs font-quicksand font-bold flex items-center gap-1.5 cursor-pointer shadow-lg transition-colors">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setPhotoUrl)}
                    />
                  </label>
                </div>

                <div>
                  <label className="font-quicksand font-bold text-xs text-[#74777e] uppercase block mb-1">
                    Photo Caption:
                  </label>
                  <input
                    type="text"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    placeholder="e.g. Kyoto, 2023 - Cozy Night"
                    className="w-full bg-[#f9f3ea] border border-[#c4c6ce] rounded-xl px-4 py-2.5 font-comfortaa text-sm text-[#000d20]"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: VIDEO CLIP */}
            {activeMediaTab === 'video' && (
              <div className="bg-white p-6 md:p-8 rounded-3xl scrapbook-shadow border border-[#e8e2d9] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#eee7de]">
                  <div>
                    <h3 className="font-quicksand font-bold text-lg text-[#000d20] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#7c5357]">videocam</span>
                      <span>Add Video to Gift</span>
                    </h3>
                    <p className="font-comfortaa text-xs text-[#74777e]">
                      Add an MP4 video file, YouTube link, or video URL for Panther to watch!
                    </p>
                  </div>
                </div>

                {/* Video Player Preview if URL provided */}
                {videoUrl ? (
                  <div className="space-y-3">
                    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg relative flex items-center justify-center">
                      {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                          title="Video preview"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={videoUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playButtonClick();
                          setVideoUrl('');
                        }}
                        className="text-xs text-red-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        <span>Remove Video</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-[#c4c6ce] rounded-2xl bg-[#fffbf6] text-center space-y-3">
                    <span className="material-symbols-outlined text-4xl text-[#7c5357]">
                      video_library
                    </span>
                    <p className="font-quicksand font-bold text-sm text-[#000d20]">
                      No video added yet
                    </p>
                    <div className="flex justify-center gap-3">
                      <label className="bg-[#000d20] hover:bg-[#0b2340] text-[#ffddb0] px-4 py-2 rounded-xl text-xs font-quicksand font-bold flex items-center gap-1.5 cursor-pointer shadow">
                        <span className="material-symbols-outlined text-sm">upload_file</span>
                        <span>Upload Video Clip</span>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleVideoUpload}
                        />
                      </label>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="font-quicksand font-bold text-xs text-[#74777e] uppercase block mb-1">
                      Video URL (YouTube or Direct MP4):
                    </label>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                      className="w-full bg-[#f9f3ea] border border-[#c4c6ce] rounded-xl px-4 py-2.5 font-quicksand text-xs text-[#000d20]"
                    />
                  </div>

                  <div>
                    <label className="font-quicksand font-bold text-xs text-[#74777e] uppercase block mb-1">
                      Video Caption / Note:
                    </label>
                    <input
                      type="text"
                      value={videoCaption}
                      onChange={(e) => setVideoCaption(e.target.value)}
                      placeholder="e.g. Our favorite trip together 📹"
                      className="w-full bg-[#f9f3ea] border border-[#c4c6ce] rounded-xl px-4 py-2 font-comfortaa text-xs text-[#000d20]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: VOICE RECORDER & VOICE OVER */}
            {activeMediaTab === 'voice' && (
              <div className="space-y-4">
                <VoiceRecorder
                  voiceNoteUrl={voiceNoteUrl}
                  onSaveVoiceNote={(url, duration) => {
                    setVoiceNoteUrl(url);
                    if (duration) setVoiceNoteDuration(duration);
                    if (url) showToast('Voice note recorded & attached! 🎙️');
                  }}
                />
              </div>
            )}

            {/* TAB 4: BACKGROUND MUSIC & SOUNDTRACK */}
            {activeMediaTab === 'music' && (
              <div className="bg-white p-6 md:p-8 rounded-3xl scrapbook-shadow border border-[#e8e2d9] space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#eee7de]">
                  <div>
                    <h3 className="font-quicksand font-bold text-lg text-[#000d20] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#7c5357]">music_note</span>
                      <span>Background Audio & Song for Panther's Slides</span>
                    </h3>
                    <p className="font-comfortaa text-xs text-[#74777e]">
                      Paste any song/audio link or choose an ambient melody that continuously plays in the background across all slides!
                    </p>
                  </div>
                </div>

                {/* OPTION 1: PASTE AUDIO / SONG LINK */}
                <div className="bg-[#fff8f0] p-5 rounded-2xl border-2 border-[#e8e2d9] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#000d20] text-[#ffddb0] flex items-center justify-center font-bold text-xs">
                        1
                      </span>
                      <span className="font-quicksand font-bold text-sm text-[#000d20]">
                        Paste Song / Audio URL
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePasteAudioFromClipboard}
                        className="px-3 py-1.5 bg-white border border-[#c4c6ce] hover:bg-[#eee7de] text-[#000d20] rounded-xl text-xs font-bold font-quicksand flex items-center gap-1.5 cursor-pointer shadow-sm"
                        title="Paste URL from clipboard"
                      >
                        <span className="material-symbols-outlined text-sm">content_paste</span>
                        <span>Paste from Clipboard</span>
                      </button>

                      <label className="px-3 py-1.5 bg-[#000d20] hover:bg-[#0b2340] text-[#ffddb0] rounded-xl text-xs font-bold font-quicksand flex items-center gap-1.5 cursor-pointer shadow-sm">
                        <span className="material-symbols-outlined text-sm">upload_file</span>
                        <span>Upload Audio</span>
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={handleAudioUpload}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={musicAudioUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMusicAudioUrl(val || undefined);
                        }}
                        placeholder="https://example.com/song.mp3 or direct audio / stream link..."
                        className="w-full bg-white border border-[#c4c6ce] focus:border-[#000d20] rounded-xl px-4 py-2.5 font-quicksand text-xs text-[#000d20] outline-none pr-10 shadow-inner"
                      />
                      {musicAudioUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setMusicAudioUrl(undefined);
                            soundFx.stopMusic();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <p className="font-comfortaa text-[11px] text-[#74777e]">
                      Supports direct MP3/WAV/M4A/AAC streams, public audio links, or files uploaded from your device.
                    </p>
                  </div>

                  {/* Audio Test Preview Controls if URL or File is set */}
                  {musicAudioUrl && (
                    <div className="bg-white p-3.5 rounded-xl border border-[#3d4b3f]/30 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-full bg-[#3d4b3f] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                          🎵
                        </span>
                        <div className="truncate">
                          <span className="font-quicksand font-bold text-xs text-[#000d20] block truncate">
                            {songTitle || 'Custom Background Song'}
                          </span>
                          <span className="font-comfortaa text-[10px] text-green-700 block">
                            ✓ Ready to play behind slides
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playCustomAudio(musicAudioUrl);
                            showToast('Playing audio preview! 🎶');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#000d20] text-[#ffddb0] hover:bg-[#0b2340] font-bold text-xs flex items-center gap-1 cursor-pointer shadow"
                        >
                          <span className="material-symbols-outlined text-sm">play_arrow</span>
                          <span>Test Audio</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.stopMusic();
                            showToast('Audio preview stopped');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#eee7de] text-[#7c5357] hover:bg-[#e8e2d9] font-bold text-xs cursor-pointer"
                        >
                          Stop
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Romantic Presets */}
                  <div className="pt-2 border-t border-[#e8e2d9]/60">
                    <span className="text-[11px] font-bold text-[#74777e] uppercase tracking-wider block mb-2 font-archivo">
                      Or Pick Quick Romantic MP3 Presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        {
                          name: '🎸 Romantic Acoustic Strings',
                          url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-acoustic-guitar-112198.mp3',
                          title: 'Romantic Acoustic Strings',
                          artist: 'Acoustic Serenade',
                        },
                        {
                          name: '🎹 Gentle Piano Starlight',
                          url: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_03d650ebac.mp3?filename=gentle-piano-126284.mp3',
                          title: 'Gentle Piano Starlight',
                          artist: 'Piano Reflections',
                        },
                        {
                          name: '☕ Cozy Sunset Chill Lofi',
                          url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3',
                          title: 'Cozy Sunset Chill Lofi',
                          artist: 'Lofi Cafe',
                        },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setMusicAudioUrl(item.url);
                            setSongTitle(item.title);
                            setSongArtist(item.artist);
                            soundFx.playCustomAudio(item.url);
                            showToast(`Loaded ${item.title}! 🎶`);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-quicksand font-bold transition-all cursor-pointer border ${
                            musicAudioUrl === item.url
                              ? 'bg-[#000d20] text-[#ffddb0] border-[#000d20] shadow'
                              : 'bg-white text-[#44474d] border-[#c4c6ce] hover:bg-[#f4ede4]'
                          }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* OPTION 2: AMBIENT SYNTHESIZER PRESETS */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#000d20] text-[#ffddb0] flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <span className="font-quicksand font-bold text-sm text-[#000d20]">
                      Or Choose Ambient Synthesizer Soundtrack
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MUSIC_PRESETS.map((preset) => {
                      const isSelected = !musicAudioUrl && musicPreset === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => {
                            setMusicAudioUrl(undefined);
                            setMusicPreset(preset.id);
                            soundFx.startMusicPreset(preset.id);
                            showToast(`Playing ${preset.name} ambient chords! 🎶`);
                          }}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'border-[#000d20] bg-[#f4ede4] shadow-md'
                              : 'border-[#eee7de] bg-[#fffbf6] hover:border-[#c4c6ce]'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[#7c5357]">
                                {preset.icon}
                              </span>
                              <span className="font-quicksand font-bold text-sm text-[#000d20]">
                                {preset.name}
                              </span>
                            </div>
                            <p className="font-comfortaa text-[11px] text-[#74777e] leading-snug">
                              {preset.desc}
                            </p>
                          </div>

                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-[#000d20] text-[#ffddb0]' : 'bg-[#eee7de] text-[#74777e]'
                          }`}>
                            <span className="material-symbols-outlined text-sm">
                              {isSelected ? 'volume_up' : 'play_arrow'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.stopMusic();
                        showToast('Music paused');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#eee7de] hover:bg-[#e8e2d9] font-quicksand font-bold text-xs text-[#000d20] flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">stop</span>
                      <span>Stop Music Preview</span>
                    </button>
                  </div>
                </div>

                {/* Song Dedication Info */}
                <div className="bg-[#0b2340] text-white p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-[#ffddb0] font-quicksand font-bold text-sm">
                    <span className="material-symbols-outlined text-base">queue_music</span>
                    <span>Song Dedication Tag (Displayed for Panther)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#b2c8ed] font-quicksand block mb-1">Song Title:</label>
                      <input
                        type="text"
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        placeholder="Song Name (e.g. Moon River)"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 font-quicksand text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#b2c8ed] font-quicksand block mb-1">Artist:</label>
                      <input
                        type="text"
                        value={songArtist}
                        onChange={(e) => setSongArtist(e.target.value)}
                        placeholder="Artist Name (e.g. Frank Ocean)"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 font-quicksand text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCREEN 5: CAPTAIN'S LOG & SAILBOAT */}
        {step === 5 && (
          <div className="animate-fadeIn max-w-xl mx-auto space-y-6">
            <div className="text-center">
              <span className="inline-block px-4 py-1 bg-[#eee7de] text-[#44474d] font-archivo text-xs rounded-full mb-2 uppercase tracking-wider font-bold">
                SLIDE 5: CAPTAIN'S LOG
              </span>
              <h1 className="font-quicksand font-bold text-4xl text-[#000d20] mb-2">Captain's Log</h1>
              <p className="font-comfortaa text-base text-[#44474d]">
                Set a sailboat memory or log entry for your journey!
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl scrapbook-shadow border border-[#e8e2d9] relative transform -rotate-1 text-center">
              <div className="washi-tape" />

              {/* Memory Date Tag */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#eee7de] text-xs">
                <span className="font-quicksand font-bold text-[#000d20] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#a68553]">calendar_today</span>
                  <span>Log Date: {memoryDate}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[11px] font-bold text-[#7c5357] underline hover:text-[#000d20] cursor-pointer"
                >
                  Change Date ✏️
                </button>
              </div>

              <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#b2c8ed] mb-4 relative group">
                <img src={captainsLogImage} alt="Captain's Log" className="w-full h-full object-cover" />
                <label className="absolute bottom-3 right-3 bg-[#000d20]/80 hover:bg-[#000d20] text-white px-3 py-1.5 rounded-full text-xs font-quicksand font-bold flex items-center gap-1.5 cursor-pointer shadow-lg transition-colors">
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                  <span>Change Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setCaptainsLogImage)}
                  />
                </label>
              </div>

              <textarea
                value={captainsLog}
                onChange={(e) => setCaptainsLog(e.target.value)}
                rows={3}
                className="w-full bg-[#f9f3ea] border border-[#000d20]/20 rounded-lg p-3 font-comfortaa text-base text-[#1e1b16] outline-none"
                placeholder="Log message..."
              />
            </div>
          </div>
        )}

        {/* SCREEN 6: THAT SMILE / LOCKET */}
        {step === 6 && (
          <div className="animate-fadeIn max-w-md mx-auto text-center space-y-6">
            <span className="inline-block px-4 py-1 bg-[#eee7de] text-[#44474d] font-archivo text-xs rounded-full mb-2 uppercase tracking-wider font-bold">
              SLIDE 6: THAT SMILE
            </span>
            <div className="bg-white p-8 rounded-2xl scrapbook-shadow border border-[#e8e2d9] relative transform rotate-1">
              <div className="washi-tape" />
              <h1 className="font-quicksand font-bold text-3xl text-[#000d20] mb-1">That Smile</h1>
              <p className="font-archivo text-xs text-[#74777e] uppercase tracking-widest font-bold mb-4">
                OR THOSE EYES
              </p>

              <div className="w-44 h-44 mx-auto rounded-full border-4 border-[#eee7de] shadow-md overflow-hidden mb-4 relative group">
                <img src={locketPhoto} alt="Locket Photo" className="w-full h-full object-cover" />
                <label className="absolute bottom-2 right-2 bg-[#000d20]/80 hover:bg-[#000d20] text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors">
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setLocketPhoto)}
                  />
                </label>
              </div>

              <input
                type="text"
                value={locketCaption}
                onChange={(e) => setLocketCaption(e.target.value)}
                className="w-full bg-transparent border-b border-[#c4c6ce] text-center font-comfortaa text-lg text-[#795154] outline-none py-1"
              />
            </div>
          </div>
        )}

        {/* SCREEN 7: DINO & MOON CHAT (3D SKY) */}
        {step === 7 && (
          <div className="animate-fadeIn max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <span className="inline-block px-4 py-1 bg-[#eee7de] text-[#44474d] font-archivo text-xs rounded-full mb-2 uppercase tracking-wider font-bold">
                SLIDE 7: DINO & MOON CONVERSATION
              </span>
              <h1 className="font-quicksand font-bold text-4xl text-[#000d20] mb-2">
                Moonlight Dialogue 🌙
              </h1>
              <p className="font-comfortaa text-sm sm:text-base text-[#44474d] max-w-xl mx-auto">
                Write both sides of the conversation: what Dino whispers to the night sky, and how the glowing Moon replies back to you both!
              </p>
            </div>

            {/* Quick Presets Starters */}
            <div className="bg-white rounded-2xl p-4 border border-[#e8e2d9] shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold text-[#74777e] uppercase tracking-wider font-archivo flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#7c5357]">auto_awesome</span>
                  <span>Quick Romantic Dialogue Templates:</span>
                </span>
                <span className="text-[11px] font-comfortaa text-[#74777e]">Click to load & customize</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CHAT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleLoadChatPreset(preset)}
                    className="p-2.5 rounded-xl border border-[#eee7de] hover:border-[#000d20] bg-[#fffbf6] hover:bg-[#f4ede4] text-left transition-all cursor-pointer group"
                  >
                    <span className="font-quicksand font-bold text-xs text-[#000d20] block group-hover:text-[#7c5357] transition-colors truncate">
                      {preset.title}
                    </span>
                    <span className="font-comfortaa text-[10px] text-[#74777e] block truncate mt-0.5">
                      Dino & Moon chat
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* TWO OPTIONS: DINO & MOON WRITING CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* OPTION 1: DINO'S CONVERSATION */}
              <div className="bg-white rounded-2xl p-5 border-2 border-[#3d4b3f]/30 shadow-md flex flex-col justify-between relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#3d4b3f] text-white flex items-center justify-center font-bold text-sm shadow">
                        🦖
                      </div>
                      <div>
                        <span className="font-archivo text-[10px] text-[#74777e] uppercase tracking-widest font-bold block">
                          OPTION 1
                        </span>
                        <h3 className="font-quicksand font-bold text-base text-[#000d20]">
                          Dino's Message
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs bg-[#3d4b3f]/10 text-[#3d4b3f] px-2.5 py-0.5 rounded-full font-bold">
                      {dinoName}
                    </span>
                  </div>

                  <label className="text-[11px] font-comfortaa text-[#74777e] block">
                    What Dino says looking up at the stars:
                  </label>

                  <textarea
                    rows={3}
                    value={
                      chatMessages.find((m) => m.sender === 'dino')?.text || ''
                    }
                    onChange={(e) => handleUpdateDinoMainText(e.target.value)}
                    placeholder="Write Dino's words to the sky (e.g. The stars look extra bright tonight...)"
                    className="w-full bg-[#f9f3ea] border border-[#000d20]/20 rounded-xl p-3 font-comfortaa text-sm text-[#1e1b16] outline-none focus:border-[#000d20] resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-1.5 border-t border-[#eee7de] mt-2">
                  <span className="text-[10px] font-comfortaa text-[#74777e]">Quick emoji:</span>
                  <div className="flex gap-1">
                    {['🦖', '💚', '✨', '🐾', '💋', '🌍'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => {
                          const current = chatMessages.find((m) => m.sender === 'dino')?.text || '';
                          handleUpdateDinoMainText(current + ' ' + em);
                        }}
                        className="px-1.5 py-0.5 bg-[#eee7de] hover:bg-[#e8e2d9] rounded text-xs cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* OPTION 2: MOON'S CONVERSATION */}
              <div className="bg-white rounded-2xl p-5 border-2 border-[#e7c08a] shadow-md flex flex-col justify-between relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e7c08a] to-[#ffddb0] text-[#000d20] flex items-center justify-center font-bold text-sm shadow">
                        🌙
                      </div>
                      <div>
                        <span className="font-archivo text-[10px] text-[#a68553] uppercase tracking-widest font-bold block">
                          OPTION 2
                        </span>
                        <h3 className="font-quicksand font-bold text-base text-[#000d20]">
                          Moon's Reply
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs bg-[#ffddb0] text-[#000d20] px-2.5 py-0.5 rounded-full font-bold">
                      The Moon ✨
                    </span>
                  </div>

                  <label className="text-[11px] font-comfortaa text-[#74777e] block">
                    What the Moon whispers back across the distance:
                  </label>

                  <textarea
                    rows={3}
                    value={
                      chatMessages.find((m) => m.sender === 'moon')?.text || ''
                    }
                    onChange={(e) => handleUpdateMoonMainText(e.target.value)}
                    placeholder="Write the Moon's reply back (e.g. Rawr! Sending shooting stars your way right now ✨)"
                    className="w-full bg-[#fffbf6] border border-[#e7c08a] rounded-xl p-3 font-comfortaa text-sm text-[#1e1b16] outline-none focus:border-[#000d20] resize-none"
                  />
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-1.5 border-t border-[#eee7de] mt-2">
                  <span className="text-[10px] font-comfortaa text-[#74777e]">Quick emoji:</span>
                  <div className="flex gap-1">
                    {['🌙', '✨', '🌟', '💖', '💫', '🦕'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => {
                          const current = chatMessages.find((m) => m.sender === 'moon')?.text || '';
                          handleUpdateMoonMainText(current + ' ' + em);
                        }}
                        className="px-1.5 py-0.5 bg-[#fff8f0] border border-[#e7c08a]/40 hover:bg-[#ffddb0]/40 rounded text-xs cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE 3D SKY CONVERSATION PREVIEW & DIALOGUE THREAD */}
            <div className="relative rounded-3xl p-6 md:p-8 shadow-2xl min-h-[460px] flex flex-col justify-between border border-white/20 overflow-hidden bg-[#000d20] text-white">
              <Dynamic3DSky themeName={theme} />

              <div className="relative z-10 mb-3 flex flex-wrap justify-between items-center gap-2">
                <div>
                  <span className="font-archivo text-xs text-[#b2c8ed] uppercase tracking-widest block font-bold mb-0.5">
                    LIVE SKY PREVIEW
                  </span>
                  <h3 className="font-quicksand font-bold text-xl text-white flex items-center gap-2">
                    <span>Under the Same Moon</span>
                    <span className="text-sm">✨</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-bold">
                  <span>{chatMessages.length} Messages in Dialogue</span>
                </div>
              </div>

              {/* Chat Messages Thread */}
              <div className="relative z-10 flex-1 space-y-3.5 overflow-y-auto max-h-[300px] pr-2 my-3">
                {chatMessages.map((msg, idx) => {
                  const isDino = msg.sender === 'dino';
                  const isEditing = editingChatId === msg.id;

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex gap-3 max-w-[90%] ${
                        isDino ? 'self-start' : 'self-end flex-row-reverse ml-auto'
                      }`}
                    >
                      <div
                        onClick={() => handleToggleMessageSender(msg.id)}
                        title="Click to switch speaker (Dino ⇄ Moon)"
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 shadow-md cursor-pointer transition-transform hover:scale-110 ${
                          isDino
                            ? 'bg-[#3d4b3f] text-white border border-white/30'
                            : 'bg-gradient-to-tr from-[#e7c08a] to-[#ffddb0] text-[#000d20] border border-white/40'
                        }`}
                      >
                        {isDino ? '🦖' : '🌙'}
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-sm relative group transition-all ${
                          isDino
                            ? 'bg-white text-[#1e1b16] rounded-tl-none shadow-md'
                            : 'bg-gradient-to-r from-[#ffddb0] to-[#fae2c6] text-[#000d20] rounded-tr-none shadow-md font-medium'
                        }`}
                      >
                        {/* Bubble Header / Controls */}
                        <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1 pb-1 border-b border-black/10 font-bold">
                          <span className="flex items-center gap-1">
                            {isDino ? `🦖 ${dinoName}` : '🌙 The Moon'}
                            {msg.time && <span className="opacity-60 font-normal">({msg.time})</span>}
                          </span>

                          <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handleToggleMessageSender(msg.id)}
                              className="px-1.5 py-0.5 rounded bg-black/10 hover:bg-black/20 text-[9px] font-bold cursor-pointer"
                              title="Switch sender"
                            >
                              {isDino ? '⇄ To Moon' : '⇄ To Dino'}
                            </button>
                            {!isEditing && (
                              <button
                                type="button"
                                onClick={() => handleStartEditChatMessage(msg)}
                                className="p-0.5 rounded hover:bg-black/10 text-[10px] cursor-pointer"
                                title="Edit message"
                              >
                                ✏️
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteChatMessage(msg.id)}
                              className="p-0.5 rounded hover:bg-red-500/20 text-red-700 text-[10px] cursor-pointer"
                              title="Delete message"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Bubble Content / Editor */}
                        {isEditing ? (
                          <div className="space-y-2 pt-1">
                            <textarea
                              rows={2}
                              value={editingChatText}
                              onChange={(e) => setEditingChatText(e.target.value)}
                              className="w-full bg-white text-[#1e1b16] border border-[#000d20]/30 rounded-lg p-2 text-xs font-comfortaa outline-none"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingChatId(null)}
                                className="px-2.5 py-1 rounded bg-[#eee7de] text-[#000d20] text-xs font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEditChatMessage(msg.id)}
                                className="px-2.5 py-1 rounded bg-[#000d20] text-[#ffddb0] text-xs font-bold cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="font-comfortaa leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Additional Message Bar with Sender Selector */}
              <div className="relative z-10 pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#b2c8ed]">
                    Add New Dialogue Line:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setChatSender('dino')}
                      className={`px-3 py-1 rounded-full text-xs font-quicksand font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        chatSender === 'dino'
                          ? 'bg-[#3d4b3f] text-white ring-2 ring-white/60 shadow'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <span>🦖 Dino</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatSender('moon')}
                      className={`px-3 py-1 rounded-full text-xs font-quicksand font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        chatSender === 'moon'
                          ? 'bg-gradient-to-r from-[#e7c08a] to-[#ffddb0] text-[#000d20] ring-2 ring-white/60 shadow font-bold'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <span>🌙 Moon</span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendChatMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newChatInput}
                    onChange={(e) => setNewChatInput(e.target.value)}
                    placeholder={
                      chatSender === 'dino'
                        ? "Say another line as Dino 🦖..."
                        : "Reply another line as the Moon 🌙..."
                    }
                    className="flex-1 bg-white/90 text-[#1e1b16] rounded-xl px-4 py-2.5 font-quicksand text-xs sm:text-sm outline-none placeholder-[#74777e]"
                  />
                  <button
                    type="submit"
                    className="bg-[#e7c08a] text-[#000d20] px-5 py-2.5 rounded-xl font-quicksand font-bold text-xs sm:text-sm hover:bg-[#ffddb0] transition-colors cursor-pointer shadow flex items-center gap-1 flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    <span>Add Line</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 8: PERSONAL LETTER & PUBLISH */}
        {step === 8 && (
          <div className="animate-fadeIn max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <span className="inline-block px-4 py-1 bg-[#eee7de] text-[#44474d] font-archivo text-xs rounded-full mb-2 uppercase tracking-wider font-bold">
                SLIDE 8: PERSONAL LETTER & PUBLISH
              </span>
              <h1 className="font-quicksand font-bold text-4xl text-[#000d20] mb-2">Your Personal Note</h1>
              <p className="font-comfortaa text-base text-[#44474d]">
                Write your heartfelt letter, verify your included slides, and generate your shareable link!
              </p>
            </div>

            {/* Personal Letter Textbox */}
            <div className="bg-[#0b2340] p-6 rounded-2xl shadow-2xl relative border border-white/10">
              <div className="bg-[#fff8f0] text-[#1e1b16] rounded-xl p-6 shadow-inner relative transform -rotate-1">
                <div className="washi-tape" />
                <textarea
                  value={personalLetter}
                  onChange={(e) => setPersonalLetter(e.target.value)}
                  rows={5}
                  className="w-full bg-transparent border-none focus:ring-0 resize-none font-comfortaa text-base leading-relaxed outline-none text-[#1e1b16]"
                  placeholder="Start writing your note for Panther..."
                />
                <div className="text-right font-comfortaa text-sm text-[#44474d] font-bold mt-2">
                  — {dinoName}
                </div>
              </div>
            </div>

            {/* Memory Calendar Summary Card */}
            <div className="bg-white rounded-2xl p-5 border-2 border-[#e8e2d9] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#000d20] text-[#ffddb0] flex items-center justify-center font-bold text-lg shadow-sm">
                  📅
                </div>
                <div>
                  <span className="font-archivo text-[10px] text-[#74777e] uppercase tracking-widest font-bold block">
                    Scrapbook Timeline Date
                  </span>
                  <div className="font-quicksand font-bold text-base text-[#000d20]">
                    {memoryDate}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={getIsoDateValue(memoryDate)}
                  onChange={(e) => handleCalendarDatePick(e.target.value)}
                  className="bg-[#f9f3ea] border border-[#c4c6ce] rounded-xl px-3 py-1.5 font-quicksand text-xs text-[#000d20] cursor-pointer outline-none"
                />
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 rounded-xl bg-[#eee7de] hover:bg-[#000d20] hover:text-[#ffddb0] text-[#000d20] font-quicksand font-bold text-xs transition-colors cursor-pointer"
                >
                  Edit in Studio
                </button>
              </div>
            </div>

            {/* Interactive Slide Inclusion Checklist */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[#e8e2d9] shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f4ede4]">
                <div>
                  <h3 className="font-quicksand font-bold text-lg text-[#000d20] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#3d4b3f]">checklist</span>
                    Slides Included in Your Published Gift ({enabledSlides.length} of {totalSteps})
                  </h3>
                  <p className="font-comfortaa text-xs text-[#74777e]">
                    Only checked slides will be visible when Panther opens this link. Skipped slides are excluded!
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllSlides}
                    className="px-3 py-1 rounded-lg bg-[#eee7de] hover:bg-[#e8e2d9] text-[#000d20] font-quicksand font-bold text-xs cursor-pointer transition-colors"
                  >
                    Select All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SLIDE_INFO.map((item) => {
                  const isChecked = enabledSlides.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleScreenInclusion(item.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-[#f4ede4] border-[#000d20] shadow-sm'
                          : 'bg-[#f9f3ea]/50 border-[#e8e2d9] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="material-symbols-outlined text-lg text-[#000d20]">
                          {item.icon}
                        </span>
                        <div className="truncate">
                          <span className="font-quicksand font-bold text-xs text-[#000d20] block truncate">
                            Slide {item.id + 1}: {item.title}
                          </span>
                          <span className="font-comfortaa text-[11px] text-[#74777e] truncate block">
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        isChecked ? 'bg-[#3d4b3f] text-white' : 'bg-[#eee7de] text-[#74777e]'
                      }`}>
                        {isChecked ? '✓' : '✕'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {!isPublished ? (
              <div className="text-center py-4">
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="bg-[#000d20] text-[#ffddb0] font-quicksand font-bold text-xl px-10 py-4 rounded-2xl shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 mx-auto cursor-pointer"
                >
                  <span className="material-symbols-outlined icon-filled">
                    {isEditMode ? 'check_circle' : 'send'}
                  </span>
                  <span>
                    {isPublishing
                      ? 'Saving Memory...'
                      : isEditMode
                      ? `Save & Update Scrapbook ✨ (${enabledSlides.length} Slides)`
                      : `Publish & Share Gift (${enabledSlides.length} Slides)`}
                  </span>
                </button>
              </div>
            ) : (
              <div className="p-6 bg-white rounded-2xl shadow-2xl border-2 border-[#fdc7cb] text-center max-w-xl mx-auto space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#3d4b3f] text-white mx-auto">
                  <span className="material-symbols-outlined text-2xl">check</span>
                </div>
                <h2 className="font-quicksand font-bold text-2xl text-[#000d20]">
                  {isEditMode ? 'Gift Successfully Updated!' : 'Gift Successfully Published!'}
                </h2>
                <p className="font-comfortaa text-xs text-[#74777e]">
                  {isEditMode
                    ? 'All your modifications have been saved to your collection and link.'
                    : `Includes exactly ${enabledSlides.length} slide${enabledSlides.length > 1 ? 's' : ''} (all skipped slides were removed).`}
                </p>
                {(() => {
                  const shareUrl = getShareableUrl(publishedGift || publishedShareCode);
                  return (
                    <div className="space-y-3">
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="w-full bg-[#f9f3ea] border border-[#c4c6ce] rounded-xl p-3 font-quicksand text-xs text-[#1e1b16] text-center"
                      />
                      <button
                        onClick={async () => {
                          soundFx.playSparkle();
                          await copyToClipboard(shareUrl);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2500);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-[#000d20] text-[#ffddb0] font-bold text-sm cursor-pointer shadow hover:bg-[#0b2340] transition-colors"
                      >
                        {isCopied ? 'Copied Link!' : 'Copy Shareable Link'}
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Fixed Bottom Step Navigation */}
      <footer className="fixed bottom-0 left-0 w-full bg-[#fff8f0]/95 backdrop-blur-md py-3 px-6 border-t border-[#e8e2d9] z-40">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`font-archivo text-xs tracking-widest uppercase font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              step === 1 ? 'opacity-30 cursor-not-allowed text-[#74777e]' : 'text-[#44474d] hover:text-[#000d20]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span> BACK
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={skipCurrentStep}
              className="px-4 py-2 rounded-xl bg-[#eee7de] text-[#7c5357] hover:bg-[#7c5357] hover:text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
              title="Skip this slide and exclude it from the final published gift"
            >
              <span>Skip & Exclude</span>
              <span>⏩</span>
            </button>

            <button
              onClick={nextStep}
              disabled={step === totalSteps}
              className={`bg-[#000d20] text-[#ffddb0] font-quicksand font-bold text-sm px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 hover:bg-[#0b2340] transition-all cursor-pointer ${
                step === totalSteps ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>{step === totalSteps ? 'Finish' : 'Continue'}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
