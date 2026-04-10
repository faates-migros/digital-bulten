import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getSessions, clearSessions, generateDummySessions } from '../lib/analyticsStore';
import type { AnalyticsSession } from '../lib/analyticsStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts';
import {
  BarChart3, Users, Clock, Eye, MousePointerClick, Search,
  TrendingUp, ArrowLeft, Trash2, RefreshCw, FileText, Zap,
  ChevronDown, ChevronUp, Filter, LogOut,
} from 'lucide-react';

const ORANGE = '#f97316';
const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#ea580c', '#c2410c'];

function StatCard({ icon: Icon, label, value, sub, color = 'orange' }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6 flex flex-col gap-3 hover:border-orange-500/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{label}</span>
        <div className="p-2 bg-orange-500/10 rounded-xl">
          <Icon className="w-4 h-4 text-orange-500" />
        </div>
      </div>
      <div className="text-3xl font-black text-white tracking-tight">{value}</div>
      {sub && <div className="text-xs font-bold text-zinc-500">{sub}</div>}
    </div>
  );
}

export default function Dashboard({ onLogout }: { onLogout?: () => void }) {
  const [allSessions, setAllSessions] = useState<AnalyticsSession[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const load = () => { getSessions().then(setAllSessions); };
  useEffect(() => { load(); }, []);

  // Get unique bulletin names
  const bulletinNames = useMemo(() => {
    const names = new Set(allSessions.map(s => s.pdfFileName).filter(Boolean));
    return Array.from(names).sort();
  }, [allSessions]);

  // Filter sessions by selected bulletin
  const sessions = useMemo(() => {
    if (selectedBulletin === 'all') return allSessions;
    return allSessions.filter(s => s.pdfFileName === selectedBulletin);
  }, [allSessions, selectedBulletin]);

  const stats = useMemo(() => {
    if (sessions.length === 0) return null;

    const totalVisitors = new Set(sessions.map(s => s.readerId)).size;
    const returningCount = sessions.filter(s => s.isReturning).length;
    const bounceCount = sessions.filter(s => s.isBounce).length;
    const avgDuration = Math.round(sessions.reduce((s, x) => s + x.totalDurationSec, 0) / sessions.length);
    const avgCompletion = Math.round(sessions.reduce((s, x) => s + x.completion, 0) / sessions.length);
    const totalClicks = sessions.reduce((s, x) => s + x.clicks, 0);

    // Page time aggregation
    const pageTimeMap: Record<number, number[]> = {};
    sessions.forEach(s => {
      s.pages.forEach(p => {
        if (!pageTimeMap[p.page]) pageTimeMap[p.page] = [];
        pageTimeMap[p.page].push(p.time);
      });
    });
    const pageAvgTimes = Object.entries(pageTimeMap)
      .map(([page, times]) => ({
        name: `Sayfa ${page}`,
        süre: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      }))
      .sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]));

    // Reactions aggregation
    const reactionMap: Record<string, number> = {};
    sessions.forEach(s => {
      s.reactions.forEach(r => {
        if (r !== 'Yok') reactionMap[r] = (reactionMap[r] || 0) + 1;
      });
    });
    const reactionData = Object.entries(reactionMap).map(([name, value]) => ({ name, value }));

    // Search queries
    const queryMap: Record<string, number> = {};
    sessions.forEach(s => {
      s.searchQueries.forEach(q => {
        if (q !== 'Hiç arama yapılmadı') queryMap[q] = (queryMap[q] || 0) + 1;
      });
    });
    const topSearches = Object.entries(queryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    // Sessions over time (by date)
    const dateMap: Record<string, number> = {};
    sessions.forEach(s => {
      const d = new Date(s.timestamp).toLocaleDateString('tr-TR');
      dateMap[d] = (dateMap[d] || 0) + 1;
    });
    const timelineData = Object.entries(dateMap).map(([tarih, oturum]) => ({ tarih, oturum }));

    // Completion distribution
    const completionBuckets = [
      { name: '0-25%', count: 0 },
      { name: '26-50%', count: 0 },
      { name: '51-75%', count: 0 },
      { name: '76-100%', count: 0 },
    ];
    sessions.forEach(s => {
      if (s.completion <= 25) completionBuckets[0].count++;
      else if (s.completion <= 50) completionBuckets[1].count++;
      else if (s.completion <= 75) completionBuckets[2].count++;
      else completionBuckets[3].count++;
    });

    // Most engaged page
    let mostEngaged = pageAvgTimes.length > 0
      ? pageAvgTimes.reduce((a, b) => a.süre > b.süre ? a : b).name
      : '-';

    return {
      totalVisitors, returningCount, bounceCount, avgDuration, avgCompletion,
      totalClicks, pageAvgTimes, reactionData, topSearches, timelineData,
      completionBuckets, mostEngaged,
    };
  }, [sessions]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}dk ${s}sn` : `${s}sn`;
  };

  const handleClear = async () => {
    if (window.confirm('Tüm analitik verilerini silmek istediğinize emin misiniz?')) {
      await clearSessions();
      load();
      setSelectedBulletin('all');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 px-8 py-5 flex items-center justify-between bg-zinc-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-6">
          <Link to="/" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-400 hover:text-white" />
          </Link>
          <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/20">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">Analitik Dashboard</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
              Bülten Okuma Analizleri
              {selectedBulletin !== 'all' && (
                <span className="ml-2 text-orange-500">· {selectedBulletin}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Bulletin Filter */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-bold ${
                selectedBulletin !== 'all'
                  ? 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20 text-orange-400'
                  : 'bg-white/5 hover:bg-white/10 border-white/5 text-zinc-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="max-w-[160px] truncate">
                {selectedBulletin === 'all' ? 'Tüm Bültenler' : selectedBulletin}
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                <button
                  onClick={() => { setSelectedBulletin('all'); setIsFilterOpen(false); }}
                  className={`w-full px-4 py-3 text-left text-xs font-bold hover:bg-white/5 transition-colors flex items-center gap-3 ${
                    selectedBulletin === 'all' ? 'text-orange-500 bg-orange-500/5' : 'text-zinc-300'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Tüm Bültenler
                  <span className="ml-auto text-[10px] text-zinc-600">{allSessions.length} oturum</span>
                </button>
                {bulletinNames.map(name => {
                  const count = allSessions.filter(s => s.pdfFileName === name).length;
                  return (
                    <button
                      key={name}
                      onClick={() => { setSelectedBulletin(name); setIsFilterOpen(false); }}
                      className={`w-full px-4 py-3 text-left text-xs font-bold hover:bg-white/5 transition-colors flex items-center gap-3 ${
                        selectedBulletin === name ? 'text-orange-500 bg-orange-500/5' : 'text-zinc-300'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="truncate flex-1">{name}</span>
                      <span className="text-[10px] text-zinc-600 shrink-0">{count} oturum</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button onClick={() => { generateDummySessions(35).then(() => load()); }} className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 rounded-xl border border-orange-500/20 transition-all text-xs font-bold text-orange-400">
            <Zap className="w-4 h-4" /> Demo Veri
          </button>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all text-xs font-bold">
            <RefreshCw className="w-4 h-4" /> Yenile
          </button>
          {onLogout && (
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl border border-white/10 transition-all text-xs font-bold text-zinc-300">
              <LogOut className="w-4 h-4" /> Çıkış
            </button>
          )}
          <button onClick={handleClear} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition-all text-xs font-bold text-red-400">
            <Trash2 className="w-4 h-4" /> Temizle
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 py-8">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="p-6 bg-white/5 rounded-3xl">
              <BarChart3 className="w-16 h-16 text-zinc-600" />
            </div>
            <h2 className="text-xl font-black text-zinc-400">Henüz veri yok</h2>
            <p className="text-sm text-zinc-600 max-w-md text-center">
              Bülteni okuyup "Analizi Paylaş" butonuna tıkladığınızda veriler burada görüntülenecektir.
            </p>
            <Link to="/" className="px-6 py-3 bg-orange-500 hover:bg-orange-400 rounded-full text-xs font-black uppercase tracking-widest transition-all">
              Bültene Git
            </Link>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <StatCard icon={Users} label="Toplam Oturum" value={sessions.length} sub={`${stats!.totalVisitors} tekil okuyucu`} />
              <StatCard icon={Clock} label="Ort. Süre" value={formatDuration(stats!.avgDuration)} />
              <StatCard icon={Eye} label="Ort. Tamamlanma" value={`%${stats!.avgCompletion}`} />
              <StatCard icon={TrendingUp} label="Geri Dönen" value={stats!.returningCount} sub={`%${sessions.length ? Math.round(stats!.returningCount / sessions.length * 100) : 0}`} />
              <StatCard icon={Zap} label="Bounce" value={stats!.bounceCount} sub={`%${sessions.length ? Math.round(stats!.bounceCount / sessions.length * 100) : 0}`} />
              <StatCard icon={MousePointerClick} label="Toplam Tıklama" value={stats!.totalClicks} />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Page Time Chart */}
              <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Sayfa Bazlı Ortalama Okuma Süresi (sn)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats!.pageAvgTimes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: '#f97316', fontWeight: 900 }}
                    />
                    <Bar dataKey="süre" fill={ORANGE} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Timeline Chart */}
              <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Oturum Zaman Çizelgesi</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats!.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="tarih" tick={{ fill: '#71717a', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: '#f97316', fontWeight: 900 }}
                    />
                    <Area type="monotone" dataKey="oturum" fill={ORANGE} fillOpacity={0.2} stroke={ORANGE} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Completion Distribution */}
              <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Tamamlanma Dağılımı</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={stats!.completionBuckets} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4}>
                      {stats!.completionBuckets.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {stats!.completionBuckets.map((b, i) => (
                    <div key={b.name} className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                      {b.name} ({b.count})
                    </div>
                  ))}
                </div>
              </div>

              {/* Reactions */}
              <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Tepkiler</h3>
                {stats!.reactionData.length === 0 ? (
                  <div className="flex items-center justify-center h-[250px] text-zinc-600 text-sm font-bold">Henüz tepki yok</div>
                ) : (
                  <div className="space-y-4 mt-4">
                    {stats!.reactionData.sort((a, b) => b.value - a.value).map(r => (
                      <div key={r.name} className="flex items-center gap-4">
                        <span className="text-sm font-bold text-zinc-300 w-32">{r.name}</span>
                        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full transition-all"
                            style={{ width: `${(r.value / Math.max(...stats!.reactionData.map(x => x.value))) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-orange-500 tabular-nums w-8 text-right">{r.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Searches */}
              <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Arama Sorguları</h3>
                {stats!.topSearches.length === 0 ? (
                  <div className="flex items-center justify-center h-[250px] text-zinc-600 text-sm font-bold">Henüz arama yok</div>
                ) : (
                  <div className="space-y-3 mt-4">
                    {stats!.topSearches.map((s, i) => (
                      <div key={s.query} className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-zinc-600 w-5 text-right">{i + 1}</span>
                        <Search className="w-3 h-3 text-zinc-600" />
                        <span className="text-xs font-bold text-zinc-300 flex-1 truncate">{s.query}</span>
                        <span className="text-[10px] font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">{s.count}×</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Most Engaged Page & Executive Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Yönetici Özeti</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      Toplam <span className="font-black text-white">{sessions.length}</span> oturum,{' '}
                      <span className="font-black text-white">{stats!.totalVisitors}</span> tekil okuyucu kaydedildi.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      Ortalama okuma süresi <span className="font-black text-white">{formatDuration(stats!.avgDuration)}</span>, tamamlanma oranı <span className="font-black text-white">%{stats!.avgCompletion}</span>.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      En çok ilgi gören sayfa: <span className="font-black text-orange-500">{stats!.mostEngaged}</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 shrink-0" />
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      Bounce oranı: <span className="font-black text-white">%{sessions.length ? Math.round(stats!.bounceCount / sessions.length * 100) : 0}</span>
                    </p>
                  </div>
                  {stats!.reactionData.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 shrink-0" />
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        En popüler tepki: <span className="font-black text-orange-500">{stats!.reactionData.sort((a, b) => b.value - a.value)[0]?.name}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Session Log */}
              <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Oturum Geçmişi</h3>
                  <button onClick={() => setShowDetails(!showDetails)} className="text-xs font-bold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                    {showDetails ? 'Gizle' : 'Detay'}
                    {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {[...sessions].reverse().map((s, i) => (
                    <div key={s.id} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-orange-500/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-3.5 h-3.5 text-zinc-600" />
                          <span className="text-xs font-bold text-zinc-300 truncate max-w-[160px]">{s.pdfFileName || 'PDF'}</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-600">{new Date(s.timestamp).toLocaleString('tr-TR')}</span>
                      </div>
                      {showDetails && (
                        <div className="mt-2 pt-2 border-t border-white/5 grid grid-cols-3 gap-2 text-[10px]">
                          <div><span className="text-zinc-600">Süre:</span> <span className="font-bold text-zinc-300">{s.totalDuration}</span></div>
                          <div><span className="text-zinc-600">Tamamlanma:</span> <span className="font-bold text-zinc-300">%{s.completion}</span></div>
                          <div><span className="text-zinc-600">Tıklama:</span> <span className="font-bold text-zinc-300">{s.clicks}</span></div>
                          <div className="col-span-3"><span className="text-zinc-600">Tepkiler:</span> <span className="font-bold text-zinc-300">{s.reactions.join(', ')}</span></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
