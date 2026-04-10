import { useEffect, useRef, useState, useCallback } from 'react';

export interface PageTime {
  page: number;
  time: string;
}

export function useFlipTracking(totalPages: number) {
  const readerId = useRef(localStorage.getItem('reader_id') || crypto.randomUUID());
  const isReturning = useRef(!!localStorage.getItem('reader_id'));
  const startTime = useRef(Date.now());
  const [currentPage, setCurrentPage] = useState(0);
  const [pageTimes, setPageTimes] = useState<Record<number, number>>({});
  const [reactions, setReactions] = useState<string[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [clicks, setClicks] = useState(0);
  const [viewedPages, setViewedPages] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    localStorage.setItem('reader_id', readerId.current);
    
    const handleClick = () => setClicks(prev => prev + 1);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Track time on current visible page
  useEffect(() => {
    const interval = setInterval(() => {
      setPageTimes(prev => {
        const next = { ...prev };
        next[currentPage] = (next[currentPage] || 0) + 1;
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPage]);

  const onPageChange = useCallback((index: number) => {
    setCurrentPage(index);
    setViewedPages(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPayload = useCallback(() => {
    const totalMs = Date.now() - startTime.current;
    const completion = Math.round((viewedPages.size / totalPages) * 100);
    
    const pages: PageTime[] = Array.from({ length: totalPages }, (_, i) => ({
      page: i + 1,
      time: `${pageTimes[i] || 0}s`
    }));

    return {
      readerId: readerId.current,
      isReturning: isReturning.current,
      totalDuration: formatDuration(totalMs),
      completion: `%${completion}`,
      pages,
      reactions: reactions.length > 0 ? reactions : ["Yok"],
      searchQueries: searchQueries.length > 0 ? searchQueries : ["Hiç arama yapılmadı"],
      isBounce: viewedPages.size <= 1 && totalMs < 10000,
      clicks
    };
  }, [totalPages, viewedPages, pageTimes, reactions, searchQueries, clicks]);

  const trackClick = useCallback(() => {
    setClicks(prev => prev + 1);
  }, []);

  const trackSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setSearchQueries(prev => [...prev, query.trim()]);
    console.log('Arama Kaydedildi:', query.trim());
  }, []);

  const resetTracking = useCallback(() => {
    startTime.current = Date.now();
    setCurrentPage(0);
    setPageTimes({});
    setReactions([]);
    setSearchQueries([]);
    setClicks(0);
    setViewedPages(new Set([0]));
  }, []);

  return {
    currentPage,
    onPageChange,
    setReactions,
    reactions,
    getPayload,
    viewedPages,
    trackClick,
    trackSearch,
    resetTracking
  };
}
