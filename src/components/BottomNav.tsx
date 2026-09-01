import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-[#f4ede4] shadow-[0_-4px_20px_rgba(11,35,64,0.08)] border-t border-[#e8e2d9]">
      <button
        onClick={() => onChangeTab('home')}
        className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-all cursor-pointer ${
          activeTab === 'home' || activeTab === 'builder'
            ? 'bg-[#fdc7cb] text-[#795154] font-bold shadow-sm'
            : 'text-[#44474d] hover:bg-[#e8e2d9]/50'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]">redeem</span>
        <span className="font-archivo text-[11px] tracking-wider mt-0.5 uppercase font-bold">Dino's Gift</span>
      </button>

      <button
        onClick={() => onChangeTab('gallery')}
        className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-all cursor-pointer ${
          activeTab === 'gallery'
            ? 'bg-[#fdc7cb] text-[#795154] font-bold shadow-sm'
            : 'text-[#44474d] hover:bg-[#e8e2d9]/50'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]">photo_library</span>
        <span className="font-archivo text-[11px] tracking-wider mt-0.5 uppercase font-bold">Gallery</span>
      </button>

      <button
        onClick={() => onChangeTab('letters')}
        className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-all cursor-pointer ${
          activeTab === 'letters'
            ? 'bg-[#fdc7cb] text-[#795154] font-bold shadow-sm'
            : 'text-[#44474d] hover:bg-[#e8e2d9]/50'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]">auto_stories</span>
        <span className="font-archivo text-[11px] tracking-wider mt-0.5 uppercase font-bold">Letters</span>
      </button>

      <button
        onClick={() => onChangeTab('settings')}
        className={`flex flex-col items-center justify-center rounded-xl px-4 py-1.5 transition-all cursor-pointer ${
          activeTab === 'settings'
            ? 'bg-[#fdc7cb] text-[#795154] font-bold shadow-sm'
            : 'text-[#44474d] hover:bg-[#e8e2d9]/50'
        }`}
      >
        <span className="material-symbols-outlined text-[22px]">settings</span>
        <span className="font-archivo text-[11px] tracking-wider mt-0.5 uppercase font-bold">Settings</span>
      </button>
    </nav>
  );
};
