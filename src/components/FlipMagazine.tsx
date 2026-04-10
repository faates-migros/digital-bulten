import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCreative, Navigation, Pagination, Keyboard, Mousewheel } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Download, ChevronDown, ChevronUp, Info, X } from 'lucide-react';
import { motion } from 'motion/react';
import type { TextItemPosition } from './PdfUpload';

import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export interface FlipMagazineHandle {
  goToPage: (index: number) => void;
}

interface FlipMagazineProps {
  onPageChange: (index: number) => void;
  currentPage: number;
  totalPages: number;
  reactions: string[];
  setReactions: (reactions: string[]) => void;
  pageBlobUrls: string[];
  fileName: string;
  editorNotes?: Record<number, string[]>;
  pageTextPositions?: TextItemPosition[][];
  searchQuery?: string;
}

const MagazinePage = ({
  children,
  number,
  currentPage,
  totalPages,
  reactions: selectedReactions,
  setReactions,
  onPageJump,
  showThumbnails,
  setShowThumbnails,
  editorNotes,
}: {
  children: React.ReactNode;
  number: number;
  currentPage: number;
  totalPages: number;
  reactions: string[];
  setReactions: (reactions: string[]) => void;
  onPageJump?: (index: number) => void;
  showThumbnails: boolean;
  setShowThumbnails: (show: boolean) => void;
  editorNotes?: string[];
}) => {
  const reactionOptions = [
    { emoji: '👍', label: 'Faydalı' },
    { emoji: '🤔', label: 'İlginç' },
    { emoji: '🔥', label: 'Harika' },
    { emoji: '🛠️', label: 'Geliştirilebilir' }
  ];

  const toggleReaction = (label: string) => {
    if (selectedReactions.includes(label)) {
      setReactions(selectedReactions.filter(r => r !== label));
    } else {
      setReactions([...selectedReactions, label]);
    }
  };

  const [isEditorNoteOpen, setIsEditorNoteOpen] = React.useState(false);

  const thumbnailsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (thumbnailsRef.current && showThumbnails) {
      const container = thumbnailsRef.current;
      const activeBtn = container.children[currentPage] as HTMLElement;
      if (activeBtn) {
        const containerRect = container.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();
        const scrollLeft = container.scrollLeft + (btnRect.left - containerRect.left) - (containerRect.width / 2) + (btnRect.width / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [currentPage, showThumbnails]);

  React.useEffect(() => {
    const el = thumbnailsRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      el.scrollLeft += delta;
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden border border-zinc-200/50">
      {/* Header */}
      <div className="px-6 py-3 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 relative shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Veri Analitiği ve Müşteri Kanal Deneyimi Ekibi</span>
        </div>
        <div className="flex items-center gap-4">
          {editorNotes && editorNotes.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setIsEditorNoteOpen(!isEditorNoteOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-200 transition-colors"
              >
                <Info className="w-3 h-3" />
                Editörün Notu
              </button>

              {isEditorNoteOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 mt-2 w-80 bg-white border border-orange-200 rounded-2xl shadow-2xl p-6 z-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest">Editörün Notu</h4>
                    <button onClick={() => setIsEditorNoteOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <ul className="space-y-3">
                    {editorNotes.map((note, idx) => (
                      <li key={idx} className="flex gap-3 text-[11px] leading-relaxed text-zinc-600 font-medium">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0 mt-1" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          )}
          <span className="text-[10px] font-bold text-zinc-300">#{number.toString().padStart(2, '0')}</span>
        </div>
      </div>

      {/* Content Area - PDF Page */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {children}
      </div>

      {/* Footer */}
      <div className={`px-6 transition-all duration-300 flex flex-col bg-zinc-50/30 border-t border-zinc-100 relative shrink-0 ${showThumbnails ? 'py-2 gap-2' : 'py-1 gap-0'}`}>
        {/* Toggle Button */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className="bg-white border border-zinc-200 rounded-full p-1 shadow-md hover:bg-zinc-50 transition-all active:scale-95"
          >
            {showThumbnails ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronUp className="w-4 h-4 text-zinc-500" />}
          </button>
        </div>

        {/* Thumbnails */}
        <motion.div
          initial={false}
          animate={{ height: showThumbnails ? 'auto' : 0, opacity: showThumbnails ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div
            ref={thumbnailsRef}
            className="flex items-center gap-2 overflow-x-auto pb-2 px-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => onPageJump?.(idx)}
                className={`flex-shrink-0 group transition-all duration-200 ${currentPage === idx ? '' : 'opacity-50 hover:opacity-100'}`}
              >
                <div className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap flex items-center gap-1.5 ${currentPage === idx ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}>
                  <span className={`text-[10px] font-black tabular-nums ${currentPage === idx ? 'text-orange-500' : 'text-zinc-400'}`}>{idx + 1}</span>
                  <span className={`text-[10px] font-bold ${currentPage === idx ? 'text-zinc-800' : 'text-zinc-500'}`}>Sayfa {idx + 1}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Bottom: Reactions & Page Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="hidden xl:flex items-center gap-4 text-[9px] font-medium text-zinc-400">
              <span>© 2025 Migros</span>
              <span className="w-1 h-1 bg-zinc-200 rounded-full" />
              <span className="font-mono">Gizli Veri</span>
            </div>
            <div className="h-4 w-[1px] bg-zinc-200 hidden xl:block" />
            <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm p-1 rounded-full border border-zinc-200/50 shadow-sm">
              {reactionOptions.map((item) => {
                const isSelected = selectedReactions.includes(item.label);
                return (
                  <button
                    key={item.label}
                    onClick={() => toggleReaction(item.label)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-white hover:scale-110 active:scale-95 relative group ${isSelected ? 'bg-white shadow-sm scale-110' : ''}`}
                    title={item.label}
                  >
                    <span className={`text-lg transition-all duration-300 ${isSelected ? 'grayscale-0 opacity-100' : 'grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                      {item.emoji}
                    </span>
                    {isSelected && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Sayfa</div>
              <div className="text-sm font-black text-zinc-900 tabular-nums">
                {currentPage + 1} <span className="text-zinc-300 mx-0.5">/</span> <span className="text-zinc-400">{totalPages}</span>
              </div>
            </div>
            <button
              className="p-2 bg-zinc-900 hover:bg-orange-500 text-white rounded-lg transition-all shadow-lg active:scale-95 group"
              title="İndir"
            >
              <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FlipMagazine = React.forwardRef<FlipMagazineHandle, FlipMagazineProps>(function FlipMagazine({ onPageChange, currentPage, totalPages, reactions, setReactions, pageBlobUrls, fileName, editorNotes, pageTextPositions, searchQuery }, ref) {
  const [isReady, setIsReady] = React.useState(false);
  const [showThumbnails, setShowThumbnails] = React.useState(true);
  const swiperRef = React.useRef<any>(null);

  // Compute highlight rectangles for a given page
  const getHighlightsForPage = React.useCallback((pageIndex: number): { left: number; top: number; width: number; height: number }[] => {
    const term = (searchQuery || '').trim().toLowerCase();
    if (term.length < 2 || !pageTextPositions?.[pageIndex]) return [];
    const items = pageTextPositions[pageIndex];
    const highlights: { left: number; top: number; width: number; height: number }[] = [];
    for (const item of items) {
      const str = item.str.toLowerCase();
      let pos = 0;
      while ((pos = str.indexOf(term, pos)) !== -1) {
        const charRatio = item.str.length > 0 ? item.width / item.str.length : 0;
        const matchLeft = item.left + pos * charRatio;
        const matchWidth = term.length * charRatio;
        highlights.push({
          left: matchLeft,
          top: item.top,
          width: matchWidth,
          height: item.height,
        });
        pos += term.length;
      }
    }
    return highlights;
  }, [searchQuery, pageTextPositions]);

  React.useImperativeHandle(ref, () => ({
    goToPage: (index: number) => {
      if (swiperRef.current) {
        swiperRef.current.slideTo(index);
      }
    }
  }));

  const onPageJump = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  const pageProps = {
    currentPage,
    totalPages,
    reactions,
    setReactions,
    onPageJump,
    showThumbnails,
    setShowThumbnails,
  };

  return (
    <div className={`w-full h-full flex items-center justify-center relative bg-zinc-950 overflow-hidden transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative w-[95vw] h-[calc(100vh-6rem)] max-w-[1700px] flex items-center justify-center">
        <Swiper
          onSwiper={(swiper) => swiperRef.current = swiper}
          grabCursor={false}
          allowTouchMove={false}
          simulateTouch={false}
          effect={'creative'}
          speed={800}
          creativeEffect={{
            prev: { shadow: true, translate: ['-120%', 0, -500] },
            next: { shadow: true, translate: ['120%', 0, -500] },
          }}
          slidesPerView={1}
          centeredSlides={true}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          pagination={{ clickable: true, type: 'progressbar' }}
          keyboard={{ enabled: true }}
          mousewheel={{
            forceToAxis: true,
            sensitivity: 0.5,
            thresholdDelta: 50,
            thresholdTime: 500,
          }}
          preventInteractionOnTransition={true}
          modules={[EffectCreative, Navigation, Pagination, Keyboard, Mousewheel]}
          onInit={() => setIsReady(true)}
          onSlideChange={(swiper) => onPageChange(swiper.activeIndex)}
          className="w-full h-full z-20"
        >
          {pageBlobUrls.map((pageUrl, idx) => {
            const highlights = getHighlightsForPage(idx);
            return (
              <SwiperSlide key={idx} className="p-0">
                <MagazinePage number={idx + 1} {...pageProps} editorNotes={editorNotes?.[idx + 1]}>
                  <iframe
                    src={`${pageUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`}
                    title={`Sayfa ${idx + 1}`}
                    style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, border: 'none' }}
                  />
                  {highlights.length > 0 && (
                    <div
                      className="absolute inset-0 pointer-events-none z-10"
                      style={{ overflow: 'hidden' }}
                    >
                      {highlights.map((h, hIdx) => (
                        <div
                          key={hIdx}
                          className="absolute rounded-sm"
                          style={{
                            left: `${h.left}%`,
                            top: `${h.top}%`,
                            width: `${h.width}%`,
                            height: `${h.height}%`,
                            backgroundColor: 'rgba(249, 115, 22, 0.35)',
                            border: '1px solid rgba(249, 115, 22, 0.6)',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </MagazinePage>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Navigation Arrows */}
        <button className="swiper-button-prev-custom absolute left-3 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/30 backdrop-blur-xl rounded-full border border-white/10 text-white hover:bg-orange-500 hover:border-orange-400 transition-all shadow-2xl group active:scale-90">
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button className="swiper-button-next-custom absolute right-3 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/30 backdrop-blur-xl rounded-full border border-white/10 text-white hover:bg-orange-500 hover:border-orange-400 transition-all shadow-2xl group active:scale-90">
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
});