import React from 'react';
import { TrendingUp, Users, AlertCircle } from 'lucide-react';

export function ExecutiveSummary() {
  return (
    <section id="ozet" className="scroll-mt-24">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Yönetici Özeti</h2>
        <p className="text-slate-500">Haziran-Ağustos 2025 dönemi genel değerlendirmesi</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-orange-600">
            <Users className="w-6 h-6" />
            <h3 className="text-lg font-semibold text-slate-900">Yazlık Mağaza Performansı</h3>
          </div>
          <ul className="space-y-3 text-slate-600 text-sm">
            <li className="flex gap-2"><span className="text-orange-500">•</span> Her 4 müşteriden 1'i (3.8 mn) yazlık/marina mağazalardan alışveriş yapmıştır.</li>
            <li className="flex gap-2"><span className="text-orange-500">•</span> Migros geneli işlemlerin %19'u ve cironun %21'i bu mağazalarda gerçekleşti.</li>
            <li className="flex gap-2"><span className="text-orange-500">•</span> En çok sepete girenler: Su ve Maden Suları (%28), Gazlı İçecekler (%21).</li>
            <li className="flex gap-2"><span className="text-orange-500">•</span> Formatlar arasında en çok tercih edilen %49.1 ile M formatı olmuştur.</li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-emerald-600">
            <TrendingUp className="w-6 h-6" />
            <h3 className="text-lg font-semibold text-slate-900">YTD Büyüme (Ocak-Ağustos)</h3>
          </div>
          <ul className="space-y-3 text-slate-600 text-sm">
            <li className="flex gap-2"><span className="text-emerald-500">•</span> YTD aktif 13 mn müşterimiz bulunmaktadır (geçen yıla göre %15 artış).</li>
            <li className="flex gap-2"><span className="text-emerald-500">•</span> Money üye ciro büyümemiz geçen yıla göre +%53'tür (Enflasyonun +%18 üstünde).</li>
            <li className="flex gap-2"><span className="text-emerald-500">•</span> Yeni müşteriler kayıp müşterilerin 6.2 katı harcama yapmıştır.</li>
            <li className="flex gap-2"><span className="text-emerald-500">•</span> Personel ciro büyümemiz %71.9 ile Migros genel büyümesinin üstündedir.</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-slate-900 mb-1">Dikkat Çeken Nokta</h4>
          <p className="text-sm text-slate-700">
            Değerli LFL müşterilerimiz incelendiğinde kendi enflasyonlarının altında kalan kategorilerin ilk 10'undan 266 mn TL ciro kaybı görülmektedir. (Konserve, Et Şarküteri, Çamaşır Yıkayıcıları vb.)
          </p>
        </div>
      </div>
    </section>
  );
}
