import React from 'react';
import { Archive, ChevronRight, FileText } from 'lucide-react';

const archives = [
  { month: 'Ağustos 2025', current: true },
  { month: 'Temmuz 2025', current: false },
  { month: 'Haziran 2025', current: false },
  { month: 'Mayıs 2025', current: false },
  { month: 'Nisan 2025', current: false },
  { month: 'Mart 2025', current: false },
  { month: 'Şubat 2025', current: false },
  { month: 'Ocak 2025', current: false },
  { month: 'Aralık 2024', current: false },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 min-h-[calc(100vh-4rem)] p-6 sticky top-16">
      <div className="flex items-center gap-2 font-semibold text-slate-800 mb-6">
        <Archive className="w-5 h-5 text-orange-500" />
        Bülten Arşivi
      </div>
      
      <div className="space-y-1">
        {archives.map((item, i) => (
          <a
            key={i}
            href="#"
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              item.current 
                ? 'bg-orange-50 text-orange-700 font-medium' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 opacity-50" />
              {item.month}
            </div>
            {item.current && <ChevronRight className="w-4 h-4" />}
          </a>
        ))}
      </div>
      
      <div className="mt-12 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hakkında</h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Veri Analitiği ve Müşteri Kanal Deneyimi ekibi tarafından hazırlanan aylık değerlendirme raporudur.
        </p>
      </div>
    </aside>
  );
}
