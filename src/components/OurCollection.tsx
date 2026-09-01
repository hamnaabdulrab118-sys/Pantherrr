import React, { useState } from 'react';
import { GiftData } from '../types';
import { getShareableUrl, copyToClipboard } from '../utils/shareUtils';

interface OurCollectionProps {
  collection: GiftData[];
  onStartNewGift: () => void;
  onOpenGift: (gift: GiftData) => void;
  onPreviewPantherView?: (gift: GiftData) => void;
  onEditGift?: (gift: GiftData) => void;
  onDeleteGift?: (id: string) => void;
}

export const OurCollection: React.FC<OurCollectionProps> = ({
  collection,
  onStartNewGift,
  onOpenGift,
  onPreviewPantherView,
  onEditGift,
  onDeleteGift,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteGift) {
      onDeleteGift(id);
    }
    setDeleteConfirmId(null);
  };

  const handleCopyShare = async (item: GiftData, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getShareableUrl(item);
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-6 pt-8 pb-28 relative min-h-screen font-quicksand">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 relative z-10">
        <div>
          <h1 className="font-quicksand font-bold text-4xl md:text-5xl text-[#000d20] mb-2">
            Our Collection
          </h1>
          <p className="font-comfortaa text-lg text-[#44474d]">
            Memories bound together across time zones from Sialkot to Ormara.
          </p>
        </div>
        <button
          onClick={onStartNewGift}
          className="bg-[#000d20] text-[#e7c08a] px-6 py-3.5 rounded-xl font-quicksand font-semibold text-lg flex items-center gap-2 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(0,13,32,0.25)] transition-all cursor-pointer shadow-md"
        >
          <span className="material-symbols-outlined text-[#e7c08a]">add</span>
          <span>New Gift for Today</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-[#e8e2d9] animate-fadeIn">
            <span className="material-symbols-outlined text-4xl text-[#7c5357] mb-2">
              delete_forever
            </span>
            <h3 className="font-quicksand font-bold text-xl text-[#000d20] mb-2">
              Delete Memory?
            </h3>
            <p className="font-comfortaa text-sm text-[#44474d] mb-6">
              Are you sure you want to remove this gift from your collection? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-[#c4c6ce] text-[#000d20] font-quicksand font-bold text-sm hover:bg-[#eee7de] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={(e) => handleDelete(deleteConfirmId, e)}
                className="px-4 py-2 rounded-xl bg-[#7c5357] text-white font-quicksand font-bold text-sm hover:bg-[#5e3b3e] transition-colors cursor-pointer shadow-md"
              >
                Delete Memory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Container */}
      <div className="relative mt-8">
        <div className="flight-tracker-line hidden md:block" />

        {collection.length === 0 ? (
          <div className="text-center py-16 bg-white/60 backdrop-blur-md rounded-2xl border border-dashed border-[#c4c6ce] max-w-md mx-auto">
            <span className="material-symbols-outlined text-5xl text-[#a68553] mb-2">
              auto_stories
            </span>
            <p className="font-quicksand font-bold text-xl text-[#000d20] mb-2">
              No memories yet
            </p>
            <p className="font-comfortaa text-sm text-[#44474d] mb-4">
              Start creating your first scrapbook gift today!
            </p>
            <button
              onClick={onStartNewGift}
              className="bg-[#000d20] text-[#e7c08a] px-5 py-2.5 rounded-xl font-quicksand font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Create First Gift</span>
            </button>
          </div>
        ) : (
          <div className="space-y-12 md:space-y-20">
            {collection.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={item.id}
                  className="relative flex flex-col md:flex-row items-center md:justify-between w-full group"
                >
                  {/* Timeline Station Icon */}
                  <div className="absolute left-6 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-9 h-9 rounded-full bg-white border-2 border-[#e7c08a] flex items-center justify-center z-10 shadow-sm">
                    <span className="material-symbols-outlined text-[#a68553] text-sm icon-filled">
                      {isEven ? 'flight' : 'favorite'}
                    </span>
                  </div>

                  {/* Date Label */}
                  <div
                    className={`w-full md:w-[45%] pl-16 md:pl-0 mb-4 md:mb-0 ${
                      isEven ? 'md:order-1 md:text-right' : 'md:order-2 text-left'
                    }`}
                  >
                    <div className="font-quicksand font-bold text-2xl text-[#000d20] mb-1.5 flex items-center gap-2 justify-start md:justify-end">
                      <span className="material-symbols-outlined text-lg text-[#a68553]">calendar_month</span>
                      <span>{item.date}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 flex-wrap justify-start md:justify-end">
                      <span className="bg-[#eee7de] text-[#44474d] font-archivo text-xs px-3 py-1 rounded-sm uppercase tracking-widest border border-dashed border-[#c4c6ce]">
                        {item.theme} Theme
                      </span>
                      {item.enabledSlides && (
                        <span className="bg-sky-100 text-sky-900 font-comfortaa text-[11px] px-2.5 py-0.5 rounded-full border border-sky-300">
                          {item.enabledSlides.length} Slides
                        </span>
                      )}
                      {item.lastEditedDate && (
                        <span className="bg-amber-100 text-amber-900 font-comfortaa text-[11px] px-2.5 py-0.5 rounded-full border border-amber-300">
                          ✏️ Edited {item.lastEditedDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div
                    className={`w-full md:w-[45%] pl-16 md:pl-0 ${
                      isEven ? 'md:order-2' : 'md:order-1'
                    }`}
                  >
                    <div className="polaroid-card bg-white p-4 rounded-xl scrapbook-shadow rotate-1 hover:rotate-0 transition-transform duration-300 relative border border-[#e8e2d9]">
                      <div className="washi-tape" />

                      {/* Top Action Buttons (Edit + Delete) */}
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                        {onEditGift && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditGift(item);
                            }}
                            className="w-8 h-8 rounded-full bg-white/90 border border-[#e8e2d9] text-[#000d20] hover:bg-[#000d20] hover:text-[#ffddb0] transition-colors flex items-center justify-center shadow-sm cursor-pointer"
                            title="Edit or Change this Scrapbook"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(item.id);
                          }}
                          className="w-8 h-8 rounded-full bg-white/90 border border-[#e8e2d9] text-[#7c5357] hover:bg-[#7c5357] hover:text-white transition-colors flex items-center justify-center shadow-sm cursor-pointer"
                          title="Delete Memory"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>

                      <div className="aspect-[4/3] rounded-sm overflow-hidden mb-4 bg-[#eee7de] relative">
                        <img
                          src={item.photoUrl || item.coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-[#0b2340] border-2 border-white shadow-sm" />
                      </div>

                      <p className="font-comfortaa text-sm md:text-base text-[#44474d] text-center mb-4 px-4 italic">
                        "{item.photoCaption || item.title}"
                      </p>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => onOpenGift(item)}
                          className="border-2 border-[#7c5357] text-[#7c5357] hover:bg-[#fdc7cb]/20 transition-colors py-2 rounded-lg font-quicksand font-semibold text-xs sm:text-sm flex justify-center items-center gap-1 cursor-pointer"
                          title="Open in Creator View"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">redeem</span>
                          <span>Open</span>
                        </button>

                        {onPreviewPantherView ? (
                          <button
                            onClick={() => onPreviewPantherView(item)}
                            className="border-2 border-emerald-600/70 text-emerald-800 hover:bg-emerald-50 transition-colors py-2 rounded-lg font-quicksand font-semibold text-xs sm:text-sm flex justify-center items-center gap-1 cursor-pointer"
                            title="Preview exactly what Panther sees"
                          >
                            <span className="material-symbols-outlined text-sm sm:text-base">visibility</span>
                            <span>Panther View</span>
                          </button>
                        ) : onEditGift ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditGift(item);
                            }}
                            className="border-2 border-amber-600/70 text-amber-800 hover:bg-amber-50 transition-colors py-2 rounded-lg font-quicksand font-semibold text-xs sm:text-sm flex justify-center items-center gap-1 cursor-pointer"
                            title="Edit slides, letters, chat, or photos in this gift"
                          >
                            <span className="material-symbols-outlined text-sm sm:text-base">edit</span>
                            <span>Edit</span>
                          </button>
                        ) : null}

                        <button
                          onClick={(e) => handleCopyShare(item, e)}
                          className={`border-2 transition-colors py-2 rounded-lg font-quicksand font-semibold text-xs sm:text-sm flex justify-center items-center gap-1 cursor-pointer ${
                            copiedId === item.id
                              ? 'border-[#3d4b3f] bg-[#3d4b3f] text-white'
                              : 'border-[#000d20] text-[#000d20] hover:bg-[#000d20] hover:text-[#ffddb0]'
                          }`}
                          title="Copy link to send to Panther"
                        >
                          <span className="material-symbols-outlined text-sm sm:text-base">
                            {copiedId === item.id ? 'check' : 'share'}
                          </span>
                          <span className="truncate">{copiedId === item.id ? 'Copied!' : 'Share'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};
