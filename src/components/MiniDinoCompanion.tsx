import React, { useState } from 'react';

export const MiniDinoCompanion: React.FC = () => {
  const [isDancing, setIsDancing] = useState<boolean>(false);
  const [speechIndex, setSpeechIndex] = useState<number>(0);
  const [showSpeech, setShowSpeech] = useState<boolean>(true);

  const tips = [
    "Hi Panther! 🐾",
    "Hi Captain! ⛵",
    "Hi Juicy Ass! 🍑",
    "Hi Shawty! ✨",
    "I rawr u! 🦖💚",
  ];

  const handleDinoClick = () => {
    setIsDancing(true);
    setShowSpeech(true);
    setSpeechIndex((prev) => (prev + 1) % tips.length);
    setTimeout(() => setIsDancing(false), 1200);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end select-none pointer-events-auto">
      {/* Speech Bubble */}
      {showSpeech && (
        <div className="mb-2 bg-white/95 backdrop-blur-md text-[#000d20] px-3.5 py-2 rounded-2xl shadow-xl border border-[#e7c08a] max-w-[200px] text-xs font-quicksand font-bold relative animate-bounce-gentle">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSpeech(false);
            }}
            className="absolute -top-1.5 -right-1.5 bg-[#000d20] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] hover:bg-[#7c5357]"
          >
            ×
          </button>
          <span>{tips[speechIndex]}</span>
          {/* Bubble tail */}
          <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-white rotate-45 border-r border-b border-[#e7c08a]" />
        </div>
      )}

      {/* Mini Dino Avatar */}
      <button
        onClick={handleDinoClick}
        className={`w-14 h-14 rounded-full bg-gradient-to-tr from-[#3d4b3f] to-[#6b8e62] border-2 border-[#ffddb0] shadow-2xl flex items-center justify-center relative cursor-pointer hover:scale-110 active:scale-95 transition-all ${
          isDancing ? 'animate-spin' : 'animate-bounce-gentle'
        }`}
        title="Click mini Dino!"
      >
        <span className="text-2xl filter drop-shadow">🦖</span>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffddb0] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e7c08a]"></span>
        </span>
      </button>
    </div>
  );
};
