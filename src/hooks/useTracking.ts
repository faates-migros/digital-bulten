import { useEffect, useRef, useState } from 'react';

const sectionNames: Record<string, string> = {
  'cover': 'Kapak',
  'ozet': 'Yönetici Özeti',
  'sozluk': 'Veri Analitiği Sözlüğü',
  'yaz-alisverisleri': 'Yaz Dönemi Alışverişleri',
  'musteri-profili': 'Müşteri Profili',
  'nps': 'NPS Skoru',
  'ekip': 'Ekip Künyesi'
};

export function useTracking() {
  const visitorId = useRef(localStorage.getItem('visitor_id') || crypto.randomUUID());
  const startTime = useRef(Date.now());
  const maxScrollDepth = useRef(0);
  const clicks = useRef(0);
  const [activeSectionId, setActiveSectionId] = useState('cover');

  useEffect(() => {
    localStorage.setItem('visitor_id', visitorId.current);

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const depth = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
      if (depth > maxScrollDepth.current) {
        maxScrollDepth.current = depth;
      }
    };

    const handleClick = () => {
      clicks.current += 1;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleClick);

    // Intersection Observer to track the active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of the section is visible
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const getTrackingData = () => {
    return {
      visitorId: visitorId.current,
      timeSpentSeconds: Math.round((Date.now() - startTime.current) / 1000),
      maxScrollDepth: maxScrollDepth.current,
      clicks: clicks.current,
      section: sectionNames[activeSectionId] || activeSectionId,
      timestamp: new Date().toISOString(),
    };
  };

  return { getTrackingData };
}
