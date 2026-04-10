import { useEffect, useRef, useState } from 'react';

export function useMagazineTracking(totalPages: number) {
  const isReturning = useRef(!!localStorage.getItem('visitor_id'));
  const visitorId = useRef(localStorage.getItem('visitor_id') || crypto.randomUUID());
  const startTime = useRef(Date.now());
  const [currentPage, setCurrentPage] = useState(0);
  const [viewedPages, setViewedPages] = useState<Set<number>>(new Set([0]));
  const [pageTimes, setPageTimes] = useState<Record<number, number>>({});
  const [clicks, setClicks] = useState(0);
  const [reaction, setReaction] = useState<string | null>(null);
  
  const lastPageChangeTime = useRef(Date.now());

  useEffect(() => {
    localStorage.setItem('visitor_id', visitorId.current);

    const handleClick = () => setClicks(prev => prev + 1);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Track time on current page
  useEffect(() => {
    const interval = setInterval(() => {
      setPageTimes(prev => ({
        ...prev,
        [currentPage]: (prev[currentPage] || 0) + 1
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPage]);

  const handlePageChange = (index: number) => {
    setCurrentPage(index);
    setViewedPages(prev => new Set(prev).add(index));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMagazinePayload = () => {
    const totalSeconds = Math.round((Date.now() - startTime.current) / 1000);
    const pagesViewedCount = viewedPages.size;
    const completionRate = Math.round((pagesViewedCount / totalPages) * 100);
    
    const pageDetails: Record<string, string> = {};
    let maxTime = -1;
    let mostEngagedPage = "Sayfa 1";

    Object.entries(pageTimes).forEach(([pageIdx, seconds]) => {
      const pageNum = parseInt(pageIdx) + 1;
      const secs = seconds as number;
      pageDetails[`page${pageNum}`] = `${secs}s`;
      if (secs > maxTime) {
        maxTime = secs;
        mostEngagedPage = `Sayfa ${pageNum}`;
      }
    });

    return {
      session: { 
        visitorId: visitorId.current, 
        isReturning: isReturning.current 
      },
      magazineStats: {
        totalPages,
        pagesViewed: pagesViewedCount,
        completionRate: `${completionRate}%`,
        avgTimePerPage: `${Math.round(totalSeconds / pagesViewedCount)}s`,
        totalTime: formatTime(totalSeconds)
      },
      pageDetails: {
        ...pageDetails,
        mostEngagedPage
      },
      interaction: {
        reaction: reaction || "Yok",
        clicks
      }
    };
  };

  return {
    currentPage,
    handlePageChange,
    setReaction,
    reaction,
    getMagazinePayload,
    completionRate: (viewedPages.size / totalPages) * 100
  };
}
