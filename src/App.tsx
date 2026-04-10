import React, { useState, useRef, useEffect, useCallback, lazy, Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FlipMagazine } from './components/FlipMagazine';
import type { FlipMagazineHandle } from './components/FlipMagazine';
import type { TextItemPosition } from './components/PdfUpload';
const PdfUpload = lazy(() => import('./components/PdfUpload').then(m => ({ default: m.PdfUpload })));
import { useFlipTracking } from './hooks/useFlipTracking';
import { addSession } from './lib/analyticsStore';
import type { AnalyticsSession } from './lib/analyticsStore';
import { saveBulletin, getAllBulletins, getBulletinById } from './lib/bulletinStore';
import type { StoredBulletin } from './lib/bulletinStore';
import { useAuth } from './hooks/useAuth';
import { 
  BarChart3, 
  X,
  Search,
  Library,
  Calendar,
  Upload,
  FileText,
  Loader2,
  Shield,
  LogOut
} from 'lucide-react';

function App() {
  const { isAdmin, logout } = useAuth();
  const [pageBlobUrls, setPageBlobUrls] = useState<string[]>([]);
  const [pdfFileName, setPdfFileName] = useState('');
  const pdfFileNameRef = useRef('');
  const [pageTexts, setPageTexts] = useState<string[]>([]);
  const [pageTextPositions, setPageTextPositions] = useState<TextItemPosition[][]>([]);
  const magazineRef = useRef<FlipMagazineHandle>(null);
  const [editorNotes, setEditorNotes] = useState<Record<number, string[]>>({});
  const [storedBulletins, setStoredBulletins] = useState<Omit<StoredBulletin, 'pdfBlob'>[]>([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);

  // Load stored bulletins list on mount
  useEffect(() => {
    getAllBulletins().then(setStoredBulletins).catch(console.error);
  }, []);

  const totalPages = pageBlobUrls.length || 1;

  const { 
    currentPage, 
    onPageChange, 
    setReactions, 
    reactions, 
    getPayload,
    viewedPages,
    trackClick,
    trackSearch,
    resetTracking
  } = useFlipTracking(totalPages);

  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handlePdfLoaded = async (urls: string[], fileName: string, notes: Record<number, string[]>, texts: string[], positions: TextItemPosition[][], rawFile: File) => {
    resetTracking();
    setPageBlobUrls(urls);
    setPdfFileName(fileName);
    pdfFileNameRef.current = fileName;
    setEditorNotes(notes);
    setPageTexts(texts);
    setPageTextPositions(positions);

    // Save to IndexedDB if not already stored
    const existing = storedBulletins.find(b => b.fileName === fileName);
    if (!existing) {
      const bulletin: StoredBulletin = {
        id: crypto.randomUUID(),
        fileName,
        uploadedAt: new Date().toISOString(),
        pageCount: urls.length,
        pdfBlob: rawFile,
      };
      await saveBulletin(bulletin);
      setStoredBulletins(prev => [bulletin, ...prev]);
    }
  };

  const handleResetPdf = () => {
    saveAnalytics();
    pageBlobUrls.forEach(url => URL.revokeObjectURL(url));
    setPageBlobUrls([]);
    setPdfFileName('');
    pdfFileNameRef.current = '';
    setEditorNotes({});
    setPageTexts([]);
    setPageTextPositions([]);
    setSearchQuery('');
    setIsSearchOpen(false);
    resetTracking();
  };

  const saveAnalytics = useCallback(async () => {
    const currentFileName = pdfFileNameRef.current;
    if (!currentFileName) return; // no bulletin loaded, nothing to save
    const payload = getPayload();
    const totalSec = payload.pages.reduce((sum, p) => sum + parseInt(p.time), 0);
    if (totalSec === 0) return; // no meaningful data
    const session: AnalyticsSession = {
      id: crypto.randomUUID(),
      readerId: payload.readerId,
      isReturning: payload.isReturning,
      timestamp: new Date().toISOString(),
      totalDuration: payload.totalDuration,
      totalDurationSec: totalSec,
      completion: parseInt(payload.completion.replace('%', '')),
      pages: payload.pages.map(p => ({ page: p.page, time: parseInt(p.time) })),
      reactions: payload.reactions,
      searchQueries: payload.searchQueries,
      isBounce: payload.isBounce,
      clicks: payload.clicks,
      pdfFileName: currentFileName,
    };
    await addSession(session);
  }, [getPayload]);

  // Auto-save analytics on page unload (tab close / navigate away)
  useEffect(() => {
    const onBeforeUnload = () => {
      const currentFileName = pdfFileNameRef.current;
      if (!currentFileName) return;
      const payload = getPayload();
      const totalSec = payload.pages.reduce((sum, p) => sum + parseInt(p.time), 0);
      if (totalSec === 0) return;
      const session = {
        id: crypto.randomUUID(),
        readerId: payload.readerId,
        isReturning: payload.isReturning,
        timestamp: new Date().toISOString(),
        totalDuration: payload.totalDuration,
        totalDurationSec: totalSec,
        completion: parseInt(payload.completion.replace('%', '')),
        pages: payload.pages.map(p => ({ page: p.page, time: parseInt(p.time) })),
        reactions: payload.reactions,
        searchQueries: payload.searchQueries,
        isBounce: payload.isBounce,
        clicks: payload.clicks,
        pdfFileName: currentFileName,
      };
      // Use sendBeacon for reliable delivery on page unload
      navigator.sendBeacon('/api/sessions', JSON.stringify(session));
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [getPayload]);

  const handleArchiveClick = () => {
    trackClick();
    setIsArchiveOpen(true);
  };

  const handleLoadBulletin = useCallback(async (bulletin: Omit<StoredBulletin, 'pdfBlob'>) => {
    // Save current session analytics before switching
    await saveAnalytics();
    setIsLoadingArchive(true);
    setIsArchiveOpen(false);
    resetTracking();
    try {
      // Reset current state
      pageBlobUrls.forEach(url => URL.revokeObjectURL(url));
      setPageBlobUrls([]);
      setPdfFileName('');
      pdfFileNameRef.current = '';
      setEditorNotes({});
      setPageTexts([]);
      setPageTextPositions([]);
      setSearchQuery('');
      setIsSearchOpen(false);

      // Fetch the PDF blob from the server
      const stored = await getBulletinById(bulletin.id);
      if (!stored) throw new Error('Bülten bulunamadı');
      const file = new File([stored.pdfBlob], bulletin.fileName, { type: 'application/pdf' });
      const pdfjsLib = await import('pdfjs-dist');
      // @ts-ignore
      const pdfjsWorker = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default;
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
      const { PDFDocument } = await import('pdf-lib');

      const arrayBuffer = await file.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
      const totalPages = pdf.numPages;
      const allNotes: Record<number, string[]> = {};
      const pageTexts: string[] = [];
      const { TextItemPosition: _ } = {} as any; // type only
      const pageTextPositions: TextItemPosition[][] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        const textContent = await page.getTextContent();
        const pageHeight = viewport.height;
        const pageWidth = viewport.width;

        const fullTextItems: string[] = [];
        const posItems: TextItemPosition[] = [];
        for (const item of textContent.items) {
          if ('str' in item && (item as any).str.trim()) {
            fullTextItems.push((item as any).str.trim());
            const tx = (item as any).transform;
            if (tx) {
              const fontSize = Math.abs(tx[3]) || 12;
              const x = tx[4];
              const y = tx[5];
              const w = (item as any).width || (item as any).str.length * fontSize * 0.5;
              posItems.push({
                str: (item as any).str,
                left: (x / pageWidth) * 100,
                top: (1 - (y + fontSize) / pageHeight) * 100,
                width: (w / pageWidth) * 100,
                height: (fontSize / pageHeight) * 100,
              });
            }
          }
        }
        pageTexts.push(fullTextItems.join(' '));
        pageTextPositions.push(posItems);

        // Extract notes (bottom 15%)
        const noteItems: { text: string; y: number; x: number }[] = [];
        for (const item of textContent.items) {
          if (!('str' in item) || !(item as any).str.trim()) continue;
          const tx = (item as any).transform;
          if (!tx) continue;
          if (tx[5] < pageHeight * 0.15) {
            noteItems.push({ text: (item as any).str.trim(), y: tx[5], x: tx[4] });
          }
        }
        if (noteItems.length > 0) {
          noteItems.sort((a, b) => b.y - a.y || a.x - b.x);
          const lines: string[] = [];
          let currentLine = { text: noteItems[0].text, y: noteItems[0].y };
          for (let j = 1; j < noteItems.length; j++) {
            const ni = noteItems[j];
            if (Math.abs(ni.y - currentLine.y) < 5) {
              currentLine.text += ' ' + ni.text;
            } else {
              lines.push(currentLine.text);
              currentLine = { text: ni.text, y: ni.y };
            }
          }
          lines.push(currentLine.text);
          const pageNotes = lines.filter(l => l.trim().length > 15);
          if (pageNotes.length > 0) allNotes[i] = pageNotes;
        }
      }

      // Split into single-page PDFs
      const srcDoc = await PDFDocument.load(pdfBytes);
      const urls: string[] = [];
      for (let i = 0; i < totalPages; i++) {
        const singlePageDoc = await PDFDocument.create();
        const [copiedPage] = await singlePageDoc.copyPages(srcDoc, [i]);
        singlePageDoc.addPage(copiedPage);
        const bytes = await singlePageDoc.save();
        const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
        urls.push(URL.createObjectURL(blob));
      }

      setPageBlobUrls(urls);
      setPdfFileName(bulletin.fileName);
      pdfFileNameRef.current = bulletin.fileName;
      setEditorNotes(allNotes);
      setPageTexts(pageTexts);
      setPageTextPositions(pageTextPositions);
    } catch (err) {
      console.error('Arşivden bülten yüklenirken hata:', err);
    } finally {
      setIsLoadingArchive(false);
    }
  }, [pageBlobUrls, resetTracking, saveAnalytics]);

  const handleSearchFocus = () => {
    trackClick();
    if (searchQuery.trim().length > 0) {
      setIsSearchOpen(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearchOpen(value.trim().length > 0 && pageTexts.length > 0);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const goToSearchResult = (pageIndex: number) => {
    onPageChange(pageIndex);
    magazineRef.current?.goToPage(pageIndex);
    trackSearch(searchQuery);
    setIsSearchOpen(false);
    searchInputRef.current?.blur();
  };

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length < 2 || pageTexts.length === 0) return [];
    return pageTexts
      .map((text, idx) => {
        const lowerText = text.toLowerCase();
        if (!lowerText.includes(query)) return null;
        const matchIdx = lowerText.indexOf(query);
        const start = Math.max(0, matchIdx - 40);
        const end = Math.min(text.length, matchIdx + query.length + 40);
        const snippet = (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
        return { pageIndex: idx, snippet };
      })
      .filter(Boolean) as { pageIndex: number; snippet: string }[];
  }, [searchQuery, pageTexts]);

  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;

  const isPdfLoaded = pageBlobUrls.length > 0;

  // Group stored bulletins by year
  const archiveByYear = useMemo(() => {
    const groups: Record<number, Omit<StoredBulletin, 'pdfBlob'>[]> = {};
    storedBulletins
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .forEach(b => {
        const year = new Date(b.uploadedAt).getFullYear();
        if (!groups[year]) groups[year] = [];
        groups[year].push(b);
      });
    return Object.entries(groups)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, items]) => ({ year: Number(year), items }));
  }, [storedBulletins]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500/30 overflow-hidden">
      {/* Header - Minimalist & Premium */}
      <header className="fixed top-0 left-0 right-0 z-[100] px-12 py-6 flex items-center justify-between bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/20">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black tracking-tighter text-white">Veri Analitiği ve Müşteri Kanal Deneyimi </h1>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em]">
              {isPdfLoaded ? pdfFileName : 'Dijital Bülten'}
            </p>
          </div>
        </div>

        {/* Search Bar - only when a bulletin is loaded */}
        {isPdfLoaded ? (
          <div className="flex-1 max-w-md mx-12 relative group">
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors group/btn z-10"
            >
              <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-orange-500 group-hover/btn:text-orange-500 transition-colors" />
            </button>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Bülten içinde ara..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              className="w-full bg-white/5 border border-white/5 rounded-full py-3 pl-12 pr-6 text-sm focus:outline-none focus:bg-white/10 focus:border-orange-500/50 transition-all placeholder:text-zinc-600"
            />
            {/* Search Results Dropdown */}
            {isSearchOpen && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">
                      {searchResults.length} sayfa bulundu
                    </div>
                    {searchResults.map((result) => (
                      <button
                        key={result.pageIndex}
                        onMouseDown={(e) => { e.preventDefault(); goToSearchResult(result.pageIndex); }}
                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-orange-500/10 transition-colors text-left group/item"
                      >
                        <span className="shrink-0 w-8 h-8 flex items-center justify-center bg-orange-500/20 text-orange-500 rounded-lg text-xs font-black">
                          {result.pageIndex + 1}
                        </span>
                        <span className="text-xs text-zinc-400 leading-relaxed group-hover/item:text-zinc-200 transition-colors line-clamp-2">
                          {result.snippet}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs font-bold text-zinc-500">Sonuç bulunamadı</p>
                    <p className="text-[10px] text-zinc-600 mt-1">Farklı bir kelime deneyin</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="hidden lg:flex items-center gap-8">
          {isPdfLoaded && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Okuma İlerlemesi</span>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-black text-white tabular-nums">{Math.round(progress)}%</span>
              </div>
            </div>
          )}
          
          {isPdfLoaded && <div className="h-10 w-[1px] bg-white/10" />}
          
          <div className="flex items-center gap-3">
            {/* Reader: only Geçmiş Bültenler */}
            <button 
              onClick={handleArchiveClick}
              className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all group active:scale-95"
            >
              <Library className="w-5 h-5 text-zinc-400 group-hover:text-white" />
              <span className="text-xs font-black uppercase tracking-widest">Geçmiş Bültenler</span>
            </button>

            {/* Admin-only buttons */}
            {isAdmin && (
              <>
                {isPdfLoaded && (
                  <button 
                    onClick={handleResetPdf}
                    className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all group active:scale-95"
                  >
                    <Upload className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                    <span className="text-xs font-black uppercase tracking-widest">Yeni PDF</span>
                  </button>
                )}
                <Link 
                  to="/dashboard"
                  className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all group active:scale-95"
                >
                  <Shield className="w-5 h-5 text-zinc-400 group-hover:text-orange-500" />
                  <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-full border border-white/10 transition-all group active:scale-95"
                >
                  <LogOut className="w-5 h-5 text-zinc-400 group-hover:text-red-400" />
                  <span className="text-xs font-black uppercase tracking-widest">Çıkış</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Magazine Area */}
      <main className="flex-1 flex items-center justify-center pt-24 pb-0 relative overflow-hidden">
        {isLoadingArchive ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            <p className="text-sm font-bold text-zinc-400">Bülten yükleniyor...</p>
          </div>
        ) : isPdfLoaded ? (
          <FlipMagazine 
            ref={magazineRef}
            onPageChange={onPageChange} 
            currentPage={currentPage}
            totalPages={totalPages}
            reactions={reactions}
            setReactions={setReactions}
            pageBlobUrls={pageBlobUrls}
            fileName={pdfFileName}
            editorNotes={editorNotes}
            pageTextPositions={pageTextPositions}
            searchQuery={searchQuery}
          />
        ) : isAdmin ? (
          <Suspense fallback={<div className="text-zinc-500 text-sm font-bold">Yükleniyor...</div>}>
            <PdfUpload onPdfLoaded={handlePdfLoaded} />
          </Suspense>
        ) : storedBulletins.length > 0 ? (
          <div className="w-full max-w-5xl mx-auto px-8 py-12">
            <div className="text-center mb-12">
              <div className="inline-flex p-4 bg-orange-500/10 rounded-3xl mb-6">
                <Library className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white mb-3">Dijital Bülten Arşivi</h2>
              <p className="text-sm text-zinc-500 font-bold uppercase tracking-[0.3em]">Okumak istediğiniz bülteni seçin</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {storedBulletins.map((b) => {
                const date = new Date(b.uploadedAt);
                const isLatest = storedBulletins[0]?.id === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => handleLoadBulletin(b)}
                    className={`group relative text-left p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                      isLatest
                        ? 'bg-gradient-to-br from-orange-500/15 to-orange-600/5 border-orange-500/30 hover:border-orange-500/60 shadow-lg shadow-orange-500/10'
                        : 'bg-white/[0.03] border-white/10 hover:border-orange-500/40 hover:bg-white/[0.06]'
                    }`}
                  >
                    {isLatest && (
                      <span className="absolute -top-2.5 right-4 px-3 py-1 bg-orange-500 text-[9px] font-black uppercase tracking-widest text-white rounded-full shadow-lg shadow-orange-500/30">
                        Güncel
                      </span>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl shrink-0 ${isLatest ? 'bg-orange-500/20' : 'bg-white/5 group-hover:bg-orange-500/10'} transition-colors`}>
                        <FileText className={`w-6 h-6 ${isLatest ? 'text-orange-500' : 'text-zinc-500 group-hover:text-orange-500'} transition-colors`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-sm text-white truncate group-hover:text-orange-400 transition-colors">
                          {b.fileName.replace('.pdf', '')}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] font-bold text-zinc-500">
                            <Calendar className="w-3 h-3 inline mr-1 -mt-0.5" />
                            {date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">{b.pageCount} sayfa</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="p-6 bg-white/5 rounded-3xl">
              <FileText className="w-16 h-16 text-zinc-600" />
            </div>
            <h2 className="text-xl font-black text-zinc-400">Henüz bülten yayınlanmadı</h2>
            <p className="text-sm text-zinc-600 max-w-md text-center">
              Yeni bir bülten yayınlandığında burada görüntülenecektir.
            </p>
          </div>
        )}
      </main>

      {/* Archive Modal */}
      {isArchiveOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900/90 backdrop-blur-lg border border-white/20 rounded-[32px] w-full max-w-3xl max-h-[75vh] overflow-hidden flex flex-col shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] animate-in zoom-in-95 duration-300">
            <div className="p-6 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500 rounded-xl">
                  <Library className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">Geçmiş Bültenler</h2>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-0.5">Dijital Arşiv ve Analiz Kitaplığı</p>
                </div>
              </div>
              <button 
                onClick={() => setIsArchiveOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors group"
              >
                <X className="w-6 h-6 text-zinc-500 group-hover:text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 magazine-scroll">
              {archiveByYear.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <FileText className="w-12 h-12 text-zinc-600" />
                  </div>
                  <h3 className="text-base font-black text-zinc-400">Henüz bülten yok</h3>
                  <p className="text-xs text-zinc-600 text-center max-w-xs">
                    PDF yüklediğinizde bültenler burada otomatik olarak görünecektir.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {archiveByYear.map((yearGroup) => (
                    <div key={yearGroup.year} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <h3 className="text-lg font-black text-white">{yearGroup.year}</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {yearGroup.items.map((item) => {
                          const isActive = item.fileName === pdfFileName;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleLoadBulletin(item)}
                              className={`flex items-center justify-between p-4 rounded-xl border transition-all group text-left ${
                                isActive
                                  ? 'bg-orange-500 border-orange-400 text-white'
                                  : 'bg-white/5 hover:bg-orange-500 border-white/5 hover:border-orange-400'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <FileText className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`} />
                                <div>
                                  <span className="font-bold text-sm group-hover:text-white block">{item.fileName}</span>
                                  <span className={`text-[10px] font-bold ${isActive ? 'text-white/70' : 'text-zinc-600 group-hover:text-white/70'}`}>
                                    {new Date(item.uploadedAt).toLocaleDateString('tr-TR')} · {item.pageCount} sayfa
                                  </span>
                                </div>
                              </div>
                              {isActive && (
                                <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-full">Aktif</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-zinc-950/50 border-t border-white/10 text-center">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em]">Migros Ticaret A.Ş. Veri Analitiği Arşivi</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
