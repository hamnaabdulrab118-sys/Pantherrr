import React from 'react';
import dinoPantherLogo from '../assets/images/dino_panther_same_size_1788091439765.jpg';

interface CoverScreenProps {
  onStartNewGift: () => void;
  onViewCollection: () => void;
  pantherName?: string;
  dinoName?: string;
}

export const CoverScreen: React.FC<CoverScreenProps> = ({
  onStartNewGift,
  onViewCollection,
  pantherName = 'Panther',
}) => {
  return (
    <div className="w-full max-w-[1100px] mx-auto px-6 py-8 flex flex-col items-center min-h-[calc(100vh-140px)] justify-center">
      {/* Flight Tracker Step 1 */}
      <div className="mb-8 text-center w-full max-w-md">
        <span className="font-archivo text-xs text-[#74777e] tracking-widest uppercase font-bold block mb-2">
          STEP 1 OF 13
        </span>
        <div className="relative h-6 flex items-center justify-between px-4">
          <div className="w-full h-1 flight-path absolute left-0 top-1/2 -translate-y-1/2" />
          <span className="material-symbols-outlined absolute text-[#a68553] left-[5%] pin-shadow bg-white rounded-full p-1 z-10 text-[18px] icon-filled">
            flight
          </span>
        </div>
      </div>

      {/* Taped Scrapbook Hero Photo */}
      <div className="relative w-full max-w-sm mb-8">
        <div className="bg-white p-4 rounded-2xl scrapbook-shadow transform rotate-[1deg] hover:rotate-0 transition-transform duration-500 border border-[#e8e2d9]">
          {/* Washi Tape */}
          <div className="washi-tape" />

          <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 bg-[#f4ede4] shadow-inner">
            <img
              src={dinoPantherLogo}
              alt="Dino and Panther sitting together"
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="font-quicksand font-bold text-2xl md:text-3xl text-center text-[#000d20] leading-tight mb-2">
            A Little Garden <br /> for My {pantherName}
          </h2>

          <div className="flex justify-center items-center gap-2 text-[#795154] text-xl my-2">
            <span>🦖</span>
            <span className="text-red-400 text-sm">❤️</span>
            <span>🐾</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={onStartNewGift}
          className="w-full bg-[#000d20] text-[#ffddb0] font-quicksand font-semibold text-lg py-4 px-8 rounded-xl shadow-[0_4px_15px_rgba(0,13,32,0.3)] border border-[#ffddb0]/20 hover:bg-[#0b2340] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group"
        >
          <span>Start a New Gift</span>
          <span className="material-symbols-outlined text-[#ffddb0] group-hover:scale-110 transition-transform icon-filled">
            favorite
          </span>
        </button>

        <button
          onClick={onViewCollection}
          className="w-full bg-white text-[#7c5357] font-quicksand font-semibold text-lg py-3.5 px-8 rounded-xl border-2 border-[#7c5357] hover:bg-[#fdc7cb]/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <span>View Our Collection</span>
        </button>
      </div>
    </div>
  );
};
