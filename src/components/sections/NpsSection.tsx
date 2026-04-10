import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function NpsSection() {
  const lineData = {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos'],
    datasets: [
      {
        label: 'NPS Skoru',
        data: [57, 52, 43, 39, 40, 41, 44, 44],
        borderColor: '#f97316',
        backgroundColor: '#f97316',
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#f97316',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 14, weight: 'bold' as const },
        displayColors: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 60,
        grid: { color: '#f1f5f9' },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  const barData1 = {
    labels: [
      'Kampanyalı ürün ve fırsat sayısı artırılmalı',
      'Müşteri iletişim merkezi ile iletişim daha kolay olmalı',
      'Kampanyalar daha açık ve net anlatılmalı',
      'İlgi çekici marka iş birlikleri sunulmalı'
    ],
    datasets: [{
      data: [28, 22, 20, 11],
      backgroundColor: '#ef4444',
      borderRadius: 4,
    }]
  };

  const barData2 = {
    labels: [
      'Bana özel kampanyaların sunulması',
      'Kendi kampanyamı kendim yaratabilmem',
      'Kazandığım fırsatları kolayca takip edebilmem',
      'Marka iş birliklerinden gelen ekstra avantajlar'
    ],
    datasets: [{
      data: [27, 17, 15, 14],
      backgroundColor: '#22c55e',
      borderRadius: 4,
    }]
  };

  const barOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.raw}%`
        }
      }
    },
    scales: {
      x: { display: false, max: 35 },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { size: 11 }, color: '#475569' }
      }
    }
  };

  return (
    <section id="nps" className="scroll-mt-24">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Money Markası Tavsiye Skoru (NPS)</h2>
        <p className="text-slate-500">Ağustos 2025 Değerlendirmesi</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-32 h-32 rounded-full bg-emerald-500 text-white flex flex-col items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
            <span className="text-4xl font-black">44</span>
            <span className="text-xs font-medium opacity-90 px-4 mt-1">Yüksek Tavsiye</span>
          </div>
          
          <div className="w-full space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-24 text-sm text-slate-600 text-right">Destekleyen</div>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[63%]" />
              </div>
              <div className="w-8 text-sm font-bold text-slate-700">%63</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 text-sm text-slate-600 text-right">Çekimser</div>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-400 w-[19%]" />
              </div>
              <div className="w-8 text-sm font-bold text-slate-700">%19</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 text-sm text-slate-600 text-right">Kötüleyen</div>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-[18%]" />
              </div>
              <div className="w-8 text-sm font-bold text-slate-700">%18</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">NPS Aylık Skor Dağılımı</h3>
          <div className="h-64 w-full">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-red-500 mb-6">0-6 Puan Verenler: Neleri daha iyi yapmamızı önerirsin?</h3>
          <div className="h-48 w-full">
            <Bar data={barData1} options={barOptions} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-emerald-500 mb-6">9-10 Puan Verenler: Money'de en çok neleri beğeniyorsun?</h3>
          <div className="h-48 w-full">
            <Bar data={barData2} options={barOptions} />
          </div>
        </div>
      </div>
    </section>
  );
}
