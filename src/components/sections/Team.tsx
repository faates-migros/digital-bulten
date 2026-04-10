import React from 'react';

export function Team() {
  const team = [
    { name: 'Bade Tuğçe BOZFAKIOĞLU', role: 'Grup Müdürü' },
    { name: 'Fidan Can', role: 'Expert' },
    { name: 'Kübra Yener', role: 'Senior' },
    { name: 'Burak Sinaz', role: 'Associate' },
    { name: 'Tunç Ergene', role: 'Senior' },
    { name: 'Zehra Sevkar', role: 'Analist' },
    { name: 'İpek Özcan', role: 'Analist' },
    { name: 'Kemal Alper', role: 'Yönetici' },
    { name: 'Fatih Ateş', role: 'Analist' },
    { name: 'Buse Dila Ok', role: 'Stajyer' },
  ];

  return (
    <section id="ekip" className="scroll-mt-24 pb-24 border-t border-slate-200 pt-12">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Ekip Künyesi</h2>
        <p className="text-slate-500">Veri Analitiği ve Müşteri Kanal Deneyimi Ekibi</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {team.map((member, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
            <div className="font-semibold text-slate-800 text-sm mb-1">{member.name}</div>
            <div className="text-xs text-orange-600 font-medium">{member.role}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-16 text-center text-xs text-slate-400">
        <p>Veri Analitiği ve Müşteri Kanal Deneyimi © 2025</p>
        <p className="mt-1">Kurumsal Gizli Veri</p>
      </div>
    </section>
  );
}
