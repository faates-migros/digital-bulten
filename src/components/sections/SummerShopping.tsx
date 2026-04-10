import React from 'react';

export function SummerShopping() {
  return (
    <section id="yaz-alisverisleri" className="scroll-mt-24">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Yaz Dönemi Alışverişleri</h2>
        <p className="text-slate-500">Haziran-Ağustos 2025 Yazlık/Marina Mağazalar Analizi</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4 text-right">Müşteri Sayısı</th>
                <th className="px-6 py-4 text-right">İşlem Sayısı</th>
                <th className="px-6 py-4 text-right">Ciro</th>
                <th className="px-6 py-4 text-right">Sepet Ort.</th>
                <th className="px-6 py-4 text-right">Kişi Başı Harcama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">Yazlık/Marina Mağazalar</td>
                <td className="px-6 py-4 text-right">3.8 mn</td>
                <td className="px-6 py-4 text-right">22.3 mn</td>
                <td className="px-6 py-4 text-right">16.772 mn TL</td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">₺753</td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">₺4.389</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-medium text-slate-900">Migros Geneli</td>
                <td className="px-6 py-4 text-right">13.9 mn</td>
                <td className="px-6 py-4 text-right">119.0 mn</td>
                <td className="px-6 py-4 text-right">78.018 mn TL</td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">₺655</td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">₺5.632</td>
              </tr>
              <tr className="bg-orange-50/50 font-semibold text-orange-700">
                <td className="px-6 py-4">Yazlık/Marina Payı</td>
                <td className="px-6 py-4 text-right">%28</td>
                <td className="px-6 py-4 text-right">%19</td>
                <td className="px-6 py-4 text-right">%21</td>
                <td className="px-6 py-4 text-right">-</td>
                <td className="px-6 py-4 text-right">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">En Çok Sepete Giren Gruplar</h3>
          <div className="space-y-3">
            {[
              { name: 'Su ve Maden Suları', val: 28 },
              { name: 'Gazlı İçecekler', val: 21 },
              { name: 'Gazsız İçecekler', val: 18 },
              { name: 'Sebzeler', val: 17 },
              { name: 'Meyveler', val: 15 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{item.name}</span>
                <div className="flex items-center gap-3 w-1/2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400" style={{ width: `${item.val}%` }} />
                  </div>
                  <span className="font-medium text-slate-900 w-8 text-right">%{item.val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Migros Geneline Göre Tercih Katı</h3>
          <div className="space-y-3">
            {[
              { name: 'Deniz ve Havuz Ürünleri', val: 3.0 },
              { name: 'Güneş Bakım Ürünleri', val: 2.2 },
              { name: 'Piknik Ürünleri', val: 1.8 },
              { name: 'Terlik', val: 1.8 },
              { name: 'Bira', val: 1.8 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{item.name}</span>
                <div className="flex items-center gap-3 w-1/2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400" style={{ width: `${(item.val / 3) * 100}%` }} />
                  </div>
                  <span className="font-medium text-slate-900 w-8 text-right">{item.val}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
