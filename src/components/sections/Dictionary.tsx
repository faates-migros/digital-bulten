import React from 'react';
import { BookOpen } from 'lucide-react';

const terms = [
  {
    term: 'Değerli Müşteri',
    desc: "Müşterilerimizin %7'si ve cironun %40'ını temsil eder. 1 yılda hemen hemen her ay gelir."
  },
  {
    term: 'Büyük TL Sepetçi',
    desc: 'Son 1 yılda sepet ortalamaları ortalamanın üzerinde olan müşteriler.'
  },
  {
    term: 'Ehl-i Keyfler',
    desc: 'Aburcubur, alkollü-alkolsüz içecek, hazır yemek vb. ürün gruplarından ortalamanın üzerinde alan müşteriler.'
  },
  {
    term: 'Kentli Dijitaller',
    desc: 'Büyük şehirlerin kent merkezlerinde yaşamayı tercih eden, yüksek gelir seviyesine sahip, dijital kanalları aktif kullanan grup.'
  },
  {
    term: 'Pratik Severler',
    desc: 'Ne istediğini bilen, anlık ihtiyacına göre hızlı ve pratik alışveriş yapan, sepet hacmi yüksek segment.'
  },
  {
    term: 'Fark Avcıları',
    desc: 'Yerel, özgün, farklı ve yeni ürünlere ilgi duyan, orta büyüklükte sepetlere sahip segment.'
  }
];

export function Dictionary() {
  return (
    <section id="sozluk" className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-slate-400" />
        <h2 className="text-2xl font-bold text-slate-900">Veri Analitiği Sözlüğü</h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {terms.map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-orange-300 transition-colors shadow-sm">
            <h3 className="font-semibold text-orange-600 mb-2">{item.term}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
