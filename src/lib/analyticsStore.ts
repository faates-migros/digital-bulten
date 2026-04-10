export interface AnalyticsSession {
  id: string;
  readerId: string;
  isReturning: boolean;
  timestamp: string;
  totalDuration: string;
  totalDurationSec: number;
  completion: number;
  pages: { page: number; time: number }[];
  reactions: string[];
  searchQueries: string[];
  isBounce: boolean;
  clicks: number;
  pdfFileName: string;
}

export async function getSessions(): Promise<AnalyticsSession[]> {
  try {
    const res = await fetch('/api/sessions');
    return await res.json();
  } catch {
    return [];
  }
}

export async function addSession(session: AnalyticsSession): Promise<void> {
  await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  });
}

export async function clearSessions(): Promise<void> {
  await fetch('/api/sessions', { method: 'DELETE' });
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const DUMMY_REACTIONS = ['Faydalı', 'İlginç', 'Harika', 'Geliştirilebilir'];
const DUMMY_SEARCHES = [
  'NPS skoru', 'yaz alışverişleri', 'müşteri profili', 'yazlık mağazalar',
  'ciro analizi', 'yeni müşteri', 'marina', 'Money Kart', 'format kırılımı',
  'Didim', 'Fethiye', 'sepet analizi', 'kayıp müşteri', 'gelgeç müşteri',
];
const DUMMY_FILES = [
  'Agustos_2025_Bulten.pdf', 'Temmuz_2025_Bulten.pdf', 'Haziran_2025_Bulten.pdf',
  'Mayis_2025_Bulten.pdf', 'Nisan_2025_Bulten.pdf',
];

export async function generateDummySessions(count = 35): Promise<void> {
  const readerPool = Array.from({ length: 12 }, () => crypto.randomUUID());
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const readerId = readerPool[rand(0, readerPool.length - 1)];
    const totalPages = rand(10, 18);
    const pagesViewed = rand(2, totalPages);
    const completion = Math.round((pagesViewed / totalPages) * 100);
    const totalSec = rand(30, 600);
    const isBounce = pagesViewed <= 1 && totalSec < 10;
    const daysAgo = rand(0, 29);
    const ts = new Date(now - daysAgo * 86400000 - rand(0, 86400000));

    const pages = Array.from({ length: totalPages }, (_, p) => ({
      page: p + 1,
      time: p < pagesViewed ? rand(3, 90) : 0,
    }));

    const reactionCount = rand(0, 3);
    const reactions: string[] = [];
    const pool = [...DUMMY_REACTIONS];
    for (let r = 0; r < reactionCount; r++) {
      const idx = rand(0, pool.length - 1);
      reactions.push(pool.splice(idx, 1)[0]);
    }

    const searchCount = rand(0, 3);
    const searches: string[] = [];
    for (let s = 0; s < searchCount; s++) {
      searches.push(DUMMY_SEARCHES[rand(0, DUMMY_SEARCHES.length - 1)]);
    }

    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;

    const session: AnalyticsSession = {
      id: crypto.randomUUID(),
      readerId,
      isReturning: rand(0, 1) === 1,
      timestamp: ts.toISOString(),
      totalDuration: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      totalDurationSec: totalSec,
      completion,
      pages,
      reactions: reactions.length > 0 ? reactions : ['Yok'],
      searchQueries: searches.length > 0 ? searches : ['Hiç arama yapılmadı'],
      isBounce,
      clicks: rand(5, 80),
      pdfFileName: DUMMY_FILES[rand(0, DUMMY_FILES.length - 1)],
    };
    await addSession(session);
  }
}
