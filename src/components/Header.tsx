import React from 'react';
import { Menu, Search } from 'lucide-react';
import { TrackingButton } from './TrackingButton';

interface HeaderProps {
  scrollProgress: number;
  getTrackingData: () => any;
}

export function Header({ scrollProgress, getTrackingData }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-slate-200">
      <div className="h-1 bg-slate-100 w-full absolute top-0">
        <div 
          className="h-full bg-orange-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-lg lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-bold text-xl text-orange-600 tracking-tight">
            MONEY <span className="text-slate-800">Bülten</span>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#ozet" className="hover:text-orange-600 transition-colors">Yönetici Özeti</a>
          <a href="#sozluk" className="hover:text-orange-600 transition-colors">Sözlük</a>
          <a href="#yaz-alisverisleri" className="hover:text-orange-600 transition-colors">Yaz Alışverişleri</a>
          <a href="#nps" className="hover:text-orange-600 transition-colors">NPS Skoru</a>
        </nav>
        
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <Search className="w-5 h-5" />
          </button>
          <TrackingButton getTrackingData={getTrackingData} />
        </div>
      </div>
    </header>
  );
}
