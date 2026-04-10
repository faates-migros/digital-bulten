import React from 'react';

export function CustomerProfile() {
  const profiles = [
    { name: 'Büyük TL Sepetçi', val: '1.2 kat', desc: '%31.7', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Değerli', val: '1.7 kat', desc: '%14.0', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Kentli Dijital', val: '1.3 kat', desc: '%24.9', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { name: 'Ehl-i Keyfler', val: '1.3 kat', desc: '%23.2', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { name: 'Pratik Severler', val: '1.4 kat', desc: '%14.5', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: '65+ Yaş Müşteri', val: '1.3 kat', desc: '%9.9', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  return (
    <section id="musteri-profili" className="scroll-mt-24">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Yazlık Mağazalardan Alışveriş Yapan Müşteri Profili</h2>
        <p className="text-slate-500">Migros geneline göre karşılaştırma</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {profiles.map((p, i) => (
          <div key={i} className={`p-6 rounded-2xl border ${p.color} flex flex-col items-center justify-center text-center`}>
            <div className="text-sm font-medium opacity-80 mb-1">{p.name}</div>
            <div className="text-3xl font-black mb-1">{p.val}</div>
            <div className="text-xs font-bold opacity-70 bg-white/50 px-2 py-1 rounded-md">{p.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
