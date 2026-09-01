import React, { useState } from 'react';
import { GiftData } from '../types';
import { soundFx } from '../utils/soundEffects';
import { getShareableUrl } from '../utils/shareUtils';

interface LettersViewProps {
  collection: GiftData[];
  onOpenGift: (gift: GiftData) => void;
  onDeleteLetter?: (id: string) => void;
  onSaveNewLetter?: (text: string) => void;
  dinoName?: string;
  pantherName?: string;
}

export const LettersView: React.FC<LettersViewProps> = ({
  collection,
  onOpenGift,
  onDeleteLetter,
  onSaveNewLetter,
  dinoName = 'Dino 🐾',
  pantherName = 'Panther 🐾✈️',
}) => {
  const [activeTab, setActiveTab] = useState<'received' | 'write'>('received');
  const [newLetter, setNewLetter] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyShareLink = async (gift: GiftData, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playSparkle();
    const url = getShareableUrl(gift);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // fallback
    }
    setCopiedId(gift.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLetter.trim()) return;
    soundFx.playSuccessChime();
    
    if (onSaveNewLetter) {
      onSaveNewLetter(newLetter);
    }
    
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setNewLetter('');
      setActiveTab('received');
    }, 1000);
  };

  const handleConfirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playButtonClick();
    if (onDeleteLetter) {
      onDeleteLetter(id);
    }
    setDeleteConfirmId(null);
  };

  const lettersList = collection.filter((g) => g.letter && g.letter.trim().length > 0);

  return (
    <main className="w-full max-w-4xl mx-auto px-6 pt-8 pb-28 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="font-quicksand font-bold text-4xl text-[#000d20] mb-2">
          Love Letters
        </h1>
        <p className="font-comfortaa text-lg text-[#44474d]">
          Heartfelt notes written for {pantherName} from {dinoName}
        </p>

        {/* Tab switcher */}
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => {
              soundFx.playButtonClick();
              setActiveTab('received');
            }}
            className={`px-5 py-2 rounded-full font-quicksand font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'received'
                ? 'bg-[#000d20] text-[#ffddb0] shadow-md'
                : 'bg-[#eee7de] text-[#44474d] hover:bg-[#e8e2d9]'
            }`}
          >
            Letters ({lettersList.length})
          </button>
          <button
            onClick={() => {
              soundFx.playButtonClick();
              setActiveTab('write');
            }}
            className={`px-5 py-2 rounded-full font-quicksand font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'write'
                ? 'bg-[#000d20] text-[#ffddb0] shadow-md'
                : 'bg-[#eee7de] text-[#44474d] hover:bg-[#e8e2d9]'
            }`}
          >
            + Write a New Note
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-[#e8e2d9] animate-fadeIn">
            <span className="material-symbols-outlined text-4xl text-[#7c5357] mb-2">
              delete_forever
            </span>
            <h3 className="font-quicksand font-bold text-xl text-[#000d20] mb-2">
              Delete This Letter?
            </h3>
            <p className="font-comfortaa text-sm text-[#44474d] mb-6">
              Are you sure you want to remove this love letter from your collection?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  soundFx.playButtonClick();
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl border border-[#c4c6ce] text-[#000d20] font-quicksand font-bold text-sm hover:bg-[#eee7de] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={(e) => handleConfirmDelete(deleteConfirmId, e)}
                className="px-4 py-2 rounded-xl bg-[#7c5357] text-white font-quicksand font-bold text-sm hover:bg-[#5e3b3e] transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                <span>Delete Letter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'received' ? (
        lettersList.length === 0 ? (
          <div className="text-center py-16 bg-white/70 backdrop-blur-md rounded-3xl border border-dashed border-[#c4c6ce] max-w-md mx-auto p-8 shadow-sm">
            <span className="material-symbols-outlined text-5xl text-[#7c5357] mb-3">
              mail
            </span>
            <h3 className="font-quicksand font-bold text-xl text-[#000d20] mb-1">
              No Letters in Collection
            </h3>
            <p className="font-comfortaa text-sm text-[#44474d] mb-6">
              Write a sweet love note for {pantherName} to start your collection!
            </p>
            <button
              onClick={() => setActiveTab('write')}
              className="bg-[#000d20] text-[#ffddb0] px-5 py-2.5 rounded-xl font-quicksand font-bold text-sm inline-flex items-center gap-2 cursor-pointer shadow"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              <span>Write First Letter</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {lettersList.map((gift) => (
              <div
                key={gift.id}
                className="bg-white rounded-2xl p-6 md:p-8 scrapbook-shadow border border-[#e8e2d9] relative transform -rotate-1 hover:rotate-0 transition-transform group"
              >
                {/* Washi tape */}
                <div className="washi-tape" />

                <div className="flex justify-between items-start mb-4 border-b border-[#f4ede4] pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-archivo text-xs text-[#a68553] uppercase tracking-wider font-bold">
                        {gift.date} • {gift.theme}
                      </span>
                      <span className="font-quicksand font-bold text-[10px] bg-[#f4ede4] border border-[#e8e2d9] text-[#000d20] px-2 py-0.5 rounded-full">
                        {gift.enabledSlides ? `${gift.enabledSlides.length} slides` : '8 slides'}
                      </span>
                    </div>
                    <h3 className="font-quicksand font-bold text-xl text-[#000d20]">
                      {gift.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleCopyShareLink(gift, e)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-quicksand font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        copiedId === gift.id
                          ? 'bg-emerald-600 text-white shadow'
                          : 'border border-[#000d20] text-[#000d20] hover:bg-[#000d20] hover:text-[#ffddb0]'
                      }`}
                      title="Copy Shareable Link"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {copiedId === gift.id ? 'check' : 'share'}
                      </span>
                      <span>{copiedId === gift.id ? 'Copied!' : 'Share'}</span>
                    </button>

                    <button
                      onClick={() => onOpenGift(gift)}
                      className="px-3.5 py-1.5 rounded-lg border border-[#7c5357] text-[#7c5357] text-xs font-quicksand font-bold hover:bg-[#fdc7cb]/20 transition-colors cursor-pointer"
                    >
                      View Gift
                    </button>
                    
                    {/* Delete Letter Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playButtonClick();
                        setDeleteConfirmId(gift.id);
                      }}
                      className="p-1.5 rounded-lg text-[#74777e] hover:text-[#7c5357] hover:bg-[#fdc7cb]/20 transition-colors cursor-pointer"
                      title="Delete Letter from Collection"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>

                <div className="relative py-2">
                  <p className="font-comfortaa text-base text-[#1e1b16] leading-relaxed italic">
                    "{gift.letter}"
                  </p>
                </div>

                <div className="mt-4 flex justify-between items-center text-xs text-[#74777e] font-quicksand pt-2 border-t border-[#f4ede4]">
                  <span>Distance: {gift.distanceMiles} miles</span>
                  <span className="font-bold text-[#000d20]">— {gift.fromPerson}</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-[#0b2340] p-6 md:p-8 rounded-2xl shadow-xl border border-white/10 text-white relative">
          <div className="bg-[#fff8f0] text-[#1e1b16] rounded-xl p-6 md:p-8 shadow-inner relative">
            <div className="flex items-center gap-2 mb-4 opacity-70">
              <span className="material-symbols-outlined text-[#74777e] text-[20px]">edit</span>
              <span className="font-archivo text-xs text-[#74777e] uppercase tracking-widest font-bold">
                Write a Letter
              </span>
            </div>

            <form onSubmit={handleSaveDraft} className="space-y-4">
              <textarea
                value={newLetter}
                onChange={(e) => setNewLetter(e.target.value)}
                rows={6}
                placeholder={`Dear ${pantherName},\nWrite something sweet for the journey...`}
                className="w-full bg-transparent border-none focus:ring-0 resize-none font-comfortaa text-lg text-[#1e1b16] placeholder-[#c4c6ce] outline-none"
                style={{ lineHeight: '32px' }}
                required
              />

              <div className="flex justify-between items-center pt-4 border-t border-[#e8e2d9]">
                <span className="font-comfortaa text-sm text-[#44474d]">— {dinoName}</span>
                <button
                  type="submit"
                  className="bg-[#000d20] text-[#ffddb0] px-6 py-2.5 rounded-xl font-quicksand font-bold text-sm hover:bg-[#0b2340] transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">favorite</span>
                  <span>Save Note to Collection</span>
                </button>
              </div>

              {savedSuccess && (
                <p className="text-center font-quicksand font-bold text-sm text-[#7c5357] animate-fadeIn">
                  ✨ Note saved to your collection!
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

