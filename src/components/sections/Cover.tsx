import React from 'react';
import { ArrowDown } from 'lucide-react';

export function Cover() {
  return (
    <section id="cover" className="min-h-[70vh] flex flex-col justify-center items-center text-center relative">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-100/50 to-transparent -z-10 rounded-3xl" />
      
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-8">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        Ağustos 2025 Raporu Yayında
      </div>
      
      <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">
        MONEY <span className="text-orange-500">Bülten</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mb-12 font-light">
        Veri Analitiği ve Müşteri Kanal Deneyimi Aylık Değerlendirme Raporu - Sayı 97
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-8">
        {[
          { label: 'Aktif Müşteri', value: '23.7 Mn' },
          { label: 'YTD Büyüme', value: '+15%' },
          { label: 'NPS Skoru', value: '44' },
          { label: 'Yazlık Alışveriş', value: '3.8 Mn' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
            <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
      
      <a href="#ozet" className="mt-16 p-4 rounded-full bg-white shadow-sm border border-slate-200 text-slate-400 hover:text-orange-500 hover:border-orange-200 transition-all animate-bounce">
        <ArrowDown className="w-6 h-6" />
      </a>
    </section>
  );
}
