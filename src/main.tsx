import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

const DashboardGuard = lazy(() => import('./pages/DashboardGuard.tsx'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={
          <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-bold">Yükleniyor...</div>}>
            <DashboardGuard />
          </Suspense>
        } />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
